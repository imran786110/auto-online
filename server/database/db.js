const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', 'data', 'automartines.db');
const dbDir = path.dirname(dbPath);

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

// Create default admin account
const createAdminAccount = () => {
  return new Promise((resolve, reject) => {
    const adminEmail = 'admin@admin.com';
    const adminPassword = 'admin12345';

    db.get('SELECT * FROM users WHERE email = ?', [adminEmail], async (err, user) => {
      if (err) {
        console.error('Error checking for admin account:', err);
        reject(err);
        return;
      }

      if (!user) {
        try {
          const hashedPassword = await bcrypt.hash(adminPassword, 10);
          db.run(
            'INSERT INTO users (email, password, fullName, firstName, lastName, role) VALUES (?, ?, ?, ?, ?, ?)',
            [adminEmail, hashedPassword, 'Admin', 'Admin', 'User', 'admin'],
            (err) => {
              if (err) {
                console.error('Error creating admin account:', err);
                reject(err);
              } else {
                console.log('✅ Admin account created (admin@admin.com / admin12345)');
                resolve();
              }
            }
          );
        } catch (error) {
          console.error('Error hashing admin password:', error);
          reject(error);
        }
      } else {
        // Admin already exists, but update it with firstName and lastName if missing
        if (!user.firstName || !user.lastName) {
          db.run(
            'UPDATE users SET firstName = ?, lastName = ? WHERE email = ?',
            ['Admin', 'User', adminEmail],
            (err) => {
              if (err) {
                console.error('Error updating admin account:', err);
              } else {
                console.log('✅ Admin account updated with firstName and lastName');
              }
              resolve();
            }
          );
        } else {
          resolve();
        }
      }
    });
  });
};

const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          fullName TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'customer',
          phone TEXT,
          address TEXT,
          city TEXT,
          postalCode TEXT,
          country TEXT DEFAULT 'Deutschland',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating users table:', err);
          reject(err);
        } else {
          // Check if columns exist (migration)
          db.all('PRAGMA table_info(users)', async (err, columns) => {
            if (err) {
              console.error('Error checking table structure:', err);
              return;
            }

            const existingColumns = columns.map(col => col.name);
            const newColumns = [
              { name: 'role', type: 'TEXT DEFAULT "customer"' },
              { name: 'firstName', type: 'TEXT' },
              { name: 'lastName', type: 'TEXT' },
              { name: 'phone', type: 'TEXT' },
              { name: 'address', type: 'TEXT' },
              { name: 'city', type: 'TEXT' },
              { name: 'postalCode', type: 'TEXT' },
              { name: 'country', type: 'TEXT DEFAULT "Deutschland"' }
            ];

            let migrationsNeeded = false;
            newColumns.forEach(col => {
              if (!existingColumns.includes(col.name)) {
                migrationsNeeded = true;
                console.log(`⚙️  Adding column ${col.name} to users table...`);
                db.run(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`, (err) => {
                  if (err) {
                    console.error(`Error adding column ${col.name}:`, err);
                  }
                });
              }
            });

            if (migrationsNeeded) {
              setTimeout(() => {
                console.log('✅ Users table migration completed');
              }, 100);
            }
          });
        }
      });

      // Listings table with comprehensive fields
      db.run(`
        CREATE TABLE IF NOT EXISTS listings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER NOT NULL,

          -- Basic Info
          title TEXT NOT NULL,
          description TEXT,
          price REAL NOT NULL,
          make TEXT,
          model TEXT,
          year INTEGER,
          firstRegistration TEXT,
          mileage INTEGER,

          -- Technical Specs
          powerPS INTEGER,
          powerKW INTEGER,
          displacement INTEGER,
          cylinders INTEGER,
          fuelType TEXT,
          transmission TEXT,
          gears INTEGER,
          driveType TEXT,

          -- Consumption & Emissions
          fuelConsumptionCity REAL,
          fuelConsumptionHighway REAL,
          fuelConsumptionCombined REAL,
          co2Emissions INTEGER,
          emissionClass TEXT,
          emissionSticker TEXT,

          -- Physical Characteristics
          color TEXT,
          colorManufacturer TEXT,
          interiorColor TEXT,
          interiorType TEXT,
          doors INTEGER,
          seats INTEGER,

          -- Condition
          condition TEXT DEFAULT 'used',
          previousOwners INTEGER,
          fullServiceHistory BOOLEAN DEFAULT 0,
          nonSmokingVehicle BOOLEAN DEFAULT 0,

          -- Features & Equipment (stored as JSON)
          features TEXT,
          safetyFeatures TEXT,
          comfortFeatures TEXT,
          entertainmentFeatures TEXT,
          extrasFeatures TEXT,

          -- Additional Info
          category TEXT DEFAULT 'sale',
          availability TEXT,
          vehicleType TEXT,
          bodyType TEXT,
          climatisation TEXT,
          parkingAssistance TEXT,

          -- Media
          images TEXT,

          -- Status
          sold BOOLEAN DEFAULT 0,

          -- Timestamps
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,

          FOREIGN KEY (userId) REFERENCES users(id)
        )
      `, (err) => {
        if (err) {
          console.error('Error creating listings table:', err);
          reject(err);
        } else {
          // Migration: Add new columns if they don't exist
          db.all('PRAGMA table_info(listings)', (err, columns) => {
            if (err) {
              console.error('Error checking listings table structure:', err);
              return;
            }

            const existingColumns = columns.map(col => col.name);
            const newColumns = [
              { name: 'powerPS', type: 'INTEGER' },
              { name: 'powerKW', type: 'INTEGER' },
              { name: 'displacement', type: 'INTEGER' },
              { name: 'cylinders', type: 'INTEGER' },
              { name: 'gears', type: 'INTEGER' },
              { name: 'driveType', type: 'TEXT' },
              { name: 'firstRegistration', type: 'TEXT' },
              { name: 'fuelConsumptionCity', type: 'REAL' },
              { name: 'fuelConsumptionHighway', type: 'REAL' },
              { name: 'fuelConsumptionCombined', type: 'REAL' },
              { name: 'co2Emissions', type: 'INTEGER' },
              { name: 'emissionClass', type: 'TEXT' },
              { name: 'emissionSticker', type: 'TEXT' },
              { name: 'colorManufacturer', type: 'TEXT' },
              { name: 'interiorColor', type: 'TEXT' },
              { name: 'interiorType', type: 'TEXT' },
              { name: 'doors', type: 'INTEGER' },
              { name: 'seats', type: 'INTEGER' },
              { name: 'condition', type: 'TEXT DEFAULT "used"' },
              { name: 'previousOwners', type: 'INTEGER' },
              { name: 'fullServiceHistory', type: 'BOOLEAN DEFAULT 0' },
              { name: 'nonSmokingVehicle', type: 'BOOLEAN DEFAULT 0' },
              { name: 'features', type: 'TEXT' },
              { name: 'safetyFeatures', type: 'TEXT' },
              { name: 'comfortFeatures', type: 'TEXT' },
              { name: 'entertainmentFeatures', type: 'TEXT' },
              { name: 'extrasFeatures', type: 'TEXT' },
              { name: 'availability', type: 'TEXT' },
              { name: 'vehicleType', type: 'TEXT' },
              { name: 'bodyType', type: 'TEXT' },
              { name: 'climatisation', type: 'TEXT' },
              { name: 'parkingAssistance', type: 'TEXT' }
            ];

            let migrationsNeeded = false;
            newColumns.forEach(col => {
              if (!existingColumns.includes(col.name)) {
                migrationsNeeded = true;
                db.run(`ALTER TABLE listings ADD COLUMN ${col.name} ${col.type}`, (err) => {
                  if (err) {
                    console.error(`Error adding column ${col.name}:`, err);
                  }
                });
              }
            });

            if (migrationsNeeded) {
              console.log('⚙️  Migrating listings table with new comprehensive fields...');
              setTimeout(() => {
                console.log('✅ Listings table migration completed');
              }, 100);
            }
          });
        }
      });

      // Contacts table
      db.run(`
        CREATE TABLE IF NOT EXISTS contacts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          fromUserId INTEGER NOT NULL,
          toUserId INTEGER NOT NULL,
          listingId INTEGER,
          message TEXT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (fromUserId) REFERENCES users(id),
          FOREIGN KEY (toUserId) REFERENCES users(id),
          FOREIGN KEY (listingId) REFERENCES listings(id)
        )
      `, async (err) => {
        if (err) {
          console.error('Error creating contacts table:', err);
          reject(err);
        } else {
          console.log('✅ Database tables initialized');
          // Wait for admin account creation before resolving
          try {
            await createAdminAccount();
            resolve();
          } catch (error) {
            console.error('Error during admin account creation:', error);
            resolve(); // Resolve anyway to allow server to start
          }
        }
      });
    });
  });
};

module.exports = {
  db,
  initDatabase
};
