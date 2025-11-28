import { useRef, useState } from "react"
import emailjs from "@emailjs/browser"
import { useToast } from "@chakra-ui/react"
import { Mail, Phone, MapPin, Clock } from 'lucide-react'

function Contact() {
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
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Kontakt</h1>
            <p className="text-xl text-gray-300">
              Wir sind für Sie da. Kontaktieren Sie uns gerne!
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Contact Information */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Kontaktinformationen</h2>

            <div className="space-y-6">
              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Phone className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Telefon</h3>
                  <p className="text-gray-600">+49 123 456789</p>
                  <p className="text-gray-600">+49 987 654321</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Mail className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">E-Mail</h3>
                  <p className="text-gray-600">info@imranhussain.de</p>
                  <p className="text-gray-600">verkauf@autoonline.de</p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Adresse</h3>
                  <p className="text-gray-600">Musterstraße 123</p>
                  <p className="text-gray-600">12345 Berlin</p>
                  <p className="text-gray-600">Deutschland</p>
                </div>
              </div>

              {/* Opening Hours */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Öffnungszeiten</h3>
                  <div className="text-gray-600 space-y-1">
                    <p>Montag - Freitag: 9:00 - 18:00</p>
                    <p>Samstag: 10:00 - 14:00</p>
                    <p>Sonntag: Geschlossen</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info Box */}
            <div className="mt-8 bg-primary-50 border border-primary-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-primary-900 mb-2">Besuchen Sie uns</h3>
              <p className="text-primary-700 text-sm">
                Gerne können Sie uns auch persönlich besuchen. Wir freuen uns auf Ihren Besuch!
                Eine Terminvereinbarung wird empfohlen.
              </p>
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Nachricht senden</h2>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dein Name *
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
                  Deine E-Mail *
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
                  Deine Nachricht *
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={6}
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
    </div>
  )
}

export default Contact
