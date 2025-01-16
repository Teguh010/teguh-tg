'use client'

import React, { useState, useEffect, useRef } from 'react'
import { parse, isValid } from 'date-fns'
import { useDispatch } from 'react-redux'
import Chart from 'react-apexcharts'
import { debounce } from 'lodash'
import { parseSpeed } from '@/lib/utils'
import { setChartData } from '@/redux/features/history-map/history-slice'

const parseCustomDate = (dateString) => {
  const formats = [
    'dd/MM/yyyy HH:mm', // Format: 09/09/2024 13:33
    'yyyy-MM-dd HH:mm:ss', // Format: 2024-09-09 13:33:00
    'yyyy-MM-dd HH:mm', // Format: 2024-09-09 13:33
    'yyyy-MM-dd hh:mma', // Format: 2024-09-09 01:33PM
    'yyyy-MM-dd', // Format: 2024-09-09
  ]

  let parsedDate = null

  // Loop over formats and try to parse the date
  for (let format of formats) {
    parsedDate = parse(dateString, format, new Date())
    if (isValid(parsedDate)) {
      return parsedDate
    }
  }

  // If no valid date is found, return current date as fallback
  return new Date()
}

const TotalSpeed = ({ dataObjectTrajectory, onPointClick }) => {
  const [series, setSeries] = useState([])
  const [options, setOptions] = useState({})
  const chartRef = useRef(null)
  const dispatch = useDispatch()

  useEffect(() => {
    const updateChart = () => {
      if (!dataObjectTrajectory || dataObjectTrajectory.length === 0) {
        setSeries([])
        setOptions({})
        return
      }

      const speeds = dataObjectTrajectory.map((item) => parseSpeed(item.spd))

      const times = dataObjectTrajectory.map((item) => parseCustomDate(item.time).getTime())

      setSeries([
        {
          name: 'Vehicle Speed',
          data: times.map((time, index) => ({
            x: time,
            y: speeds[index],
          })),
        },
      ])

      setOptions({
        chart: {
          id: 'area-datetime',
          type: 'area',
          height: 185,
          animations: {
            enabled: false, // Disable animations for better performance
          },
          zoom: {
            enabled: true, // Disable zooming for better performance
          },
          toolbar: {
            show: true, // Hide toolbar for better performance
          },
          events: {
            click: function (event, chartContext, config) {
              const dataIndex = config.dataPointIndex
              if (dataIndex >= 0 && dataIndex < dataObjectTrajectory.length) {
                const clickedData = dataObjectTrajectory[dataIndex]
                onPointClick(clickedData)
                dispatch(setChartData(clickedData))
              }
            },
          },
        },
        stroke: {
          curve: 'straight', // Simple straight line for better performance
        },
        dataLabels: {
          enabled: false, // Disable data labels for better performance
        },
        xaxis: {
          type: 'datetime',
          labels: {
            show: false, // Hide x-axis labels for better performance
          },
        },
        yaxis: {
          title: {
            text: 'Speed (km/h)',
          },
        },
        tooltip: {
          enabled: true, 
          x: {
            formatter: (value) => {
              const date = new Date(value)
              return `${date.getDate()}/${
                date.getMonth() + 1
              }/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
            },
          },
        },
        legend: {
          show: false, // Hide legend for better performance
        },
      })
    }

    const timeoutId = setTimeout(updateChart, 300)
    return () => clearTimeout(timeoutId)
  }, [dataObjectTrajectory])

// useEffect(() => {
//   const handleWheelZoom = debounce((event) => {
//     if (chartRef.current) {
//       event.preventDefault()
//       event.stopPropagation() // Prevent the event from affecting other elements
//       event.stopImmediatePropagation() // Ensure no other listeners are triggered

//       const chart = chartRef.current.chart
//       const chartRect = chart.w.globals.dom.baseEl.getBoundingClientRect()
//       const mouseX = (event.clientX - chartRect.left) / chartRect.width

//       const currentMinX = chart.w.globals.minX
//       const currentMaxX = chart.w.globals.maxX
//       const totalX = currentMaxX - currentMinX

//       // Smaller zoom factors for smoother zooming
//       const zoomFactorIn = 0.05 // Smaller for smoother zoom in
//       const zoomFactorOut = 0.95 // Slightly larger for smoother zoom out

//       let newMinX, newMaxX

//       if (event.deltaY < 0) {
//         const zoomRange = zoomFactorIn * totalX
//         const midPoint = currentMinX + mouseX * totalX
//         newMinX = midPoint - zoomRange / 2
//         newMaxX = midPoint + zoomRange / 2
//       } else {
//         const zoomRange = zoomFactorOut * totalX
//         newMinX = currentMinX - zoomRange / 2
//         newMaxX = currentMaxX + zoomRange / 2
//       }

//       newMinX = Math.max(newMinX, chart.w.globals.initialMinX)
//       newMaxX = Math.min(newMaxX, chart.w.globals.initialMaxX)

//       if (!isNaN(newMinX) && !isNaN(newMaxX) && newMinX < newMaxX) {
//         chart.zoomX(newMinX, newMaxX)
//       }
//     }
//   }, 40)

//   const chartElement = document.querySelector('#chart')

//   if (chartElement) {
//     chartElement.addEventListener('wheel', handleWheelZoom, { passive: false }) // Use passive: false to ensure smooth behavior
//   }

//   return () => {
//     if (chartElement) {
//       chartElement.removeEventListener('wheel', handleWheelZoom)
//     }
//   }
// }, [])

useEffect(() => {
  const handleWheelZoom = debounce((event) => {
    if (chartRef.current) {
      const chart = chartRef.current.chart
      const chartRect = chart.w.globals.dom.baseEl.getBoundingClientRect()

      // Ensure the wheel event only affects the chart if the mouse is over the chart area
      if (
        event.clientX >= chartRect.left &&
        event.clientX <= chartRect.right &&
        event.clientY >= chartRect.top &&
        event.clientY <= chartRect.bottom
      ) {
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()

        const mouseX = (event.clientX - chartRect.left) / chartRect.width
        const currentMinX = chart.w.globals.minX
        const currentMaxX = chart.w.globals.maxX
        const totalX = currentMaxX - currentMinX

         const zoomFactorIn = 0.1 // Make zoom-in slower and smoother
        const zoomFactorOut = 5 
        let newMinX, newMaxX

        if (event.deltaY < 0) {
          const zoomRange = zoomFactorIn * totalX
          const midPoint = currentMinX + mouseX * totalX
          newMinX = midPoint - zoomRange / 2
          newMaxX = midPoint + zoomRange / 2
        } else {
          const zoomRange = zoomFactorOut * totalX
          newMinX = currentMinX - zoomRange / 2
          newMaxX = currentMaxX + zoomRange / 2
        }

        newMinX = Math.max(newMinX, chart.w.globals.initialMinX)
        newMaxX = Math.min(newMaxX, chart.w.globals.initialMaxX)

        if (!isNaN(newMinX) && !isNaN(newMaxX) && newMinX < newMaxX) {
          chart.zoomX(newMinX, newMaxX)
        }
      }
    }
  }, 40) // Debounce to avoid too frequent zooming

  const chartElement = document.querySelector('#chart')

  if (chartElement) {
    chartElement.addEventListener('wheel', handleWheelZoom, { passive: false }) // Disable passive behavior for smooth zoom
  }

  return () => {
    if (chartElement) {
      chartElement.removeEventListener('wheel', handleWheelZoom)
    }
  }
}, [])



  return (
    <div>
      <div id='chart' style={{ minHeight: '200px', height: '200px', marginTop: '-15px' }}>
        {series.length > 0 && (
          <Chart
            key={JSON.stringify(series)}
            ref={chartRef}
            options={options}
            series={series}
            type='area'
            height={185}
            width='100%'
          />
        )}
      </div>
    </div>
  )
}

export default TotalSpeed
