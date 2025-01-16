import React from 'react'
import { Icon } from '@iconify/react'
import { useTranslation } from 'react-i18next'
import { Progress } from '@/components/ui/progress'
import { formatDistanceToNow, parseISO, differenceInMinutes } from 'date-fns'

interface TachographDataListProps {
  objectId?: string | number
  tachoData?: any[]
}

const isValidTachoValue = (value: number | null): boolean => {
  return value !== null && value !== 7 && value >= 0; // 7 indicates data not available
};

const TachographDataList: React.FC<TachographDataListProps> = ({ objectId, tachoData }) => {
  console.log('tachoData',tachoData)
  const { t } = useTranslation()
  const matchingTachoData = tachoData?.[0]
  const stats = matchingTachoData?.stats?.[0]?.[0]

  if (!matchingTachoData || !stats) return null

  const formatMinutes = (minutes: number): string => {
    if (!minutes && minutes !== 0) return '-'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}:${mins.toString().padStart(2, '0')}`
  }

  const calculateProgress = (current: number, max: number) => {
    return Math.min((current / max) * 100, 100)
  }

  const timers = [
    {
      label: 'Continuous',
      value: stats.cont_drive_time,
      max: 270,
      maxLabel: '4:30',
      icon: 'mdi:timer-outline',
      warning: 240,
      critical: 260
    },
    {
      label: 'Daily',
      value: stats.current_daily_drive_time,
      max: 540,
      maxLabel: '9:00',
      icon: 'mdi:calendar-clock',
      warning: 480,
      critical: 520
    },
    {
      label: 'Weekly',
      value: stats.current_weekly_drive_time,
      max: 3360,
      maxLabel: '56:00',
      icon: 'mdi:calendar-week',
      warning: 3000,
      critical: 3200
    },
    {
      label: 'Biweekly',
      value: stats.total_drive_time,
      max: 5400,
      maxLabel: '90:00',
      icon: 'mdi:calendar-month',
      warning: 5000,
      critical: 5200
    }
  ]

  const getDriverStateInfo = (state: number) => {
    switch (state) {
      case 0:
        return { label: 'driver_state_0', icon: 'mdi:bed', color: 'text-gray-600' }
      case 1:
        return { label: 'driver_state_1', icon: 'mdi:account-clock', color: 'text-blue-600' }
      case 2:
        return { label: 'driver_state_2', icon: 'mdi:account-wrench', color: 'text-orange-600' }
      case 3:
        return { label: 'driver_state_3', icon: 'mdi:steering', color: 'text-green-600' }
      default:
        return { label: 'unknown', icon: 'mdi:help-circle', color: 'text-gray-400' }
    }
  }

  const getProgressColor = (value: number, warning: number, critical: number, max: number) => {
    const percentage = (value / max) * 100
    const warningPercentage = (warning / max) * 100
    const criticalPercentage = (critical / max) * 100

    if (percentage >= criticalPercentage) {
      return 'bg-red-500'
    }
    if (percentage >= warningPercentage) {
      return 'bg-amber-500'
    }
    if (percentage >= warningPercentage * 0.75) {
      return 'bg-amber-300'
    }
    if (percentage >= warningPercentage * 0.5) {
      return 'bg-blue-400'
    }
    return 'bg-blue-300'
  }

  const getTextColor = (value: number, warning: number, critical: number, max: number) => {
    const percentage = (value / max) * 100
    const warningPercentage = (warning / max) * 100
    const criticalPercentage = (critical / max) * 100

    if (percentage >= criticalPercentage) {
      return 'text-red-500'
    }
    if (percentage >= warningPercentage) {
      return 'text-amber-500'
    }
    if (percentage >= warningPercentage * 0.75) {
      return 'text-amber-600'
    }
    if (percentage >= warningPercentage * 0.5) {
      return 'text-green-600'
    }
    return 'text-green-500'
  }

  const getRestDuration = (gpstime: string, ignition: string) => {
    if (ignition === "on") return null;
    
    try {
      const gpsDate = parseISO(gpstime);
      const now = new Date();
      const diffInMinutes = differenceInMinutes(now, gpsDate);
      
      const hours = Math.floor(diffInMinutes / 60);
      const minutes = diffInMinutes % 60;
      
      const hoursText = hours > 0 ? `${hours} ${hours === 1 ? 'hour' : 'hours'}` : '';
      const minutesText = minutes > 0 ? `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}` : '';
      
      if (hours > 0 && minutes > 0) {
        return `${hoursText} ${minutesText}`;
      } else if (hours > 0) {
        return hoursText;
      } else if (minutes > 0) {
        return minutesText;
      } else {
        return '0 minutes';
      }
    } catch (error) {
      console.error('Error parsing date:', error);
      return null;
    }
  }

  return (
    <div className="p-1.5 bg-slate-50/80 rounded-lg text-xs">
      {/* Header with Driver State and Ignition */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
           <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border">
              <Icon 
                icon={stats.ignition === "on" ? "mdi:engine" : "mdi:engine-off"} 
                className={`text-base ${stats.ignition === "on" ? "text-green-600" : "text-gray-400"}`}
              />
              <span className="text-[11px] text-gray-600 capitalize">
                {stats.ignition}
              </span>
            </div>

          {/* Ignition Status with Rest Duration */}
          <div className="flex items-center gap-2">
           <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border">
            <Icon 
              icon={getDriverStateInfo(stats.driver_state).icon} 
              className={`text-base ${getDriverStateInfo(stats.driver_state).color}`}
            />
            <span className="text-[11px] text-gray-600">
              {t(getDriverStateInfo(stats.driver_state).label)}{(stats.ignition === "off" && stats.driver_state === 0) && (
                <span className="text-[10px] text-gray-600">: {getRestDuration(stats.gpstime, stats.ignition)}</span>
              )}
            </span>
          </div>
            {/* Rest Duration */}
            {/* {(stats.ignition === "off" && stats.driver_state === 0) && (
              <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border">
                <Icon 
                  icon="mdi:timer-off" 
                  className="text-base text-gray-400"
                />
                <span className="text-[11px] text-gray-600">
                  {getRestDuration(stats.gpstime, stats.ignition)}
                </span>
              </div>
            )} */}
          </div>
        </div>

        {/* GPS Time */}
        <div className="flex items-center gap-1">
          <Icon icon="mdi:clock-outline" className="text-[11px] text-gray-500" />
          <span className="text-[11px] text-gray-500">
            GPS time: {stats.gpstime?.split('T')[1]?.substring(0, 5)}
          </span>
        </div>
      </div>

      {/* Main Timers Grid */}
      <div className="grid grid-cols-4 gap-1">
        {timers.map((timer, idx) => {
          return (
            <div key={idx} className="bg-white rounded p-1 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1">
                  <Icon icon={timer.icon} className="text-base text-blue-400" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 leading-tight">
                      {timer.label}
                    </span>
                    <span className={`text-[10px] font-medium leading-tight ${
                      getTextColor(timer.value, timer.warning, timer.critical, timer.max)
                    }`}>
                      {formatMinutes(timer.value)} / {timer.maxLabel}
                    </span>
                  </div>
                </div>
              </div>
              <Progress 
                value={calculateProgress(timer.value, timer.max)}
                className="h-[10px] mt-1"
                indicatorClassName={`transition-all ${
                  getProgressColor(timer.value, timer.warning, timer.critical, timer.max)
                }`}
              />
            </div>
          )
        })}
      </div>

      {/* Bottom Info Row */}
      <div className="flex justify-between items-center mt-2 px-0.5">
        {/* Rest Indicators */}
        <div className="flex items-center gap-3">
          {/* Reduced Daily Rests */}
          <div className="flex flex-col pr-1">
            <span className="text-[11px] text-gray-500 leading-tight">
              {t('reduced_daily_rests_remaining')}
            </span>
            <div className="flex gap-0.5">
              {[...Array(3)].map((_, idx) => (
                <div 
                  key={idx}
                  className={`w-[14px] h-[14px] rounded-full ${
                    isValidTachoValue(stats.reduced_daily_rests_remaining) && idx < (stats.reduced_daily_rests_remaining || 0)
                      ? 'bg-blue-400'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            {!isValidTachoValue(stats.reduced_daily_rests_remaining) && (
              <span className="text-[10px] text-gray-400">Not available</span>
            )}
          </div>

          {/* 10h Times Remaining */}
          <div className="flex flex-col pl-4">
            <span className="text-[11px] text-gray-500 leading-tight">
              Extra Hours
            </span>
            <div className="flex gap-1">
              {[...Array(2)].map((_, idx) => (
                <div 
                  key={idx}
                  className={`w-[14px] h-[14px] rounded-full border-[1.5px] flex items-center justify-center ${
                    isValidTachoValue(stats.remaining_10h_times) && idx < (stats.remaining_10h_times || 0)
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <Icon 
                    icon={isValidTachoValue(stats.remaining_10h_times) && idx < (stats.remaining_10h_times || 0) 
                      ? 'mdi:check' 
                      : 'mdi:minus'} 
                    className={`text-xs ${
                      isValidTachoValue(stats.remaining_10h_times) && idx < (stats.remaining_10h_times || 0)
                        ? 'text-blue-400'
                        : 'text-gray-300'
                    }`}
                  />
                </div>
              ))}
            </div>
            {!isValidTachoValue(stats.remaining_10h_times) && (
              <span className="text-[10px] text-gray-400">Not available</span>
            )}
          </div>
        </div>

        {/* Break Time */}
        <div className="flex flex-col items-end">
          <span className="text-[11px] text-gray-500 leading-tight">
            {t('brake_time')}
          </span>
          <div className="flex items-center gap-1">
            <Icon icon="mdi:coffee" className="text-base text-gray-400" />
            <span className="text-[11px] font-medium">
              {formatMinutes(stats.brake_time)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TachographDataList
