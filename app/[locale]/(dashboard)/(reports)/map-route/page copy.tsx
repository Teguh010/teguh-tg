'use client'
import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Settings from './components/settings' // Import komponen baru
import GeolocationInput from './components/geolocation-input' // Import komponen baru
import SidebarListContainer from './components/sidebar-list-container' // Import SidebarListContainer

const HereMap = dynamic(() => import('./HereMap'), { ssr: false })

const Home = () => {
  const [routeData, setRouteData] = useState<{ distance: string; duration: string } | null>(null)
  const [tollData, setTollData] = useState<{ tolls: any[] } | null>(null)

  const [startLocation, setStartLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [endLocation, setEndLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [startSuggestions, setStartSuggestions] = useState<any[]>([])
  const [endSuggestions, setEndSuggestions] = useState<any[]>([])

  const [transportMode, setTransportMode] = useState('truck')

  const [truckHeight, setTruckHeight] = useState(350)
  const [truckGrossWeight, setTruckGrossWeight] = useState(18000)
  const [truckWeightPerAxle, setTruckWeightPerAxle] = useState(9000)

  const [smallTruckHeight, setSmallTruckHeight] = useState(250)
  const [smallTruckGrossWeight, setSmallTruckGrossWeight] = useState(7500)
  const [smallTruckWeightPerAxle, setSmallTruckWeightPerAxle] = useState(3000)

  const [totalTollPrices, setTotalTollPrices] = useState({})
  const [emissionType, setEmissionType] = useState('euro6') // Default Euro 6
  const [co2Class, setCo2Class] = useState('3') // Default CO2 Class 3

  const [trailerType, setTrailerType] = useState('Caravan') // 0=None
  const [trailersCount, setTrailersCount] = useState('0') // 0=no trailer
  const [trailerNumberAxles, setTrailerNumberAxles] = useState('0') // 0=no trailer
  const [hybrid, setHybrid] = useState('0') // 0=non-hybrid
  const [height, setHeight] = useState('350') // in cm
  const [trailerHeight, setTrailerHeight] = useState('350') // in cm
  const [vehicleWeight, setVehicleWeight] = useState('7500') // in kg
  const [passengersCount, setPassengersCount] = useState('0') // number of passengers
  const [tiresCount, setTiresCount] = useState('0') // number of tires
  const [commercial, setCommercial] = useState('0') // 0=non-commercial
  const [shippedHazardousGoods, setShippedHazardousGoods] = useState('') // list of hazardous goods
  const [heightAbove1stAxle, setHeightAbove1stAxle] = useState('350') // in cm
  const [length, setLength] = useState('') // in cm
  const [fuelType, setFuelType] = useState('Diesel') // e.g., Diesel, Petrol
  const [trailerWeight, setTrailerWeight] = useState('0') // in kg

  const startInputRef = useRef<HTMLInputElement>(null)
  const endInputRef = useRef<HTMLInputElement>(null)

  const API_KEY = process.env.NEXT_PUBLIC_HERE_MAPS_TOKEN

  const fetchLocationSuggestions = async (query: string, setSuggestions: (data: any[]) => void) => {
    if (!query) {
      setSuggestions([])
      return
    }

    const url = `https://autocomplete.search.hereapi.com/v1/autocomplete?q=${query}&apiKey=${API_KEY}&limit=5`
    const res = await fetch(url)
    const data = await res.json()

    if (data.items) {
      setSuggestions(data.items)
    } else {
      setSuggestions([])
    }
  }

//   const fetchRouteFromHereAPI = async () => {
//   if (startLocation && endLocation) {
//     let transportParams = `transportMode=truck`

//     if (transportMode === 'truck') {
//       transportParams = `transportMode=truck&vehicle[height]=${truckHeight}&vehicle[grossWeight]=${truckGrossWeight}&vehicle[weightPerAxle]=${truckWeightPerAxle}`
//     } else if (transportMode === 'small_truck') {
//       transportParams = `transportMode=truck&vehicle[height]=${smallTruckHeight}&vehicle[grossWeight]=${smallTruckGrossWeight}&vehicle[weightPerAxle]=${smallTruckWeightPerAxle}`
//     }

//     // Menambahkan parameter tambahan terkait biaya tol
//     const tollParams = `
//       trailerType=${trailerType}
//       &trailersCount=${trailersCount}
//       &trailerNumberAxles=${trailerNumberAxles}
//       &hybrid=${hybrid}
//       &height=${height}
//       &trailerHeight=${trailerHeight}
//       &vehicleWeight=${vehicleWeight}
//       &passengersCount=${passengersCount}
//       &tiresCount=${tiresCount}
//       &commercial=${commercial}
//       &shippedHazardousGoods=${encodeURIComponent(shippedHazardousGoods)}
//       &heightAbove1stAxle=${heightAbove1stAxle}
//       &length=${length}
//       &fuelType=${encodeURIComponent(fuelType)}
//       &trailerWeight=${trailerWeight}
//     `.replace(/\s+/g, '') // Menghapus whitespace

//     // Menyusun URL dengan parameter tambahan
//     const routeURL = `https://route-matching-v8.api.here.com/match?routeMatch=1&origin=${startLocation.lat},${startLocation.lon}&destination=${endLocation.lat},${endLocation.lon}&return=tolls,summary,travelSummary&tolls[summaries]=total&${transportParams}&currency=EUR&vehicleOptions.trailerType=${trailerType}&apiKey=${API_KEY}`

//     try {
//       const response = await fetch(routeURL)
//       const data = await response.json()

//       if (data.routes) {
//         const route = data.routes[0]
//         const tolls = route.sections[0].tolls || []

//         setRouteData({
//           distance: (route.sections[0].summary.length / 1000).toFixed(2),
//           duration: (route.sections[0].summary.duration / 60).toFixed(2),
//         })

//         if (tolls.length > 0) {
//           setTollData({
//             tolls: tolls.map((toll) => ({
//               name: toll.fares?.[0]?.name,
//               price: toll.fares?.[0]?.price?.value || null,
//               currency: toll.fares?.[0]?.price?.currency || null,
//             })),
//           })
//         } else {
//           setTollData(null)
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching route from HERE API:', error)
//     }
//   }
// }


  const fetchRouteFromHereAPI = async () => {
    if (API_KEY) {
      let transportParams = `transportMode=truck`

      // if (transportMode === 'truck') {
      //   transportParams = `transportMode=truck&vehicle[height]=${truckHeight}&vehicle[grossWeight]=${truckGrossWeight}&vehicle[weightPerAxle]=${truckWeightPerAxle}`
      // } else if (transportMode === 'small_truck') {
      //   transportParams = `transportMode=truck&vehicle[height]=${smallTruckHeight}&vehicle[grossWeight]=${smallTruckGrossWeight}&vehicle[weightPerAxle]=${smallTruckWeightPerAxle}`
      // }

      // Menambahkan parameter tambahan terkait biaya tol
    

      // &trailersCount=${trailersCount}
      // &trailerNumberAxles=${trailerNumberAxles}
      // &hybrid=${hybrid}
      // &height=${height}
      // &trailerHeight=${trailerHeight}
      // &vehicleWeight=${vehicleWeight}
      // &passengersCount=${passengersCount}
      // &tiresCount=${tiresCount}
      // &commercial=${commercial}
      // &shippedHazardousGoods=${encodeURIComponent(shippedHazardousGoods)}
      // &heightAbove1stAxle=${heightAbove1stAxle}
      // &length=${length}
      // &fuelType=${encodeURIComponent(fuelType)}
      // &trailerWeight=${trailerWeight}

        const tollParams = `
      &truck[trailerCount]=${trailersCount}
      &truck[trailerType]=${trailerType}`.replace(/\s+/g, '') // Menghapus whitespace
    // `origin=${startLocation.lat},${startLocation.lon}&` +

   const routeURL = `https://router.hereapi.com/v8/routes?` +
    `origin=54.69062,25.2698&` +
    `destination=41.38804,2.17001&` +
    `return=tolls,summary,travelSummary&` +
    `tolls[summaries]=total&` +
    `${transportParams}&` +
    `tolls[emissionType]=${emissionType};co2class=${co2Class}&` +
    `currency=EUR&` +
    `truck[trailerCount]=${trailersCount}&` +
    `truck[trailerHeight]=${trailerHeight}&` +
    `apiKey=${API_KEY}`;

      // Menyusun URL dengan parameter tambahan
            // const routeURL2 = `https://router.hereapi.com/v8/routes?origin=${startLocation.lat},${startLocation.lon}&destination=${endLocation.lat},${endLocation.lon}&return=tolls,summary,travelSummary&tolls[summaries]=total&${transportParams}&tolls[emissionType]=${emissionType};co2class=${co2Class}&currency=EUR&apiKey=${API_KEY}`

    // const routeURL = `
    // https://router.hereapi.com/v8/routes?origin=${startLocation.lat},${startLocation.lon}
    // &destination=${endLocation.lat},${endLocation.lon}
    // &return=tolls,summary,travelSummary&tolls[summaries]=total
    // &${transportParams}&tolls[emissionType]=${emissionType}
    // &co2class=${co2Class}&currency=EUR
    // &vehicleOptions.trailerType=${trailerType}&apiKey=${API_KEY}`

    //         const routeURL = `https://router.hereapi.com/v8/routes?origin=${startLocation.lat},${startLocation.lon}&destination=${endLocation.lat},${endLocation.lon}&return=tolls,summary,travelSummary&tolls[summaries]=total&${transportParams}&tolls[emissionType]=${emissionType};co2class=${co2Class}&vehicleOptions.trailerType=${trailerType}&vehicleOptions.trailersCount=${trailersCount}&currency=EUR&apiKey=${API_KEY}`
    //         const routeURL = `https://router.hereapi.com/v8/routes?origin=${startLocation.lat},${startLocation.lon}&
    // destination=${endLocation.lat},${endLocation.lon}&
    // return=tolls,summary,travelSummary&
    // tolls[summaries]=total&
    // tolls[emissionType]=${emissionType};co2class=${co2Class}&currency=EUR&
    // apiKey=${API_KEY}`;



      try {
        const response = await fetch(routeURL)
        const data = await response.json()

        if (data.routes) {
          const route = data.routes[0]
          const tolls = route.sections[0].tolls || []

          setRouteData({
            distance: (route.sections[0].summary.length / 1000).toFixed(2),
            duration: (route.sections[0].summary.duration / 60).toFixed(2),
          })

          if (tolls.length > 0) {
            setTollData({
              tolls: tolls.map((toll) => ({
                name: toll.fares?.[0]?.name,
                price: toll.fares?.[0]?.price?.value || null,
                currency: toll.fares?.[0]?.price?.currency || null,
              })),
            })
          } else {
            setTollData(null)
          }
        }
      } catch (error) {
        console.error('Error fetching route from HERE API:', error)
      }
    }
  }

  const handleSelectLocation = async (item: any, isStart: boolean) => {
    const placeId = item.id
    const ecodeURL = `https://lookup.search.hereapi.com/v1/lookup?id=${placeId}&apiKey=${API_KEY}`

    try {
      const response = await fetch(ecodeURL)
      const data = await response.json()

      if (data && data.position) {
        const lat = data.position.lat
        const lon = data.position.lng

        if (isStart) {
          setStartLocation({ lat, lon })
          setStartSuggestions([])
          if (startInputRef.current) {
            startInputRef.current.value = item.address.label
          }
        } else {
          setEndLocation({ lat, lon })
          setEndSuggestions([])
          if (endInputRef.current) {
            endInputRef.current.value = item.address.label
          }
        }
      } else {
        console.error('Geocoding result does not contain position.')
      }
    } catch (error) {
      console.error('Error fetching geocoding details:', error)
    }
  }

  const calculateTotalTollPrice = (tollData) => {
    const totals = {}

    tollData.tolls.forEach((toll) => {
      const { price, currency } = toll
      if (!totals[currency]) {
        totals[currency] = 0
      }
      totals[currency] += price
    })

    return totals
  }

  // useEffect(() => {
  //   if (startLocation && endLocation) {
  //     fetchRouteFromHereAPI()
  //   }
  // }, [startLocation, endLocation, transportMode, emissionType, co2Class])

    useEffect(() => {
         fetchRouteFromHereAPI()

  }, [])
  

  useEffect(() => {
    if (tollData && tollData.tolls.length > 0) {
      const totalPrices = calculateTotalTollPrice(tollData)
      setTotalTollPrices(totalPrices)
    }
  }, [tollData])

  return (
    <div>
      <div className='flex relative'>
        <div className='sidebar-map-container'>
          <div className='w-[320px] bg-white p-0 block left-sidebar'>
            <div className='form-input-container p-2'>
              <GeolocationInput
                startSuggestions={startSuggestions}
                endSuggestions={endSuggestions}
                fetchLocationSuggestions={fetchLocationSuggestions}
                handleSelectLocation={handleSelectLocation}
                setStartSuggestions={setStartSuggestions}
                setEndSuggestions={setEndSuggestions}
                startInputRef={startInputRef}
                endInputRef={endInputRef}
              />

              <Settings
                transportMode={transportMode}
                setTransportMode={setTransportMode}
                truckHeight={truckHeight}
                setTruckHeight={setTruckHeight}
                truckGrossWeight={truckGrossWeight}
                setTruckGrossWeight={setTruckGrossWeight}
                truckWeightPerAxle={truckWeightPerAxle}
                setTruckWeightPerAxle={setTruckWeightPerAxle}
                smallTruckHeight={smallTruckHeight}
                setSmallTruckHeight={setSmallTruckHeight}
                smallTruckGrossWeight={smallTruckGrossWeight}
                setSmallTruckGrossWeight={setSmallTruckGrossWeight}
                smallTruckWeightPerAxle={smallTruckWeightPerAxle}
                setSmallTruckWeightPerAxle={setSmallTruckWeightPerAxle}
                fetchRouteFromHereAPI={fetchRouteFromHereAPI}
                startLocation={startLocation}
                endLocation={endLocation}
                emissionType={emissionType}
                setEmissionType={setEmissionType}
                co2Class={co2Class}
                setCo2Class={setCo2Class}
                trailerType={trailerType}
                setTrailerType={setTrailerType}
                trailersCount={trailersCount}
                setTrailersCount={setTrailersCount}
                trailerNumberAxles={trailerNumberAxles}
                setTrailerNumberAxles={setTrailerNumberAxles}
                hybrid={hybrid}
                setHybrid={setHybrid}
                height={height}
                setHeight={setHeight}
                trailerHeight={trailerHeight}
                setTrailerHeight={setTrailerHeight}
                vehicleWeight={vehicleWeight}
                setVehicleWeight={setVehicleWeight}
                passengersCount={passengersCount}
                setPassengersCount={setPassengersCount}
                tiresCount={tiresCount}
                setTiresCount={setTiresCount}
                commercial={commercial}
                setCommercial={setCommercial}
                shippedHazardousGoods={shippedHazardousGoods}
                setShippedHazardousGoods={setShippedHazardousGoods}
                heightAbove1stAxle={heightAbove1stAxle}
                setHeightAbove1stAxle={setHeightAbove1stAxle}
                length={length}
                setLength={setLength}
                fuelType={fuelType}
                setFuelType={setFuelType}
                trailerWeight={trailerWeight}
                setTrailerWeight={setTrailerWeight}
              />
            </div>
          </div>
        </div>

        <div className='flex-grow p-0'>
          <HereMap
            startLocation={startLocation}
            endLocation={endLocation}
            setStartLocation={setStartLocation}
            setEndLocation={setEndLocation}
            transportMode={transportMode}
            onTollData={setTollData}
          />
        </div>

        {routeData && (
          <div className='w-[330px] bg-white-600 p-0 block right-sidebar sidebar-map-container'>
            <SidebarListContainer
              routeData={routeData}
              totalTollPrices={totalTollPrices}
              tollData={tollData}
              transportMode={transportMode}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default Home

// trailerType
// trailersCount
// trailerNumberAxles
// hybrid
// height
// trailerHeight
// vehicleWeight
// passengersCount
// tiresCount
// commercial
// shippedHazardousGoods
// heightAbove1stAxle
// length
// fuelType
// trailerWeight
