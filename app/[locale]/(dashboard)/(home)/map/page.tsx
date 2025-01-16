'use client'
import { useEffect, useState, useRef, useMemo } from 'react'
import dynamic from 'next/dynamic'

import { Card, CardContent } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'
import { Icon } from '@iconify/react'

import LayoutLoader from '@/components/layout-loader'
import loadHereMaps from '@/components/maps/here-map/utils/here-map-loader'
import SidebarContent from './components/main-map-components/sidebar-content'
import FooterMap from './components/main-map-components/footer-map'
import FooterMapHistory from './components/history-components/footer-map-history'
import { useUser } from '@/context/UserContext'
import { relogin } from '@/lib/auth'

import { useDispatch, useSelector } from 'react-redux'
import { fetchData, fetchGroupListData } from '@/redux/features/main-map'
import { RootState } from '@/redux/store'
import { fetchDataObjectTripStop, fetchDataObjectTrajectory } from '@/redux/features/history-map'
import { fetchDataObjectFuelLevel } from '@/redux/features/fuel-report'
import { isVehicleOffline } from '@/lib/utils'
import { useMaintenance } from '@/context/MaintenanceContext'
import { setChartData } from '@/redux/features/history-map/history-slice'

const HereMap = dynamic(() => import('./HereMap'), { ssr: false })
const LeafletMapHistory = dynamic(() => import('./history/LeafletMapHistory'), { ssr: false })

const Home = () => {
  const { t } = useTranslation()
  const UserContext = useUser()
  const { getUserRef } = UserContext.operations
  const [mapLoaded, setMapLoaded] = useState(false)
  const [stopsData, setStopsData] = useState([])
  const [trajectoryData, setTrajectoryData] = useState([])
  const hereMapRef = useRef(null)
  const dataContentCardRef = useRef(null)
  const [selectedVehicles, setSelectedVehicles] = useState([])
  const [selectedTab, setSelectedTab] = useState('tab-vehicles')
  const [activeItem, setActiveItem] = useState(null)
  const [tripStopData, setTripStopData] = useState({})
  const [showFooterHistory, setShowFooterHistory] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isFooterOpen, setIsFooterOpen] = useState(false)
  const [selectedData, setSelectedData] = useState(null)
  const [vehicleStatus, setVehicleStatus] = useState(null)
  const [hereAaddress, setHereAddress] = useState('')
  const [hereAddressData, setHereAddressData] = useState({})
  const { isMaintenanceMode, setMaintenanceMode } = useMaintenance()

  const [indexData, setIndexData] = useState(null)
  const userToken = getUserRef().token
  const dispatch = useDispatch()
  const { vehicle, isPageLoading, isLoadingVehicles, vehiclesToMap, searchQuery, tachoData } = useSelector(
    (state: RootState) => state.maps
  )
  const {
    startDate,
    endDate,
    dataObjectTripStop,
    dataObjectTripStopTotals,
    dataObjectTrajectory,
    isGenerate,
    selectedHistoryData,
    addressData,
    stopIndex,
    label,
    historyVehicle
  } = useSelector((state: RootState) => state.history)

  const { dataObjectFuelLevel } = useSelector((state: RootState) => state.fuel)

  useEffect(() => {
    if (userToken) {
      dispatch(fetchGroupListData(userToken))
    }
  }, [dispatch])

  useEffect(() => {
    if (userToken) {
      dispatch(fetchData(userToken))
    }
  }, [dispatch, userToken])

  useEffect(() => {
    if (userToken && !isMaintenanceMode) {
      const intervalId = setInterval(() => {
        dispatch(fetchData(userToken))
      }, 20000)

      return () => clearInterval(intervalId)
    }
  }, [dispatch, userToken, isMaintenanceMode])

  useEffect(() => {
    if (vehicle) {
      const offlineStatus = isVehicleOffline(vehicle.last_timestamp, vehicle.ignition)
      setVehicleStatus(offlineStatus)
    }
  }, [vehicle])

  const filteredVehicles = useMemo(() => {
    if (searchQuery) {
      return vehiclesToMap.filter((vehicle) =>
        vehicle.object_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    return vehiclesToMap
  }, [searchQuery, vehiclesToMap])

  useEffect(() => {
    if (selectedHistoryData) {
      setSelectedData(selectedHistoryData)
      setIndexData(stopIndex)
      setTripStopData(selectedHistoryData)
      setHereAddress(addressData.here_address)
      setHereAddressData(addressData)
      setShowFooterHistory(true)
      if (hereMapRef.current) {
        hereMapRef.current.updateMarkers(selectedData)
      }
    }
  }, [selectedHistoryData])

  const handlePointClick = (data: any) => {
    if (!data.lat && !data.lon) {
      if (!dataObjectTrajectory) {
        console.error('No valid trajectory data in store')
        return
      }
      const fuelTime = new Date(data.t).getTime()
      let closestPoint = null
      let smallestDiff = Infinity

      dataObjectTrajectory.forEach((point) => {
        const trajectoryDate = new Date(point.time.replace(' ', 'T'))
        const trajectoryTime = trajectoryDate.getTime()
        const timeDiff = Math.abs(fuelTime - trajectoryTime)

        if (timeDiff < smallestDiff) {
          smallestDiff = timeDiff
          closestPoint = point
        }
      })

      if (closestPoint) {
        const localTime = new Date(closestPoint.time.replace(' ', 'T'))

        const matchedData = {
          lat: closestPoint.lat,
          lon: closestPoint.lon || closestPoint.lng,
          time: localTime.toLocaleString('sv').replace(' ', 'T'),
          fuelLevel: data.p
        }
        setSelectedData(matchedData)
        setIndexData('marker')
        dispatch(setChartData(matchedData))
         if (hereMapRef.current) {
        hereMapRef.current.updateMarkers(matchedData, 'marker')
      }
      }
    } else {
      setSelectedData(data)
      setIndexData('marker')
      if (hereMapRef.current) {
        hereMapRef.current.updateMarkers(data, 'marker')
      }
    }
  }

  useEffect(() => {
    if (selectedTab === 'tab-vehicles') {
      setShowFooterHistory(false)
    }
    if (vehicle) {
      setIsFooterOpen(true)
    }
  }, [selectedTab, vehicle, label])

  const handleGenerateClick = async () => {
    // dispatch(setGenerate(true));
    if (historyVehicle && startDate && endDate) {
      dispatch(fetchDataObjectTripStop(userToken, historyVehicle, startDate, endDate))
      dispatch(fetchDataObjectTrajectory(userToken, historyVehicle, startDate, endDate))
      dispatch(fetchDataObjectFuelLevel(userToken, historyVehicle, startDate, endDate))
    }
  }

  useEffect(() => {
    if (dataObjectTripStop) {
      const stopsData = dataObjectTripStop.map((stop) => ({
        lat: stop.lat,
        lng: stop.lon,
        ...stop
      }))
      setStopsData(stopsData)
    }
    if (dataObjectTrajectory) {
      const trajectoryData = dataObjectTrajectory.map((track) => ({
        lat: track.lat,
        lng: track.lon,
        ...track
      }))
      setTrajectoryData(trajectoryData)
    }
  }, [dataObjectTripStop, dataObjectTrajectory])

  useEffect(() => {
    loadHereMaps(() => {
      setMapLoaded(true)
    })
  }, [])

  if (isLoadingVehicles || !vehiclesToMap || !mapLoaded) {
    return <LayoutLoader />
  }

  const renderMap = () => {
    if (selectedTab === 'tab-vehicles') {
      return (
        <>
          {!activeItem ? (
            <div>
              <HereMap vehicleList={filteredVehicles} isSidebarOpen={isSidebarOpen} />
            </div>
          ) : (
            <div>
              {vehicle ? (
                <HereMap
                  vehicleList={filteredVehicles}
                  lat={vehicle.lat}
                  lon={vehicle.lon}
                  isSidebarOpen={isSidebarOpen}
                />
              ) : (
                <HereMap lat={56.31226} lon={22.3230616} isSidebarOpen={isSidebarOpen} />
              )}
            </div>
          )}
        </>
      )
    } else if (selectedTab === 'tab-history') {
      return vehicle ? (
        <LeafletMapHistory
          ref={hereMapRef}
          data={vehicle}
          lat={vehicle.lat}
          lon={vehicle.lon}
          zoom={15}
          stopsData={stopsData}
          trajectoryData={trajectoryData}
          selectedVehicles={selectedVehicles}
          isSidebarOpen={isSidebarOpen}
        />
      ) : (
        <LeafletMapHistory
          ref={hereMapRef}
          data={{}}
          lat={56.31226}
          lon={22.3230616}
          zoom={15}
          stopsData={stopsData}
          trajectoryData={trajectoryData}
          selectedVehicles={selectedVehicles}
          isSidebarOpen={isSidebarOpen}
        />
      )
    }
    return null
  }

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  const toggleFooter = () => {
    if (selectedTab === 'tab-vehicles') {
      setIsFooterOpen((prev) => !prev)
    } else {
      setShowFooterHistory((prev) => !prev)
    }
  }

  return (
    <>
      {vehiclesToMap ? (
        <div className='flex relative sidebar-map-container'>
          <div className={`w-[320px] bg-white p-0   ${isSidebarOpen ? 'block' : 'hidden'}`}>
            <SidebarContent
              vehiclesToMap={filteredVehicles}
              dataObjectTripStop={stopsData}
              vehicleHistoryMap={vehicle}
              isGenerate={isGenerate}
              selectedVehicles={selectedVehicles}
              setSelectedVehicles={setSelectedVehicles}
              handleGenerateClick={handleGenerateClick}
              setSelectedTab={setSelectedTab}
              setActiveItem={setActiveItem}
            />
            <button
              className='border fixed top-40 left-[310px] bg-white text-black p-2 rounded-full  z-[10]'
              onClick={toggleSidebar}
            >
              <Icon icon='tabler:chevron-left' className='text-lg' />
            </button>
          </div>
          <button
            className={`border fixed top-40 left-0 bg-white text-black p-2 rounded-full  z-[10] ${
              isSidebarOpen ? 'hidden' : 'block'
            }`}
            onClick={toggleSidebar}
          >
            <Icon icon='tabler:chevron-right' className='text-lg' />
          </button>

          <div className='flex-grow p-0'>{renderMap()}</div>

          <div
            className={`bg-gray-800 text-white p-0 absolute bottom-0 left-[320px] `}
            style={{ width: 'calc(100vw - 320px)' }}
          >
            <Card
              ref={dataContentCardRef}
              className='data-content-card p-0 bg-white w-full rounded-none shadow-none'
            >
              <CardContent className='px-0 pt-0 pb-0'>
                <div>
                  {vehicle && selectedTab === 'tab-vehicles' && (
                    <div className={`${isFooterOpen ? 'block' : 'hidden'}`}>
                      <FooterMap 
                        data={vehicle} 
                        vehicleStatus={vehicleStatus}
                        tachoData={tachoData}
                      />
                    </div>
                  )}
                  {dataObjectTripStopTotals && selectedTab !== 'tab-vehicles' && (
                    <div className={`${showFooterHistory ? 'block' : 'hidden'}`}>
                      <FooterMapHistory
                        dataObjectFuelLevel={dataObjectFuelLevel}
                        data={dataObjectTripStopTotals}
                        tripStopData={tripStopData}
                        indexLabel={label}
                        dataObjectTrajectory={trajectoryData}
                        onPointClick={handlePointClick}
                        activeTab={selectedTab}
                        here_address={hereAaddress}
                        hereAddressData={hereAddressData}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            {selectedTab === 'tab-vehicles' ? (
              <>
                {vehicle && (
                  <button
                    onClick={toggleFooter}
                    className={`absolute ${
                      isFooterOpen ? 'top-[-25px]' : 'bottom-5'
                    } left-0 mt-2 mr-2 border bg-white text-black p-2 rounded-full`}
                  >
                    <Icon
                      icon={isFooterOpen ? 'tabler:chevron-down' : 'tabler:chevron-up'}
                      className='text-lg'
                    />
                  </button>
                )}
              </>
            ) : (
              <>
                {selectedHistoryData && (
                  <button
                    onClick={toggleFooter}
                    className={`absolute ${
                      showFooterHistory ? 'top-[-25px]' : 'bottom-5'
                    } left-0 mt-2 mr-2 border bg-white text-black p-2 rounded-full`}
                  >
                    <Icon
                      icon={showFooterHistory ? 'tabler:chevron-down' : 'tabler:chevron-up'}
                      className='text-lg'
                    />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <div className='flex flex-col md:flex-row gap-5'>
          <Card title='Collapse Icon Accordion' className='p-6'>
            <p className='text-sm text-default-400 dark:text-default-600'>
              The user does not have vehicles.
            </p>
          </Card>
        </div>
      )}
    </>
  )
}

export default Home
