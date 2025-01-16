import React, { useState } from 'react'
import { Icon } from '@iconify/react'
import CustomDataList1 from './custom-data-list1'
import CustomDataList2 from './custom-data-list2'
import './footer-map.css'

interface FooterMapProps {
  data?: any
  onClick?: () => void
  vehicleStatus: boolean
  tachoData?: any[]
}

const FooterMap: React.FC<FooterMapProps> = ({ data, onClick, vehicleStatus, tachoData }) => {
  const [showColumns, setShowColumns] = useState(false)
  const hasCustomDataList2Data = 
    data?.virtual_odometer_continuous || 
    data?.['(can)_engine_hours_(total)'] || 
    data?.['(can)_fuel_tank_level'] || 
    data?.['(can)_rpm'];

  const gridClass = hasCustomDataList2Data ? 'grid-cols-7' : 'grid-cols-1';
  return (
    <div>
      <div className={`grid ${gridClass} pb-2`}>
        <div className={`first-column border-gray-300 ${hasCustomDataList2Data ? 'col-span-3' : 'col-span-7'}`}>
          <CustomDataList1 data={data} vehicleStatus={vehicleStatus} hasCustomDataList2Data={hasCustomDataList2Data} />
        </div>

        {hasCustomDataList2Data && (
          <div className={`second-column border-l border-gray-300 ${showColumns ? 'show' : ''} col-span-4`}>
            <CustomDataList2 
              data={data} 
              objectId={data?.id} 
              tachoData={tachoData} 
            />
          </div>
        )}
      </div>

      <div className='flex justify-center'>
        <button 
          className='button-show-toggle bg-primary text-white p-2 rounded-full absolute bottom-2 right-2' 
          onClick={() => setShowColumns(!showColumns)}
        >
          <Icon icon={`${showColumns ? 'tabler:chevron-up' : 'tabler:chevron-down'}`} className='text-lg' />
        </button>
      </div>
    </div>
  )
}

export default FooterMap
