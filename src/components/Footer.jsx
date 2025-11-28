import { Link } from 'react-router-dom'
import { Car, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react'

export default function Footer() {
  const phoneNumber = '+49 176 37130790'
  const email = 'info@imranhussain.de'
  const address = 'Goldäckerstr. 66, 71144 Steinenbronn'

  return (
    <footer className="bg-gray-900 text-gray-300 mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <Car className="h-8 w-8 text-primary-500" />
              <span className="text-2xl font-bold text-white">Auto Online</span>
            </Link>
            <p className="text-sm text-gray-400">
              Bei Auto-Online.de geht es nicht nur um den Verkauf von Autos, sondern um die Schaffung einer nahtlosen, vertrauensvollen Erfahrung für unsere Kunden.
            </p>
            <div className="flex gap-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary-500 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary-500 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary-500 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase">Kontakt</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary-500 flex-shrink-0" />
                <a href={`tel:${phoneNumber}`} className="hover:text-primary-500 transition-colors">
                  {phoneNumber}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary-500 flex-shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-primary-500 transition-colors break-all">
                  {email}
                </a>
              </li>
            </ul>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase">Adresse</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary-500 mt-1 flex-shrink-0" />
                <span>
                  Auto Online<br />
                  {address}
                </span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase">Schnelllinks</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-primary-500 transition-colors">
                  Startseite
                </Link>
              </li>
              <li>
                <Link to="/category/sale" className="hover:text-primary-500 transition-colors">
                  Fahrzeuge
                </Link>
              </li>
              <li>
                <Link to="/contactus" className="hover:text-primary-500 transition-colors">
                  Kontakt
                </Link>
              </li>
              <li>
                <Link to="/impressum" className="hover:text-primary-500 transition-colors">
                  Impressum
                </Link>
              </li>
              <li>
                <Link to="/datenschutz" className="hover:text-primary-500 transition-colors">
                  Datenschutz
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>Copyright © {new Date().getFullYear()} <Link to="/" className="hover:text-primary-500 transition-colors">Auto Online</Link> | Alle Rechte Vorbehalten</p>
        </div>
      </div>
    </footer>
  )
}
