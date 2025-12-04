import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import { Edit, Trash2, CheckCircle, MoreVertical, X, Eye, AlertTriangle } from 'lucide-react';
import { listingsAPI } from '../api/listings';
import { getBaseURL } from '../api/client';

export default function AdminDashboard() {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'available', 'sold'
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, listing: null });
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    // Check if user is admin
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/sign-in');
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== 'admin') {
      navigate('/');
      return;
    }

    fetchListings();
  }, [navigate]);

  useEffect(() => {
    // Filter listings based on selected filter
    if (filter === 'all') {
      setFilteredListings(listings);
    } else if (filter === 'available') {
      setFilteredListings(listings.filter(l => !l.sold));
    } else if (filter === 'sold') {
      setFilteredListings(listings.filter(l => l.sold));
    }
  }, [filter, listings]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const data = await listingsAPI.getAll({ category: 'sale', includeSold: 'true' });
      setListings(data);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast({
        title: 'Fehler',
        description: 'Fahrzeuge konnten nicht geladen werden',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.listing) return;

    try {
      await listingsAPI.delete(deleteDialog.listing.id);
      toast({
        title: 'Erfolgreich!',
        description: 'Fahrzeug wurde gelöscht',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchListings();
      setDeleteDialog({ isOpen: false, listing: null });
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Fehler beim Löschen',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setDeleteDialog({ isOpen: false, listing: null });
    }
    setOpenMenuId(null);
  };

  const openDeleteDialog = (listing) => {
    setDeleteDialog({ isOpen: true, listing });
    setOpenMenuId(null);
  };

  const handleToggleSold = async (id, currentStatus, title) => {
    try {
      const formData = new FormData();
      formData.append('sold', !currentStatus ? '1' : '0');

      await listingsAPI.update(id, formData);
      toast({
        title: 'Erfolgreich!',
        description: !currentStatus ? `"${title}" als verkauft markiert` : `"${title}" als verfügbar markiert`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchListings();
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Fehler beim Aktualisieren',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
    setOpenMenuId(null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatMileage = (mileage) => {
    return new Intl.NumberFormat('de-DE').format(mileage);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
          <p className="text-gray-600 mt-4 text-lg">Lädt Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Verwalten Sie alle Fahrzeugeinträge</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            Alle ({listings.length})
          </button>
          <button
            onClick={() => setFilter('available')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'available'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            Verfügbar ({listings.filter(l => !l.sold).length})
          </button>
          <button
            onClick={() => setFilter('sold')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'sold'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            Verkauft ({listings.filter(l => l.sold).length})
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg mb-8 overflow-visible">
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fahrzeug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marke / Modell
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jahr
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    KM
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Erstellt
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredListings.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                      Keine Fahrzeuge gefunden
                    </td>
                  </tr>
                ) : (
                  filteredListings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {listing.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{listing.make} {listing.model}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{listing.year}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatMileage(listing.mileage)} km</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{formatPrice(listing.price)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            listing.sold
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {listing.sold ? 'Verkauft' : 'Verfügbar'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(listing.createdAt).toLocaleDateString('de-DE')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === listing.id ? null : listing.id);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="h-5 w-5 text-gray-600" />
                          </button>

                          {/* Dropdown Menu */}
                          {openMenuId === listing.id && (
                            <>
                              {/* Backdrop */}
                              <div
                                className="fixed inset-0 z-30"
                                onClick={() => setOpenMenuId(null)}
                              />

                              {/* Menu - positioned to open downward */}
                              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-40 max-h-96 overflow-y-auto">
                                <button
                                  onClick={() => navigate(`/category/sale/${listing.id}`)}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                                >
                                  <Eye className="h-4 w-4" />
                                  Ansehen
                                </button>
                                <button
                                  onClick={() => {
                                    navigate(`/edit-listing/${listing.id}`);
                                    setOpenMenuId(null);
                                  }}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Edit className="h-4 w-4" />
                                  Bearbeiten
                                </button>
                                <button
                                  onClick={() => handleToggleSold(listing.id, listing.sold, listing.title)}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  {listing.sold ? 'Als verfügbar markieren' : 'Als verkauft markieren'}
                                </button>
                                <button
                                  onClick={() => openDeleteDialog(listing)}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Löschen
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Extra space at bottom to allow dropdown menus to show */}
        <div className="h-64"></div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialog.isOpen && deleteDialog.listing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setDeleteDialog({ isOpen: false, listing: null })}
          />

          {/* Dialog */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            {/* Icon */}
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              Fahrzeug löschen?
            </h3>

            {/* Description */}
            <p className="text-gray-600 text-center mb-6">
              Möchten Sie dieses Fahrzeug wirklich unwiderruflich löschen?
            </p>

            {/* Car Details Card */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                {(() => {
                  try {
                    const images = deleteDialog.listing.images ? JSON.parse(deleteDialog.listing.images) : [];
                    return images[0] ? (
                      <img
                        src={`${getBaseURL()}${images[0]}`}
                        alt={deleteDialog.listing.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    ) : null;
                  } catch (e) {
                    return null;
                  }
                })()}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 truncate">
                    {deleteDialog.listing.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {deleteDialog.listing.make} {deleteDialog.listing.model}
                  </p>
                  <p className="text-sm text-gray-500">
                    {deleteDialog.listing.year} • {new Intl.NumberFormat('de-DE').format(deleteDialog.listing.mileage)} km
                  </p>
                  <p className="text-sm font-semibold text-primary-600 mt-1">
                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(deleteDialog.listing.price)}
                  </p>
                </div>
              </div>
            </div>

            {/* Warning */}
            <p className="text-sm text-red-600 text-center mb-6 font-medium">
              Diese Aktion kann nicht rückgängig gemacht werden!
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteDialog({ isOpen: false, listing: null })}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors"
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
