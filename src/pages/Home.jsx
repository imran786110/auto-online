import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Shield, Award, HeartHandshake, Search, Mail, Phone, MapPin } from 'lucide-react'
import { useToast } from '@chakra-ui/react'
import emailjs from '@emailjs/browser'
import topImage from '../images/auto-online-bg.png';
import bottomImage from '../images/for-sale3.jpg';
import RecentlyAddedCars from './RecentlyAddedCars';

const Home = () => {
  const formRef = useRef()
  const toast = useToast()

  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { target } = e
    const { name, value } = target
    setForm({
      ...form,
      [name]: value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    emailjs
      .send(
        "service_mqprzzu",
        "template_r1cmvqr",
        {
          from_name: form.name,
          to_name: "autosale",
          from_email: form.email,
          to_email: "info@imranhussain.de",
          message: form.message,
        },
        "Rk6Wrl7f2h9RS2vD4"
      )
      .then(
        () => {
          setLoading(false)
          setForm({
            name: "",
            email: "",
            message: "",
          })
          toast({
            title: 'Erfolgreich gesendet!',
            description: 'Ihre Nachricht wurde erfolgreich gesendet.',
            status: 'success',
            duration: 3000,
            isClosable: true,
            position: 'top',
          })
        },
        (error) => {
          setLoading(false)
          console.error(error)
          toast({
            title: 'Fehler',
            description: 'Etwas ist schief gelaufen. Bitte versuchen Sie es erneut.',
            status: 'error',
            duration: 3000,
            isClosable: true,
            position: 'top',
          })
        }
      )
  }

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

      {/* About Us Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Über uns</h2>
            <div className="h-1 w-24 bg-primary-500 mx-auto mb-6"></div>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-white/10">
              <p className="text-lg text-gray-200 leading-relaxed mb-6">
                Bei <span className="text-primary-400 font-semibold">auto-online.sheraliat.com</span> sind wir mehr als nur ein Autohändler – wir sind Ihre vertrauenswürdige Quelle für hochwertige Fahrzeuge und kundenorientierten Service. Unser Engagement für Exzellenz spiegelt sich in unserem sorgfältig kuratierten Angebot wider, das sowohl neue Modelle als auch geprüfte Gebrauchtwagen umfasst.
              </p>

              <p className="text-lg text-gray-200 leading-relaxed mb-8">
                Mit einem Team von Automobil-Experten setzen wir auf Qualität und Transparenz, um sicherzustellen, dass Ihre Fahrzeugwahl Ihren individuellen Bedürfnissen entspricht. Bei auto-online.sheraliat.com geht es nicht nur um den Verkauf von Autos, sondern um die Schaffung einer nahtlosen, vertrauensvollen Erfahrung für unsere Kunden.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-primary-400 text-4xl font-bold mb-2">1+</div>
                  <div className="text-gray-300 font-medium">Jahre Erfahrung</div>
                </div>
                <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-primary-400 text-4xl font-bold mb-2">5+</div>
                  <div className="text-gray-300 font-medium">Zufriedene Kunden</div>
                </div>
                <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-primary-400 text-4xl font-bold mb-2">100%</div>
                  <div className="text-gray-300 font-medium">Geprüfte Qualität</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Kontaktieren Sie uns</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Haben Sie Fragen? Wir sind für Sie da und helfen Ihnen gerne weiter.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Contact Information */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Kontaktinformationen</h3>

              <div className="space-y-6">
                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Phone className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">Telefon</h4>
                    <p className="text-gray-600">+49 176 37130790</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Mail className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">E-Mail</h4>
                    <p className="text-gray-600">info@imranhussain.de</p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">Adresse</h4>
                    <p className="text-gray-600">Goldäckerstr. 66</p>
                    <p className="text-gray-600">71144 Steinenbronn</p>
                    <p className="text-gray-600">Deutschland</p>
                  </div>
                </div>
              </div>

              {/* Browse Vehicles CTA */}
              <div className="mt-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6">
                <h4 className="text-xl font-bold text-white mb-2">Entdecken Sie unsere Fahrzeuge</h4>
                <p className="text-primary-100 mb-4">
                  Durchsuchen Sie unser Angebot an hochwertigen Fahrzeugen
                </p>
                <Link
                  to="/category/sale"
                  className="inline-flex items-center gap-2 bg-white text-primary-600 px-6 py-3 rounded-lg hover:bg-gray-100 font-semibold transition-all"
                >
                  <Search className="h-5 w-5" />
                  Fahrzeuge ansehen
                </Link>
              </div>
            </div>

            {/* Right Side - Contact Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Nachricht senden</h3>

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ihr Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Max Mustermann"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ihre E-Mail *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="max@beispiel.de"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ihre Nachricht *
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    placeholder="Schreiben Sie hier Ihre Nachricht..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Wird gesendet...' : 'Nachricht senden'}
                </button>
              </form>

              <p className="mt-4 text-sm text-gray-500 text-center">
                * Pflichtfelder
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
