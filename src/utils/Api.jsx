import axios from "axios";
import Cookies from "js-cookie";

// Base URL - Update this to your backend URL
// Use local URL for development, production URL for production
// Force production URL for now
const BASE_URL = "https://elitedigitalcardsbackend-production.up.railway.app/api";
// const BASE_URL = process.env.NODE_ENV === 'production' 
//   ? "https://elitedigitalcardsbackend-production.up.railway.app/api"
//   : "http://localhost:3000/api";

const Api = axios.create({
  baseURL: BASE_URL,
});

const Apiauth = axios.create({
  baseURL: BASE_URL,
});

// Add a request interceptor to include the token in headers
Api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

Apiauth.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============== Login ==============
export const login = (post) => Apiauth.post("/auth/login", post);

// ============== Register ==============
export const signup = (post) => Apiauth.post("/auth/signup", post);

// ============== All Clients ==============
export const allClients = () => Api.get("/profile/");
export const getDashboardStats = () => Api.get("/profile/dashboard-stats");
export const getUserRegistrationStats = () => Api.get("/profile/user-stats");

// ============== All Students ==============
export const allStudents = () => Api.get("/student-profile/");

// ============== Client Profile ==============
export const getClientProfile = (id) => Api.get(`/profile/${id}`);
export const deleteClientProfile = (id) => Api.delete(`/profile/${id}`);
export const updateClientProfile = (id, data) => Api.put(`/profile/${id}`, data);

// ============== Student Profile ==============
export const getStudentProfile = (id) => Api.get(`/student-profile/${id}`);
export const deleteStudentProfile = (id) => Api.delete(`/student-profile/${id}`);
export const updateStudentProfile = (id, data) => Api.put(`/student-profile/${id}`, data);

// ============== Student Skills ==============
export const getStudentSkills = (userId) => Api.get(`/student-skills/my?userId=${userId}`);
export const getAllStudentSkills = () => Api.get(`/student-skills/`);
export const createStudentSkill = (data) => Api.post(`/student-skills/admin/create`, data);
export const updateStudentSkill = (id, data) => Api.put(`/student-skills/${id}/admin`, data);
export const deleteStudentSkill = (id) => Api.delete(`/student-skills/${id}/admin`);

// ============== Student Projects ==============
export const getStudentProjects = (userId) => Api.get(`/student-projects/my?userId=${userId}`);
export const getAllStudentProjects = () => Api.get(`/student-projects/`);
export const createStudentProject = (formData) => Api.post(`/student-projects/admin/create`, formData, {
  headers: { "Content-Type": "multipart/form-data" },
});
export const updateStudentProject = (id, formData) => Api.put(`/student-projects/${id}/admin`, formData, {
  headers: { "Content-Type": "multipart/form-data" },
});
export const deleteStudentProject = (id) => Api.delete(`/student-projects/${id}/admin`);

// ============== Student Experience ==============
export const getStudentExperience = (userId) => Api.get(`/student-experiences/my?userId=${userId}`);
export const getAllStudentExperience = () => Api.get(`/student-experiences/`);
export const createStudentExperience = (data) => Api.post(`/student-experiences/admin/create`, data);
export const updateStudentExperience = (id, data) => Api.put(`/student-experiences/${id}/admin`, data);
export const deleteStudentExperience = (id) => Api.delete(`/student-experiences/${id}/admin`);

// ============== Student Education ==============
export const getStudentEducation = (userId) => Api.get(`/student-educations/my?userId=${userId}`);
export const getAllStudentEducation = () => Api.get(`/student-educations/`);
export const createStudentEducation = (data) => Api.post(`/student-educations/admin/create`, data);
export const updateStudentEducation = (id, data) => Api.put(`/student-educations/${id}/admin`, data);
export const deleteStudentEducation = (id) => Api.delete(`/student-educations/${id}/admin`);

// ============== Student Achievements ==============
export const getStudentAchievements = (userId) => Api.get(`/student-achievements/my?userId=${userId}`);
export const getAllStudentAchievements = () => Api.get(`/student-achievements/`);
export const createStudentAchievement = (formData) => Api.post(`/student-achievements/admin/create`, formData, {
  headers: { "Content-Type": "multipart/form-data" },
});
export const updateStudentAchievement = (id, formData) => Api.put(`/student-achievements/${id}/admin`, formData, {
  headers: { "Content-Type": "multipart/form-data" },
});
export const deleteStudentAchievement = (id) => Api.delete(`/student-achievements/${id}/admin`);

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

// ============== Inquiries ==============
export const submitInquiry = (data) => Api.post("/inquiries/", data);
export const getAllInquiries = () => Api.get("/inquiries/");
export const getInquiryById = (id) => Api.get(`/inquiries/${id}`);
export const deleteInquiry = (id) => Api.delete(`/inquiries/${id}`);

export default Api;