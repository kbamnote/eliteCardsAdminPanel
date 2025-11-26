import axios from "axios";
import Cookies from "js-cookie";

// Base URL - Update this to your backend URL
// Use local URL for development, production URL for production
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? "https://elitedigitalcardsbackend-production.up.railway.app/api"
  : "http://localhost:3000/api";

const Api = axios.create({
  baseURL: BASE_URL,
});

const Apiauth = axios.create({
  baseURL: BASE_URL,
});

Api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

Api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Token expired or invalid
      Cookies.remove("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ============== AUTH ==============
export const login = (post) => Apiauth.post("/auth/login", post);

// ============== Register ==============
export const signup = (post) => Apiauth.post("/auth/signup", post);

// ============== All Clients ==============
export const allClients = () => Api.get("/profile/");
export const getDashboardStats = () => Api.get("/profile/dashboard-stats");

// ============== Client Profile ==============
export const getClientProfile = (id) => Api.get(`/profile/${id}`);
export const deleteClientProfile = (id) => Api.delete(`/profile/${id}`);
export const updateClientProfile = (id, data) => Api.put(`/profile/${id}`, data);

// ============== Client Services ==============
export const getClientServices = (userId) => Api.get(`/services/public/${userId}`);
export const getAllServices = () => Api.get(`/services/`);
export const createAdminService = (data) => Api.post(`/services/admin`, data);
export const deleteAdminService = (id) => Api.delete(`/services/${id}/admin`);
export const updateAdminService = (id, data) => Api.put(`/services/${id}/admin`, data);

// ============== Client Gallery ==============
export const getClientGallery = (userId) => Api.get(`/gallery/public/${userId}`);
export const getAllGalleryItems = () => Api.get(`/gallery/`);
export const createAdminGalleryItem = (data) => Api.post(`/gallery/admin/upload`, data, {
  headers: { "Content-Type": "multipart/form-data" },
});
export const deleteAdminGalleryItem = (id) => Api.delete(`/gallery/${id}/admin`);
export const updateAdminGalleryItem = (id, data) => Api.put(`/gallery/${id}/admin`, data);

// ============== Client Products ==============
export const getClientProducts = (userId) => Api.get(`/products/public/${userId}`);
export const getAllProducts = () => Api.get(`/products/`);
export const createAdminProduct = (data) => Api.post(`/products/admin/upload`, data, {
  headers: { "Content-Type": "multipart/form-data" },
});
export const deleteAdminProduct = (id) => Api.delete(`/products/${id}/admin`);
export const updateAdminProduct = (id, data) => Api.put(`/products/${id}/admin`, data);

// ============== Client Testimonials ==============
export const getClientTestimonials = (userId) => Api.get(`/testimonials/public/${userId}`);
export const getAllTestimonials = () => Api.get(`/testimonials/`);
export const createAdminTestimonial = (data) => Api.post(`/testimonials/admin`, data);
export const deleteAdminTestimonial = (id) => Api.delete(`/testimonials/${id}/admin`);
export const updateAdminTestimonial = (id, data) => Api.put(`/testimonials/${id}/admin`, data);

// ============== Mail ==============
// Updated to accept FormData instead of JSON
export const sendSingleMail = (formData) => 
  Api.post("/mail/send-single", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const sendGroupMail = (formData) => 
  Api.post("/mail/send-group", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getMailTrackingData = () => Api.get("/mail/");

export default Api;