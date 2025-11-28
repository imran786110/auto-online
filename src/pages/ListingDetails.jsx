import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  CheckCircle,
  Car,
  Settings,
  ArrowLeft
} from 'lucide-react';
import { listingsAPI } from '../api/listings';

// Helper component for detail items
const DetailItem = ({ label, value }) => (
  <div className="p-3 bg-gray-50 rounded-lg">
    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
      {label}
    </p>
    <p className="text-sm font-semibold text-gray-900">
      {value}
    </p>
  </div>
);

// Helper component for feature sections
const FeatureSection = ({ title, features }) => (
  <div>
    <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
    <div className="grid grid-cols-2 gap-2">
      {features.map((feature, index) => (
        <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
          <span className="text-primary-600">✓</span>
          <span>{feature}</span>
        </div>
      ))}
    </div>
  </div>
);

// Helper function to parse features
const parseFeatures = (featuresString) => {
  try {
    if (!featuresString) return [];
    const parsed = JSON.parse(featuresString);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function ListingDetails() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Check if user is admin and get user details
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setIsAdmin(user.role === 'admin');
      setCurrentUser(user);
    }

    // Fetch listing data
    const fetchListing = async () => {
      try {
        setLoading(true);
        const data = await listingsAPI.getById(listingId);
        setListing(data);

        // Parse images
        let parsedImages = [];
        try {
          if (data.images && typeof data.images === 'string') {
            parsedImages = JSON.parse(data.images);
          } else if (Array.isArray(data.images)) {
            parsedImages = data.images;
          }
        } catch (error) {
          console.error('Error parsing images:', error);
        }
        setImages(parsedImages);
      } catch (error) {
        console.error('Error fetching listing:', error);
        toast({
          title: 'Fehler',
          description: 'Fahrzeug konnte nicht geladen werden',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [listingId, toast]);

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const handleDelete = async () => {
    if (!window.confirm('Sind Sie sicher, dass Sie diese Anzeige löschen möchten?')) {
      return;
    }

    try {
      setActionLoading(true);
      await listingsAPI.delete(listingId);
      toast({
        title: 'Erfolgreich!',
        description: 'Anzeige wurde gelöscht',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/profile');
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        title: 'Fehler',
        description: error.response?.data?.error || 'Fehler beim Löschen',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleSold = async () => {
    try {
      setActionLoading(true);
      const updatedSoldStatus = !listing.sold;

      // Create FormData for the update
      const formData = new FormData();
      formData.append('sold', updatedSoldStatus ? '1' : '0');

      await listingsAPI.update(listingId, formData);
      setListing({ ...listing, sold: updatedSoldStatus });
      toast({
        title: 'Erfolgreich!',
        description: updatedSoldStatus ? 'Als verkauft markiert' : 'Als verfügbar markiert',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating listing:', error);
      toast({
        title: 'Fehler',
        description: error.response?.data?.error || 'Fehler beim Aktualisieren',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatMileage = (mileage) => {
    return new Intl.NumberFormat('de-DE').format(mileage);
  };

  const generateMailtoLink = () => {
    // Email subject
    const subject = `Anfrage: ${listing.make} ${listing.model} ${listing.year} - ${formatPrice(listing.price)}`;

    // Email body with user details if logged in
    let body = `Guten Tag,\n\nich interessiere mich für folgendes Fahrzeug:\n\n`;
    body += `Fahrzeug: ${listing.title}\n`;
    body += `Marke/Modell: ${listing.make} ${listing.model}\n`;
    body += `Baujahr: ${listing.year}\n`;
    body += `Kilometerstand: ${formatMileage(listing.mileage)} km\n`;
    body += `Preis: ${formatPrice(listing.price)}\n\n`;
    body += `Ich würde gerne einen Termin für eine Besichtigung und Probefahrt vereinbaren.\n\n`;

    // Add user details if logged in
    if (currentUser) {
      body += `Meine Kontaktdaten:\n`;
      body += `Name: ${currentUser.name || ''}\n`;
      body += `E-Mail: ${currentUser.email || ''}\n\n`;
    }

    body += `Bitte teilen Sie mir einen passenden Termin mit.\n\n`;
    body += `Mit freundlichen Grüßen`;

    // Encode for URL
    const mailtoLink = `mailto:imranhussain.cse@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    return mailtoLink;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
          <p className="text-gray-600 mt-4 text-lg">Lädt Fahrzeugdetails...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Car className="h-20 w-20 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Fahrzeug nicht gefunden</h2>
          <p className="text-gray-600 mb-6">Das gesuchte Fahrzeug existiert nicht.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Zurück zur Startseite
          </Link>
        </div>
      </div>
    );
  }

  const currentImage = images.length > 0
    ? `http://localhost:5000${images[currentImageIndex]}`
    : 'https://via.placeholder.com/800x600?text=Kein+Bild';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Zurück</span>
          </button>
        </div>
      </div>


      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Image Slideshow */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-gray-200 rounded-xl overflow-hidden shadow-lg aspect-[4/3]">
              <img
                src={currentImage}
                alt={listing.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800x600?text=Fahrzeug+Bild';
                }}
              />

              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                    listing.sold
                      ? 'bg-red-500 text-white'
                      : 'bg-primary-500 text-white'
                  }`}
                >
                  {listing.sold ? 'VERKAUFT' : 'VERFÜGBAR'}
                </span>
              </div>

              {/* Navigation Buttons */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePreviousImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-lg transition-all hover:scale-110"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-lg transition-all hover:scale-110"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  {currentImageIndex + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex
                        ? 'border-primary-600 shadow-md scale-105'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={`http://localhost:5000${img}`}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Quick Details Below Images */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Fahrzeugübersicht</h3>
              <div className="grid grid-cols-2 gap-4">
                {listing.powerPS && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <span className="text-primary-600 font-bold text-sm">PS</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Leistung</p>
                      <p className="font-semibold text-gray-900">{listing.powerPS} PS</p>
                    </div>
                  </div>
                )}
                {listing.fuelType && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <span className="text-primary-600 text-lg">⛽</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Kraftstoff</p>
                      <p className="font-semibold text-gray-900">{listing.fuelType}</p>
                    </div>
                  </div>
                )}
                {listing.transmission && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <span className="text-primary-600 text-lg">⚙️</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Getriebe</p>
                      <p className="font-semibold text-gray-900">{listing.transmission}</p>
                    </div>
                  </div>
                )}
                {listing.color && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <span className="text-primary-600 text-lg">🎨</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Farbe</p>
                      <p className="font-semibold text-gray-900">{listing.color}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Title and Price */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                {listing.title}
              </h1>
              <div className="flex items-center gap-3 text-lg text-gray-600 mb-4">
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
              <div className="pt-4 border-t">
                <p className="text-gray-600 text-sm font-medium mb-1">Preis</p>
                <p className={`text-4xl font-bold ${listing.sold ? 'line-through text-gray-400' : 'text-primary-600'}`}>
                  {formatPrice(listing.price)}
                </p>
              </div>
            </div>

            {/* Key Specifications */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Fahrzeugdaten</h2>
              <div className="grid grid-cols-2 gap-3">
                <DetailItem label="Kilometerstand" value={`${formatMileage(listing.mileage)} km`} />
                {listing.firstRegistration && <DetailItem label="Erstzulassung" value={listing.firstRegistration} />}
                {listing.year && <DetailItem label="Baujahr" value={listing.year} />}
                {listing.condition && <DetailItem label="Zustand" value={listing.condition} />}
                {listing.previousOwners && <DetailItem label="Vorbesitzer" value={listing.previousOwners} />}
                {listing.vehicleType && <DetailItem label="Fahrzeugtyp" value={listing.vehicleType} />}
                {listing.bodyType && <DetailItem label="Karosserieform" value={listing.bodyType} />}
                {listing.availability && <DetailItem label="Verfügbarkeit" value={listing.availability} />}
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Technische Daten</h2>
              <div className="grid grid-cols-2 gap-3">
                {listing.powerPS && <DetailItem label="Leistung" value={`${listing.powerPS} PS${listing.powerKW ? ` (${listing.powerKW} kW)` : ''}`} />}
                {listing.displacement && <DetailItem label="Hubraum" value={`${listing.displacement} ccm`} />}
                {listing.cylinders && <DetailItem label="Zylinder" value={listing.cylinders} />}
                {listing.fuelType && <DetailItem label="Kraftstoff" value={listing.fuelType} />}
                {listing.transmission && <DetailItem label="Getriebe" value={listing.transmission} />}
                {listing.gears && <DetailItem label="Gänge" value={listing.gears} />}
                {listing.driveType && <DetailItem label="Antrieb" value={listing.driveType} />}
              </div>
            </div>

            {/* Consumption & Emissions */}
            {(listing.fuelConsumptionCity || listing.fuelConsumptionHighway || listing.fuelConsumptionCombined || listing.co2Emissions || listing.emissionClass) && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Verbrauch & Emissionen</h2>
                <div className="grid grid-cols-2 gap-3">
                  {listing.fuelConsumptionCity && <DetailItem label="Innerorts" value={`${listing.fuelConsumptionCity} l/100km`} />}
                  {listing.fuelConsumptionHighway && <DetailItem label="Außerorts" value={`${listing.fuelConsumptionHighway} l/100km`} />}
                  {listing.fuelConsumptionCombined && <DetailItem label="Kombiniert" value={`${listing.fuelConsumptionCombined} l/100km`} />}
                  {listing.co2Emissions && <DetailItem label="CO₂-Emissionen" value={`${listing.co2Emissions} g/km`} />}
                  {listing.emissionClass && <DetailItem label="Emissionsklasse" value={listing.emissionClass} />}
                  {listing.emissionSticker && <DetailItem label="Umweltplakette" value={listing.emissionSticker} />}
                </div>
              </div>
            )}

            {/* Exterior & Interior */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Ausstattung & Details</h2>
              <div className="grid grid-cols-2 gap-3">
                {listing.color && <DetailItem label="Außenfarbe" value={listing.color} />}
                {listing.colorManufacturer && <DetailItem label="Herstellerfarbe" value={listing.colorManufacturer} />}
                {listing.interiorColor && <DetailItem label="Innenfarbe" value={listing.interiorColor} />}
                {listing.interiorType && <DetailItem label="Polsterung" value={listing.interiorType} />}
                {listing.doors && <DetailItem label="Türen" value={listing.doors} />}
                {listing.seats && <DetailItem label="Sitzplätze" value={listing.seats} />}
                {listing.climatisation && <DetailItem label="Klimaanlage" value={listing.climatisation} />}
                {listing.parkingAssistance && <DetailItem label="Einparkhilfe" value={listing.parkingAssistance} />}
              </div>

              {/* Service History */}
              {(listing.fullServiceHistory || listing.nonSmokingVehicle) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {listing.fullServiceHistory && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                        ✓ Scheckheftgepflegt
                      </span>
                    )}
                    {listing.nonSmokingVehicle && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                        ✓ Nichtraucherfahrzeug
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Features */}
            {(listing.safetyFeatures || listing.comfortFeatures || listing.entertainmentFeatures || listing.extrasFeatures) && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Ausstattungsmerkmale</h2>
                <div className="space-y-4">
                  {listing.safetyFeatures && parseFeatures(listing.safetyFeatures).length > 0 && (
                    <FeatureSection title="Sicherheit" features={parseFeatures(listing.safetyFeatures)} />
                  )}
                  {listing.comfortFeatures && parseFeatures(listing.comfortFeatures).length > 0 && (
                    <FeatureSection title="Komfort" features={parseFeatures(listing.comfortFeatures)} />
                  )}
                  {listing.entertainmentFeatures && parseFeatures(listing.entertainmentFeatures).length > 0 && (
                    <FeatureSection title="Unterhaltung" features={parseFeatures(listing.entertainmentFeatures)} />
                  )}
                  {listing.extrasFeatures && parseFeatures(listing.extrasFeatures).length > 0 && (
                    <FeatureSection title="Extras" features={parseFeatures(listing.extrasFeatures)} />
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            {listing.description && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Beschreibung</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {listing.description}
                </p>
              </div>
            )}

            {/* Contact Button */}
            {!listing.sold && (
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg p-6 text-white">
                <h3 className="text-xl font-bold mb-2">Interessiert?</h3>
                <p className="text-primary-100 mb-4">
                  Kontaktieren Sie uns für weitere Informationen oder eine Probefahrt.
                </p>
                <a
                  href={generateMailtoLink()}
                  className="inline-flex items-center justify-center w-full bg-white text-primary-600 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  📧 Jetzt kontaktieren
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
