'use client'

import React, { useState } from 'react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import axios from 'axios'

import Image from 'next/image'
import xlImage from '@/public/images/all-img/xl-image.png'
import csvImage from '@/public/images/all-img/csv-image.png'

const GeocodeFileProcessor = () => {
  const [fileData, setFileData] = useState(null)
  const [processedData, setProcessedData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) {
      setErrorMessage('No file uploaded')
      return
    }

    const fileType = file.name.split('.').pop().toLowerCase()
    if (fileType === 'xls' || fileType === 'xlsx') {
      parseExcel(file)
    } else if (fileType === 'csv') {
      parseCSV(file)
    } else {
      setErrorMessage('Unsupported file type. Please upload an Excel (.xls or .xlsx) or CSV file.')
    }
  }

  const parseExcel = (file) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        if (e.target.result instanceof ArrayBuffer) {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          const sheetName = workbook.SheetNames[0]
          const sheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 })
          setFileData(jsonData)
          setErrorMessage('')
        } else {
          setErrorMessage('Failed to process the file. Please try again.')
        }
      } catch (error) {
        console.error('Error processing Excel file:', error.message)
        setErrorMessage('Failed to read Excel file. Please ensure it is a valid file.')
      }
    }

    reader.onerror = () => {
      setErrorMessage('Error reading file. Please try again.')
    }

    reader.readAsArrayBuffer(file)
  }

  const parseCSV = (file) => {
    Papa.parse(file, {
      header: false,
      complete: (result) => {
        try {
          setFileData(result.data)
          setErrorMessage('')
        } catch (error) {
          console.error('Error processing CSV file:', error.message)
          setErrorMessage('Failed to read CSV file. Please ensure it is a valid file.')
        }
      },
      skipEmptyLines: true
    })
  }

  const processCSV = async () => {
    if (!fileData) {
      setErrorMessage('No data to process. Please upload a file first.')
      return
    }

    const addressColumnIndex = 1
    const addresses = fileData.slice(1).map((row) => row[addressColumnIndex])

    setLoading(true)

    const updatedData = await Promise.all(
      addresses.map(async (address) => {
        const { lat, lng } = await fetchLatLon(address)

        // Ganti null dengan not found
        const latitude = lat !== null ? lat : 'not found'
        const longitude = lng !== null ? lng : 'not found'

        return { address, latitude, longitude }
      })
    )

    setProcessedData(updatedData)
    setLoading(false)
  }

  const fetchLatLon = async (address) => {
    const apiKey = process.env.NEXT_PUBLIC_HERE_MAPS_TOKEN
    const url = `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(
      address
    )}&apiKey=${apiKey}`

    try {
      const response = await axios.get(url)
      const location = response.data.items[0]?.position || { lat: null, lng: null }

      if (location.lat !== null && location.lng !== null) {
        return location
      } else {
        console.warn(`Address not found: ${address}. Retrying with fallback...`)

        // Fallback: Ambil bagian sebelum koma
        const fallbackAddress = address.split(',')[0].trim()
        const fallbackUrl = `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(
          fallbackAddress
        )}&apiKey=${apiKey}`

        const fallbackResponse = await axios.get(fallbackUrl)
        const fallbackLocation = fallbackResponse.data.items[0]?.position || {
          lat: null,
          lng: null
        }
        return fallbackLocation
      }
    } catch (error) {
      return { lat: null, lng: null }
    }
  }

  const downloadCSV = () => {
    if (!processedData) return

    const csv = Papa.unparse(processedData)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'Processed Addresses.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadExcel = () => {
    if (!processedData) return

    const worksheet = XLSX.utils.json_to_sheet(processedData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Processed Data')

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'Processed Addresses.xlsx')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className='flex flex-col items-start'>
      <h1 className='text-xl font-bold'>Geocode File Processor</h1>
      <h5>Please choose file xl or csv</h5>
      <div className='flex flex-col sm:flex-row gap-2 pt-4 top-component'>
        <div>
          <input type='file' accept='.xls,.xlsx,.csv' onChange={handleFileUpload} />
        </div>
        {errorMessage && <p className='text-red-500'>{errorMessage}</p>}
        {fileData && (
          <div>
            <button
              onClick={processCSV}
              className='px-4 py-2 bg-primary text-white rounded'
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Process Addresses'}
            </button>
          </div>
        )}
        {processedData && (
          <div className='flex flex-col sm:flex-row gap-2'>
            <button onClick={downloadCSV} className='px-4 py-2 bg-green-500 text-white rounded'>
              Download Processed CSV
            </button>
            <button onClick={downloadExcel} className='px-4 py-2 bg-yellow-500 text-white rounded'>
              Download Processed Excel
            </button>
          </div>
        )}
      </div>
      <div className='bottom-component mt-4 \'>
        <span className='font-bold'>
          Ensure your XLS/CSV file is in a valid format to obtain accurate latitude and longitude: <br />
          * Avoid unnecessary empty rows. <br />
          * The first column should contain numbers or letters.  <br />
          * The second column should contain addresses.  <br />
        </span>
        <div className='flex gap-3 pt-2'>
          <div>
            Example for xl format
            <Image src={xlImage} alt='' objectFit='cover' className='h-60 w-60 text-primary' />
          </div>
          <div>
            Example for csv format
            <Image src={csvImage} alt='' objectFit='cover' className='h-60 w-60 text-primary' />
          </div>
        </div>
      </div>
    </div>
  )
}

export default GeocodeFileProcessor
