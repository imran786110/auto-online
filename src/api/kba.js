import axios from 'axios'

const KBA_API_URL = 'https://www.kbaapi.de/api/reg.asmx/CheckGermany'
const KBA_API_USERNAME = import.meta.env.VITE_KBA_API_USERNAME

/**
 * Call KBA API to lookup vehicle data by HSN/TSN
 * @param {string} hsn - HSN number (4 digits)
 * @param {string} tsn - TSN number (3 digits)
 * @returns {Promise<Object>} Vehicle data from KBA API
 */
export const lookupVehicleByKBA = async (hsn, tsn) => {
  try {
    // Check if API username is configured
    if (!KBA_API_USERNAME) {
      throw new Error('KBA API username not configured. Please set VITE_KBA_API_USERNAME in .env file')
    }

    // Format: ****/**
    const kbaNumber = `${hsn}/${tsn}`

    const response = await axios.get(KBA_API_URL, {
      params: {
        KBANumber: kbaNumber,
        username: KBA_API_USERNAME
      }
    })

    // Parse XML response
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(response.data, 'text/xml')

    // Check for parsing errors
    const parseError = xmlDoc.querySelector('parsererror')
    if (parseError) {
      throw new Error('Failed to parse XML response')
    }

    // Extract vehicleJson field which contains the JSON data
    const vehicleJsonNode = xmlDoc.querySelector('vehicleJson')

    if (!vehicleJsonNode || !vehicleJsonNode.textContent) {
      throw new Error('No vehicle data found for this HSN/TSN combination')
    }

    // Parse the JSON string inside vehicleJson
    const vehicleData = JSON.parse(vehicleJsonNode.textContent)

    return {
      success: true,
      data: vehicleData
    }
  } catch (error) {
    console.error('KBA API Error:', error)

    return {
      success: false,
      error: error.response?.data || error.message || 'Failed to fetch vehicle data'
    }
  }
}

/**
 * Map KBA API response to form data structure
 * @param {Object} kbaData - Data from KBA API
 * @returns {Object} Mapped form data
 */
export const mapKBADataToForm = (kbaData) => {
  const formData = {}

  // Make and Model
  if (kbaData.CarMake?.CurrentTextValue) {
    formData.make = kbaData.CarMake.CurrentTextValue
  } else if (kbaData.MakeDescription?.CurrentTextValue) {
    formData.make = kbaData.MakeDescription.CurrentTextValue
  }

  if (kbaData.CarModel?.CurrentTextValue) {
    formData.model = kbaData.CarModel.CurrentTextValue
  } else if (kbaData.ModelDescription?.CurrentTextValue) {
    formData.model = kbaData.ModelDescription.CurrentTextValue
  }

  // Description (can be used as title if needed)
  if (kbaData.Description) {
    formData.title = kbaData.Description
  }

  // Power
  if (kbaData.PowerHP) {
    formData.powerPS = kbaData.PowerHP
  }

  if (kbaData.PowerKW) {
    formData.powerKW = kbaData.PowerKW
  }

  // Engine Size (displacement in ccm)
  if (kbaData.EngineSize && kbaData.EngineSize > 0) {
    formData.displacement = kbaData.EngineSize
  }

  // Fuel Type - map German fuel types to form values
  if (kbaData.Fuel || kbaData.FuelType?.CurrentValue) {
    const fuelValue = kbaData.Fuel || kbaData.FuelType?.CurrentValue
    const fuelTypeMap = {
      'Elektro': 'Elektro',
      'Benzin': 'Benzin',
      'Diesel': 'Diesel',
      'Hybrid': 'Hybrid',
      'Plug-in-Hybrid': 'Plug-in-Hybrid',
      'Autogas': 'Autogas (LPG)',
      'Erdgas': 'Erdgas (CNG)',
      'LPG': 'Autogas (LPG)',
      'CNG': 'Erdgas (CNG)'
    }

    formData.fuelType = fuelTypeMap[fuelValue] || fuelValue
  }

  // Additional fields that might be available from KBA API
  // These are optional and will only be set if present in the response

  // Doors
  if (kbaData.Doors) {
    formData.doors = String(kbaData.Doors)
  }

  // Seats
  if (kbaData.Seats) {
    formData.seats = String(kbaData.Seats)
  }

  // Transmission
  if (kbaData.Transmission) {
    const transmissionMap = {
      'Manuell': 'Manuell',
      'Manual': 'Manuell',
      'Automatik': 'Automatik',
      'Automatic': 'Automatik',
      'Halbautomatik': 'Halbautomatik',
      'Semi-Automatic': 'Halbautomatik'
    }
    formData.transmission = transmissionMap[kbaData.Transmission] || kbaData.Transmission
  }

  // Cylinders
  if (kbaData.Cylinders) {
    formData.cylinders = kbaData.Cylinders
  }

  // CO2 Emissions
  if (kbaData.CO2Emissions) {
    formData.co2Emissions = kbaData.CO2Emissions
  }

  // Emission Class
  if (kbaData.EmissionClass) {
    formData.emissionClass = kbaData.EmissionClass
  }

  // Body Type / Vehicle Type
  if (kbaData.BodyType) {
    const bodyTypeMap = {
      'Limousine': 'Limousine',
      'Kombi': 'Kombi',
      'SUV': 'SUV',
      'Coupé': 'Coupé',
      'Coupe': 'Coupé',
      'Cabrio': 'Cabrio',
      'Cabriolet': 'Cabrio',
      'Kleinwagen': 'Kleinwagen',
      'Van': 'Van/Transporter',
      'Transporter': 'Van/Transporter'
    }
    formData.bodyType = bodyTypeMap[kbaData.BodyType] || kbaData.BodyType
  }

  // Color (if available)
  if (kbaData.Color) {
    formData.color = kbaData.Color
  }

  // Gears
  if (kbaData.Gears) {
    formData.gears = kbaData.Gears
  }

  // Drive Type
  if (kbaData.DriveType) {
    const driveTypeMap = {
      'Vorderradantrieb': 'Vorderradantrieb',
      'FWD': 'Vorderradantrieb',
      'Front': 'Vorderradantrieb',
      'Hinterradantrieb': 'Hinterradantrieb',
      'RWD': 'Hinterradantrieb',
      'Rear': 'Hinterradantrieb',
      'Allradantrieb': 'Allradantrieb',
      'AWD': 'Allradantrieb',
      '4WD': 'Allradantrieb',
      'All': 'Allradantrieb'
    }
    formData.driveType = driveTypeMap[kbaData.DriveType] || kbaData.DriveType
  }

  return formData
}
