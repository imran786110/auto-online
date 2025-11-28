import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useToast } from '@chakra-ui/react'
import { ChevronLeft, ChevronRight, Check, Car, Zap, Palette, Shield, Image as ImageIcon, X } from 'lucide-react'
import { listingsAPI } from '../api/listings'
import { getBaseURL } from '../api/client'

export default function EditListing() {
  const { listingId } = useParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [fetchingListing, setFetchingListing] = useState(true)
  const [formData, setFormData] = useState({
    // Basic Info
    title: '',
    make: '',
    model: '',
    year: '',
    firstRegistration: '',
    price: '',
    mileage: '',
    category: 'sale',
    condition: 'used',

    // Technical Specs
    powerPS: '',
    powerKW: '',
    displacement: '',
    cylinders: '',
    fuelType: 'Benzin',
    transmission: 'Manuell',
    gears: '',
    driveType: '',

    // Consumption & Emissions
    fuelConsumptionCity: '',
    fuelConsumptionHighway: '',
    fuelConsumptionCombined: '',
    co2Emissions: '',
    emissionClass: '',
    emissionSticker: '',

    // Physical Characteristics
    color: '',
    colorManufacturer: '',
    interiorColor: '',
    interiorType: 'Stoff',
    doors: '4',
    seats: '5',

    // Condition
    previousOwners: '',
    fullServiceHistory: false,
    nonSmokingVehicle: false,

    // Additional Info
    availability: 'Sofort',
    vehicleType: 'PKW',
    bodyType: '',
    climatisation: '',

    // Description
    description: ''
  })

  const [features, setFeatures] = useState({
    safety: [],
    comfort: [],
    entertainment: [],
    extras: [],
    parking: []
  })

  const [existingImages, setExistingImages] = useState([])
  const [newImages, setNewImages] = useState([])
  const [newImagePreviews, setNewImagePreviews] = useState([])
  const [imagesToDelete, setImagesToDelete] = useState([])
  const [category, setCategory] = useState('sale')

  const navigate = useNavigate()
  const toast = useToast()

  const totalSteps = 5

  // Fetch existing listing data
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const listing = await listingsAPI.getById(listingId)

        // Check if user is owner or admin
        const userData = localStorage.getItem('user')
        if (userData) {
          const user = JSON.parse(userData)
          if (listing.userId !== user.userId && user.role !== 'admin') {
            toast({
              title: 'Nicht autorisiert',
              description: 'Sie können nur Ihre eigenen Anzeigen bearbeiten',
              status: 'error',
              duration: 3000,
              isClosable: true,
            })
            navigate('/')
            return
          }
        } else {
          navigate('/sign-in')
          return
        }

        // Populate form data
        setFormData({
          title: listing.title || '',
          make: listing.make || '',
          model: listing.model || '',
          year: listing.year || '',
          firstRegistration: listing.firstRegistration || '',
          price: listing.price || '',
          mileage: listing.mileage || '',
          category: listing.category || 'sale',
          condition: listing.condition || 'used',
          powerPS: listing.powerPS || '',
          powerKW: listing.powerKW || '',
          displacement: listing.displacement || '',
          cylinders: listing.cylinders || '',
          fuelType: listing.fuelType || 'Benzin',
          transmission: listing.transmission || 'Manuell',
          gears: listing.gears || '',
          driveType: listing.driveType || '',
          fuelConsumptionCity: listing.fuelConsumptionCity || '',
          fuelConsumptionHighway: listing.fuelConsumptionHighway || '',
          fuelConsumptionCombined: listing.fuelConsumptionCombined || '',
          co2Emissions: listing.co2Emissions || '',
          emissionClass: listing.emissionClass || '',
          emissionSticker: listing.emissionSticker || '',
          color: listing.color || '',
          colorManufacturer: listing.colorManufacturer || '',
          interiorColor: listing.interiorColor || '',
          interiorType: listing.interiorType || 'Stoff',
          doors: listing.doors || '4',
          seats: listing.seats || '5',
          previousOwners: listing.previousOwners || '',
          fullServiceHistory: listing.fullServiceHistory === 1 || listing.fullServiceHistory === true,
          nonSmokingVehicle: listing.nonSmokingVehicle === 1 || listing.nonSmokingVehicle === true,
          availability: listing.availability || 'Sofort',
          vehicleType: listing.vehicleType || 'PKW',
          bodyType: listing.bodyType || '',
          climatisation: listing.climatisation || '',
          description: listing.description || ''
        })

        // Parse and populate features
        const parseFeatures = (jsonString) => {
          try {
            return jsonString ? JSON.parse(jsonString) : []
          } catch (e) {
            return []
          }
        }

        setFeatures({
          safety: parseFeatures(listing.safetyFeatures),
          comfort: parseFeatures(listing.comfortFeatures),
          entertainment: parseFeatures(listing.entertainmentFeatures),
          extras: parseFeatures(listing.extrasFeatures),
          parking: parseFeatures(listing.parkingAssistance)
        })

        // Parse existing images
        const images = parseFeatures(listing.images)
        console.log('📸 Parsed images from listing:', images)
        console.log('📸 Listing.images raw value:', listing.images)
        setExistingImages(images || [])
        console.log('📸 Setting existingImages state to:', images || [])

        // Save category for navigation
        setCategory(listing.category || 'sale')

        setFetchingListing(false)
      } catch (error) {
        toast({
          title: 'Fehler',
          description: 'Anzeige konnte nicht geladen werden',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        navigate('/')
      }
    }

    fetchListing()
  }, [listingId, navigate, toast])

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value
    })
  }

  const handleFeatureToggle = (category, feature) => {
    setFeatures(prev => ({
      ...prev,
      [category]: prev[category].includes(feature)
        ? prev[category].filter(f => f !== feature)
        : [...prev[category], feature]
    }))
  }

  const handleSelectAll = (category, allFeatures) => {
    setFeatures(prev => ({
      ...prev,
      [category]: [...allFeatures]
    }))
  }

  const handleDeselectAll = (category) => {
    setFeatures(prev => ({
      ...prev,
      [category]: []
    }))
  }

  const handleNewImageChange = (e) => {
    const files = Array.from(e.target.files)
    setNewImages(files)

    // Create previews
    const previews = files.map(file => URL.createObjectURL(file))
    setNewImagePreviews(previews)
  }

  const handleRemoveExistingImage = (imageUrl) => {
    setImagesToDelete([...imagesToDelete, imageUrl])
    setExistingImages(existingImages.filter(img => img !== imageUrl))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Only submit if we're on the last step
    if (currentStep < totalSteps) {
      nextStep()
      return
    }

    setLoading(true)

    console.log('🚀 SUBMIT - Current existingImages state:', existingImages)
    console.log('🚀 SUBMIT - Images to delete:', imagesToDelete)
    console.log('🚀 SUBMIT - New images count:', newImages.length)

    try {
      const data = new FormData()

      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '' && formData[key] !== null) {
          data.append(key, formData[key])
        }
      })

      // Append features as JSON strings (features is same as safetyFeatures for backward compatibility)
      data.append('features', JSON.stringify(features.safety))
      data.append('safetyFeatures', JSON.stringify(features.safety))
      data.append('comfortFeatures', JSON.stringify(features.comfort))
      data.append('entertainmentFeatures', JSON.stringify(features.entertainment))
      data.append('extrasFeatures', JSON.stringify(features.extras))
      data.append('parkingAssistance', JSON.stringify(features.parking))

      // Append existing images (not deleted)
      console.log('🚀 SUBMIT - Appending existingImages to FormData:', JSON.stringify(existingImages))
      data.append('existingImages', JSON.stringify(existingImages))

      // Append images to delete
      data.append('imagesToDelete', JSON.stringify(imagesToDelete))

      // Append new images
      newImages.forEach((image) => {
        data.append('images', image)
      })

      await listingsAPI.update(listingId, data)

      toast({
        title: 'Erfolgreich!',
        description: 'Anzeige wurde aktualisiert',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      // Navigate to listing details
      navigate(`/category/${category}/${listingId}`)
    } catch (error) {
      toast({
        title: 'Fehler',
        description: error.response?.data?.error || 'Fehler beim Aktualisieren',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} className="flex items-center">
            <button
              type="button"
              onClick={() => setCurrentStep(step)}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                step < currentStep
                  ? 'bg-primary-500 hover:bg-primary-600 text-white'
                  : step === currentStep
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {step < currentStep ? <Check size={20} /> : step}
            </button>
            {step < 5 && (
              <div
                className={`w-12 sm:w-20 h-1 ${
                  step < currentStep ? 'bg-primary-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-xs sm:text-sm font-medium">
        <span className={currentStep === 1 ? 'text-primary-600' : 'text-gray-600'}>Basis</span>
        <span className={currentStep === 2 ? 'text-primary-600' : 'text-gray-600'}>Technik</span>
        <span className={currentStep === 3 ? 'text-primary-600' : 'text-gray-600'}>Details</span>
        <span className={currentStep === 4 ? 'text-primary-600' : 'text-gray-600'}>Ausstattung</span>
        <span className={currentStep === 5 ? 'text-primary-600' : 'text-gray-600'}>Fotos</span>
      </div>
    </div>
  )

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Car className="h-8 w-8 text-primary-600" />
        <h2 className="text-2xl font-bold text-gray-900">Grundinformationen</h2>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Titel *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="z.B. BMW 320d Touring M Sport"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Marke *</label>
          <input
            type="text"
            name="make"
            value={formData.make}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="z.B. BMW"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Modell *</label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="z.B. 320d"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Baujahr *</label>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            required
            min="1900"
            max={new Date().getFullYear() + 1}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="2020"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Erstzulassung</label>
          <input
            type="month"
            name="firstRegistration"
            value={formData.firstRegistration}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Preis (€) *</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="25000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Kilometerstand *</label>
          <input
            type="number"
            name="mileage"
            value={formData.mileage}
            onChange={handleChange}
            required
            min="0"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="50000"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Zustand *</label>
          <select
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="used">Gebraucht</option>
            <option value="new">Neufahrzeug</option>
            <option value="oldtimer">Oldtimer</option>
            <option value="preowned">Jahreswagen</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Fahrzeugtyp</label>
          <select
            name="vehicleType"
            value={formData.vehicleType}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="PKW">PKW</option>
            <option value="SUV/Geländewagen">SUV/Geländewagen</option>
            <option value="Transporter">Transporter</option>
            <option value="Cabrio/Roadster">Cabrio/Roadster</option>
            <option value="Sportwagen/Coupé">Sportwagen/Coupé</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Karosserieform</label>
        <select
          name="bodyType"
          value={formData.bodyType}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Bitte wählen</option>
          <option value="Limousine">Limousine</option>
          <option value="Kombi">Kombi</option>
          <option value="SUV">SUV</option>
          <option value="Coupé">Coupé</option>
          <option value="Cabrio">Cabrio</option>
          <option value="Kleinwagen">Kleinwagen</option>
          <option value="Van/Transporter">Van/Transporter</option>
        </select>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Zap className="h-8 w-8 text-primary-600" />
        <h2 className="text-2xl font-bold text-gray-900">Technische Daten</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Leistung (PS)</label>
          <input
            type="number"
            name="powerPS"
            value={formData.powerPS}
            onChange={handleChange}
            min="0"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="150"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Leistung (kW)</label>
          <input
            type="number"
            name="powerKW"
            value={formData.powerKW}
            onChange={handleChange}
            min="0"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="110"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hubraum (ccm)</label>
          <input
            type="number"
            name="displacement"
            value={formData.displacement}
            onChange={handleChange}
            min="0"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="1995"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Zylinder</label>
          <input
            type="number"
            name="cylinders"
            value={formData.cylinders}
            onChange={handleChange}
            min="1"
            max="16"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="4"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Kraftstoffart *</label>
          <select
            name="fuelType"
            value={formData.fuelType}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="Benzin">Benzin</option>
            <option value="Diesel">Diesel</option>
            <option value="Elektro">Elektro</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Plug-in-Hybrid">Plug-in-Hybrid</option>
            <option value="Autogas (LPG)">Autogas (LPG)</option>
            <option value="Erdgas (CNG)">Erdgas (CNG)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Getriebe *</label>
          <select
            name="transmission"
            value={formData.transmission}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="Manuell">Manuell</option>
            <option value="Automatik">Automatik</option>
            <option value="Halbautomatik">Halbautomatik</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Anzahl Gänge</label>
          <input
            type="number"
            name="gears"
            value={formData.gears}
            onChange={handleChange}
            min="1"
            max="10"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="6"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Antriebsart</label>
          <select
            name="driveType"
            value={formData.driveType}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Bitte wählen</option>
            <option value="Vorderradantrieb">Vorderradantrieb</option>
            <option value="Hinterradantrieb">Hinterradantrieb</option>
            <option value="Allradantrieb">Allradantrieb</option>
          </select>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">Verbrauch & Emissionen</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Innerorts (l/100km)</label>
            <input
              type="number"
              step="0.1"
              name="fuelConsumptionCity"
              value={formData.fuelConsumptionCity}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="7.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Außerorts (l/100km)</label>
            <input
              type="number"
              step="0.1"
              name="fuelConsumptionHighway"
              value={formData.fuelConsumptionHighway}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="5.2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kombiniert (l/100km)</label>
            <input
              type="number"
              step="0.1"
              name="fuelConsumptionCombined"
              value={formData.fuelConsumptionCombined}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="6.1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CO₂-Emissionen (g/km)</label>
            <input
              type="number"
              name="co2Emissions"
              value={formData.co2Emissions}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="139"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Emissionsklasse</label>
            <select
              name="emissionClass"
              value={formData.emissionClass}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Bitte wählen</option>
              <option value="Euro 6d">Euro 6d</option>
              <option value="Euro 6d-TEMP">Euro 6d-TEMP</option>
              <option value="Euro 6c">Euro 6c</option>
              <option value="Euro 6b">Euro 6b</option>
              <option value="Euro 6">Euro 6</option>
              <option value="Euro 5">Euro 5</option>
              <option value="Euro 4">Euro 4</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Umweltplakette</label>
            <select
              name="emissionSticker"
              value={formData.emissionSticker}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Bitte wählen</option>
              <option value="Grün">Grün (4)</option>
              <option value="Gelb">Gelb (3)</option>
              <option value="Rot">Rot (2)</option>
              <option value="Keine">Keine</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Palette className="h-8 w-8 text-primary-600" />
        <h2 className="text-2xl font-bold text-gray-900">Fahrzeugdetails</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Außenfarbe</label>
          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="z.B. Schwarz"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Herstellerfarbe</label>
          <input
            type="text"
            name="colorManufacturer"
            value={formData.colorManufacturer}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="z.B. Saphirschwarz Metallic"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Innenfarbe</label>
          <input
            type="text"
            name="interiorColor"
            value={formData.interiorColor}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="z.B. Schwarz"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Polsterung</label>
          <select
            name="interiorType"
            value={formData.interiorType}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="Stoff">Stoff</option>
            <option value="Teilleder">Teilleder</option>
            <option value="Vollleder">Vollleder</option>
            <option value="Alcantara">Alcantara</option>
            <option value="Kunstleder">Kunstleder</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Anzahl Türen</label>
          <select
            name="doors"
            value={formData.doors}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="2">2/3</option>
            <option value="4">4/5</option>
            <option value="6">6/7</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Anzahl Sitzplätze</label>
          <select
            name="seats"
            value={formData.seats}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="2">2</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
          </select>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">Zustand & Historie</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vorbesitzer</label>
            <input
              type="number"
              name="previousOwners"
              value={formData.previousOwners}
              onChange={handleChange}
              min="0"
              max="20"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Verfügbarkeit</label>
            <select
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="Sofort">Sofort</option>
              <option value="Nach Vereinbarung">Nach Vereinbarung</option>
              <option value="1-2 Wochen">1-2 Wochen</option>
              <option value="2-4 Wochen">2-4 Wochen</option>
            </select>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="fullServiceHistory"
              checked={formData.fullServiceHistory}
              onChange={handleChange}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-700">Scheckheftgepflegt</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="nonSmokingVehicle"
              checked={formData.nonSmokingVehicle}
              onChange={handleChange}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-700">Nichtraucherfahrzeug</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Klimaanlage</label>
          <select
            name="climatisation"
            value={formData.climatisation}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Keine Angabe</option>
            <option value="Keine">Keine</option>
            <option value="Manuell">Manuelle Klimaanlage</option>
            <option value="Automatik">Klimaautomatik</option>
            <option value="2-Zonen">2-Zonen Klimaautomatik</option>
            <option value="3-Zonen">3-Zonen Klimaautomatik</option>
            <option value="4-Zonen">4-Zonen Klimaautomatik</option>
          </select>
        </div>
      </div>
    </div>
  )

  const renderStep4 = () => {
    const safetyFeaturesList = [
      'ABS', 'ESP', 'Airbag Fahrer', 'Airbag Beifahrer', 'Seitenairbag',
      'Kopfairbag', 'Spurhalteassistent', 'Notbremsassistent', 'Toter-Winkel-Assistent',
      'Verkehrszeichenerkennung', 'Müdigkeitswarner', 'Abstandstempomat'
    ]

    const comfortFeaturesList = [
      'Sitzheizung', 'Lenkradheizung', 'Standheizung', 'Panoramadach',
      'Elektrische Fensterheber', 'Elektrische Seitenspiegel', 'Schiebedach',
      'Regensensor', 'Lichtsensor', 'Keyless Entry', 'Start-Stopp-Automatik',
      'Tempomat', 'Multifunktionslenkrad', 'Lederlenkrad', 'Elektrisch verstellbare Sitze'
    ]

    const entertainmentFeaturesList = [
      'Navigationssystem', 'Bluetooth', 'USB-Anschluss', 'Apple CarPlay',
      'Android Auto', 'DAB+ Radio', 'CD-Player', 'Soundsystem',
      'Freisprecheinrichtung', 'Induktive Ladestation'
    ]

    const extrasFeaturesList = [
      'Metallic-Lackierung', 'Leichtmetallfelgen', 'LED-Scheinwerfer',
      'Xenon-Scheinwerfer', 'Nebelscheinwerfer', 'Anhängerkupplung',
      'Dachreling', 'Sportsitze', 'Sportfahrwerk', 'Partikelfilter',
      'Allwetterreifen', 'Winterreifen', 'Sommerreifen'
    ]

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-8 w-8 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900">Ausstattung</h2>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Sicherheit</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleSelectAll('safety', safetyFeaturesList)}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                Alle auswählen
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={() => handleDeselectAll('safety')}
                className="text-xs text-gray-600 hover:text-gray-700 font-medium"
              >
                Alle abwählen
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {safetyFeaturesList.map(feature => (
              <label key={feature} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={features.safety.includes(feature)}
                  onChange={() => handleFeatureToggle('safety', feature)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{feature}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Komfort</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleSelectAll('comfort', comfortFeaturesList)}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                Alle auswählen
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={() => handleDeselectAll('comfort')}
                className="text-xs text-gray-600 hover:text-gray-700 font-medium"
              >
                Alle abwählen
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {comfortFeaturesList.map(feature => (
              <label key={feature} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={features.comfort.includes(feature)}
                  onChange={() => handleFeatureToggle('comfort', feature)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{feature}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Unterhaltung</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleSelectAll('entertainment', entertainmentFeaturesList)}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                Alle auswählen
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={() => handleDeselectAll('entertainment')}
                className="text-xs text-gray-600 hover:text-gray-700 font-medium"
              >
                Alle abwählen
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {entertainmentFeaturesList.map(feature => (
              <label key={feature} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={features.entertainment.includes(feature)}
                  onChange={() => handleFeatureToggle('entertainment', feature)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{feature}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Extras</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleSelectAll('extras', extrasFeaturesList)}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                Alle auswählen
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={() => handleDeselectAll('extras')}
                className="text-xs text-gray-600 hover:text-gray-700 font-medium"
              >
                Alle abwählen
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {extrasFeaturesList.map(feature => (
              <label key={feature} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={features.extras.includes(feature)}
                  onChange={() => handleFeatureToggle('extras', feature)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{feature}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Einparkhilfe</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleSelectAll('parking', ['Sensoren vorne', 'Sensoren hinten', 'Sensoren vorne und hinten', 'Rückfahrkamera', '360° Kamera', 'Selbstlenkende Einparkhilfe'])}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                Alle auswählen
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={() => handleDeselectAll('parking')}
                className="text-xs text-gray-600 hover:text-gray-700 font-medium"
              >
                Alle abwählen
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {['Sensoren vorne', 'Sensoren hinten', 'Sensoren vorne und hinten', 'Rückfahrkamera', '360° Kamera', 'Selbstlenkende Einparkhilfe'].map(feature => (
              <label key={feature} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={features.parking.includes(feature)}
                  onChange={() => handleFeatureToggle('parking', feature)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{feature}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <ImageIcon className="h-8 w-8 text-primary-600" />
        <h2 className="text-2xl font-bold text-gray-900">Fotos & Beschreibung</h2>
      </div>

      {existingImages.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Aktuelle Bilder</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {existingImages.map((imageUrl, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                <img
                  src={`${getBaseURL()}${imageUrl}`}
                  alt={`Existing ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                    Hauptbild
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveExistingImage(imageUrl)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Neue Bilder hinzufügen (max. 10)</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleNewImageChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        />
        <p className="text-sm text-gray-500 mt-2">
          Laden Sie bis zu 10 neue Bilder hoch.
        </p>
      </div>

      {newImagePreviews.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Neue Bilder (Vorschau)</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {newImagePreviews.map((preview, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-primary-200">
                <img
                  src={preview}
                  alt={`New Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Fahrzeugbeschreibung</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={8}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          placeholder="Beschreiben Sie das Fahrzeug ausführlich: Besonderheiten, Zustand, Extras, Wartungshistorie, etc."
        />
        <p className="text-sm text-gray-500 mt-2">
          Eine ausführliche Beschreibung erhöht die Verkaufschancen.
        </p>
      </div>
    </div>
  )

  if (fetchingListing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Anzeige...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Fahrzeuganzeige bearbeiten</h1>

        {renderStepIndicator()}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 sm:p-8" noValidate>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}

          <div className="flex gap-4 mt-8 pt-6 border-t">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
              >
                <ChevronLeft size={20} />
                Zurück
              </button>
            )}

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 font-semibold"
              >
                Weiter
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Wird aktualisiert...' : 'Änderungen speichern'}
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate(`/category/${category}/${listingId}`)}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
