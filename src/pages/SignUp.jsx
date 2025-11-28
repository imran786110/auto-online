import { useState, useContext } from 'react'
import { useToast } from '@chakra-ui/react'
import { ArrowLeft, User, Mail, Lock } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import UserContext from '../contexts/user/UserContext'
import { authAPI } from '../api/auth'

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  })
  const { firstName, lastName, email, password } = formData

  const { dispatch } = useContext(UserContext)

  const navigate = useNavigate()
  const toast = useToast()

  const changeHandler = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value
    }))
  }

  const submitHandler = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await authAPI.register({ firstName, lastName, email, password })

      dispatch({ type: 'SET_USER', payload: result.user.fullName })

      toast({
        title: 'Erfolgreich registriert!',
        description: "Willkommen bei Auto Online",
        position: 'top',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      navigate('/category/sale')
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Ein Fehler ist aufgetreten'

      toast({
        title: 'Fehler',
        description: errorMessage,
        position: 'top',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Back Button and Content */}
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="max-w-md w-full">
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="mb-6 flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Zurück
          </button>

          {/* Registration Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Konto erstellen</h2>
              <p className="text-gray-600 mt-2">Registrieren Sie sich für ein neues Konto</p>
            </div>

            <form onSubmit={submitHandler} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline h-4 w-4 mr-1" />
                    Vorname
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={changeHandler}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Max"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nachname
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={changeHandler}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Mustermann"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline h-4 w-4 mr-1" />
                  E-Mail-Adresse
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={changeHandler}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="max@beispiel.de"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="inline h-4 w-4 mr-1" />
                  Passwort
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={changeHandler}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    {showPassword ? 'Verstecken' : 'Zeigen'}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">Mindestens 6 Zeichen</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 font-semibold disabled:opacity-50 transition-colors"
              >
                {loading ? 'Registrierung läuft...' : 'Registrieren'}
              </button>
            </form>

            <div className="mt-6 space-y-3">
              <p className="text-center text-gray-600">
                Haben Sie bereits ein Konto?{' '}
                <Link to="/sign-in" className="text-primary-600 hover:text-primary-700 font-medium">
                  Anmelden
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp
