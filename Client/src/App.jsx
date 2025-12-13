import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Navbar from './components/navbar'
import { useAuth } from './hooks/useAuth'

const App = () => {
  const { user } = useAuth()

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={user ? <Navigate to="/sweets" replace /> : <Login />} />
        <Route path="/login" element={user ? <Navigate to="/sweets" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/sweets" replace /> : <Register />} />
        <Route path="/sweets" element={user ? <Home /> : <Navigate to="/" replace />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App