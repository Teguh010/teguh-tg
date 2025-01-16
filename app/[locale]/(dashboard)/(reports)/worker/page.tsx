'use client'

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import LayoutLoader from '@/components/layout-loader'
import AdvancedTable from '@/components/partials/advanced'
import { useTranslation } from 'react-i18next'
import { fetchDataWorkerList, createWorkerThunk } from '@/redux/features/options'
import { setFormData } from '@/redux/features/options/options-slice'

import CustomInput from '@/components/organisms/ReusableInput'
import ReusableDialog from '@/components/organisms/ReusableDialog'
import { useUser } from '@/context/UserContext'
import { RootState } from '@/redux/store'

const Worker = () => {
  const { t } = useTranslation()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const UserContext = useUser()
  const { getUserRef } = UserContext.operations
  const userToken = getUserRef().token
  const dispatch = useDispatch()

  const { dataWorkerList, ignoreList, formData } = useSelector((state: RootState) => state.options)

  useEffect(() => {
    if (userToken) {
      dispatch(fetchDataWorkerList(userToken))
    }
  }, [dispatch, userToken])

  if (!userToken || !dataWorkerList) {
    return <LayoutLoader />
  }

  const handleInputChange = (name: string, value: string) => {
    dispatch(setFormData({ name, value }))
  }

  const handleSubmit = async () => {
    try {
      await dispatch(createWorkerThunk(userToken, {
        name: formData.name,
        surname: formData.surname,
        phone: formData.phone,
        email: formData.email
      }));
      // Setelah worker berhasil dibuat, muat ulang daftar worker
      dispatch(fetchDataWorkerList(userToken));
    } catch (error) {
      console.error('Error creating worker:', error);
    } finally {
      setIsDialogOpen(false);
    }
  };

  const pickers = () => {
    return (
      <div className='flex flex-col lg:flex-row justify-start gap-2'>
        <ReusableDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          triggerLabel='Create Worker'
          dialogTitle='Create Worker'
          footerButtons={[
            {
              label: 'Submit',
              variant: 'solid',
              action: handleSubmit,
              type: 'submit',
            },
          ]}
        >
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-4'>
            <CustomInput
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              type='text'
              label='Name'
            />
            <CustomInput
              name="surname"
              value={formData.surname}
              onChange={handleInputChange}
              type='text'
              label='Surname'
            />
            <CustomInput
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              type='text'
              label='Phone'
            />
            <CustomInput
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              type='text'
              label='Email'
            />
          </div>
        </ReusableDialog>
      </div>
    );
  };

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-12 gap-6'>
        <div className='col-span-12 lg:col-span-12 overflow-x-auto'>
          <AdvancedTable ignoreList={ignoreList} dataList={dataWorkerList} pickers={pickers} />
        </div>
      </div>
    </div>
  )
}

export default Worker
