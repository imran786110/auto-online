import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@chakra-ui/react'
import { ChevronLeft, ChevronRight, Check, Car, Zap, Palette, Shield, Image as ImageIcon, X, Search } from 'lucide-react'
import { listingsAPI } from '../api/listings'
import { lookupVehicleByKBA, mapKBADataToForm } from '../api/kba'

export default function CreateListing() {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [kbaLookupLoading, setKbaLookupLoading] = useState(false)
  const [hsn, setHsn] = useState('')
  const [tsn, setTsn] = useState('')
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

  const [images, setImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])

  const navigate = useNavigate()
  const toast = useToast()

  const totalSteps = 5

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) {
      navigate('/sign-in')
    }
  }, [navigate])

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value
    })
  }

  const handleKBALookup = async (hsnValue, tsnValue) => {
    // Only trigger lookup if both HSN and TSN are filled
    if (!hsnValue || !tsnValue) return

    // Validate HSN (should be 4 characters)
    if (hsnValue.length !== 4) return

    // Validate TSN (should be 3 characters)
    if (tsnValue.length !== 3) return

    setKbaLookupLoading(true)

    try {
      const result = await lookupVehicleByKBA(hsnValue, tsnValue)

      if (result.success && result.data) {
        const mappedData = mapKBADataToForm(result.data)

        // Update formData with the mapped data
        setFormData(prevData => ({
          ...prevData,
          ...mappedData
        }))

        toast({
          title: 'Fahrzeugdaten geladen',
          description: `${result.data.Description || 'Fahrzeugdaten'} erfolgreich importiert`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } else {
        toast({
          title: 'Keine Daten gefunden',
          description: result.error || 'Für diese HSN/TSN-Kombination wurden keine Fahrzeugdaten gefunden',
          status: 'warning',
          duration: 4000,
          isClosable: true,
        })
      }
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Fehler beim Abrufen der Fahrzeugdaten',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setKbaLookupLoading(false)
    }
  }

  const handleHsnChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) // Alphanumeric only, max 4
    setHsn(value)

    // Trigger lookup if both fields are complete
    if (value.length === 4 && tsn.length === 3) {
      handleKBALookup(value, tsn)
    }
  }

  const handleTsnChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3) // Alphanumeric only, max 3
    setTsn(value)

    // Trigger lookup if both fields are complete
    if (hsn.length === 4 && value.length === 3) {
      handleKBALookup(hsn, value)
    }
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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setImages(prevImages => [...prevImages, ...files])

    // Create previews
    const previews = files.map(file => URL.createObjectURL(file))
    setImagePreviews(prevPreviews => [...prevPreviews, ...previews])
  }

  const removeImage = (indexToRemove) => {
    // Revoke the object URL to free memory
    URL.revokeObjectURL(imagePreviews[indexToRemove])

    // Remove from both arrays
    setImages(prevImages => prevImages.filter((_, index) => index !== indexToRemove))
    setImagePreviews(prevPreviews => prevPreviews.filter((_, index) => index !== indexToRemove))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Only submit if we're on the last step
    if (currentStep < totalSteps) {
      nextStep()
      return
    }

    setLoading(true)

    try {
      const data = new FormData()

      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '' && formData[key] !== null) {
          data.append(key, formData[key])
        }
      })

      // Append features as JSON strings
      data.append('features', JSON.stringify(features.safety))
      data.append('safetyFeatures', JSON.stringify(features.safety))
      data.append('comfortFeatures', JSON.stringify(features.comfort))
      data.append('entertainmentFeatures', JSON.stringify(features.entertainment))
      data.append('extrasFeatures', JSON.stringify(features.extras))
      data.append('parkingAssistance', JSON.stringify(features.parking))

      // Append images
      images.forEach((image) => {
        data.append('images', image)
      })

      await listingsAPI.create(data)

      toast({
        title: 'Erfolgreich!',
        description: 'Anzeige wurde erstellt',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      // Navigate to admin dashboard for admins, home for others
      const userData = localStorage.getItem('user')
      if (userData) {
        const user = JSON.parse(userData)
        if (user.role === 'admin') {
          navigate('/admin/dashboard')
        } else {
          navigate('/')
        }
      } else {
        navigate('/')
      }
    } catch (error) {
      toast({
        title: 'Fehler',
        description: error.response?.data?.error || 'Fehler beim Erstellen',
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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Search className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">HSN/TSN Fahrzeugdaten abrufen</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Geben Sie die HSN (4 Stellen) und TSN (3 Stellen) ein, um Fahrzeugdaten automatisch zu laden.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">HSN (4 Stellen)</label>
            <input
              type="text"
              value={hsn}
              onChange={handleHsnChange}
              maxLength={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="z.B. 0005"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">TSN (3 Stellen)</label>
            <input
              type="text"
              value={tsn}
              onChange={handleTsnChange}
              maxLength={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="z.B. AJR"
            />
          </div>
        </div>

        {kbaLookupLoading && (
          <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Fahrzeugdaten werden abgerufen...</span>
          </div>
        )}
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Fahrzeugbilder (max. 10)</label>
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/avif"
          multiple
          onChange={handleImageChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        />
        <p className="text-sm text-gray-500 mt-2">
          Laden Sie bis zu 10 Bilder hoch (JPG, PNG, WebP, GIF, AVIF). Das erste Bild wird als Hauptbild verwendet.
        </p>
      </div>

      {imagePreviews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 group">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                  Hauptbild
                </div>
              )}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow-lg transition-all opacity-0 group-hover:opacity-100"
                title="Bild entfernen"
              >
                <X size={16} />
              </button>
            </div>
          ))}
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Neue Fahrzeuganzeige erstellen</h1>

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

            <button
              type="submit"
              disabled={loading && currentStep === totalSteps}
              className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep < totalSteps ? (
                <>
                  Weiter
                  <ChevronRight size={20} />
                </>
              ) : (
                loading ? 'Wird erstellt...' : 'Anzeige veröffentlichen'
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
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
