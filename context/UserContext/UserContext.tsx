import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from 'react'
const jwtDecode = require('jwt-decode')

import { settingList, settingUpdate } from '@/models/setting'
import { userProfile, refreshTokenModel } from '@/models/user_profile'
import { relogin } from '@/lib/auth'

export interface Setting {
  title: string
  value: string | boolean | number
}

export interface User {
  token: string | null
  username: string | null
  password: string | null
  customer: string | null
}

interface UserContextType {
  models: {
    user: User | null
    userProfileData: User | null
    settings: Setting[] | null
  }
  operations: {
    setUser: (user: Partial<User>) => void
    clearUser: () => void
    setSettings: (settings: Setting[]) => void
    refreshToken: () => void
    getUserRef: () => User | null
  }
}

const UserContext = createContext<UserContextType>({
  models: {
    user: null,
    settings: null,
    userProfileData: null,
  },
  operations: {
    setUser: () => {},
    clearUser: () => {},
    setSettings: () => {},
    refreshToken: () => {},
    getUserRef: () => null,
  },
})

const defaultSettings: Setting[] = [
  { title: 'time_format', value: 'HH:mm:ss' },
  { title: 'language', value: 'en' },
  { title: 'date_format', value: 'dd/MM/yyyy' },
  { title: 'unit_volume', value: 'l' },
  { title: 'unit_distance', value: 'km' },
]

const formatDuration = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes} minutes ${seconds} seconds`
}

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null) // Initialize as null
  const userRef = useRef<User | null>(user)
  const [settings, setSettingsState] = useState<Setting[]>([])

  const [userProfileData, setUserProfileData] = useState(null)
  const dataFetchedRef = useRef(false)

  useEffect(() => {
    userRef.current = user
  }, [user])

  const handleSetUser = useCallback((newUser: Partial<User>) => {
    setUserState((prevUser) => {
      const updatedUser = { ...prevUser, ...newUser }
      if (updatedUser.token) {
        localStorage.setItem(
          'userData',
          JSON.stringify({
            token: updatedUser.token,
            username: updatedUser.username,
            customer: updatedUser.customer,
            password: updatedUser.password,
          })
        )
      } else {
        localStorage.removeItem('userData')
      }
      return updatedUser
    })
  }, [])

  const handleClearUser = useCallback(() => {
    localStorage.removeItem('userData')
    localStorage.removeItem('token')
    localStorage.removeItem('userdata')
    setUserState(null)
    setSettingsState([])
  }, [])

const refreshToken = useCallback(async () => {
  const userData = userRef.current
  if (userData?.token) {
    try {
      const refreshedData = await refreshTokenModel(userData.token)
      if (refreshedData) {
        handleSetUser({ token: refreshedData.access_token })
      } else {
        console.error('Failed to refresh token: No refreshed token returned.')
      }
    } catch (error: any) {
      console.error('Full error object:', error)
      await relogin()
    }
  } else {
    console.warn('No token available to refresh')
    handleClearUser()
    window.location.assign('/')
  }
}, [handleSetUser, handleClearUser])

  // Decode token to get the exp value
  const getTokenExpirationTime = useCallback((token: string) => {
    try {
      const decoded = jwtDecode.jwtDecode(token)
      const expTime = decoded.exp ? decoded.exp * 1000 : null // Convert to millisecond
      return expTime
    } catch (error) {
      console.error('Error decoding token:', error)
      return null
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserData = localStorage.getItem('userData')
      if (storedUserData) {
        try {
          const parsedData = JSON.parse(storedUserData)
          setUserState({
            token: parsedData.token || null,
            username: parsedData.username || null,
            password: parsedData.password,
            customer: parsedData.customer || null,
          })

          if (parsedData.token) {
            const expTime = getTokenExpirationTime(parsedData.token)
            if (expTime) {
              const currentTime = Date.now()
              const tokenValidityDuration = expTime - currentTime
            }
          }
        } catch (error) {
          console.error('Error parsing userData from localStorage:', error)
        }
      }
    }
  }, [getTokenExpirationTime])

useEffect(() => {
  if (user?.token) {
    const expirationTime = getTokenExpirationTime(user.token)
    if (expirationTime) {
      const currentTime = Date.now()
      const timeUntilExpiration = expirationTime - currentTime

      const refreshTime = Math.max(timeUntilExpiration - 60000, timeUntilExpiration * 0.5)
      if (refreshTime > 0) {
        const timeoutId = setTimeout(() => {
          refreshToken()
        }, refreshTime)
        return () => clearTimeout(timeoutId)
      } else {
        refreshToken()
      }
    }
  }
}, [user?.token, getTokenExpirationTime, refreshToken])


  const handleSetSettings = useCallback(
    async (newSettings: Setting[]) => {
      if (!userRef.current?.token) return

      let updatedSettings = [...settings]

      for (const newSetting of newSettings) {
        const storedSetting = updatedSettings.find((setting) => setting.title === newSetting.title)
        if (!storedSetting || storedSetting.value !== newSetting.value) {
          const settingIndex = updatedSettings.findIndex(
            (setting) => setting.title === newSetting.title
          )

          if (settingIndex !== -1) {
            updatedSettings[settingIndex] = newSetting
          } else {
            updatedSettings.push(newSetting)
          }

          try {
            await settingUpdate(userRef.current.token, newSetting.title, String(newSetting.value))
          } catch (error) {
            console.error(`Error updating setting ${newSetting.title}:`, error)
          }
        }
      }

      setSettingsState(updatedSettings)
    },
    [settings]
  )

  // Fetch settings when token is available
  useEffect(() => {
    if (user?.token) {
      const fetchUserSettings = async () => {
        try {
          const data = await settingList(user.token)
          if (data) {
            let updatedSettings = [...defaultSettings]
            const timeFormat = data.items.find((item) => item.key === 'time_format')
            const language = data.items.find((item) => item.key === 'language')
            const dateFormat = data.items.find((item) => item.key === 'date_format')
            const unitVolume = data.items.find((item) => item.key === 'unit_volume')
            const unitDistance = data.items.find((item) => item.key === 'unit_distance')

            if (timeFormat) {
              updatedSettings = updatedSettings.map((setting) =>
                setting.title === 'time_format' ? { ...setting, value: timeFormat.vle } : setting
              )
            }
            if (language) {
              updatedSettings = updatedSettings.map((setting) =>
                setting.title === 'language' ? { ...setting, value: language.vle } : setting
              )
            }
            if (dateFormat) {
              updatedSettings = updatedSettings.map((setting) =>
                setting.title === 'date_format' ? { ...setting, value: dateFormat.vle } : setting
              )
            }
            if (unitVolume) {
              updatedSettings = updatedSettings.map((setting) =>
                setting.title === 'unit_volume' ? { ...setting, value: unitVolume.vle } : setting
              )
            }
            if (unitDistance) {
              updatedSettings = updatedSettings.map((setting) =>
                setting.title === 'unit_distance'
                  ? { ...setting, value: unitDistance.vle }
                  : setting
              )
            }
            setSettingsState(updatedSettings)
          }
        } catch (error) {
          setSettingsState(defaultSettings)
          console.error('Error fetching client info:', error)
        }
      }
      fetchUserSettings()
    }
  }, [user?.token])

  // Listener for cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'userData') {
        const newUserData = event.newValue ? JSON.parse(event.newValue) : null
        setUserState((prevUser) => ({
          ...prevUser,
          token: newUserData ? newUserData.token : null,
        }))

        if (!newUserData) {
          setSettingsState([])
        }
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange)
      return () => window.removeEventListener('storage', handleStorageChange)
    }
  }, [getTokenExpirationTime])

  const fetchUserData = useCallback(async () => {
    if (!dataFetchedRef.current) {
      const storedUserData = localStorage.getItem('userData')

      if (storedUserData) {
        try {
          const parsedData = JSON.parse(storedUserData)
          if (parsedData.token && parsedData.username && parsedData.customer && parsedData.password) {
            // Set data ke state sesuai kebutuhan
            setUserProfileData({
              username: parsedData.username,
              customer: parsedData.customer,
              password: parsedData.password,
              token: parsedData.token,
            })
            dataFetchedRef.current = true
          } else {
            console.error('Incomplete userData in localStorage', parsedData)
          }
        } catch (error) {
          console.error('Error parsing userData from localStorage:', error)
        }
      } else {
        console.error('No userData found in localStorage')
      }
    }
  }, [])

  useEffect(() => {
    if (user?.token && !dataFetchedRef.current) {
      fetchUserData()
    }
  }, [user?.token, fetchUserData])

  return (
    <UserContext.Provider
      value={{
        models: {
          user,
          settings,
          userProfileData,
        },
        operations: {
          setUser: handleSetUser,
          clearUser: handleClearUser,
          setSettings: handleSetSettings,
          refreshToken,
          getUserRef: () => userRef.current,
        },
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
