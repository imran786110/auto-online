import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Heading, SimpleGrid, Spinner, Center } from '@chakra-ui/react'
import { listingsAPI } from '../api/listings'
import ListingItem from '../components/listings/ListingItem'

// Top 10 most popular car brands in Germany
const TOP_10_BRANDS = [
  'Volkswagen',
  'Mercedes-Benz',
  'BMW',
  'Audi',
  'Opel',
  'Ford',
  'Renault',
  'Skoda',
  'Seat',
  'Peugeot'
]

const BRAND_FILTERS = [
  { name: 'Alle Marken', value: 'all' },
  { name: 'Volkswagen', value: 'Volkswagen' },
  { name: 'Mercedes-Benz', value: 'Mercedes-Benz' },
  { name: 'BMW', value: 'BMW' },
  { name: 'Audi', value: 'Audi' },
  { name: 'Opel', value: 'Opel' },
  { name: 'Ford', value: 'Ford' },
  { name: 'Renault', value: 'Renault' },
  { name: 'Skoda', value: 'Skoda' },
  { name: 'Seat', value: 'Seat' },
  { name: 'Peugeot', value: 'Peugeot' },
  { name: 'Andere', value: 'others' },
]

export default function Listings() {
  const { categoryName } = useParams()
  const [allListings, setAllListings] = useState([])
  const [filteredListings, setFilteredListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBrand, setSelectedBrand] = useState('all')

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const data = await listingsAPI.getAll({ category: categoryName })
        setAllListings(data)
        setFilteredListings(data)
        setLoading(false)
      } catch (error) {
        console.error('Error:', error)
        setLoading(false)
      }
    }

    fetchListings()
  }, [categoryName])

  useEffect(() => {
    if (selectedBrand === 'all') {
      setFilteredListings(allListings)
    } else if (selectedBrand === 'others') {
      // Show all brands except the top 10
      setFilteredListings(allListings.filter(listing =>
        !TOP_10_BRANDS.includes(listing.make)
      ))
    } else {
      // Show specific brand
      setFilteredListings(allListings.filter(listing =>
        listing.make.toLowerCase() === selectedBrand.toLowerCase()
      ))
    }
  }, [selectedBrand, allListings])

  if (loading) {
    return (
      <Center minH="50vh">
        <Spinner size="xl" color="orange.500" />
      </Center>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Fahrzeuge</h1>
          <p className="text-gray-600">
            {filteredListings.length} Fahrzeug{filteredListings.length !== 1 ? 'e' : ''} gefunden
          </p>
        </div>

        {/* Brand Filter */}
        <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Nach Marke filtern</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {BRAND_FILTERS.map((brand) => (
              <button
                key={brand.value}
                onClick={() => setSelectedBrand(brand.value)}
                className={`px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
                  selectedBrand === brand.value
                    ? 'bg-primary-600 text-white shadow-md scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
                }`}
              >
                {brand.name}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Grid */}
        {filteredListings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">🚗</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Keine Fahrzeuge gefunden</h3>
            <p className="text-gray-600">
              {selectedBrand === 'all'
                ? 'Es gibt derzeit keine Fahrzeuge in dieser Kategorie.'
                : selectedBrand === 'others'
                ? 'Es gibt derzeit keine Fahrzeuge anderer Marken. Versuchen Sie eine andere Filterung.'
                : `Es gibt derzeit keine ${selectedBrand} Fahrzeuge. Versuchen Sie eine andere Marke.`}
            </p>
            {selectedBrand !== 'all' && (
              <button
                onClick={() => setSelectedBrand('all')}
                className="mt-4 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition-colors"
              >
                Alle Marken anzeigen
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <ListingItem key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
