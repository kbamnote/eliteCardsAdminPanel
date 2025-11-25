import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Eye, Trash2, Mail } from 'lucide-react';
import DeleteModal from '../../common/DeleteModal';
import MailModal from '../../common/MailModal';
import { 
  allClients, 
  deleteClientProfile,
  getClientServices,
  deleteAdminService,
  getClientGallery,
  deleteAdminGalleryItem,
  getClientProducts,
  deleteAdminProduct,
  getClientTestimonials,
  deleteAdminTestimonial
} from '../../../utils/Api';

const AllClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [mailModalOpen, setMailModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [clientToMail, setClientToMail] = useState(null);
  const navigate = useNavigate();

  // Fetch clients from the API
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await allClients();
        if (response.data.success) {
          setClients(response.data.data);
        } else {
          setError('Failed to fetch clients');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching clients:', error);
        setError('Error fetching clients: ' + (error.response?.data?.message || error.message));
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const filteredClients = clients.filter(client =>
    client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.profession?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (clientId) => {
    navigate(`/client/${clientId}`);
  };

  const openDeleteModal = (clientId, clientName) => {
    setClientToDelete({ id: clientId, name: clientName });
    setDeleteModalOpen(true);
    // Clear any previous messages when opening the modal
    setError('');
    setSuccessMessage('');
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setClientToDelete(null);
  };

  const openMailModal = (clientId = null) => {
    setClientToMail(clientId);
    setMailModalOpen(true);
    // Clear any previous messages when opening the modal
    setError('');
    setSuccessMessage('');
  };

  const closeMailModal = () => {
    setMailModalOpen(false);
    setClientToMail(null);
  };

  const handleDeleteClient = async () => {
    if (!clientToDelete) return;
    
    const { id: clientId, name: clientName } = clientToDelete;
    
    try {
      // Get all associated data for this specific client
      const [servicesRes, galleryRes, productsRes, testimonialsRes] = await Promise.all([
        getClientServices(clientId),
        getClientGallery(clientId),
        getClientProducts(clientId),
        getClientTestimonials(clientId)
      ]).catch(() => [{data: {data: []}}, {data: {data: []}}, {data: {data: []}}, {data: {data: []}}]); // Ignore errors

      // Delete all associated services
      if (servicesRes?.data?.data) {
        const serviceDeletePromises = servicesRes.data.data.map(service => deleteAdminService(service._id));
        await Promise.all(serviceDeletePromises).catch(() => {}); // Ignore errors
      }

      // Delete all associated gallery items
      if (galleryRes?.data?.data) {
        const galleryDeletePromises = galleryRes.data.data.map(item => deleteAdminGalleryItem(item._id));
        await Promise.all(galleryDeletePromises).catch(() => {}); // Ignore errors
      }

      // Delete all associated products
      if (productsRes?.data?.data) {
        const productDeletePromises = productsRes.data.data.map(product => deleteAdminProduct(product._id));
        await Promise.all(productDeletePromises).catch(() => {}); // Ignore errors
      }

      // Delete all associated testimonials
      if (testimonialsRes?.data?.data) {
        const testimonialDeletePromises = testimonialsRes.data.data.map(testimonial => deleteAdminTestimonial(testimonial._id));
        await Promise.all(testimonialDeletePromises).catch(() => {}); // Ignore errors
      }

      // Finally, delete the client account (user and profile)
      const response = await deleteClientProfile(clientId);
      
      if (response.data.success) {
        // Remove the client from the state
        setClients(clients.filter(client => (client._id || client.userId || client.id) !== clientId));
        // Show success message
        setSuccessMessage(`${clientName}'s account and all associated data deleted successfully`);
        // Clear any previous error
        setError('');
      } else {
        setError('Failed to delete client: ' + response.data.message);
        setSuccessMessage('');
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      setError('Error deleting client: ' + (error.response?.data?.message || error.message));
      setSuccessMessage('');
    } finally {
      closeDeleteModal();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a2e] mt-20 rounded-xl shadow-lg p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <Users className="h-6 w-6 text-green-500 mr-2" />
          <h2 className="text-2xl font-bold text-white">All Clients</h2>
        </div>
        
        <div className="flex gap-2">
          {/* Mail All Button */}
          <button
            onClick={() => openMailModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Mail className="h-4 w-4" />
            <span>Mail All</span>
          </button>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search clients..."
              className="pl-10 pr-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 bg-green-500 text-white p-3 rounded-md text-sm">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && !deleteModalOpen && (
        <div className="mb-4 bg-red-500 text-white p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Profession</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => {
                const clientId = client._id || client.userId || client.id;
                return (
                  <tr key={clientId} className="hover:bg-[#0f0f1a]">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {client.name ? client.name.charAt(0).toUpperCase() : 'U'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{client.name || 'Unnamed Client'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{client.profession || 'Not specified'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{client.email || client.userId?.email || 'No email'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        client.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {client.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {/* Mail Button */}
                        <button 
                          onClick={() => openMailModal(clientId)}
                          className="text-blue-400 hover:text-blue-300"
                          title="Send Mail"
                        >
                          <Mail className="h-5 w-5" />
                        </button>
                        
                        <button 
                          onClick={() => handleViewDetails(clientId)}
                          className="text-green-400 hover:text-green-300"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(clientId, client.name || 'this client')}
                          className="text-red-400 hover:text-red-300"
                          title="Delete Client"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-400">
                  No clients found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteClient}
        itemName={clientToDelete?.name || 'this client'}
      />
      
      <MailModal
        showModal={mailModalOpen}
        setShowModal={closeMailModal}
        clientId={clientToMail}
      />
    </div>
  );
};

export default AllClients;