import { Link } from 'react-router-dom'
import { ArrowRight, Shield, Award, HeartHandshake, Search } from 'lucide-react'
import topImage from '../images/auto-online-bg.png';
import bottomImage from '../images/for-sale3.jpg';
import RecentlyAddedCars from './RecentlyAddedCars';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] bg-gradient-to-r from-gray-900 to-gray-800">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url(${topImage})` }}
        />
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-5xl md:text-5xl font-bold mb-6">
                Ihr Traumauto wartet auf Sie
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-gray-200">
                Entdecken Sie unsere exklusive Auswahl an hochwertigen Fahrzeugen zu unschlagbaren Preisen
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  to="/category/sale"
                  className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-4 rounded-lg hover:bg-primary-700 font-semibold transition-all transform hover:scale-105"
                >
                  Fahrzeuge durchsuchen
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/contactus"
                  className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-lg hover:bg-gray-100 font-semibold transition-all transform hover:scale-105"
                >
                  Kontakt aufnehmen
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                <Shield className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Geprüfte Qualität</h3>
              <p className="text-gray-600">
                Jedes Fahrzeug wird einer gründlichen Inspektion unterzogen, um höchste Qualität zu gewährleisten
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                <Award className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Faire Preise</h3>
              <p className="text-gray-600">
                Transparente Preisgestaltung und beste Angebote für Ihr Budget
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                <HeartHandshake className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Persönliche Beratung</h3>
              <p className="text-gray-600">
                Unser erfahrenes Team steht Ihnen mit Rat und Tat zur Seite
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Added Cars */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Neueste Fahrzeuge</h2>
            <p className="text-xl text-gray-600">Entdecken Sie unsere aktuellen Angebote</p>
          </div>
          <RecentlyAddedCars />
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img
                src={bottomImage}
                alt="Auto Online Showroom"
                className="rounded-2xl shadow-2xl w-full"
              />
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <h2 className="text-4xl font-bold text-gray-900">
                Ihr Autohaus für Qualität & Service
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Hochwertige Fahrzeuge zu fairen Preisen. Jedes Auto wird geprüft und kommt mit persönlicher Beratung.
              </p>

              {/* Smart Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Geprüfte Qualität</h4>
                    <p className="text-sm text-gray-600">Alle Fahrzeuge werden gründlich inspiziert</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Award className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Faire Preise</h4>
                    <p className="text-sm text-gray-600">Transparente Preisgestaltung ohne versteckte Kosten</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <HeartHandshake className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Persönliche Beratung</h4>
                    <p className="text-sm text-gray-600">Kompetente Unterstützung bei der Fahrzeugwahl</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Search className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Große Auswahl</h4>
                    <p className="text-sm text-gray-600">Vielfältiges Angebot für jeden Geschmack</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-4">
                <Link
                  to="/category/sale"
                  className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-semibold transition-colors"
                >
                  Fahrzeuge erkunden
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 bg-white text-primary-600 border-2 border-primary-600 px-6 py-3 rounded-lg hover:bg-primary-50 font-semibold transition-colors"
                >
                  Mehr über uns
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Bereit, Ihr Traumauto zu finden?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Besuchen Sie uns noch heute und begeben Sie sich auf eine Reise, auf der Ihr perfektes Fahrzeug auf Sie wartet.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/category/sale"
              className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-lg hover:bg-gray-100 font-semibold transition-all transform hover:scale-105"
            >
              <Search className="h-5 w-5" />
              Alle Fahrzeuge ansehen
            </Link>
            <Link
              to="/contactus"
              className="inline-flex items-center gap-2 bg-primary-800 text-white px-8 py-4 rounded-lg hover:bg-primary-900 font-semibold transition-all transform hover:scale-105"
            >
              Kontakt
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
