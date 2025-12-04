const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'listings');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif|avif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype.startsWith('image/');

    // Accept if either the extension is correct OR mimetype is an image
    if (mimetype || extname) {
      return cb(null, true);
    }

    console.error('❌ File rejected:', {
      filename: file.originalname,
      mimetype: file.mimetype,
      extname: path.extname(file.originalname)
    });
    cb(new Error('Only image files are allowed (JPG, PNG, WebP, GIF, AVIF)'));
  }
});

// Get all listings
router.get('/', (req, res) => {
  const { category, search, minPrice, maxPrice, make, year, includeSold } = req.query;

  let query = 'SELECT listings.*, users.fullName as ownerName, users.email as ownerEmail FROM listings JOIN users ON listings.userId = users.id WHERE 1=1';
  const params = [];

  // Hide sold cars from public users unless includeSold is explicitly set to 'true'
  if (includeSold !== 'true') {
    query += ' AND listings.sold = 0';
  }


  if (category) {
    query += ' AND listings.category = ?';
    params.push(category);
  }

  if (search) {
    query += ' AND (listings.title LIKE ? OR listings.description LIKE ? OR listings.make LIKE ? OR listings.model LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  if (minPrice) {
    query += ' AND listings.price >= ?';
    params.push(minPrice);
  }

  if (maxPrice) {
    query += ' AND listings.price <= ?';
    params.push(maxPrice);
  }

  if (make) {
    query += ' AND listings.make = ?';
    params.push(make);
  }

  if (year) {
    query += ' AND listings.year = ?';
    params.push(year);
  }

  query += ' ORDER BY listings.createdAt DESC';

  db.all(query, params, (err, listings) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Parse images JSON
    const formattedListings = listings.map(listing => ({
      ...listing,
      images: listing.images ? JSON.parse(listing.images) : []
    }));

    res.json({ listings: formattedListings });
  });
});

// Get single listing
router.get('/:id', (req, res) => {
  db.get(
    'SELECT listings.*, users.fullName as ownerName, users.email as ownerEmail FROM listings JOIN users ON listings.userId = users.id WHERE listings.id = ?',
    [req.params.id],
    (err, listing) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }

      console.log('🔍 GET listing', req.params.id, '- Raw images from DB:', listing.images);
      listing.images = listing.images ? JSON.parse(listing.images) : [];
      console.log('🔍 GET listing', req.params.id, '- Parsed images:', listing.images);
      res.json({ listing });
    }
  );
});

// Create listing
router.post('/', authenticate, upload.array('images', 15), [
  body('title').trim().notEmpty(),
  body('price').isFloat({ min: 0 }),
  body('description').optional().trim(),
], (req, res) => {
  console.log('📝 POST /listings - Creating new listing...');
  console.log('👤 User ID:', req.user?.userId);
  console.log('📸 Files uploaded:', req.files?.length || 0);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('❌ Validation errors:', JSON.stringify(errors.array(), null, 2));
    console.error('📦 Request body:', JSON.stringify(req.body, null, 2));
    return res.status(400).json({ errors: errors.array() });
  }

  console.log('✅ Validation passed, proceeding with database insert...');

  const {
    // Basic Info
    title, description, price, make, model, year, firstRegistration, mileage, category, condition,
    // Technical Specs
    powerPS, powerKW, displacement, cylinders, fuelType, transmission, gears, driveType,
    // Consumption & Emissions
    fuelConsumptionCity, fuelConsumptionHighway, fuelConsumptionCombined,
    co2Emissions, emissionClass, emissionSticker,
    // Physical Characteristics
    color, colorManufacturer, interiorColor, interiorType, doors, seats,
    // Condition
    previousOwners, fullServiceHistory, nonSmokingVehicle,
    // Features (JSON strings)
    safetyFeatures, comfortFeatures, entertainmentFeatures, extrasFeatures,
    // Additional Info
    availability, vehicleType, bodyType, climatisation, parkingAssistance
  } = req.body;

  const images = req.files ? req.files.map(file => `/uploads/listings/${file.filename}`) : [];

  db.run(
    `INSERT INTO listings (
      userId, title, description, price, make, model, year, firstRegistration, mileage, category, condition,
      powerPS, powerKW, displacement, cylinders, fuelType, transmission, gears, driveType,
      fuelConsumptionCity, fuelConsumptionHighway, fuelConsumptionCombined,
      co2Emissions, emissionClass, emissionSticker,
      color, colorManufacturer, interiorColor, interiorType, doors, seats,
      previousOwners, fullServiceHistory, nonSmokingVehicle,
      features, safetyFeatures, comfortFeatures, entertainmentFeatures, extrasFeatures,
      availability, vehicleType, bodyType, climatisation, parkingAssistance,
      images
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      req.user.userId, title, description, price, make, model, year, firstRegistration, mileage, category || 'sale', condition || 'used',
      powerPS, powerKW, displacement, cylinders, fuelType, transmission, gears, driveType,
      fuelConsumptionCity, fuelConsumptionHighway, fuelConsumptionCombined,
      co2Emissions, emissionClass, emissionSticker,
      color, colorManufacturer, interiorColor, interiorType, doors, seats,
      previousOwners, fullServiceHistory ? 1 : 0, nonSmokingVehicle ? 1 : 0,
      JSON.stringify({ safety: [], comfort: [], entertainment: [], extras: [] }), safetyFeatures, comfortFeatures, entertainmentFeatures, extrasFeatures,
      availability, vehicleType, bodyType, climatisation, parkingAssistance,
      JSON.stringify(images)
    ],
    function(err) {
      if (err) {
        console.error('❌ Database insert error:', err);
        console.error('❌ Error message:', err.message);
        console.error('❌ Error code:', err.code);
        console.error('❌ Error errno:', err.errno);
        return res.status(500).json({
          error: 'Failed to create listing',
          details: err.message
        });
      }

      console.log('✅ Listing created successfully! ID:', this.lastID);
      res.status(201).json({
        message: 'Listing created successfully',
        listingId: this.lastID
      });
    }
  );
});

// Update listing
router.put('/:id', authenticate, upload.array('images', 15), (req, res) => {
  const listingId = req.params.id;

  // First check if user owns the listing
  db.get('SELECT * FROM listings WHERE id = ?', [listingId], (err, listing) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Check if user is owner or admin
    if (listing.userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const {
      // Basic Info
      title, description, price, make, model, year, firstRegistration, mileage, category, condition,
      // Technical Specs
      powerPS, powerKW, displacement, cylinders, fuelType, transmission, gears, driveType,
      // Consumption & Emissions
      fuelConsumptionCity, fuelConsumptionHighway, fuelConsumptionCombined,
      co2Emissions, emissionClass, emissionSticker,
      // Physical Characteristics
      color, colorManufacturer, interiorColor, interiorType, doors, seats,
      // Condition
      previousOwners, fullServiceHistory, nonSmokingVehicle,
      // Features (JSON strings)
      features, safetyFeatures, comfortFeatures, entertainmentFeatures, extrasFeatures,
      // Additional Info
      availability, vehicleType, bodyType, climatisation, parkingAssistance,
      // Status
      sold,
      // Image management
      existingImages, imagesToDelete
    } = req.body;

    // Start with existing images from request, or fall back to current listing images
    let images = [];
    if (existingImages !== undefined && existingImages !== null && existingImages !== '') {
      try {
        const parsed = JSON.parse(existingImages);
        images = Array.isArray(parsed) ? parsed : [];
        console.log('📸 Existing images from request:', images);

        // IMPORTANT: If existingImages is explicitly sent as empty array [], keep current images
        // Only clear images if user explicitly deleted them (imagesToDelete will have entries)
        if (images.length === 0 && (!imagesToDelete || JSON.parse(imagesToDelete || '[]').length === 0)) {
          console.log('⚠️  WARNING: existingImages is empty but no images marked for deletion');
          console.log('⚠️  Preserving current images to prevent accidental loss');
          images = listing.images ? JSON.parse(listing.images) : [];
        }
      } catch (e) {
        console.log('❌ Error parsing existingImages, using listing images');
        images = listing.images ? JSON.parse(listing.images) : [];
      }
    } else {
      // No existingImages sent, keep current listing images
      console.log('📸 No existingImages field, using current listing images');
      images = listing.images ? JSON.parse(listing.images) : [];
    }

    // Delete images that were marked for deletion
    if (imagesToDelete) {
      try {
        const toDelete = JSON.parse(imagesToDelete);
        console.log('Images to delete:', toDelete);
        toDelete.forEach(imagePath => {
          const fullPath = path.join(__dirname, '..', imagePath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            console.log('Deleted image:', imagePath);
          }
        });
      } catch (e) {
        console.error('Error deleting images:', e);
      }
    }

    // Add new uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/listings/${file.filename}`);
      console.log('Adding new images:', newImages);
      images = [...images, ...newImages];
    }

    console.log('Final images array:', images);

    db.run(
      `UPDATE listings SET
       title = ?, description = ?, price = ?, make = ?, model = ?, year = ?, firstRegistration = ?,
       mileage = ?, category = ?, condition = ?,
       powerPS = ?, powerKW = ?, displacement = ?, cylinders = ?, fuelType = ?, transmission = ?, gears = ?, driveType = ?,
       fuelConsumptionCity = ?, fuelConsumptionHighway = ?, fuelConsumptionCombined = ?,
       co2Emissions = ?, emissionClass = ?, emissionSticker = ?,
       color = ?, colorManufacturer = ?, interiorColor = ?, interiorType = ?, doors = ?, seats = ?,
       previousOwners = ?, fullServiceHistory = ?, nonSmokingVehicle = ?,
       features = ?, safetyFeatures = ?, comfortFeatures = ?, entertainmentFeatures = ?, extrasFeatures = ?,
       availability = ?, vehicleType = ?, bodyType = ?, climatisation = ?, parkingAssistance = ?,
       images = ?, sold = ?, updatedAt = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        title !== undefined ? title : listing.title,
        description !== undefined ? description : listing.description,
        price !== undefined ? price : listing.price,
        make !== undefined ? make : listing.make,
        model !== undefined ? model : listing.model,
        year !== undefined ? year : listing.year,
        firstRegistration !== undefined ? firstRegistration : listing.firstRegistration,
        mileage !== undefined ? mileage : listing.mileage,
        category !== undefined ? category : listing.category,
        condition !== undefined ? condition : listing.condition,
        powerPS !== undefined ? powerPS : listing.powerPS,
        powerKW !== undefined ? powerKW : listing.powerKW,
        displacement !== undefined ? displacement : listing.displacement,
        cylinders !== undefined ? cylinders : listing.cylinders,
        fuelType !== undefined ? fuelType : listing.fuelType,
        transmission !== undefined ? transmission : listing.transmission,
        gears !== undefined ? gears : listing.gears,
        driveType !== undefined ? driveType : listing.driveType,
        fuelConsumptionCity !== undefined ? fuelConsumptionCity : listing.fuelConsumptionCity,
        fuelConsumptionHighway !== undefined ? fuelConsumptionHighway : listing.fuelConsumptionHighway,
        fuelConsumptionCombined !== undefined ? fuelConsumptionCombined : listing.fuelConsumptionCombined,
        co2Emissions !== undefined ? co2Emissions : listing.co2Emissions,
        emissionClass !== undefined ? emissionClass : listing.emissionClass,
        emissionSticker !== undefined ? emissionSticker : listing.emissionSticker,
        color !== undefined ? color : listing.color,
        colorManufacturer !== undefined ? colorManufacturer : listing.colorManufacturer,
        interiorColor !== undefined ? interiorColor : listing.interiorColor,
        interiorType !== undefined ? interiorType : listing.interiorType,
        doors !== undefined ? doors : listing.doors,
        seats !== undefined ? seats : listing.seats,
        previousOwners !== undefined ? previousOwners : listing.previousOwners,
        fullServiceHistory !== undefined ? (fullServiceHistory ? 1 : 0) : listing.fullServiceHistory,
        nonSmokingVehicle !== undefined ? (nonSmokingVehicle ? 1 : 0) : listing.nonSmokingVehicle,
        features !== undefined ? features : listing.features,
        safetyFeatures !== undefined ? safetyFeatures : listing.safetyFeatures,
        comfortFeatures !== undefined ? comfortFeatures : listing.comfortFeatures,
        entertainmentFeatures !== undefined ? entertainmentFeatures : listing.entertainmentFeatures,
        extrasFeatures !== undefined ? extrasFeatures : listing.extrasFeatures,
        availability !== undefined ? availability : listing.availability,
        vehicleType !== undefined ? vehicleType : listing.vehicleType,
        bodyType !== undefined ? bodyType : listing.bodyType,
        climatisation !== undefined ? climatisation : listing.climatisation,
        parkingAssistance !== undefined ? parkingAssistance : listing.parkingAssistance,
        JSON.stringify(images),
        sold !== undefined ? (sold === '1' || sold === 1 || sold === true ? 1 : 0) : listing.sold,
        listingId
      ],
      (err) => {
        if (err) {
          console.error('Database update error:', err);
          return res.status(500).json({ error: 'Failed to update listing' });
        }

        res.json({ message: 'Listing updated successfully' });
      }
    );
  });
});

// Delete listing
router.delete('/:id', authenticate, (req, res) => {
  const listingId = req.params.id;

  db.get('SELECT * FROM listings WHERE id = ?', [listingId], (err, listing) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Check if user is owner or admin
    if (listing.userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete images from disk
    if (listing.images) {
      const images = JSON.parse(listing.images);
      images.forEach(imagePath => {
        const fullPath = path.join(__dirname, '..', imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    }

    db.run('DELETE FROM listings WHERE id = ?', [listingId], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete listing' });
      }

      res.json({ message: 'Listing deleted successfully' });
    });
  });
});

// Get user's listings
router.get('/user/:userId', (req, res) => {
  db.all(
    'SELECT * FROM listings WHERE userId = ? ORDER BY createdAt DESC',
    [req.params.userId],
    (err, listings) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const formattedListings = listings.map(listing => ({
        ...listing,
        images: listing.images ? JSON.parse(listing.images) : []
      }));

      res.json({ listings: formattedListings });
    }
  );
});

module.exports = router;
