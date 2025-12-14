import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import UserLogin from './pages/UserLogin'
import AdminLogin from './pages/AdminLogin'
import Register from './pages/Register'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Navbar from './components/navbar'
import { useAuth } from './hooks/useAuth'

const App = () => {
  const { user, isAdmin } = useAuth()

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={user ? <Navigate to="/sweets" replace /> : <UserLogin />} />
        <Route path="/login" element={user ? <Navigate to="/sweets" replace /> : <UserLogin />} />
        <Route path="/admin/login" element={user ? (isAdmin() ? <Navigate to="/dashboard" replace /> : <Navigate to="/sweets" replace />) : <AdminLogin />} />
        <Route path="/register" element={user ? <Navigate to="/sweets" replace /> : <Register />} />
        <Route path="/sweets" element={user ? <Home /> : <Navigate to="/login" replace />} />
        <Route path="/dashboard" element={user && isAdmin() ? <Dashboard /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App