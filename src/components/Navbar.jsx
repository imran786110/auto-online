import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Car, Menu, X, Plus, User, LogOut } from 'lucide-react'
import { useToast } from '@chakra-ui/react'
import { authAPI } from '../api/auth'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    // Check if user is logged in
    const checkUser = () => {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      } else {
        setUser(null)
      }
    }

    checkUser()

    // Listen for custom storage event to update user state
    const handleStorageChange = () => {
      checkUser()
    }

    window.addEventListener('user-updated', handleStorageChange)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('user-updated', handleStorageChange)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const handleSignOut = async () => {
    try {
      await authAPI.logout()
      setUser(null)
      toast({
        title: 'Erfolgreich abgemeldet',
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top',
      })
      navigate('/')
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Abmeldung fehlgeschlagen',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      })
    }
  }

  const closeMenu = () => setIsOpen(false)

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
            <Car className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">Auto Online</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Startseite
            </Link>
            <Link to="/category/sale" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Fahrzeuge
            </Link>
            <Link to="/contactus" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Kontakt
            </Link>

            {/* Authentication UI - Hidden for public users */}
            {user ? (
              <>
                <Link
                  to="/create-listing"
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Anzeige erstellen
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-primary-600 font-medium transition-colors"
                  >
                    <User className="h-5 w-5" />
                    {user.fullName || user.displayName || 'User'}
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-200">
                      {user.role === 'admin' && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                        >
                          <User className="h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      )}
                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                      >
                        <User className="h-4 w-4" />
                        Profil
                      </Link>
                      <button
                        onClick={() => {
                          setShowUserMenu(false)
                          handleSignOut()
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Abmelden
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : null}
            {/* Login button hidden - users can view cars and contact via email without account */}
            {/*
            <Link
              to="/sign-in"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
            >
              Anmelden
            </Link>
            */}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-200 py-3 space-y-2">
            <Link
              to="/"
              onClick={closeMenu}
              className="block px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg font-medium transition-colors"
            >
              Startseite
            </Link>
            <Link
              to="/category/sale"
              onClick={closeMenu}
              className="block px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg font-medium transition-colors"
            >
              Fahrzeuge
            </Link>
            <Link
              to="/contactus"
              onClick={closeMenu}
              className="block px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg font-medium transition-colors"
            >
              Kontakt
            </Link>

            {/* Authentication UI - Hidden for public users */}
            {user ? (
              <>
                <Link
                  to="/create-listing"
                  onClick={closeMenu}
                  className="block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
                >
                  <Plus className="inline h-4 w-4 mr-2" />
                  Anzeige erstellen
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    onClick={closeMenu}
                    className="block px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg font-medium transition-colors"
                  >
                    <User className="inline h-4 w-4 mr-2" />
                    Admin Dashboard
                  </Link>
                )}
                <Link
                  to="/profile"
                  onClick={closeMenu}
                  className="block px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg font-medium transition-colors"
                >
                  <User className="inline h-4 w-4 mr-2" />
                  Profil
                </Link>
                <button
                  onClick={() => {
                    closeMenu()
                    handleSignOut()
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg font-medium transition-colors"
                >
                  <LogOut className="inline h-4 w-4 mr-2" />
                  Abmelden
                </button>
              </>
            ) : null}
            {/* Login button hidden - users can view cars and contact via email without account */}
            {/*
            <Link
              to="/sign-in"
              onClick={closeMenu}
              className="block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
            >
              Anmelden
            </Link>
            */}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
