import { useState, useEffect } from 'react'

export const useAuthentication = () => {
  const [user, setUser] = useState(null)
  const [checkingStatus, setCheckingStatus] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
    }
    setCheckingStatus(false)
  }, [])

  const isLogged = user !== null

  return { user, isLogged, checkingStatus }
}

export default useAuthentication
