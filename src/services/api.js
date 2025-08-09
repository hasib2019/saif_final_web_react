import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add language header
    const language = localStorage.getItem('language') || 'en';
    config.headers['Accept-Language'] = language;
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/login', credentials),
  logout: () => api.post('/logout'),
  getUser: () => api.get('/user'),
  changePassword: (data) => api.post('/change-password', data),
};

// Public API
export const publicAPI = {
  getLanguages: () => api.get('/languages'),
  getCompanyInfo: () => api.get('/public/company-info'),
  getProducts: (params) => api.get('/public/products', { params }),
  getProduct: (id) => api.get(`/public/products/${id}`),
  getProductCategories: (params) => api.get('/public/product-categories', { params }),
  getPressReleases: (params) => api.get('/public/press-releases', { params }),
  getPressRelease: (id) => api.get(`/public/press-releases/${id}`),
  getPartners: (params) => api.get('/public/partners', { params }),
  submitContactForm: (data) => api.post('/public/contact', data),
};

// Admin API
export const adminAPI = {
  // Users
  getUsers: (params) => api.get('/admin/users', { params }),
  createUser: (data) => api.post('/admin/users', data),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  resetUserPassword: (id, data) => api.post(`/admin/users/${id}/reset-password`, data),
  getRoles: () => api.get('/admin/users/roles'),

  // Company Info
  getCompanyInfo: () => api.get('/admin/company-info'),
  updateCompanyInfo: (data) => api.put('/admin/company-info', data),

  // About
  getAbout: () => api.get('/admin/about'),
  updateAbout: (data) => api.put('/admin/about', data),
  getAboutTeam: () => api.get('/admin/about/team'),
  getAboutTimeline: () => api.get('/admin/about/timeline'),

  // Products
  getProducts: (params) => api.get('/admin/products', { params }),
  createProduct: (data) => {
    const config = data instanceof FormData ? {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    } : {};
    return api.post('/admin/products', data, config);
  },
  getProduct: (id) => api.get(`/admin/products/${id}`),
  updateProduct: (id, data) => {
    const config = data instanceof FormData ? {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    } : {};
    return api.put(`/admin/products/${id}`, data, config);
  },
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),

  // Product Categories
  getProductCategories: (params) => api.get('/admin/product-categories', { params }),
  createProductCategory: (data) => {
    const config = data instanceof FormData ? {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    } : {};
    return api.post('/admin/product-categories', data, config);
  },
  getProductCategory: (id) => api.get(`/admin/product-categories/${id}`),
  updateProductCategory: (id, data) => {
    const config = data instanceof FormData ? {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    } : {};
    return api.put(`/admin/product-categories/${id}`, data, config);
  },
  deleteProductCategory: (id) => api.delete(`/admin/product-categories/${id}`),

  // Press Releases
  getPressReleases: (params) => api.get('/admin/press-releases', { params }),
  createPressRelease: (data) => api.post('/admin/press-releases', data),
  getPressRelease: (id) => api.get(`/admin/press-releases/${id}`),
  updatePressRelease: (id, data) => api.put(`/admin/press-releases/${id}`, data),
  deletePressRelease: (id) => api.delete(`/admin/press-releases/${id}`),

  // Hero Slides
  getHeroSlides: (params) => api.get('/admin/hero-slides', { params }),
  createHeroSlide: (data) => api.post('/admin/hero-slides', data),
  getHeroSlide: (id) => api.get(`/admin/hero-slides/${id}`),
  updateHeroSlide: (id, data) => api.put(`/admin/hero-slides/${id}`, data),
  deleteHeroSlide: (id) => api.delete(`/admin/hero-slides/${id}`),

  // Partners
  getPartners: (params) => api.get('/admin/partners', { params }),
  createPartner: (data) => api.post('/admin/partners', data),
  getPartner: (id) => api.get(`/admin/partners/${id}`),
  updatePartner: (id, data) => api.put(`/admin/partners/${id}`, data),
  deletePartner: (id) => api.delete(`/admin/partners/${id}`),

  // Form Submissions
  getFormSubmissions: (params) => api.get('/admin/form-submissions', { params }),
  getFormSubmission: (id) => api.get(`/admin/form-submissions/${id}`),
  updateFormSubmission: (id, data) => api.put(`/admin/form-submissions/${id}`, data),
  deleteFormSubmission: (id) => api.delete(`/admin/form-submissions/${id}`),
  getFormStatistics: () => api.get('/admin/form-submissions/statistics'),
};

export default api;