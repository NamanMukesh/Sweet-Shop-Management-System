import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user, axios: axiosInstance, isAdmin } = useAuth()
  const [sweets, setSweets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingSweet, setEditingSweet] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [showRestockModal, setShowRestockModal] = useState(null)
  const [restockQuantity, setRestockQuantity] = useState('')

  const categories = [
    'Sweets',
    'Chocolates',
    'Cookies',
    'Cakes',
    'Ice Cream',
    'Desserts',
    'Traditional',
    'Other',
  ]

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
    try {
      const response = await axiosInstance.delete(`/api/sweets/${sweetId}`)
      if (response.data.success) {
        toast.success('Sweet deleted successfully!')
        setShowDeleteConfirm(null)
        fetchSweets()
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Delete failed'
      toast.error(message)
      setShowDeleteConfirm(null)
    }
  }

  const handleRestock = async (sweetId) => {
    if (!restockQuantity || isNaN(restockQuantity) || parseInt(restockQuantity) <= 0) {
      toast.error('Please enter a valid quantity')
      return
    }

    try {
      const response = await axiosInstance.post(`/api/sweets/${sweetId}/restock`, {
        quantity: parseInt(restockQuantity),
      })
      if (response.data.success) {
        toast.success('Restocked successfully!')
        setShowRestockModal(null)
        setRestockQuantity('')
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

  // Filter sweets based on search and category
  const filteredSweets = sweets.filter((sweet) => {
    const matchesSearch = searchTerm === '' || 
      sweet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sweet.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === '' || sweet.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
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

        {/* Search and Filter Section */}
        <div className="mb-8 bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Sweets
              </label>
              <input
                id="search"
                type="text"
                placeholder="Search by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Category
              </label>
              <select
                id="categoryFilter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Add/Edit Form Modal */}
        {showAddForm && isAdmin() && (
          <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full mx-4 border-2 border-gray-300">
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
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
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
                {filteredSweets.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin() ? 5 : 4} className="px-6 py-8 text-center text-gray-500">
                      No sweets found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredSweets.map((sweet) => (
                  <tr key={sweet._id || sweet.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {sweet.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sweet.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Rs. {sweet.price?.toFixed(2) || '0.00'}
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
                          onClick={() => setShowRestockModal(sweet._id || sweet.id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          Restock
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(sweet._id || sweet.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4 border-2 border-gray-300">
              <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
              <p className="text-gray-700 mb-6">Are you sure you want to delete this sweet? This action cannot be undone.</p>
              <div className="flex gap-4">
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-all"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Restock Modal */}
        {showRestockModal && (
          <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4 border-2 border-gray-300">
              <h3 className="text-xl font-bold mb-4">Restock Sweet</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity to Add
                </label>
                <input
                  type="number"
                  min="1"
                  value={restockQuantity}
                  onChange={(e) => setRestockQuantity(e.target.value)}
                  placeholder="Enter quantity"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  autoFocus
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => handleRestock(showRestockModal)}
                  className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-all"
                >
                  Restock
                </button>
                <button
                  onClick={() => {
                    setShowRestockModal(null)
                    setRestockQuantity('')
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard

