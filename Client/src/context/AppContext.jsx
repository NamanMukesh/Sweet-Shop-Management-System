import React, { createContext, useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export const AppContext = createContext()

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [loading, setLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
      localStorage.setItem('token', token)
    } else {
      delete axiosInstance.defaults.headers.common['Authorization']
      localStorage.removeItem('token')
    }
  }, [token])

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const response = await axiosInstance.get('/api/auth/me')
          if (response.data.success) {
            setUser(response.data.user)
          } else {
            setToken(null)
            setUser(null)
          }
        } catch (error) {
          console.error('Failed to load user:', error)
          setToken(null)
          setUser(null)
        }
      }
      setLoading(false)
    }

    loadUser()
  }, [token])

  // Login function
  const login = async (email, password, isAdminLogin = false) => {
    try {
      const response = await axiosInstance.post('/api/auth/login', {
        email,
        password,
      })
      if (response.data.success) {
        const token = response.data.token
        const userData = response.data.user

        // Check admin status if this is an admin login attempt
        if (isAdminLogin && !userData.isAdmin && userData.role !== 'admin') {
          toast.error('Access denied. Admin privileges required.')
          return { success: false, message: 'Access denied. Admin privileges required.' }
        }

        setToken(token)
        setUser(userData)
        
        // Only show toast if not admin login (AdminLogin will show its own toast)
        if (!isAdminLogin) {
          toast.success('Login successful!')
        }
        
        return { success: true, user: userData, token }
      } else {
        toast.error(response.data.message || 'Login failed')
        return { success: false, message: response.data.message }
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed'
      toast.error(message)
      return { success: false, message }
    }
  }

  // Register function
  const register = async (name, email, password) => {
    try {
      // Validate inputs before sending
      if (!name || !email || !password || 
          name.trim() === '' || email.trim() === '' || password.trim() === '') {
        toast.error('Please fill in all fields')
        return { success: false, message: 'Please fill in all fields' }
      }

      const requestData = {
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
      }

      const response = await axiosInstance.post('/api/auth/register', requestData)
      
      if (response.data && response.data.success) {
        // Set token first
        const token = response.data.token
        const userData = response.data.user
        
        console.log('Setting token and user:', { 
          hasToken: !!token, 
          hasUser: !!userData,
          user: userData 
        })
        
        // Update state - React will batch these updates
        setToken(token)
        setUser(userData)
        
        // Store token in localStorage immediately
        if (token) {
          localStorage.setItem('token', token)
          // Also set in axios headers immediately
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
        }
        
        toast.success('Registration successful!')
        
        // Return success with user data
        return { success: true, user: userData, token }
      } else {
        const errorMsg = response.data?.message || 'Registration failed'
        toast.error(errorMsg)
        return { success: false, message: errorMsg }
      }
    } catch (error) {
      // Get the error message from server response
      const serverMessage = error.response?.data?.message
      const message = serverMessage || error.message || 'Registration failed'
      
      // Show user-friendly error message
      if (serverMessage && serverMessage.includes('already exists')) {
        toast.error('This email is already registered. Please use a different email or try logging in.')
      } else {
        toast.error(message)
      }
      
      return { success: false, message }
    }
  }

  // Logout function
  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    delete axiosInstance.defaults.headers.common['Authorization']
    toast.success('Logged out successfully')
  }

  // Check if user is admin
  const isAdmin = () => {
    return user?.role === 'admin' || user?.isAdmin === true
  }

  const value = {
    user,
    token,
    loading,
    showLogin,
    setShowLogin,
    setToken,
    login,
    register,
    logout,
    isAdmin,
    axios: axiosInstance,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

