import { useNavigate } from 'react-router-dom'
import { Car, Home, ArrowLeft, Search } from 'lucide-react'

const NotFound404 = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-3xl w-full text-center">
        {/* Animated Car Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary-200 rounded-full blur-3xl opacity-50 animate-pulse"></div>
            <Car className="h-32 w-32 text-primary-600 relative animate-bounce" strokeWidth={1.5} />
          </div>
        </div>

        {/* 404 Text */}
        <div className="mb-6">
          <h1 className="text-9xl font-bold text-primary-600 mb-2 tracking-tight">
            404
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-transparent via-primary-500 to-transparent mx-auto mb-6"></div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Seite nicht gefunden
          </h2>
          <p className="text-lg text-gray-600 max-w-xl mx-auto mb-8">
            Die von Ihnen gesuchte Seite scheint eine falsche Abzweigung genommen zu haben.
            Keine Sorge, wir bringen Sie zurück auf die richtige Strecke!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition-all hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Home className="h-5 w-5" />
            Zur Startseite
          </button>

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-8 py-4 bg-white text-primary-600 border-2 border-primary-600 rounded-lg hover:bg-primary-50 font-semibold transition-all hover:scale-105 shadow-md"
          >
            <ArrowLeft className="h-5 w-5" />
            Zurück
          </button>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Search className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Beliebte Seiten
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/category/sale')}
              className="p-4 rounded-lg border-2 border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-all text-gray-700 hover:text-primary-600 font-medium"
            >
              <Car className="h-6 w-6 mx-auto mb-2" />
              Fahrzeuge
            </button>

            <button
              onClick={() => navigate('/contactus')}
              className="p-4 rounded-lg border-2 border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-all text-gray-700 hover:text-primary-600 font-medium"
            >
              <span className="text-2xl mb-2 block">📧</span>
              Kontakt
            </button>

            <button
              onClick={() => navigate('/about')}
              className="p-4 rounded-lg border-2 border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-all text-gray-700 hover:text-primary-600 font-medium"
            >
              <span className="text-2xl mb-2 block">ℹ️</span>
              Über uns
            </button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="mt-12 opacity-30">
          <div className="flex justify-center gap-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound404