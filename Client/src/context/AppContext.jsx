import React, { createContext, useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

// Create the context
export const AppContext = createContext()

// API base URL - should be moved to environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

// Configure axios defaults
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// AppProvider component
export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [loading, setLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(false)

  // Set up axios interceptor to include token in requests
  useEffect(() => {
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
      localStorage.setItem('token', token)
    } else {
      delete axiosInstance.defaults.headers.common['Authorization']
      localStorage.removeItem('token')
    }
  }, [token])

  // Load user data on mount if token exists
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
  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/api/auth/login', {
        email,
        password,
      })
      if (response.data.success) {
        setToken(response.data.token)
        setUser(response.data.user)
        toast.success('Login successful!')
        return { success: true }
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
      const response = await axiosInstance.post('/api/auth/register', {
        name,
        email,
        password,
      })
      if (response.data.success) {
        setToken(response.data.token)
        setUser(response.data.user)
        toast.success('Registration successful!')
        return { success: true }
      } else {
        toast.error(response.data.message || 'Registration failed')
        return { success: false, message: response.data.message }
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Registration failed'
      toast.error(message)
      return { success: false, message }
    }
  }

  // Logout function
  const logout = () => {
    setToken(null)
    setUser(null)
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

