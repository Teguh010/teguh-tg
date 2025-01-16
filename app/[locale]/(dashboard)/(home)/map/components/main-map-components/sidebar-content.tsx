'use client'
import { useState, useEffect, useMemo, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import VehiclePicker from './vehicle-picker'
import DatePickerWithRange from './date-picker-with-range'
import CustomList from './custom-list'
import CustomListCheckBox from './custom-list-checkbox'
import BarChart from './bar-chart'
import GroupSelection from './group-selction'
import { Icon } from '@iconify/react'
import { useUser } from '@/context/UserContext'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store' // Import RootState untuk tipe state
import {
  setStartDate as setStartDateAction,
  setEndDate as setEndDateAction,
  setHistoryVehicle,
  setMinMoving,
  setMinStationary,
  setShowStationaryIgnition,
  setAllowZooming,
} from '@/redux/features/history-map/history-slice'
import CollapsibleComponent from '../history-components/collapsible-component'
import { handleSelectHistoryDataStore } from '@/redux/features/history-map/history-thunks' // Impor thunk

import { fetchHereAddress } from '@/lib/utils'
import { addressCacheAdd } from '@/models/address_cache'
import { tachoLiveDrivingStateStats } from '@/models/tachograph'
import {
  setSearchQuery,
  setFilteredVehicle,
  setObjectGroupId,
  setVehicle,
} from '@/redux/features/main-map/maps-slice'

import {
  fetchGroupListDataById,
  filterByGroup,
  filterBySearch,
} from '@/redux/features/main-map/maps-thunks'

import { setActiveVehicle, setTachoData } from '@/redux/features/main-map/maps-slice'

const SidebarContent = ({
  vehiclesToMap,
  dataObjectTripStop,
  vehicleHistoryMap,
  isGenerate,
  selectedVehicles,
  setSelectedVehicles,
  handleGenerateClick,
  setSelectedTab,
  setActiveItem,
}) => {
  const { t } = useTranslation()
  const UserContext = useUser()
  const { getUserRef } = UserContext.operations
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [selectedTab, setSelectedTabState] = useState('tab-vehicles')
  const [activeItem, setActiveItemState] = useState(null)
  const [selectedGroupIds, setSelectedGroupIds] = useState([])
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false)
  const [setByVehicleObjectClick, setSetByVehicleObjectClick] = useState(false)
  const [setByHistoryObjectClick, setSetByHistoryObjectClick] = useState(false)

  const activeItemRef = useRef(null)
  const activeHistoryItemRef = useRef(null)

  const handleToggleCollapsible = () => {
    setIsCollapsibleOpen((prev) => !prev)
  }

  const userToken = getUserRef().token
  const dispatch = useDispatch()

  const {
    searchQuery,
    dataObjectListGroup,
    dataObjectListGroupIds,
    dataObjectList,
    isLoadingGroup,
    activeVehicleId,
  } = useSelector((state: RootState) => state.maps)

  const {
    startDate,
    endDate,
    settings,
    minMoving,
    minStationary,
    showStationaryIgnition,
    stopIndex,
    historyVehicle,
  } = useSelector((state: RootState) => state.history)
  useEffect(() => {
    dispatch(filterBySearch())
  }, [searchQuery])

  useEffect(() => {
    dispatch(filterByGroup())
  }, [dataObjectList, dataObjectListGroupIds])

  useEffect(() => {
    if (!vehicleHistoryMap || !startDate || !endDate || selectedVehicles.length === 0) {
      isGenerate = false
    }
  }, [
    startDate,
    endDate,
    minMoving,
    selectedVehicles,
    vehicleHistoryMap,
    minStationary,
    showStationaryIgnition,
  ])

  const handleCheckboxChange = (vehicle, checked) => {
    if (checked) {
      setSelectedVehicles((prev) => [...prev, vehicle])
    } else {
      setSelectedVehicles((prev) => prev.filter((v) => v !== vehicle))
    }
  }

  const handleSelectGroup = (selectedId: any) => {
    if (!selectedId) return
    dispatch(fetchGroupListDataById(userToken, selectedId))
    dispatch(filterByGroup())
  }

  const handleClearGroupSelection = () => {
    dispatch(setObjectGroupId(null))
    if (searchQuery) {
      dispatch(filterBySearch())
    } else {
      dispatch(setFilteredVehicle([...dataObjectList]))
    }
  }

  const handleSetStartDate = (date) => {
    dispatch(setStartDateAction(date))
  }

  const handleSetMinMoving = (value) => {
    dispatch(setMinMoving(value))
  }

  const handleSetMinStationary = (value) => {
    dispatch(setMinStationary(value))
  }

  const handleSetShowStationaryIgnition = (value) => {
    dispatch(setShowStationaryIgnition(value))
  }

  const handleSetEndDate = (date) => {
    dispatch(setEndDateAction(date))
  }

  const handleSetVehicle = (data) => {
    dispatch(setVehicle(data))
  }

  useEffect(() => {
    if (!setByVehicleObjectClick && activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    // Reset the flag after scrolling
    setSetByVehicleObjectClick(false)
  }, [activeVehicleId])

  useEffect(() => {
    if (!setByHistoryObjectClick && activeHistoryItemRef.current) {
      activeHistoryItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    // Reset the flag after scrolling
    setSetByHistoryObjectClick(false)
  }, [stopIndex])

  const VehicleObjects = () => {
    return vehiclesToMap?.map((object, index) => {
      const handleTriggerClick = async () => {
        let here_address = object.cached_address || '';
        
        if (!here_address) {
          here_address = await fetchHereAddress(object.lat, object.lon);
          try {
            await addressCacheAdd(userToken, [{
              lat: object.lat,
              lng: object.lon,
              a: here_address,
            }]);
          } catch (error) {
            console.error('Failed to cache address:', error);
          }
        }

        // Fetch tachograph data when vehicle is selected
        try {
          const tachoResponse = await tachoLiveDrivingStateStats(userToken, object.objectid);
          if (tachoResponse) {
            dispatch(setTachoData([{
              id: object.objectid,
              name: object.object_name,
              stats: [tachoResponse]
            }]));
          }
        } catch (error) {
          console.error('Error fetching tachograph data:', error);
        }

        dispatch(setVehicle({
          ...object,
          here_address,
        }));
        setActiveItem(true);
        dispatch(setHistoryVehicle(object));
        dispatch(setActiveVehicle(object.id));
        dispatch(setAllowZooming(true));
        setSetByVehicleObjectClick(true);
      };
      const isChecked = selectedVehicles.includes(object)
      const isActiveVehicle = activeVehicleId === object.id

      // const isActiveVehicle = activeVehicleId === object.id; // Check if this item is active

      return (
        <div key={index} ref={isActiveVehicle ? activeItemRef : null}>
          <CustomListCheckBox
            onCheckboxChange={(checked) => handleCheckboxChange(object, checked)}
            onClickList={handleTriggerClick}
            object={object}
            title={object.object_name}
            isChecked={isChecked}
            trip_state={object.trip_state}
            ignition={object.ignition}
            activeVehicleId={activeVehicleId}
          />
        </div>
      )
    })
  }

  const ListHistory = () => {
    if (dataObjectTripStop.length > 0) {
      const firstStop = dataObjectTripStop.find((point) => point.state !== 'moving')
      const lastStop = [...dataObjectTripStop].reverse().find((point) => point.state !== 'moving')
      const lastNumber = dataObjectTripStop.filter((point) => point.state !== 'moving').length -1
      const isActiveHistoryItem = (item, index) => {
        return stopIndex === index
      }

      return (
        <div>
          {/* Menampilkan First Stop */}
          {firstStop && (
            <CustomList
              data={firstStop}
              key='start-marker'
              onSelect={async (data) => {
                const label = 'Start'
                const stopIndex = 0 // Index untuk first stop
                await dispatch(
                  handleSelectHistoryDataStore({ data, label, stopIndex, allowZoom: true })
                )
                setActiveItemState(data)
                setSetByHistoryObjectClick(true)
              }}
              isActive={isActiveHistoryItem(firstStop, 0)}
              fallback='Start'
              bgColor='bg-green-500'
              fontSize='8px'
            />
          )}

          {/* Menampilkan Stop Points Lain */}
          {dataObjectTripStop
            .filter(
              (object) => object.state !== 'moving' && object !== firstStop && object !== lastStop
            )
            .map((object, index) => (
              <div
                ref={isActiveHistoryItem(object, index + 1) ? activeHistoryItemRef : null}
                key={index + 1}
              >
                <CustomList
                  data={object}
                  onSelect={async (data) => {
                    const label = (index + 1).toString()
                    const stopIndex = index + 1
                    await dispatch(
                      handleSelectHistoryDataStore({ data, label, stopIndex, allowZoom: true })
                    )
                    setActiveItemState(data)
                    setSetByHistoryObjectClick(true)
                  }}
                  isActive={isActiveHistoryItem(object, index + 1)}
                  fallback={(index + 1).toString()}
                  bgColor='bg-blue-500'
                  fontSize='12px'
                />
              </div>
            ))}

          {/* Menampilkan Last Stop */}
          {lastStop && (
            <div
              ref={
                isActiveHistoryItem(lastStop, lastNumber)
                  ? activeHistoryItemRef
                  : null
              }
            >
              <CustomList
                data={lastStop}
                key='stop-marker'
                onSelect={async (data) => {
                  const label = 'Stop'
                  const stopIndex = lastNumber // Index untuk last stop
                  await dispatch(
                    handleSelectHistoryDataStore({ data, label, stopIndex, allowZoom: true })
                  )
                  setActiveItemState(data)
                  setSetByHistoryObjectClick(true)
                }}
                isActive={isActiveHistoryItem(lastStop, lastNumber)}
                fallback="Stop"
                bgColor='bg-red-500'
                fontSize='8px'
              />
            </div>
          )}
        </div>
      )
    }
  }

  const handleTabChange = (value) => {
    setSelectedTabState(value)
    setSelectedTab(value)
  }

  const selectedGroupId = selectedGroupIds.length > 0 ? selectedGroupIds[0] : null

  return (
    <>
      <Card
        className='sidebar-tab p-0 rounded-none shadow-none relative z-10 h-full'
        style={{ width: '320px' }}
      >
        <div>
          <Tabs defaultValue='tab-vehicles' onValueChange={handleTabChange}>
            <TabsList className='w-full'>
              <TabsTrigger value='tab-vehicles' className='w-full'>
                Vehicles
              </TabsTrigger>
              <TabsTrigger value='tab-history' className='w-full'>
                History
              </TabsTrigger>
            </TabsList>
            {selectedTab === 'tab-vehicles' && (
              <div className='p-1'>
                <div>
                  <div style={{ height: '150px' }}>
                    <div className='flex items-center align-middle flex-col justify-center'>
                      <BarChart data={vehiclesToMap} />
                      {/* <span>some information</span> */}
                    </div>
                  </div>
                  {dataObjectListGroup && (
                    <GroupSelection
                      data={dataObjectListGroup}
                      onSelect={handleSelectGroup}
                      onClear={handleClearGroupSelection}
                      selectedGroupId={selectedGroupId}
                    />
                  )}
                </div>
                <input
                  type='text'
                  placeholder='Search vehicles...'
                  value={searchQuery}
                  onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                  className='w-full p-2 border rounded'
                />
              </div>
            )}
            <Card
              className={`tab-content-card shadow-none ${
                selectedTab === 'tab-vehicles' ? 'overflow-y-auto' : ''
              }`}
              style={{
                height:
                  selectedTab === 'tab-vehicles' ? 'calc(100vh - 350px)' : 'calc(100vh - 300px)',
              }}
            >
              {' '}
              <TabsContent value='tab-vehicles'>
                <div>{isLoadingGroup ? 'Loading..' : <VehicleObjects />}</div>
              </TabsContent>
              <TabsContent value='tab-history'>
                <div className='p-2 tab-history-content'>
                  <div className='flex flex-col w-full gap-2'>
                    <VehiclePicker
                      vehicles={dataObjectList}
                      setVehicleHistoryMap={(vehicle) => dispatch(setHistoryVehicle(vehicle))}
                      setVehicleObject={(vehicle) => dispatch(setHistoryVehicle(vehicle))}
                      selectedVehicle={historyVehicle}
                      setSelectedVehicle={setSelectedVehicle}
                      className='w-full'
                    />
                    <DatePickerWithRange
                      setStartDate={handleSetStartDate}
                      setEndDate={handleSetEndDate}
                      startDate={startDate}
                      endDate={endDate}
                      settings={settings}
                      className='w-full'
                    />
                  </div>
                  <div className='more-settings my-2'>
                    <Button
                      variant='outline'
                      color='primary'
                      size='sm'
                      className={`h-8 w-full ${
                        isCollapsibleOpen ? 'bg-primary text-primary-foreground border-primary' : ''
                      }`}
                      onClick={handleToggleCollapsible}
                    >
                      <span className='capitalize'>Additional Setting</span>
                    </Button>
                    <CollapsibleComponent
                      open={isCollapsibleOpen}
                      handleSetMinMoving={handleSetMinMoving}
                      minMoving={minMoving}
                      handleSetMinStationary={handleSetMinStationary}
                      minStationary={minStationary}
                      handleSetShowStationaryIgnition={handleSetShowStationaryIgnition}
                      showStationaryIgnition={showStationaryIgnition}
                    />{' '}
                  </div>
                  <div className='mt-2 mb-1'>
                    <Button
                      variant='outline'
                      color='success'
                      size='sm'
                      className='h-8 w-full'
                      disabled={isGenerate || !historyVehicle || !startDate || !endDate}
                      onClick={handleGenerateClick}
                    >
                      <span className='capitalize'>{isGenerate ? 'Generating' : 'Generate'}</span>
                    </Button>
                  </div>
                </div>
                <div
                  className='overflow-y-auto bg-blue'
                  style={{
                    height: isCollapsibleOpen ? 'calc(85vh - 320px)' : 'calc(85vh - 160px)',
                  }}
                >
                  {dataObjectTripStop && (
                    <div>
                      {isGenerate ? (
                        <>
                          <div className='flex justify-center '>
                            <Icon icon='eos-icons:bubble-loading' className='text-2xl' />
                          </div>
                        </>
                      ) : (
                        <ListHistory />
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Card>
          </Tabs>
        </div>
      </Card>
    </>
  )
}

export default SidebarContent

