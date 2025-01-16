import React, { useState } from 'react'
import { Icon } from '@iconify/react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useTranslation } from 'react-i18next'
import { firstUpperLetter } from '@/lib/utils'
import SensorsDataList from './sensors-data-list'
import TachographDataList from './tachograph-data-list'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'

interface CustomDataListProps {
  data?: any
  objectId?: string | number
  tachoData?: any[]
}

const CustomDataList: React.FC<CustomDataListProps> = ({ data, objectId, tachoData }) => {
  const { t } = useTranslation()
  const [selectedTab, setSelectedTab] = useState('sensors')

  const { vehiclesWithTacho } = useSelector((state: RootState) => state.maps)

  // const hasTachoData = objectId && vehiclesWithTacho.includes(String(objectId))

  return (
    <div>
      <Tabs defaultValue='sensors' onValueChange={(value) => setSelectedTab(value)}>
        <TabsList>
          <TabsTrigger value='sensors'>
            <div>
              <div className='label-item flex items-center gap-0 w-full'>
                <span className='mr-1.5 mt-0.5 text-primary'>
                  <Icon icon='oui:security-signal' className='text-2xl text-blue-400' />
                </span>
                <span className='text-gray-600 font-semibold text-md'>
                  {firstUpperLetter(t('sensors'))}
                </span>
              </div>
            </div>
          </TabsTrigger>

          <TabsTrigger value='tachograph'>
            <div>
              <div className='label-item flex items-center gap-0 w-full'>
                <span className='mr-1.5 mt-0.5 text-primary'>
                  <Icon icon='f7:graph-circle' className='text-2xl text-blue-400' />
                </span>
                <span className='text-gray-600 font-semibold text-md'>
                  {firstUpperLetter(t('tachograph'))}
                </span>
              </div>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value='sensors'>
          <SensorsDataList data={data} />
        </TabsContent>

        <TabsContent value='tachograph'>
          <TachographDataList objectId={objectId} tachoData={tachoData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CustomDataList
