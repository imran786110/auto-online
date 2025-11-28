import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LoadingContext from '../contexts/loading/LoadingContext'
import { useToast } from '@chakra-ui/react'
import { ArrowLeft } from 'lucide-react'
import { authAPI } from '../api/auth'

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const { email, password } = formData
  const { buttonLoading, dispatch } = useContext(LoadingContext)

  const nav = useNavigate()
  const toast = useToast()

  const changeHandler = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }))
  }

  const submitHandler = async e => {
    e.preventDefault()
    dispatch({ type: 'START_LOADING' })

    try {
      const result = await authAPI.login({ email, password })

      dispatch({ type: 'STOP_LOADING' })
      toast({
        title: 'Willkommen zurück!',
        description: `Hallo ${result.user.fullName}`,
        position: 'top',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      nav('/category/sale')
    } catch (error) {
      console.log(error)
      dispatch({ type: 'STOP_LOADING' })

      const errorMessage = error.response?.data?.error || 'Ein Fehler ist aufgetreten'

      toast({
        title: 'Fehler!',
        description: errorMessage,
        position: 'top',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Back Button and Content */}
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="max-w-md w-full">
          {/* Back Button */}
          <button
            onClick={() => nav('/')}
            className="mb-6 flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Zurück
          </button>

          {/* Login Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Willkommen zurück</h2>
              <p className="text-gray-600 mt-2">Melden Sie sich bei Ihrem Konto an</p>
            </div>

            <form onSubmit={submitHandler} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-Mail-Adresse
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={changeHandler}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="ihre@email.de"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    {showPassword ? 'Verstecken' : 'Zeigen'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={buttonLoading}
                className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 font-semibold disabled:opacity-50 transition-colors"
              >
                {buttonLoading ? 'Anmelden...' : 'Anmelden'}
              </button>
            </form>

            <div className="mt-6 space-y-3">
              <p className="text-center text-gray-600">
                Noch kein Konto?{' '}
                <Link to="/sign-up" className="text-primary-600 hover:text-primary-700 font-medium">
                  Registrieren
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
