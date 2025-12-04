import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

import Profile from './pages/Profile'
import NotFound404 from './pages/NotFound404';
// Authentication pages - kept accessible via direct URL for admin access
// Sign-in button hidden from navbar, but admins can access /sign-in directly
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
// import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import Listings from './pages/Listings';
import Contact from './pages/Contact';
import CreateListing from './pages/CreateListing';
import EditListing from './pages/EditListing';
import ListingDetails from './pages/ListingDetails';
import AdminDashboard from './pages/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar'
import Footer from './components/Footer';

import { LoadingProvider } from './contexts/loading/LoadingContext';
import { UserProvider } from './contexts/user/UserContext';
import ContactUs from './pages/ContactUs';
import Impressum from './pages/Impressum';
import Datenschutz from './pages/Datenschutz';
import About from './pages/About';
import SoldOutItems from './pages/SoldOut';

const ROUTES = {
  Home: {id: '1', element: Home, path: '/'},
  // Authentication routes - accessible via direct URL (e.g., /sign-in) for admin access
  // Login button hidden from navbar to keep UI clean for public users
  SignIn: {id: '2', element: SignIn, path: '/sign-in'},
  SignUp: {id: '3', element: SignUp, path: '/sign-up'},
  // ForgotPassword: {id: '4', element: ForgotPassword, path: '/forgot-password'},
  Listings: {id: '5', element: Listings, path: '/category/:categoryName'},
  CreateListing: {id: '6', element: CreateListing, path: '/create-listing'},
  EditListing: {id: '7', element: EditListing, path: '/edit-listing/:listingId'},
  ListingDetails: {id: '8', element: ListingDetails, path: '/category/:categoryName/:listingId'},
  NotFound404: {id: '9', element: NotFound404, path: '/*'},
  About: {id: '10', element: About, path: '/about'},
}

function App() {
  return (
    <LoadingProvider>
      <UserProvider>
          <Router>
            <Navbar />
            <Routes>
              {Object.entries(ROUTES).map(route => {
                const [key, value] = route;
                const TopLevelComponent = value.element;
                return (
                  <Route
                    key={key}
                    path={value.path}
                    element={<TopLevelComponent />}
                  />
                )
              })
              }
              <Route>
                <Route path='/soldout' element={<SoldOutItems />} />
              </Route>
              <Route>
                <Route path='/contactus' element={<ContactUs />} />
              </Route>
              <Route>
                <Route path='/impressum' element={<Impressum />} />
              </Route>
              <Route>
                <Route path='/datenschutz' element={<Datenschutz />} />
              </Route>
              <Route>
                <Route path='/admin/dashboard' element={<AdminDashboard />} />
              </Route>

              <Route path='/profile' element={<PrivateRoute route='/sign-in' />}>
                <Route path='/profile' element={<Profile />} />
              </Route>
              <Route path='/contact/:carOwnerId' element={<PrivateRoute route='/sign-in' />}>
                <Route path='/contact/:carOwnerId' element={<Contact />} />
              </Route>

            </Routes>

            <Footer />
          </Router>
      </UserProvider>
    </LoadingProvider>
  );
}

export default App;
