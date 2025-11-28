import { Link } from 'react-router-dom';
import { Car, Eye } from 'lucide-react';

const ListingItem = ({ listing }) => {
  if (!listing) return null;

  // Parse images from JSON string
  let images = [];
  try {
    if (listing.images && typeof listing.images === 'string') {
      images = JSON.parse(listing.images);
    } else if (Array.isArray(listing.images)) {
      images = listing.images;
    }
  } catch (error) {
    console.error('Error parsing images:', error);
    images = [];
  }

  // Get the first image or use placeholder
  const carImage = images.length > 0
    ? `http://localhost:5000${images[0]}`
    : 'https://via.placeholder.com/400x300?text=No+Image';

  // Format price in EUR
  const formattedPrice = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(listing.price || 0);

  // Format mileage
  const formattedMileage = new Intl.NumberFormat('de-DE').format(listing.mileage || 0);

  // Build the details link
  const detailsLink = `/category/${listing.category}/${listing.id}`;

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden h-full flex flex-col">
      {/* Image Container */}
      <div className="relative overflow-hidden bg-gray-200 h-48 sm:h-56 md:h-64">
        <img
          src={carImage}
          alt={`${listing.make} ${listing.model}`}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x300?text=Car+Image';
          }}
        />

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
              listing.sold
                ? 'bg-red-500 text-white'
                : 'bg-primary-500 text-white'
            }`}
          >
            {listing.sold ? 'Verkauft' : 'Verfügbar'}
          </span>
        </div>

        {/* Car Icon Badge */}
        <div className="absolute top-3 left-3 bg-white rounded-full p-2 shadow-md">
          <Car size={20} className="text-primary-600" />
        </div>
      </div>

      {/* Content Container */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 line-clamp-2">
          {listing.title}
        </h3>

        {/* Make, Model, Year */}
        <div className="flex flex-wrap items-center gap-2 mb-3 text-gray-600">
          <span className="font-semibold text-gray-800">{listing.make}</span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-800">{listing.model}</span>
          {listing.year && (
            <>
              <span className="text-gray-400">•</span>
              <span className="text-gray-800">{listing.year}</span>
            </>
          )}
        </div>

        {/* Key Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          {/* Mileage */}
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">
              Kilometer
            </span>
            <span className="text-gray-900 font-semibold">
              {formattedMileage} km
            </span>
          </div>

          {/* Transmission */}
          {listing.transmission && (
            <div className="flex flex-col">
              <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                Getriebe
              </span>
              <span className="text-gray-900 font-semibold">
                {listing.transmission}
              </span>
            </div>
          )}

          {/* Fuel Type */}
          {listing.fuelType && (
            <div className="flex flex-col">
              <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                Kraftstoff
              </span>
              <span className="text-gray-900 font-semibold">
                {listing.fuelType}
              </span>
            </div>
          )}

          {/* Color */}
          {listing.color && (
            <div className="flex flex-col">
              <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                Farbe
              </span>
              <span className="text-gray-900 font-semibold">
                {listing.color}
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        <hr className="my-3 border-gray-200" />

        {/* Price Section */}
        <div className="mb-4">
          <p className="text-gray-500 text-sm font-medium mb-1">Preis</p>
          <p className={`text-3xl font-bold ${listing.sold ? 'line-through text-gray-400' : 'text-primary-600'}`}>
            {formattedPrice}
          </p>
        </div>

        {/* Details Button */}
        <Link to={detailsLink} className="mt-auto">
          <button
            className="w-full bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 group"
            disabled={listing.sold}
          >
            <Eye size={18} className="group-hover:scale-110 transition-transform" />
            <span>Details anzeigen</span>
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ListingItem;
