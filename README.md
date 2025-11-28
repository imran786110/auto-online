# Auto Martines - Car Showroom Website

A modern, full-stack car showroom web application built for the German market.

## Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Chakra UI** - Component library for notifications
- **React Router DOM v6** - Client-side routing
- **Axios** - HTTP client for API calls
- **Lucide React** - Modern icon library
- **React Copy to Clipboard** - Copy functionality
- **Framer Motion** - Animation library

### Backend
- **Node.js + Express** - Server framework
- **SQLite3** - Local file-based database
- **JWT (jsonwebtoken)** - Authentication tokens
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **Express Validator** - Input validation
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Development Tools
- **Vite** - Fast HMR (Hot Module Replacement)
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes
- **Nodemon** - Auto-restart backend on changes

## Features

- 🔐 JWT-based authentication (login/logout)
- 👤 Role-based access control (Admin & Customer)
- 🚗 Complete car listings management (CRUD operations)
- 📸 Multi-image upload support (up to 10 images per listing)
- 🎨 Modern, responsive German-language interface
- 💾 Local SQLite database (no cloud dependencies)
- 🌐 RESTful API with Express
- ⚡ Fast development with Vite
- 🔒 Secure password hashing with bcryptjs
- 🎯 Brand filtering (Top 10 German car brands + Others)
- 📧 Email contact functionality with pre-filled templates
- 🏷️ Advanced car specifications (technical specs, features, emissions)
- 💼 Admin dashboard with listing management
- 📱 Fully responsive design

## Quick Start

### Prerequisites
- Node.js 16+ installed
- npm or yarn

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Environment variables:**
The `.env` file is already configured with default values for local development.

3. **Start the application:**
```bash
# Start both frontend and backend together
npm run dev:all

# OR start separately:
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run dev
```

4. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

### Default Admin Account
```
Email: admin@admin.com
Password: admin12345
```
**Important:** Change this password after first login in production!

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend only (Vite dev server) |
| `npm run server` | Start backend only (Express server) |
| `npm run dev:all` | Start both frontend and backend |
| `npm run build` | Build frontend for production |
| `npm run preview` | Preview production build locally |

## Project Structure

```
auto-martines-web/
├── server/                    # Backend
│   ├── index.js              # Express server entry point
│   ├── database/
│   │   └── db.js             # SQLite database setup
│   ├── middleware/
│   │   └── auth.js           # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js           # Authentication routes
│   │   ├── listings.js       # Car listing routes
│   │   └── users.js          # User management routes
│   ├── data/                 # SQLite database file (auto-created)
│   └── uploads/              # Uploaded car images (auto-created)
│
├── src/                      # Frontend
│   ├── api/                  # API client services
│   │   ├── client.js         # Axios configuration
│   │   ├── auth.js           # Auth API calls
│   │   ├── listings.js       # Listings API calls
│   │   └── users.js          # User API calls
│   ├── components/
│   │   ├── Navbar.jsx        # Main navigation
│   │   ├── Footer.jsx        # Site footer
│   │   └── RecentlyAddedCars.jsx
│   ├── pages/
│   │   ├── Home.jsx          # Home page
│   │   ├── SignIn.jsx        # Login page
│   │   ├── SignUp.jsx        # Registration page
│   │   ├── Listings.jsx      # Car listings with filters
│   │   ├── ListingDetails.jsx # Car detail page
│   │   ├── CreateListing.jsx # Create car listing (multi-step form)
│   │   ├── EditListing.jsx   # Edit car listing
│   │   ├── AdminDashboard.jsx # Admin management
│   │   ├── Profile.jsx       # User profile
│   │   ├── ContactUs.jsx     # Contact page
│   │   ├── Impressum.jsx     # Legal notice (German requirement)
│   │   └── Datenschutz.jsx   # Privacy policy (German requirement)
│   ├── contexts/
│   │   └── AuthContext.jsx   # Authentication context
│   ├── images/               # Static images
│   ├── App.jsx               # Main app component
│   └── main.jsx              # React entry point
│
├── .env                      # Environment variables
├── package.json              # Dependencies and scripts
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind CSS configuration
└── README.md                 # This file
```

## Database Schema

### Users Table
```sql
- id (INTEGER PRIMARY KEY)
- fullName (TEXT NOT NULL)
- email (TEXT UNIQUE NOT NULL)
- password (TEXT NOT NULL) -- bcrypt hashed
- role (TEXT DEFAULT 'customer') -- 'admin' or 'customer'
- createdAt (DATETIME DEFAULT CURRENT_TIMESTAMP)
- updatedAt (DATETIME DEFAULT CURRENT_TIMESTAMP)
```

### Listings Table
```sql
- id (INTEGER PRIMARY KEY)
- userId (INTEGER FOREIGN KEY)
- title, description, price
- make, model, year, firstRegistration
- mileage, category, condition
- powerPS, powerKW, displacement, cylinders
- fuelType, transmission, gears, driveType
- fuelConsumption*, co2Emissions, emissionClass
- color, interiorColor, doors, seats
- previousOwners, fullServiceHistory, nonSmokingVehicle
- features (JSON) -- safety, comfort, entertainment, extras
- availability, vehicleType, bodyType
- images (JSON array)
- sold (BOOLEAN DEFAULT 0)
- createdAt, updatedAt
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (requires auth)

### Listings
- `GET /api/listings` - Get all listings (with filters)
- `GET /api/listings/:id` - Get single listing
- `POST /api/listings` - Create listing (auth required)
- `PUT /api/listings/:id` - Update listing (auth required, owner/admin only)
- `DELETE /api/listings/:id` - Delete listing (auth required, owner/admin only)
- `GET /api/listings/user/:userId` - Get user's listings

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/profile` - Update profile (auth required)

## Environment Variables

Located in `.env` file:

```env
# Application
VITE_APP_NAME=Auto Martines
VITE_APP_URL=http://localhost:3000
VITE_API_URL=http://localhost:5000/api

# Server
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

**Important for Production:**
- Change `JWT_SECRET` to a secure random string
- Update URLs to your production domain
- Set `NODE_ENV=production`

## Key Features Explained

### Brand Filtering
The listings page includes filters for the top 10 most popular car brands in Germany:
- Volkswagen, Mercedes-Benz, BMW, Audi, Opel
- Ford, Renault, Skoda, Seat, Peugeot
- "Andere" option for all other brands
- Active filter styling with orange theme

### Multi-Step Car Listing Form
Creating/editing a car listing uses a 5-step form:
1. Basic Information (title, description, price)
2. Technical Specifications (engine, transmission, fuel)
3. Features & Equipment (safety, comfort, entertainment)
4. Condition & Details (mileage, owners, service history)
5. Images & Publish (upload photos, review)

### Email Contact
The "Jetzt kontaktieren" button generates a pre-filled email with:
- Subject: Car details (make, model, year, price)
- Body: German template with car information
- Auto-includes logged-in user's contact details
- Recipient: imranhussain.cse@gmail.com

### Image Upload Protection
Server-side protection prevents accidental image loss:
- Preserves existing images if `existingImages` is empty
- Only deletes images explicitly marked for deletion
- Debug logging for troubleshooting

## Security Features

- ✅ Passwords hashed with bcryptjs (10 salt rounds)
- ✅ JWT tokens for stateless authentication
- ✅ Protected API routes with authentication middleware
- ✅ Role-based authorization (admin/customer)
- ✅ Input validation with express-validator
- ✅ SQL injection protection (parameterized queries)
- ✅ CORS configuration
- ✅ File upload restrictions (size, type)

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (Windows)
taskkill /PID <process_id> /F

# Or change port in .env
PORT=5001
```

### Database Issues
Delete and recreate the database:
```bash
# Windows
del server\data\automartines.db

# Linux/Mac
rm server/data/automartines.db

# Then restart server
npm run server
```

### Images Not Loading
- Check `server/uploads/listings/` directory exists
- Verify file permissions
- Check browser console for 404 errors
- Verify API URL in `.env`

### Build Fails
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

## Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions for Linux/Nginx servers.

## Contact

**Auto Martines**
- Email: imranhussain.cse@gmail.com
- Location: Germany

## License

Proprietary - All rights reserved
