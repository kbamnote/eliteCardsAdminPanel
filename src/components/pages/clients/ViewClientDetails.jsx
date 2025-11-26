import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Briefcase, Image, Package, MessageCircle, Phone, Mail, MapPin, Calendar, Link, Facebook, Instagram, Twitter, Linkedin, Youtube, Smartphone, Edit, Plus } from 'lucide-react';
import EditModal from '../../common/EditModal';
import { 
  getClientProfile, 
  getClientServices, 
  getClientGallery, 
  getClientProducts, 
  getClientTestimonials,
  updateClientProfile,
  updateAdminService,
  updateAdminGalleryItem,
  updateAdminProduct,
  updateAdminTestimonial,
  allClients,
  createAdminService,
  createAdminGalleryItem,
  createAdminProduct,
  createAdminTestimonial
} from '../../../utils/Api';

const ViewClientDetails = () => {
  const { id } = useParams(); // This is the user ID passed from the route
  const navigate = useNavigate();
  const [clientData, setClientData] = useState(null);
  const [services, setServices] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [products, setProducts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Edit modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        setSuccessMessage('');
        
        // Always start by fetching all profiles to get the correct mapping
        const allProfilesResponse = await allClients();
        if (allProfilesResponse.data.success) {
          const profiles = allProfilesResponse.data.data;
          // Find the matching profile by Profile ID, User ID, or nested User ID
          const matchingProfile = profiles.find(profile => 
            profile._id === id || profile.userId === id || profile.userId?._id === id
          );
          
          if (matchingProfile) {
            setClientData(matchingProfile);
            
            // Use the user ID from the matching profile for associated data
            const userId = matchingProfile.userId?._id || matchingProfile.userId || id;
            
            // Fetch associated data in parallel
            try {
              // Fetch all associated data in parallel
              const [servicesResponse, galleryResponse, productsResponse, testimonialsResponse] = await Promise.allSettled([
                getClientServices(userId),
                getClientGallery(userId),
                getClientProducts(userId),
                getClientTestimonials(userId)
              ]);
              
              // Handle services
              if (servicesResponse.status === 'fulfilled' && servicesResponse.value.data.success) {
                setServices(servicesResponse.value.data.data);
              }
              
              // Handle gallery
              if (galleryResponse.status === 'fulfilled' && galleryResponse.value.data.success) {
                setGallery(galleryResponse.value.data.data);
              }
              
              // Handle products
              if (productsResponse.status === 'fulfilled' && productsResponse.value.data.success) {
                setProducts(productsResponse.value.data.data);
              }
              
              // Handle testimonials
              if (testimonialsResponse.status === 'fulfilled' && testimonialsResponse.value.data.success) {
                setTestimonials(testimonialsResponse.value.data.data);
              }
            } catch (err) {
              console.error('Error fetching associated data:', err);
            }
          } else {
            setError('Client profile not found');
          }
        } else {
          setError('Failed to fetch client profiles');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching client data:', err);
        setError('Error fetching client data: ' + (err.response?.data?.message || err.message));
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const openEditModal = (section, item = null) => {
    setEditingSection(section);
    setEditingItem(item);
    setEditModalOpen(true);
    setError('');
    setSuccessMessage('');
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingSection('');
    setEditingItem(null);
  };

  const handleSaveProfile = async (updatedData) => {
    try {
      // Use the user ID from the client data, not the profile ID from the route
      const userId = clientData?.userId?._id || clientData?.userId || id;
      const response = await updateClientProfile(userId, updatedData);
      if (response.data.success) {
        setClientData(response.data.data);
        setSuccessMessage('Profile updated successfully');
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      setError('Error updating profile: ' + (error.response?.data?.message || error.message));
      throw error;
    }
  };

  const handleSaveService = async (updatedData) => {
    try {
      const response = await updateAdminService(editingItem._id, updatedData);
      if (response.data.success) {
        setServices(services.map(service => 
          service._id === editingItem._id ? response.data.data : service
        ));
        setSuccessMessage('Service updated successfully');
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      setError('Error updating service: ' + (error.response?.data?.message || error.message));
      throw error;
    }
  };

  const handleSaveGalleryItem = async (updatedData) => {
    try {
      const response = await updateAdminGalleryItem(editingItem._id, updatedData);
      if (response.data.success) {
        setGallery(gallery.map(item => 
          item._id === editingItem._id ? response.data.data : item
        ));
        setSuccessMessage('Gallery item updated successfully');
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      setError('Error updating gallery item: ' + (error.response?.data?.message || error.message));
      throw error;
    }
  };

  const handleSaveProduct = async (updatedData) => {
    try {
      const response = await updateAdminProduct(editingItem._id, updatedData);
      if (response.data.success) {
        setProducts(products.map(product => 
          product._id === editingItem._id ? response.data.data : product
        ));
        setSuccessMessage('Product updated successfully');
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      setError('Error updating product: ' + (error.response?.data?.message || error.message));
      throw error;
    }
  };

  const handleSaveTestimonial = async (updatedData) => {
    try {
      const response = await updateAdminTestimonial(editingItem._id, updatedData);
      if (response.data.success) {
        setTestimonials(testimonials.map(testimonial => 
          testimonial._id === editingItem._id ? response.data.data : testimonial
        ));
        setSuccessMessage('Testimonial updated successfully');
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      setError('Error updating testimonial: ' + (error.response?.data?.message || error.message));
      throw error;
    }
  };

  const renderEditModalContent = () => {
    switch (editingSection) {
      case 'createProfile':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white">Create Profile</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="create-name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Profession</label>
                <input
                  type="text"
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="create-profession"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">About</label>
                <textarea
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                  id="create-about"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Phone 1</label>
                <input
                  type="text"
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="create-phone1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Phone 2</label>
                <input
                  type="text"
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="create-phone2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Location</label>
                <input
                  type="text"
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="create-location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Date of Birth</label>
                <input
                  type="date"
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="create-dob"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Gmail</label>
                <input
                  type="email"
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="create-gmail"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Website Link</label>
                <input
                  type="url"
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="create-websiteLink"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">App Link</label>
                <input
                  type="url"
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="create-appLink"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Template ID</label>
                <input
                  type="text"
                  defaultValue="template1"
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="create-templateId"
                />
              </div>
              {/* Social Media Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Facebook</label>
                <input
                  type="url"
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="create-facebook"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Instagram</label>
                <input
                  type="url"
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="create-instagram"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Twitter</label>
                <input
                  type="url"
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="create-twitter"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">LinkedIn</label>
                <input
                  type="url"
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="create-linkedin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">YouTube</label>
                <input
                  type="url"
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="create-youtube"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">WhatsApp</label>
                <input
                  type="text"
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="create-whatsapp"
                />
              </div>
            </div>
          </div>
        );
      
      case 'profile':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white">Edit Profile</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  defaultValue={clientData?.name || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Profession</label>
                <input
                  type="text"
                  defaultValue={clientData?.profession || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-profession"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">About</label>
                <textarea
                  defaultValue={clientData?.about || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                  id="edit-about"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Phone 1</label>
                <input
                  type="text"
                  defaultValue={clientData?.phone1 || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-phone1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Phone 2</label>
                <input
                  type="text"
                  defaultValue={clientData?.phone2 || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-phone2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Location</label>
                <input
                  type="text"
                  defaultValue={clientData?.location || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Date of Birth</label>
                <input
                  type="date"
                  defaultValue={clientData?.dob ? new Date(clientData.dob).toISOString().split('T')[0] : ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-dob"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Gmail</label>
                <input
                  type="email"
                  defaultValue={clientData?.gmail || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-gmail"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Website Link</label>
                <input
                  type="url"
                  defaultValue={clientData?.websiteLink || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-websiteLink"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">App Link</label>
                <input
                  type="url"
                  defaultValue={clientData?.appLink || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-appLink"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Template ID</label>
                <input
                  type="text"
                  defaultValue={clientData?.templateId || 'template1'}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-templateId"
                />
              </div>
            </div>
          </div>
        );
      
      case 'service':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white">
              {editingItem ? 'Edit Service' : 'Add Service'}
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  defaultValue={editingItem?.title || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-service-title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea
                  defaultValue={editingItem?.description || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                  id="edit-service-description"
                />
              </div>
            </div>
          </div>
        );
      
      case 'gallery':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white">
              {editingItem ? 'Edit Gallery Item' : 'Add Gallery Item'}
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Caption</label>
                <input
                  type="text"
                  defaultValue={editingItem?.caption || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-gallery-caption"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-gallery-image"
                />
              </div>
            </div>
          </div>
        );
      
      case 'product':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white">
              {editingItem ? 'Edit Product' : 'Add Product'}
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  defaultValue={editingItem?.name || editingItem?.productName || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-product-name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea
                  defaultValue={editingItem?.description || editingItem?.details || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                  id="edit-product-description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Price</label>
                <input
                  type="number"
                  step="0.01"
                  defaultValue={editingItem?.price || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-product-price"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-product-image"
                />
              </div>
            </div>
          </div>
        );
      
      case 'testimonial':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white">
              {editingItem ? 'Edit Testimonial' : 'Add Testimonial'}
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Client Name</label>
                <input
                  type="text"
                  defaultValue={editingItem?.clientName || editingItem?.testimonialName || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-testimonial-name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Feedback</label>
                <textarea
                  defaultValue={editingItem?.feedback || ''}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="4"
                  id="edit-testimonial-feedback"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Rating</label>
                <select
                  defaultValue={editingItem?.rating || 5}
                  className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  id="edit-testimonial-rating"
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num} Star{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const handleSaveChanges = async () => {
    const formData = new FormData(document.getElementById('edit-form'));
    const data = {};
    
    // Collect form data based on the section being edited
    switch (editingSection) {
      case 'createProfile':
        // Collect all profile data
        data.name = document.getElementById('create-name').value;
        data.profession = document.getElementById('create-profession').value;
        data.about = document.getElementById('create-about').value;
        data.phone1 = document.getElementById('create-phone1').value;
        data.phone2 = document.getElementById('create-phone2').value;
        data.location = document.getElementById('create-location').value;
        data.dob = document.getElementById('create-dob').value;
        data.gmail = document.getElementById('create-gmail').value;
        data.websiteLink = document.getElementById('create-websiteLink').value;
        data.appLink = document.getElementById('create-appLink').value;
        data.templateId = document.getElementById('create-templateId').value;
        
        // Collect social media data
        data.socialMedia = {
          facebook: document.getElementById('create-facebook').value,
          instagram: document.getElementById('create-instagram').value,
          twitter: document.getElementById('create-twitter').value,
          linkedin: document.getElementById('create-linkedin').value,
          youtube: document.getElementById('create-youtube').value,
          whatsapp: document.getElementById('create-whatsapp').value
        };
        
        await handleCreateProfile(data);
        break;
      
      case 'profile':
        data.name = document.getElementById('edit-name').value;
        data.profession = document.getElementById('edit-profession').value;
        data.about = document.getElementById('edit-about').value;
        data.phone1 = document.getElementById('edit-phone1').value;
        data.phone2 = document.getElementById('edit-phone2').value;
        data.location = document.getElementById('edit-location').value;
        data.dob = document.getElementById('edit-dob').value;
        data.gmail = document.getElementById('edit-gmail').value;
        data.websiteLink = document.getElementById('edit-websiteLink').value;
        data.appLink = document.getElementById('edit-appLink').value;
        data.templateId = document.getElementById('edit-templateId').value;
        await handleSaveProfile(data);
        break;
      
      case 'service':
        data.title = document.getElementById('edit-service-title').value;
        data.description = document.getElementById('edit-service-description').value;
        if (editingItem) {
          await handleSaveService(data);
        } else {
          await handleCreateService(data);
        }
        break;
      
      case 'gallery':
        data.caption = document.getElementById('edit-gallery-caption').value;
        const galleryImage = document.getElementById('edit-gallery-image').files[0];
        if (galleryImage) {
          data.image = galleryImage;
        }
        if (editingItem) {
          await handleSaveGalleryItem(data);
        } else {
          await handleCreateGalleryItem(data);
        }
        break;
      
      case 'product':
        data.name = document.getElementById('edit-product-name').value;
        data.description = document.getElementById('edit-product-description').value;
        data.price = document.getElementById('edit-product-price').value;
        const productImage = document.getElementById('edit-product-image').files[0];
        if (productImage) {
          data.image = productImage;
        }
        if (editingItem) {
          await handleSaveProduct(data);
        } else {
          await handleCreateProduct(data);
        }
        break;
      
      case 'testimonial':
        data.testimonialName = document.getElementById('edit-testimonial-name').value;
        data.feedback = document.getElementById('edit-testimonial-feedback').value;
        data.rating = document.getElementById('edit-testimonial-rating').value;
        if (editingItem) {
          await handleSaveTestimonial(data);
        } else {
          await handleCreateTestimonial(data);
        }
        break;
      
      default:
        throw new Error('Unknown section');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1a1a2e] rounded-xl shadow-lg p-6">
        <div className="flex items-center mb-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-green-500 hover:text-green-400 mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
          </button>
          <h2 className="text-2xl font-bold text-white">Client Details</h2>
        </div>
        <div className="bg-red-500 text-white p-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="bg-[#1a1a2e] rounded-xl shadow-lg p-6">
        <div className="flex items-center mb-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-green-500 hover:text-green-400 mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
          </button>
          <h2 className="text-2xl font-bold text-white">Client Details</h2>
        </div>
        <div className="text-gray-400">Client not found</div>
      </div>
    );
  }

  // Use the user ID from the profile data
  const userId = clientData?.userId?._id || clientData?.userId || id;

  // Check if the client has a profile (has name or other profile fields)
  const hasProfile = clientData && (clientData.name || clientData.profession || clientData.about);
  
  // Helper function to prepare data for creating a new profile
  const handleCreateProfile = async (profileData) => {
    try {
      const userId = clientData?.userId?._id || clientData?.userId || id;
      // Use updateClientProfile which now handles creating a profile if it doesn't exist
      const response = await updateClientProfile(userId, profileData);
      if (response.data.success) {
        setClientData(response.data.data);
        setSuccessMessage('Profile created successfully');
        closeEditModal();
        // Refresh the data by calling the fetchData function
        // Since fetchData is not accessible here, we'll fetch the updated profile directly
        try {
          const updatedProfileResponse = await getClientProfile(id);
          if (updatedProfileResponse.data.success) {
            setClientData(updatedProfileResponse.data.data);
          }
        } catch (err) {
          console.error('Error fetching updated profile:', err);
        }
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      setError('Error creating profile: ' + (error.response?.data?.message || error.message));
      throw error;
    }
  };

  // Helper function to create a new service
  const handleCreateService = async (serviceData) => {
    try {
      const userId = clientData?.userId?._id || clientData?.userId || id;
      const response = await createAdminService({ ...serviceData, userId });
      if (response.data.success) {
        setSuccessMessage('Service created successfully');
        closeEditModal();
        // Refresh services
        try {
          const servicesResponse = await getClientServices(userId);
          if (servicesResponse.data.success) {
            setServices(servicesResponse.data.data);
          }
        } catch (err) {
          console.error('Error fetching updated services:', err);
        }
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      setError('Error creating service: ' + (error.response?.data?.message || error.message));
      throw error;
    }
  };

  // Helper function to create a new gallery item
  const handleCreateGalleryItem = async (galleryData) => {
    try {
      const userId = clientData?.userId?._id || clientData?.userId || id;
      const formData = new FormData();
      formData.append('userId', userId);
      if (galleryData.caption) formData.append('caption', galleryData.caption);
      if (galleryData.image) formData.append('image', galleryData.image);
      
      const response = await createAdminGalleryItem(formData);
      if (response.data.success) {
        setSuccessMessage('Gallery item created successfully');
        closeEditModal();
        // Refresh gallery
        try {
          const galleryResponse = await getClientGallery(userId);
          if (galleryResponse.data.success) {
            setGallery(galleryResponse.data.data);
          }
        } catch (err) {
          console.error('Error fetching updated gallery:', err);
        }
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      setError('Error creating gallery item: ' + (error.response?.data?.message || error.message));
      throw error;
    }
  };

  // Helper function to create a new product
  const handleCreateProduct = async (productData) => {
    try {
      const userId = clientData?.userId?._id || clientData?.userId || id;
      const formData = new FormData();
      formData.append('userId', userId);
      if (productData.name) formData.append('productName', productData.name);
      if (productData.description) formData.append('details', productData.description);
      if (productData.price) formData.append('price', productData.price);
      if (productData.image) formData.append('productPhoto', productData.image);
      
      const response = await createAdminProduct(formData);
      if (response.data.success) {
        setSuccessMessage('Product created successfully');
        closeEditModal();
        // Refresh products
        try {
          const productsResponse = await getClientProducts(userId);
          if (productsResponse.data.success) {
            setProducts(productsResponse.data.data);
          }
        } catch (err) {
          console.error('Error fetching updated products:', err);
        }
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      setError('Error creating product: ' + (error.response?.data?.message || error.message));
      throw error;
    }
  };

  // Helper function to create a new testimonial
  const handleCreateTestimonial = async (testimonialData) => {
    try {
      const userId = clientData?.userId?._id || clientData?.userId || id;
      const response = await createAdminTestimonial({ ...testimonialData, userId });
      if (response.data.success) {
        setSuccessMessage('Testimonial created successfully');
        closeEditModal();
        // Refresh testimonials
        try {
          const testimonialsResponse = await getClientTestimonials(userId);
          if (testimonialsResponse.data.success) {
            setTestimonials(testimonialsResponse.data.data);
          }
        } catch (err) {
          console.error('Error fetching updated testimonials:', err);
        }
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      setError('Error creating testimonial: ' + (error.response?.data?.message || error.message));
      throw error;
    }
  };

  // Helper function to render social media links
  const renderSocialMediaLinks = () => {
    const socialMedia = clientData.socialMedia || {};
    const platforms = [
      { key: 'facebook', icon: Facebook, label: 'Facebook' },
      { key: 'instagram', icon: Instagram, label: 'Instagram' },
      { key: 'twitter', icon: Twitter, label: 'Twitter' },
      { key: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
      { key: 'youtube', icon: Youtube, label: 'YouTube' },
      { key: 'whatsapp', icon: Smartphone, label: 'WhatsApp' }
    ];

    return platforms.filter(platform => socialMedia[platform.key]).map(platform => {
      const IconComponent = platform.icon;
      return (
        <div key={platform.key} className="flex items-center mb-1">
          <IconComponent className="h-4 w-4 text-green-400 mr-2" />
          <span className="text-gray-400 w-24">{platform.label}:</span>
          <a 
            href={socialMedia[platform.key]} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-green-400 hover:underline truncate"
          >
            {socialMedia[platform.key]}
          </a>
        </div>
      );
    });
  };

  return (
    <div className="bg-[#1a1a2e] rounded-xl shadow-lg p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-green-500 hover:text-green-400 mr-4"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back
        </button>
        <h2 className="text-2xl font-bold text-white">Client Details</h2>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 bg-green-500 text-white p-3 rounded-md text-sm">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-500 text-white p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Profile Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <User className="h-5 w-5 mr-2 text-green-500" />
            Profile Information
          </h3>
          <button
            onClick={() => openEditModal(hasProfile ? 'profile' : 'createProfile')}
            className="flex items-center text-green-400 hover:text-green-300 text-sm"
          >
            <Edit className="h-4 w-4 mr-1" />
            {hasProfile ? 'Edit' : 'Add Details'}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0f0f1a] p-4 rounded-lg">
            <h4 className="text-lg font-medium text-white mb-3">Personal Details</h4>
            <div className="space-y-2">
              <div className="flex">
                <span className="text-gray-400 w-32">Name:</span>
                <span className="text-white">{clientData.name || 'Not provided'}</span>
              </div>
              <div className="flex">
                <span className="text-gray-400 w-32">Email:</span>
                <span className="text-white">{clientData.email || clientData.userId?.email || 'Not provided'}</span>
              </div>
              <div className="flex">
                <span className="text-gray-400 w-32">Profession:</span>
                <span className="text-white">{clientData.profession || 'Not provided'}</span>
              </div>
              <div className="flex">
                <span className="text-gray-400 w-32">About:</span>
                <span className="text-white">{clientData.about || 'Not provided'}</span>
              </div>
              <div className="flex">
                <span className="text-gray-400 w-32">Phone 1:</span>
                <span className="text-white">{clientData.phone1 || 'Not provided'}</span>
              </div>
              <div className="flex">
                <span className="text-gray-400 w-32">Phone 2:</span>
                <span className="text-white">{clientData.phone2 || 'Not provided'}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-[#0f0f1a] p-4 rounded-lg">
            <h4 className="text-lg font-medium text-white mb-3">Additional Information</h4>
            <div className="space-y-2">
              <div className="flex">
                <span className="text-gray-400 w-32">Location:</span>
                <span className="text-white">{clientData.location || 'Not provided'}</span>
              </div>
              <div className="flex">
                <span className="text-gray-400 w-32">Date of Birth:</span>
                <span className="text-white">
                  {clientData.dob ? new Date(clientData.dob).toLocaleDateString() : 'Not provided'}
                </span>
              </div>
              <div className="flex">
                <span className="text-gray-400 w-32">Gmail:</span>
                <span className="text-white">{clientData.gmail || 'Not provided'}</span>
              </div>
              <div className="flex">
                <span className="text-gray-400 w-32">Website:</span>
                <span className="text-white">
                  {clientData.websiteLink ? (
                    <a href={clientData.websiteLink} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">
                      {clientData.websiteLink}
                    </a>
                  ) : 'Not provided'}
                </span>
              </div>
              <div className="flex">
                <span className="text-gray-400 w-32">App Link:</span>
                <span className="text-white">
                  {clientData.appLink ? (
                    <a href={clientData.appLink} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">
                      {clientData.appLink}
                    </a>
                  ) : 'Not provided'}
                </span>
              </div>
              <div className="flex">
                <span className="text-gray-400 w-32">Template ID:</span>
                <span className="text-white">{clientData.templateId || 'template1'}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Social Media Links */}
        {(clientData.socialMedia && Object.values(clientData.socialMedia).some(link => link)) && (
          <div className="mt-6 bg-[#0f0f1a] p-4 rounded-lg">
            <h4 className="text-lg font-medium text-white mb-3">Social Media Links</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {renderSocialMediaLinks()}
            </div>
          </div>
        )}
        
        {/* Images Section */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Image */}
          {clientData.profileImg && (
            <div className="bg-[#0f0f1a] p-4 rounded-lg">
              <h4 className="text-lg font-medium text-white mb-3">Profile Image</h4>
              <img 
                src={clientData.profileImg} 
                alt="Profile" 
                className="rounded-lg w-full max-h-64 object-contain"
              />
            </div>
          )}
          
          {/* Banner Image */}
          {clientData.bannerImg && (
            <div className="bg-[#0f0f1a] p-4 rounded-lg">
              <h4 className="text-lg font-medium text-white mb-3">Banner Image</h4>
              <img 
                src={clientData.bannerImg} 
                alt="Banner" 
                className="rounded-lg w-full max-h-64 object-contain"
              />
            </div>
          )}
        </div>
      </div>

      {/* Services Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <Briefcase className="h-5 w-5 mr-2 text-green-500" />
            Services ({services.length})
          </h3>
          <button
            onClick={() => openEditModal('service', null)}
            className="flex items-center text-green-400 hover:text-green-300 text-sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Service
          </button>
        </div>
        {services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <div key={service._id} className="bg-[#0f0f1a] p-4 rounded-lg relative">
                <button
                  onClick={() => openEditModal('service', service)}
                  className="absolute top-2 right-2 text-green-400 hover:text-green-300"
                  title="Edit Service"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <h4 className="font-medium text-white">{service.title}</h4>
                <p className="text-gray-400 text-sm mt-1">{service.description}</p>
                {service.image && (
                  <img src={service.image} alt={service.title} className="mt-2 rounded w-full h-32 object-cover" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#0f0f1a] p-4 rounded-lg text-gray-400">
            No services added yet
          </div>
        )}
      </div>

      {/* Gallery Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <Image className="h-5 w-5 mr-2 text-green-500" />
            Gallery ({gallery.length})
          </h3>
          <button
            onClick={() => openEditModal('gallery', null)}
            className="flex items-center text-green-400 hover:text-green-300 text-sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Gallery Item
          </button>
        </div>
        {gallery.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.map((item) => (
              <div key={item._id} className="bg-[#0f0f1a] rounded-lg overflow-hidden relative">
                <button
                  onClick={() => openEditModal('gallery', item)}
                  className="absolute top-2 right-2 text-green-400 hover:text-green-300 bg-black bg-opacity-50 rounded-full p-1"
                  title="Edit Gallery Item"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <img src={item.imageUrl} alt={item.caption || "Gallery"} className="w-full h-32 object-cover" />
                {item.caption && <div className="p-2 text-white text-sm">{item.caption}</div>}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#0f0f1a] p-4 rounded-lg text-gray-400">
            No gallery items added yet
          </div>
        )}
      </div>

      {/* Products Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <Package className="h-5 w-5 mr-2 text-green-500" />
            Products ({products.length})
          </h3>
          <button
            onClick={() => openEditModal('product', null)}
            className="flex items-center text-green-400 hover:text-green-300 text-sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Product
          </button>
        </div>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product._id} className="bg-[#0f0f1a] p-4 rounded-lg relative">
                <button
                  onClick={() => openEditModal('product', product)}
                  className="absolute top-2 right-2 text-green-400 hover:text-green-300"
                  title="Edit Product"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <h4 className="font-medium text-white">{product.name || product.productName}</h4>
                <p className="text-gray-400 text-sm mt-1">{product.description || product.details}</p>
                {product.productPhoto && (
                  <img src={product.productPhoto} alt={product.name || product.productName} className="mt-2 rounded w-full h-32 object-cover" />
                )}
                <div className="mt-2 text-green-400 font-medium">
                  {product.price ? `$${product.price}` : 'Price not set'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#0f0f1a] p-4 rounded-lg text-gray-400">
            No products added yet
          </div>
        )}
      </div>

      {/* Testimonials Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <MessageCircle className="h-5 w-5 mr-2 text-green-500" />
            Testimonials ({testimonials.length})
          </h3>
          <button
            onClick={() => openEditModal('testimonial', null)}
            className="flex items-center text-green-400 hover:text-green-300 text-sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Testimonial
          </button>
        </div>
        {testimonials.length > 0 ? (
          <div className="space-y-4">
            {testimonials.map((testimonial) => (
              <div key={testimonial._id} className="bg-[#0f0f1a] p-4 rounded-lg relative">
                <button
                  onClick={() => openEditModal('testimonial', testimonial)}
                  className="absolute top-2 right-2 text-green-400 hover:text-green-300"
                  title="Edit Testimonial"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <div className="flex items-center mb-2">
                  <div className="bg-green-500 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">
                    {testimonial.clientName?.charAt(0) || testimonial.testimonialName?.charAt(0) || 'U'}
                  </div>
                  <div className="ml-3">
                    <div className="text-white font-medium">{testimonial.clientName || testimonial.testimonialName || 'Anonymous'}</div>
                    <div className="text-gray-400 text-sm">
                      {testimonial.date ? new Date(testimonial.date).toLocaleDateString() : 'Date not provided'}
                    </div>
                  </div>
                </div>
                <p className="text-gray-300">{testimonial.feedback}</p>
                <div className="mt-2 flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${i < (testimonial.rating || 0) ? 'text-yellow-400' : 'text-gray-600'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#0f0f1a] p-4 rounded-lg text-gray-400">
            No testimonials added yet
          </div>
        )}
      </div>
      
      {/* Edit Modal */}
      <EditModal
        isOpen={editModalOpen}
        onClose={closeEditModal}
        title={`Edit ${editingSection.charAt(0).toUpperCase() + editingSection.slice(1)}`}
        onSave={handleSaveChanges}
      >
        <form id="edit-form">
          {renderEditModalContent()}
        </form>
      </EditModal>
    </div>
  );
};

export default ViewClientDetails;