import { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { AntPath, antPath } from 'leaflet-ant-path'
import { handleSelectHistoryDataStore } from '@/redux/features/history-map/history-thunks' // Impor thunk
import { RootState } from '@/redux/store' // Import RootState untuk tipe state

interface HereMapProps {
  lat: number
  lon: number
  zoom: number
  width?: string
  height?: string
  data: any
  stopsData: any[]
  selectedVehicles: any[]
  trajectoryData: any[]
  isSidebarOpen?: boolean
}

const LeafletMapHistory = forwardRef<any, HereMapProps>(
  (
    {
      lat,
      lon,
      zoom,
      width = '100%',
      data,
      stopsData,
      selectedVehicles,
      trajectoryData,
      isSidebarOpen
    },
    ref
  ) => {
    const mapRef = useRef<HTMLDivElement>(null)
    const mapInstance = useRef<L.Map | null>(null)
    const historyMarkersGroup = useRef<L.LayerGroup | null>(null)
    const pointMarkersGroup = useRef<L.LayerGroup | null>(null)
    const polylineGroup = useRef<L.LayerGroup | null>(null)

    const { allowZoom, stopIndex, selectedHistoryData, chartData } = useSelector(
      (state: RootState) => state.history
    )
    const dispatch = useDispatch()

    const dotIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 16 16"><path fill="#0000FF" d="M8 4C5.8 4 4 5.8 4 8s1.8 4 4 4s4-1.8 4-4s-1.8-4-4-4"/><path fill="#0000FF" d="M8 1c3.9 0 7 3.1 7 7s-3.1 7-7 7s-7-3.1-7-7s3.1-7 7-7m0-1C3.6 0 0 3.6 0 8s3.6 8 8 8s8-3.6 8-8s-3.6-8-8-8"/></svg>`

    const createWaypointIcon = (label: string, color: string) => {
      return L.divIcon({
        html: `
          <svg xmlns="http://www.w3.org/2000/svg" width="${
            label === 'Stop' || label === 'Start' ? '32' : '31'
          }" height="${label === 'Stop' || label === 'Start' ? '32' : '28'}" viewBox="0 0 48 48">
            <path d="M24 0C12.955 0 4 9.075 4 20.075C4 28.35 24 48 24 48S44 28.35 44 20.075C44 9.075 35.045 0 24 0Z" fill="${color}" />
            <text x="24" y="24" font-size="${
              label === 'Stop' || label === 'Start' ? '15' : '20'
            }" text-anchor="middle" fill="#ffffff">${label}</text>
          </svg>`,
        className: 'custom-marker-icon',
        iconSize: [28, 28],
        iconAnchor: [14, 28]
      })
    }

    useImperativeHandle(ref, () => ({
      showTrackingPath,
      setMapPosition
    }))

    useEffect(() => {
      if (selectedHistoryData && allowZoom) {
        updateMarkers(selectedHistoryData, stopIndex)
      }
    }, [selectedHistoryData, stopIndex])

    useEffect(() => {
      if (chartData) {
        updateMarkers(chartData, true)
      }
    }, [chartData])

    useEffect(() => {
      if (!mapRef.current) return

      if (!mapInstance.current) {
        const map = L.map(mapRef.current).setView([lat, lon], zoom)

        // Define the base map layer
        const baseMapLayer = L.tileLayer(
          `https://maps.hereapi.com/v3/base/mc/{z}/{x}/{y}/jpeg?apiKey=${process.env.NEXT_PUBLIC_HERE_MAPS_TOKEN}`,
          {
            maxZoom: 20,
            attribution: '&copy; 2024 HERE Technologies'
          }
        )
        const satelliteLayer = L.tileLayer(
          `https://{s}.aerial.maps.ls.hereapi.com/maptile/2.1/maptile/newest/satellite.day/{z}/{x}/{y}/256/png8?apiKey=${process.env.NEXT_PUBLIC_HERE_MAPS_TOKEN}`,
          {
            subdomains: ['1', '2', '3', '4'],
            maxZoom: 20,
            detectRetina: true,
            attribution: '&copy; 2024 HERE Technologies'
          }
        )

        // Truck layer
        const truckLayer = L.tileLayer(
          `https://{s}.base.maps.ls.hereapi.com/maptile/2.1/trucktile/newest/normal.day/{z}/{x}/{y}/256/png8?apiKey=${process.env.NEXT_PUBLIC_HERE_MAPS_TOKEN}`,
          {
            subdomains: ['1', '2', '3', '4'],
            maxZoom: 20,
            detectRetina: true,
            attribution: '&copy; 2024 HERE Technologies'
          }
        )

        // Add baseMapLayer by default
        baseMapLayer.addTo(map)

        // Layer control to switch between baseMap, satellite, and truck
        L.control
          .layers({
            'Standard Map': baseMapLayer,
            'Satellite Map': satelliteLayer,
            'Truck Map': truckLayer
          })
          .addTo(map)

        historyMarkersGroup.current = L.layerGroup().addTo(map)
        pointMarkersGroup.current = L.layerGroup().addTo(map)
        polylineGroup.current = L.layerGroup().addTo(map)
        mapInstance.current = map
      }
    }, [lat, lon, zoom])

    const setMapPosition = () => {
      if (mapInstance.current && data.lat) {
        mapInstance.current.setView([data.lat, data.lon], zoom)

        const defaultMarker = L.marker([data.lat, data.lon], {
          icon: L.divIcon({
            html: dotIconSVG,
            className: 'default-marker-icon'
          })
        })
        defaultMarker.addTo(historyMarkersGroup.current)
      }
    }

    useEffect(() => {
      setMapPosition()
    }, [data])

    const updateMarkers = (selectedData: any, marker?: boolean) => {
      if (mapInstance.current) {
        pointMarkersGroup.current.clearLayers()

        if (selectedData?.lat && selectedData?.lon) {
          const newCoords = [selectedData.lat, selectedData.lon] as [number, number]
          if (mapInstance.current) {
            mapInstance.current.setView(newCoords, zoom)

            if (marker) {
              const dotMarker = L.marker(newCoords, {
                icon: L.divIcon({ html: dotIconSVG, className: '' })
              })
              dotMarker.addTo(pointMarkersGroup.current)
            }
          }
        }
      }
    }

    useEffect(() => {
      if (selectedVehicles.length > 0) {
        updateMarkers(selectedVehicles[0], null)
      }
    }, [selectedVehicles])

    const showTrackingPath = () => {
      if (!mapInstance.current || trajectoryData.length === 0 || !polylineGroup.current) return

      // Clear previous polylines and markers
      polylineGroup.current.clearLayers()
      historyMarkersGroup.current?.clearLayers()

      // Sort data berdasarkan waktu
      const sortedTrajectory = [...trajectoryData].sort((a, b) => 
        new Date(a.time).getTime() - new Date(b.time).getTime()
      )

      // Gunakan data yang sudah diurutkan untuk membuat latlngs
      const latlngs = sortedTrajectory.map((point) => [point.lat, point.lon] as [number, number])

      // Create AntPath dengan data yang sudah diurutkan
      let antPolyline = new antPath(latlngs, {
        color: 'rgba(0, 128, 255, 0.7)',
        weight: 6,
        pulseColor: '#FFFFFF',
        delay: 950,
        dashArray: [30, 60],
        reverse: false,
        paused: false
      })

      // Add the path to the group and map
      antPolyline.addTo(polylineGroup.current)

      // Initialize stop counter and marker index
      let markerIndex = 0
      const waypointMarkers: L.Marker[] = []

      // Add start marker as the first stop
      let startCoords = stopsData[0]
      const firstStop = stopsData.find(
        (point) =>
          point.state !== 'moving' && point.lat === startCoords.lat && point.lon === startCoords.lon
      )
      if (firstStop) {
        startCoords = firstStop
      }

      const startIcon = L.marker([startCoords.lat, startCoords.lon], {
        icon: createWaypointIcon('Start', '#32CD32')
      })
      waypointMarkers.push(startIcon)

      startIcon.on('click', async () => {
        const stopIndex = 0
        const data = startCoords
        const label = 'Start'
        // Dispatching Redux actions when marker is clicked tanpa zoom
        await dispatch(handleSelectHistoryDataStore({ data, label, stopIndex, allowZoom: false }))
      })
      markerIndex++ // Increment marker index

      // Add stop marker
      let stopCoords = stopsData[stopsData.length - 1]
      const lastStop = stopsData.find(
        (point) =>
          point.state !== 'moving' && point.lat === stopCoords.lat && point.lon === stopCoords.lon
      )
      if (lastStop) {
        stopCoords = lastStop
      }

      const stopIcon = L.marker([stopCoords.lat, stopCoords.lon], {
        icon: createWaypointIcon('Stop', '#FF0000')
      })
      waypointMarkers.push(stopIcon)

      stopIcon.on('click', async () => {
        const stopIndex = markerIndex - 1
        const data = stopCoords
        const label = 'Stop' // Last stop is labeled as 'Stop'
        // Dispatching Redux actions when marker is clicked tanpa zoom
        await dispatch(handleSelectHistoryDataStore({ data, label, stopIndex, allowZoom: false }))
      })
      markerIndex++ // Increment marker index

      // Create waypoint markers for stopsData
      let stopCounter = 0
      stopsData.forEach((point) => {
        if (point.state !== 'moving' && point !== firstStop && point !== lastStop) {
          stopCounter++

          const label = stopCounter.toString()
          const icon = createWaypointIcon(label, '#1E90FF')

          if (point.lat && point.lon) {
            const marker = L.marker([point.lat, point.lon], { icon })
            waypointMarkers.push(marker)

            const currentMarkerIndex = markerIndex - 1

            marker.on('click', async () => {
              const stopIndex = currentMarkerIndex
              const data = point
              const label = 'Stop'
              await dispatch(
                handleSelectHistoryDataStore({ data, label, stopIndex, allowZoom: false })
              )
            })
            markerIndex++ // Increment marker index
          }
        }
      })

      // Add all markers to the historyMarkersGroup
      waypointMarkers.forEach((marker) => marker.addTo(historyMarkersGroup.current!))

      // Fit map bounds to polyline
      mapInstance.current.fitBounds(antPolyline.getBounds())
    }

    useEffect(() => {
      if (trajectoryData.length > 0 && stopsData.length > 0) {
        showTrackingPath()
      }
    }, [trajectoryData, stopsData, pointMarkersGroup, historyMarkersGroup])

    useEffect(() => {
      if (mapInstance.current) {
        mapInstance.current.invalidateSize()
      }
    }, [isSidebarOpen])

    return (
      <div
        ref={mapRef}
        style={{ width, height: 'calc(100vh - 52px)', top: '0px', right: '0px', zIndex: '0' }}
      />
    )
  }
)

export default LeafletMapHistory
