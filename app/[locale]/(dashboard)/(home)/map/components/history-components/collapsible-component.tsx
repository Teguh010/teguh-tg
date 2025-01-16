'use client'
import React from 'react'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import CustomInput from './custom-input'

interface CollapsibleComponentProps {
  open?: boolean // Boolean to control if the collapsible is open
  handleSetMinMoving: (value: number) => void
  minMoving: number
  handleSetMinStationary: (value: number) => void
  minStationary: number
  handleSetShowStationaryIgnition: (value: boolean) => void
  showStationaryIgnition: boolean
}

const CollapsibleComponent: React.FC<CollapsibleComponentProps> = ({
  open,
  handleSetMinMoving,
  minMoving,
  handleSetMinStationary,
  minStationary,
  handleSetShowStationaryIgnition,
  showStationaryIgnition,
}) => {
  return (
    <Collapsible open={open}>
      <CollapsibleContent className='CollapsibleContent'>
        {/* Input untuk Min Moving */}
        <div className='flex flex-col gap-2 pt-2'>
          <CustomInput
            value={minMoving}
            onChange={handleSetMinMoving}
            type='number'
            label='Min Moving (minute)'
            placeholder='Min Moving'
            min={0}
          />

          {/* Input untuk Min Stationary */}
          <CustomInput
            value={minStationary}
            onChange={handleSetMinStationary}
            type='number'
            label='Min Stationary (minute)'
            placeholder='Min Stationary'
            min={0}
          />

          {/* Checkbox untuk Show Stationary Ignition */}
          <div className=''>
            <label className='flex items-center'>
              <input
                type='checkbox'
                checked={showStationaryIgnition}
                onChange={(e) => handleSetShowStationaryIgnition(e.target.checked)}
                className='mr-2'
              />
              Stationary with Ignition
            </label>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export default CollapsibleComponent
