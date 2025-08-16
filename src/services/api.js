import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
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
  getContactInfo: () => api.get('/public/contact-info'),
  getProductCategories: (params) => api.get('/public/product-categories', { params }),
  getPressReleases: (params) => api.get('/public/press-releases', { params }),
  getPressRelease: (id) => api.get(`/public/press-releases/${id}`),
  getPartners: (params) => api.get('/public/partners', { params }),
  submitContactForm: (data) => api.post('/public/contact', data),
  getHeroSlides: () => api.get('/public/hero-slides'),
};

// Admin API
export const adminAPI = {
  // Media
  get: (endpoint) => api.get(endpoint),
  post: (endpoint, data, config) => api.post(endpoint, data, config),
  put: (endpoint, data, config) => api.put(endpoint, data, config),
  delete: (endpoint) => api.delete(endpoint),
  
  // Media Library
  getMedia: () => api.get('/admin/media'),
  uploadMedia: (formData) => api.post('/admin/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  deleteMedia: (id) => api.delete(`/admin/media/${id}`),
  
  // File Upload (legacy)
  uploadFile: (formData) => api.post('/admin/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
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
  getPressReleases: (params) => api.get('/admin/press-releases', { params })
    .then(response => {
      console.log('Original press releases response:', response);
      // Check if we need to transform the response
      if (response.data && response.data.success && response.data.data) {
        // If the API returns a success response with data property
        console.log('Transforming success response format');
        return {
          ...response,
          data: response.data.data
        };
      } else if (response.data && !response.data.data && Array.isArray(response.data)) {
        // If the API returns an array directly, wrap it in the expected format
        console.log('Transforming array response format');
        return {
          ...response,
          data: {
            data: response.data
          }
        };
      }
      console.log('Using original response format');
      return response;
    }),
  createPressRelease: (data) => {
    const config = data instanceof FormData ? {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    } : {};
    return api.post('/admin/press-releases', data, config);
  },
  getPressRelease: (id) => api.get(`/admin/press-releases/${id}`)
    .then(response => {
      console.log('Original single press release response:', response);
      // Handle different response formats
      if (response.data && response.data.success && response.data.data) {
        console.log('Transforming success response format for single press release');
        return {
          ...response,
          data: response.data.data
        };
      }
      return response;
    }),
  updatePressRelease: (id, data) => {
    console.log('Updating press release with ID:', id, 'Data:', data);
    
    // Check if we need to convert data to FormData
    let formData;
    const config = {};
    
    if (data instanceof FormData) {
      formData = data;
      config.headers = {
        'Content-Type': 'multipart/form-data'
      };
    } else {
      // Convert regular object to FormData if it contains file objects
      if (data.featured_image && data.featured_image instanceof File) {
        formData = new FormData();
        
        // Add all fields to FormData
        Object.keys(data).forEach(key => {
          if (data[key] !== undefined) {
            if (key === 'featured_image' && data[key] instanceof File) {
              formData.append(key, data[key]);
            } else if (typeof data[key] === 'object' && data[key] !== null && !(data[key] instanceof File)) {
              formData.append(key, JSON.stringify(data[key]));
            } else {
              formData.append(key, data[key]);
            }
          }
        });
        
        config.headers = {
          'Content-Type': 'multipart/form-data'
        };
      } else {
        // Use regular JSON if no files
        formData = data;
      }
    }
    
    // Add _method=PUT for Laravel to handle as PUT request
    return api.post(`/admin/press-releases/${id}?_method=PUT`, formData, config)
      .then(response => {
        console.log('Press release update response:', response);
        return response;
      })
      .catch(error => {
        console.error('Error updating press release:', error);
        throw error;
      });
  },
  deletePressRelease: (id) => api.delete(`/admin/press-releases/${id}`),

  // Hero Slides
  getHeroSlides: (params) => api.get('/admin/hero-slides', { params }),
  createHeroSlide: (data) => api.post('/admin/hero-slides', data),
  getHeroSlide: (id) => api.get(`/admin/hero-slides/${id}`),
  updateHeroSlide: (id, data) => api.put(`/admin/hero-slides/${id}`, data),
  toggleHeroSlideStatus: (id) => api.patch(`/admin/hero-slides/${id}/toggle-status`),
  deleteHeroSlide: (id) => api.delete(`/admin/hero-slides/${id}`),

  // Partners
  getPartners: (params) => api.get('/admin/partners', { params }),
  createPartner: (data) => api.post('/admin/partners', data),
  getPartner: (id) => api.get(`/admin/partners/${id}`),
  updatePartner: (id, data) => api.put(`/admin/partners/${id}`, data),
  deletePartner: (id) => api.delete(`/admin/partners/${id}`),

  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
  uploadSettingFile: (formData) => api.post('/admin/settings/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  clearCache: () => api.post('/admin/settings/clear-cache'),
  backupSettings: () => api.get('/admin/settings/backup'),
  restoreSettings: (formData) => api.post('/admin/settings/restore', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),

  // Form Submissions
  getFormSubmissions: (params) => {
    console.log('Calling getFormSubmissions with params:', params);
    // Use the test endpoint that doesn't require authentication
    return api.get('/test/form-submissions', { params })
      .then(response => {
        console.log('Form submissions API response:', response);
        // Transform the response to make it easier to work with in the frontend
        // The backend returns { success: true, data: { data: [...contacts] } }
        if (response.data && response.data.success && response.data.data) {
          // Return the data in a format that's easier to work with
          return {
            ...response,
            data: response.data
          };
        }
        return response;
      })
      .catch(error => {
        console.error('Error in getFormSubmissions:', error);
        throw error;
      });
  },
  getFormSubmission: (id) => api.get(`/admin/form-submissions/${id}`),
  updateFormSubmission: (id, data) => api.put(`/admin/form-submissions/${id}`, data),
  deleteFormSubmission: (id) => api.delete(`/admin/form-submissions/${id}`),
  getFormStatistics: () => api.get('/admin/form-submissions/statistics'),
  
  // Contact Info
  getContactInfo: () => api.get('/admin/contact-info'),
  createContactInfo: (data) => api.post('/admin/contact-info', data),
  getContactInfoById: (id) => api.get(`/admin/contact-info/${id}`),
  updateContactInfo: (id, data) => api.put(`/admin/contact-info/${id}`, data),
  deleteContactInfo: (id) => api.delete(`/admin/contact-info/${id}`),
};

export default api;