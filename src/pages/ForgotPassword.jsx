import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Car } from 'lucide-react'
import { useToast } from '@chakra-ui/react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const toast = useToast()

  const handleSubmit = (e) => {
    e.preventDefault()
    toast({
      title: 'Feature coming soon',
      description: 'Password reset functionality will be available soon',
      status: 'info',
      duration: 3000,
      isClosable: true,
      position: 'top',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2">
              <Car className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">Auto Online</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-8">
        <div className="max-w-md w-full">
          <Link to="/sign-in" className="mb-6 flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors">
            <ArrowLeft className="h-5 w-5" />
            Zurück zur Anmeldung
          </Link>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Passwort zurücksetzen</h2>
              <p className="text-gray-600 mt-2">Geben Sie Ihre E-Mail-Adresse ein</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-Mail-Adresse
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="ihre@email.de"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 font-semibold transition-colors"
              >
                Link senden
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
