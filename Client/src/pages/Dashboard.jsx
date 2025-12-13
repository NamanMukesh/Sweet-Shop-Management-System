import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user, axios: axiosInstance, isAdmin } = useAuth()
  const [sweets, setSweets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingSweet, setEditingSweet] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    quantity: '',
  })

  useEffect(() => {
    fetchSweets()
  }, [])

  const fetchSweets = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('/api/sweets')
      if (response.data.success) {
        setSweets(response.data.sweets || [])
      }
    } catch (error) {
      console.error('Failed to fetch sweets:', error)
      toast.error('Failed to load sweets')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingSweet) {
        // Update existing sweet
        const response = await axiosInstance.put(
          `/api/sweets/${editingSweet._id || editingSweet.id}`,
          formData
        )
        if (response.data.success) {
          toast.success('Sweet updated successfully!')
          setEditingSweet(null)
          setShowAddForm(false)
          resetForm()
          fetchSweets()
        }
      } else {
        // Add new sweet
        const response = await axiosInstance.post('/api/sweets', formData)
        if (response.data.success) {
          toast.success('Sweet added successfully!')
          setShowAddForm(false)
          resetForm()
          fetchSweets()
        }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Operation failed'
      toast.error(message)
    }
  }

  const handleEdit = (sweet) => {
    setEditingSweet(sweet)
    setFormData({
      name: sweet.name,
      category: sweet.category,
      price: sweet.price.toString(),
      quantity: sweet.quantity.toString(),
    })
    setShowAddForm(true)
  }

  const handleDelete = async (sweetId) => {
    if (!window.confirm('Are you sure you want to delete this sweet?')) {
      return
    }

    try {
      const response = await axiosInstance.delete(`/api/sweets/${sweetId}`)
      if (response.data.success) {
        toast.success('Sweet deleted successfully!')
        fetchSweets()
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Delete failed'
      toast.error(message)
    }
  }

  const handleRestock = async (sweetId) => {
    const quantity = prompt('Enter quantity to add:')
    if (!quantity || isNaN(quantity) || quantity <= 0) {
      toast.error('Please enter a valid quantity')
      return
    }

    try {
      const response = await axiosInstance.post(`/api/sweets/${sweetId}/restock`, {
        quantity: parseInt(quantity),
      })
      if (response.data.success) {
        toast.success('Restocked successfully!')
        fetchSweets()
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Restock failed'
      toast.error(message)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      price: '',
      quantity: '',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          {isAdmin() && (
            <button
              onClick={() => {
                setShowAddForm(true)
                setEditingSweet(null)
                resetForm()
              }}
              className="bg-primary text-white px-6 py-2 rounded-md hover:bg-blue-800 transition-all"
            >
              Add New Sweet
            </button>
          )}
        </div>

        {/* Add/Edit Form Modal */}
        {showAddForm && isAdmin() && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-4">
                {editingSweet ? 'Edit Sweet' : 'Add New Sweet'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white py-2 rounded-md hover:bg-blue-800 transition-all"
                  >
                    {editingSweet ? 'Update' : 'Add'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false)
                      setEditingSweet(null)
                      resetForm()
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Sweets Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  {isAdmin() && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sweets.map((sweet) => (
                  <tr key={sweet._id || sweet.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {sweet.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sweet.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${sweet.price?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sweet.quantity}
                    </td>
                    {isAdmin() && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(sweet)}
                          className="text-primary hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleRestock(sweet._id || sweet.id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          Restock
                        </button>
                        <button
                          onClick={() => handleDelete(sweet._id || sweet.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

