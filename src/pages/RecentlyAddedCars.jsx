import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { listingsAPI } from '../api/listings'
import ListingItem from '../components/listings/ListingItem'

export default function RecentlyAddedCars() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const data = await listingsAPI.getAll({ category: 'sale' })
        // Sort by createdAt descending to get latest first, then take top 3
        const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setListings(sortedData.slice(0, 3))
        setLoading(false)
      } catch (error) {
        console.error('Error fetching listings:', error)
        setLoading(false)
      }
    }

    fetchListings()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (listings.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-xl text-gray-600">Noch keine Fahrzeuge verfügbar</p>
      </div>
    )
  }

  return (
    <div>
      {/* Cars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {listings.map((listing) => (
          <div key={listing.id}>
            <ListingItem listing={listing} />
          </div>
        ))}
      </div>

      {/* View All Link */}
      <div className="text-center">
        <Link
          to="/category/sale"
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-4 rounded-lg hover:bg-primary-700 font-semibold transition-all transform hover:scale-105"
        >
          Alle Fahrzeuge ansehen
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </div>
  )
}
