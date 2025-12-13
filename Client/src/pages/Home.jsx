import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

const Home = () => {
  const { user, axios: axiosInstance } = useAuth()
  const [sweets, setSweets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetchSweets()
  }, [])

  const fetchSweets = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get('/api/sweets')
      if (response.data.success) {
        setSweets(response.data.sweets || [])
        // Extract unique categories
        const uniqueCategories = [
          ...new Set((response.data.sweets || []).map((sweet) => sweet.category)),
        ]
        setCategories(uniqueCategories)
      }
    } catch (error) {
      console.error('Failed to fetch sweets:', error)
      toast.error('Failed to load sweets')
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (sweetId) => {
    try {
      const response = await axiosInstance.post(`/api/sweets/${sweetId}/purchase`)
      if (response.data.success) {
        toast.success('Purchase successful!')
        fetchSweets() // Refresh the list
      } else {
        toast.error(response.data.message || 'Purchase failed')
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Purchase failed'
      toast.error(message)
    }
  }

  const filteredSweets = sweets.filter((sweet) => {
    const matchesSearch =
      sweet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sweet.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !categoryFilter || sweet.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading sweets...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🍬 Welcome to Sweet Shop
          </h1>
          <p className="text-lg text-gray-600">
            Discover our delicious collection of sweets
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
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
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Category
              </label>
              <select
                id="category"
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

        {/* Sweets Grid */}
        {filteredSweets.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-xl text-gray-600">No sweets found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSweets.map((sweet) => (
              <div
                key={sweet._id || sweet.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="text-4xl mb-4 text-center">🍬</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{sweet.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Category:</span> {sweet.category}
                  </p>
                  <p className="text-2xl font-bold text-primary mb-4">
                    ${sweet.price?.toFixed(2) || '0.00'}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`text-sm font-medium ${
                        sweet.quantity > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {sweet.quantity > 0
                        ? `${sweet.quantity} in stock`
                        : 'Out of stock'}
                    </span>
                  </div>
                  {user && (
                    <button
                      onClick={() => handlePurchase(sweet._id || sweet.id)}
                      disabled={sweet.quantity === 0}
                      className={`w-full py-2 px-4 rounded-md font-medium transition-all ${
                        sweet.quantity > 0
                          ? 'bg-primary text-white hover:bg-blue-800'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {sweet.quantity > 0 ? 'Purchase' : 'Out of Stock'}
                    </button>
                  )}
                  {!user && (
                    <p className="text-sm text-center text-gray-500 mt-2">
                      Please login to purchase
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Home

