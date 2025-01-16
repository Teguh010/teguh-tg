import React from 'react'
import { Icon } from '@iconify/react'
import { useTranslation } from 'react-i18next'
import { firstUpperLetter } from '@/lib/utils'

interface CustomDataListProps {
  data?: any
  onClick?: () => void
  vehicleStatus: boolean
  hasCustomDataList2Data: any
}

const CustomDataList: React.FC<CustomDataListProps> = ({
  data,
  onClick,
  vehicleStatus,
  hasCustomDataList2Data,
}) => {
  const { t } = useTranslation()
  const colSpanClass = hasCustomDataList2Data ? 'col-span-4' : 'col-span-2'

  return (
    <div>
      <div className='flex items-center gap-2 w-full pt-2 px-2 justify-between'>
        <div className='label-item flex items-center gap-0 w-full pl-6'>
          <span className='mr-1.5 mt-0.5 text-primary'>
            <Icon icon='tabler:gps' className='text-2xl text-blue-400' />
          </span>
          <span className='text-gray-600 font-semibold text-md'>{data.object_name} </span>
        </div>
        <div className='label-item flex items-center text-right gap-0'>
          <span className='px-4 text-primary'>{data?.speed}km/hr</span>
          <span>
            <Icon
              icon='mdi:engine-outline'
              className={`text-lg ${data?.ignition === true ? 'text-orange-400' : 'text-gray-400'}`}
            />
          </span>
          <span className='mr-0 mt-0.5 text-primary'>
            <Icon
              icon='radix-icons:dot-filled'
              className={`text-2xl ${vehicleStatus ? 'text-gray-400' : 'text-success'}`}
            />
          </span>
          <span className={`text-md ${vehicleStatus ? 'text-gray-400' : 'text-success'}`}>
            {vehicleStatus ? 'Offline' : 'Online'}
          </span>
        </div>
      </div>
      <div className='border-b border-gray-300 my-2 px-0'></div>
      <div className='grid grid-cols gap-4 px-4'>
        <ul className='w-full'>
          {/* Address Row */}
          <li className='text-body-color dark:text-dark-6 text-sm'>
            <div className='grid grid-cols-12 items-center w-full'>
              <div className={`label-item ${colSpanClass} flex items-center`}>
                <span className='mr-1.5 mt-0.5 text-primary'>
                  <Icon icon='fa-regular:dot-circle' className='text-sm' />
                </span>
                <span className='text-gray-600'>{firstUpperLetter(t('address'))}</span>
              </div>
              <div className='value-item col-span-8'>
                <span className='text-gray-600'>
                  :{' '}
                  {data[t('cached_address')] === '' || data[t('cached_address')] === null
                    ? data.here_address
                    : data[t('cached_address')]}
                </span>
              </div>
            </div>
          </li>

          <div className='border-b border-gray-300 my-2 px-2'></div>

          {/* Lat, Lng Row */}
          <li className='text-body-color dark:text-dark-6 text-sm'>
            <div className='grid grid-cols-12 items-center w-full'>
              <div className={`label-item ${colSpanClass} flex items-center`}>
                <span className='mr-1.5 mt-0.5 text-primary'>
                  <Icon icon='fa-regular:dot-circle' className='text-sm' />
                </span>
                <span className='text-gray-600'>Lat, Lng</span>
              </div>
              <div className='value-item col-span-8'>
                <span className='text-gray-600'>
                  : {data.lat ? data.lat : '--'}, {data.lon ? data.lon : '--'}
                </span>
              </div>
            </div>
          </li>

          <div className='border-b border-gray-300 my-2 px-2'></div>

          {/* Last Activity Row */}
          <li className='text-body-color dark:text-dark-6 text-sm'>
            <div className='grid grid-cols-12 items-center w-full'>
              <div className={`label-item ${colSpanClass} flex items-center`}>
                <span className='mr-1.5 mt-0.5 text-primary'>
                  <Icon icon='fa-regular:dot-circle' className='text-sm' />
                </span>
                <span className='text-gray-600'>Last Activity</span>
              </div>
              <div className='value-item col-span-8'>
                <span className='text-gray-600'>
                  : {data.last_timestamp == 'Invalid date' ? '--' : data.last_timestamp}
                </span>
              </div>
            </div>
          </li>

          <div className='border-b border-gray-300 my-2 px-2'></div>

          {/* Driver Row */}
          <li className='text-body-color dark:text-dark-6 text-sm'>
            <div className='grid grid-cols-12 items-center w-full'>
              <div className={`label-item ${colSpanClass} flex items-center`}>
                <span className='mr-1.5 mt-0.5 text-primary'>
                  <Icon icon='fa-regular:dot-circle' className='text-sm' />
                </span>
                <span className='text-gray-600'>Driver</span>
              </div>
              <div className='value-item col-span-8'>
                <span className='text-gray-600'>
                  : {data.driver_name ? data.driver_name : '--'}
                </span>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default CustomDataList
