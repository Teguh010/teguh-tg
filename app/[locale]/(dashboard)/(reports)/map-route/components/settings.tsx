import React, { useState, useRef } from 'react'

import CustomSelect from './input-form/custom-seleect'
import CustomInput from '@/components/organisms/ReusableInput'

import {
  transportOptions,
  emissionTypeOptions,
  co2ClassOptions,
  fuelTypeOptions,
  trailerTypeOptions,
  trailersCountOptions,
  commercialOptions,
} from '../data/options'
import { SettingsFormProps } from '@/types/map_route' // Import the new type
import ReusableDialog from '@/components/organisms/ReusableDialog'

import { Button } from '@/components/ui/button'
import Card from '@/components/ui/card-snippet'

const SettingsForm: React.FC<SettingsFormProps> = ({
  transportMode,
  setTransportMode,
  truckHeight,
  setTruckHeight,
  truckGrossWeight,
  setTruckGrossWeight,
  truckWeightPerAxle,
  setTruckWeightPerAxle,
  smallTruckHeight,
  setSmallTruckHeight,
  smallTruckGrossWeight,
  setSmallTruckGrossWeight,
  smallTruckWeightPerAxle,
  setSmallTruckWeightPerAxle,
  fetchRouteFromHereAPI,
  startLocation,
  endLocation,
  emissionType,
  setEmissionType,
  co2Class,
  setCo2Class,
  // **Props baru**
  trailerType,
  setTrailerType,
  trailersCount,
  setTrailersCount,
  trailerNumberAxles,
  setTrailerNumberAxles,
  hybrid,
  setHybrid,
  height,
  setHeight,
  trailerHeight,
  setTrailerHeight,
  vehicleWeight,
  setVehicleWeight,
  passengersCount,
  setPassengersCount,
  tiresCount,
  setTiresCount,
  commercial,
  setCommercial,
  shippedHazardousGoods,
  setShippedHazardousGoods,
  heightAbove1stAxle,
  setHeightAbove1stAxle,
  length,
  setLength,
  fuelType,
  setFuelType,
  trailerWeight,
  setTrailerWeight,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const dialogContentRef = useRef(null)

  return (
    <div className='px-2'>
      <p className='font-bold py-2'>Settings:</p>
      <div className='setting-input'>
        <CustomSelect
          value={transportMode}
          onChange={setTransportMode}
          options={transportOptions}
          placeholder='Choose Transport Mode'
          label={'Transport Mode'}
        />
      </div>

      {(transportMode === 'truck' || transportMode === 'small_truck') && (
        <div>
          <p className='font-bold py-2'>
            {transportMode === 'truck' ? 'Truck' : 'Small Truck'} Settings:
          </p>

          <div className='mb-2'>
            <label>Height (cm):</label>
            <input
              type='number'
              value={transportMode === 'truck' ? truckHeight : smallTruckHeight}
              onChange={(e) =>
                transportMode === 'truck'
                  ? setTruckHeight(Number(e.target.value))
                  : setSmallTruckHeight(Number(e.target.value))
              }
              className='w-full p-2 mb-2 border rounded-md'
              min='0'
            />
          </div>

          <div className='mb-2'>
            <label>Total Weight (kg):</label>
            <input
              type='number'
              value={transportMode === 'truck' ? truckGrossWeight : smallTruckGrossWeight}
              onChange={(e) =>
                transportMode === 'truck'
                  ? setTruckGrossWeight(Number(e.target.value))
                  : setSmallTruckGrossWeight(Number(e.target.value))
              }
              className='w-full p-2 mb-2 border rounded-md'
              min='0'
            />
          </div>

          <div className='mb-2'>
            <label>Weight per Axle (kg):</label>
            <input
              type='number'
              value={transportMode === 'truck' ? truckWeightPerAxle : smallTruckWeightPerAxle}
              onChange={(e) =>
                transportMode === 'truck'
                  ? setTruckWeightPerAxle(Number(e.target.value))
                  : setSmallTruckWeightPerAxle(Number(e.target.value))
              }
              className='w-full p-2 mb-2 border rounded-md'
              min='0'
            />
          </div>

          <Button
            variant='outline'
            size='md'
            onClick={fetchRouteFromHereAPI}
            className={` mb-6  ${
              !startLocation || !endLocation ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!startLocation || !endLocation}
          >
            Submit V.09
          </Button>
        </div>
      )}
      <ReusableDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        triggerLabel='Advance Settings'
        dialogTitle='Advance Settings'
        footerButtons={[
          {
            label: 'Submit',
            variant: 'solid',
            action: () => {
              setIsDialogOpen(false)
            },
            type: 'submit',
          },
        ]}
      >
        <div className='grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-4'>
          <CustomSelect
            value={co2Class}
            onChange={setCo2Class}
            options={co2ClassOptions}
            placeholder='Choose CO2 Class'
            label={'Co2 Class'}
          />

          <CustomSelect
            value={emissionType}
            onChange={setEmissionType}
            options={emissionTypeOptions}
            placeholder='Choose Emission Type'
            label={'Emission Type'}
          />

          <CustomInput
            name='height'
            value={height}
            onChange={setHeight}
            type='number'
            label='Height (Overall) (cm)'
            placeholder='Height (Overall) (cm)'
            min={0}
          />

          <CustomInput
            name='vehicleWeight'
            value={vehicleWeight}
            onChange={setVehicleWeight}
            type='number'
            label='Vehicle Weight (kg)'
            placeholder='Vehicle Weight (kg)'
            min={0}
          />

          <div>
            <CustomSelect
              value={trailerType}
              onChange={setTrailerType}
              options={trailerTypeOptions}
              placeholder='Choose Trailer Type'
              label={'Trailer Type'}
            />
          </div>

          <div>
            <CustomSelect
              value={trailersCount}
              onChange={setTrailersCount}
              options={trailersCountOptions}
              placeholder='Choose Trailers Count'
              label={'Trailers Count'}
            />
          </div>

          <CustomInput
            name='trailerNumberAxles'
            value={trailerNumberAxles}
            onChange={setTrailerNumberAxles}
            type='number'
            label='Trailer Number of Axles'
            min={0}
          />

          <div>
            <CustomSelect
              value={hybrid}
              onChange={setHybrid}
              options={[
                { value: '0', label: 'No' },
                { value: '1', label: 'Yes' },
              ]}
              placeholder='Is Hybrid?'
              label={'Hybrid'}
            />
          </div>

          <CustomInput
            name='trailerHeight'
            value={trailerHeight}
            onChange={setTrailerHeight}
            type='number'
            label='Trailer Height (cm)'
            min={0}
          />

          <CustomInput
            name='passengersCount'
            value={passengersCount}
            onChange={setPassengersCount}
            type='number'
            label='Passengers Count'
            min={0}
          />

          <CustomInput
            name='tiresCount'
            value={tiresCount}
            onChange={setTiresCount}
            type='number'
            label='Tires Count'
            min={0}
          />

          <div>
            <CustomSelect
              value={commercial}
              onChange={setCommercial}
              options={commercialOptions}
              placeholder='Is Commercial Use?'
              label={'Commercial Use'}
            />
          </div>

          <CustomInput
            name='shippedHazardousGoods'
            value={shippedHazardousGoods}
            onChange={setShippedHazardousGoods}
            type='text'
            label='Shipped Hazardous Goods'
            min={0}
          />

          <CustomInput
            name='heightAbove1stAxle'
            value={heightAbove1stAxle}
            onChange={setHeightAbove1stAxle}
            type='number'
            label='Height Above 1st Axle (cm)'
            min={0}
          />

          <CustomInput
            name='length'
            value={length}
            onChange={setLength}
            type='number'
            label='Vehicle Length (cm)'
            min={0}
          />

          <div>
            <CustomSelect
              value={fuelType}
              onChange={setFuelType}
              options={fuelTypeOptions}
              placeholder='Choose Fuel Type'
              label={'Fuel Type'}
            />
          </div>

          <CustomInput
            name='trailerWeight'
            value={trailerWeight}
            onChange={setTrailerWeight}
            type='number'
            label='Trailer Weight (kg)'
            min={0}
          />
        </div>
      </ReusableDialog>
    </div>
  )
}

export default SettingsForm
