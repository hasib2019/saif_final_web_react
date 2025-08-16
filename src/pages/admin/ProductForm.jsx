import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductForm = ({ readOnly = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language, languages, getLocalized, t } = useLanguage();
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    name: { en: '', ar: '' },
    description: { en: '', ar: '' },
    specifications: { en: '', ar: '' },
    category_id: '',
    is_active: true,
    sort_order: 0,
    images: [],
    videos: [],
    catalog_file: null
  });

  const handleVideoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      // Store both the file objects and create preview URLs
      const videoFiles = files.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      
      setFormData(prev => ({
        ...prev,
        videos: Array.isArray(prev.videos) ? [...prev.videos, ...videoFiles] : [...videoFiles]
      }));
      
      toast.success('Videos added for upload');
    } catch (error) {
      console.error('Error processing videos:', error);
      toast.error('Failed to process videos');
    }
  };

  const removeVideo = (index) => {
    setFormData(prev => {
      // Ensure videos is an array
      const currentVideos = Array.isArray(prev.videos) ? prev.videos : [];
      const newVideos = [...currentVideos];
      // If the video has a preview URL, revoke it to prevent memory leaks
      if (newVideos[index]?.preview && typeof newVideos[index].preview === 'string') {
        URL.revokeObjectURL(newVideos[index].preview);
      }
      newVideos.splice(index, 1);
      return {
        ...prev,
        videos: newVideos
      };
    });
  };

  const handleCatalogUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData(prev => ({
      ...prev,
      catalog_file: file,
      remove_catalog: false
    }));
    
    toast.success('Catalog file added for upload');
  };

  const removeCatalog = () => {
    setFormData(prev => ({
      ...prev,
      catalog_file: null,
      remove_catalog: true
    }));
  };

  useEffect(() => {
    fetchCategories();
    if (isEditMode) {
      fetchProduct();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await adminAPI.getProduct(id);
      if (response.data && response.data.data) {
        // Ensure images and videos are always arrays
        const productData = response.data.data;
        if (!productData.images) {
          productData.images = [];
        }
        if (!productData.videos) {
          productData.videos = [];
        }
        // Ensure all required fields are properly initialized
        const normalizedData = {
          name: { en: productData.name?.en || '', ar: productData.name?.ar || '' },
          description: { en: productData.description?.en || '', ar: productData.description?.ar || '' },
          specifications: { en: productData.specifications?.en || '', ar: productData.specifications?.ar || '' },
          category_id: productData.category_id || '',
          is_active: productData.is_active ?? true,
          sort_order: productData.sort_order || 0,
          images: productData.images || [],
          videos: productData.videos || [],
          catalog_file: productData.catalog_file || null
        };
        setFormData(normalizedData);
        // Log normalized data for debugging
        console.log('Normalized product data:', normalizedData);
      } else {
        toast.error('Failed to load product data');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await adminAPI.getProductCategories();
      if (response.data && response.data.data) {
        setCategories(response.data.data);
      } else {
        toast.error('Failed to load categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories: ' + (error.message || 'Unknown error'));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleLocalizedInputChange = (field, lang, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value
      }
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      // Store both the file objects and create preview URLs
      const imageFiles = files.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      
      setFormData(prev => ({
        ...prev,
        images: Array.isArray(prev.images) ? [...prev.images, ...imageFiles] : [...imageFiles]
      }));
      
      toast.success('Images added for upload');
    } catch (error) {
      console.error('Error processing images:', error);
      toast.error('Failed to process images');
    }
  };

  const removeImage = (index) => {
    setFormData(prev => {
      // Ensure images is an array
      const currentImages = Array.isArray(prev.images) ? prev.images : [];
      const newImages = [...currentImages];
      // If the image has a preview URL, revoke it to prevent memory leaks
      if (newImages[index]?.preview && typeof newImages[index].preview === 'string') {
        URL.revokeObjectURL(newImages[index].preview);
      }
      newImages.splice(index, 1);
      return {
        ...prev,
        images: newImages
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (readOnly) return;
    
    // Debug form data before validation
    console.log('Form data before validation:', formData);
    console.log('Category ID type:', typeof formData.category_id, 'Value:', formData.category_id);
    
    // Validate required fields
    if (!formData.name?.en?.trim()) {
      toast.error('English name is required');
      setSaving(false);
      return;
    }
    
    if (!formData.name?.ar?.trim()) {
      toast.error('Arabic name is required');
      setSaving(false);
      return;
    }
    
    if (!formData.category_id) {
      toast.error('Category is required');
      setSaving(false);
      return;
    }
    
    setSaving(true);
    console.log('Form data before submission:', formData);
    try {
      // Create a FormData object for file uploads
      const apiFormData = new FormData();
      
      // Add localized fields
      if (formData.name) {
        // Add name as a JSON string to satisfy the validator
        apiFormData.append('name', JSON.stringify(formData.name));
        
        // Also add individual localized fields
        if (formData.name.en) apiFormData.append('name[en]', formData.name.en);
        if (formData.name.ar) apiFormData.append('name[ar]', formData.name.ar);
        
        console.log('Sending name:', JSON.stringify(formData.name));
        console.log('Sending name.en:', formData.name.en);
        console.log('Sending name.ar:', formData.name.ar);
      }
      
      // Add description fields in the correct format
      apiFormData.append('description[en]', formData.description?.en || '');
      apiFormData.append('description[ar]', formData.description?.ar || '');
      
      // Add specifications fields in the correct format
      apiFormData.append('specifications[en]', formData.specifications?.en || '');
      apiFormData.append('specifications[ar]', formData.specifications?.ar || '');
      
      // Add other fields
      if (formData.category_id) {
        apiFormData.append('category_id', formData.category_id);
        console.log('Sending category_id:', formData.category_id);
      } else {
        console.error('Category ID is missing or invalid');
      }
      apiFormData.append('is_active', formData.is_active ? '1' : '0');
      
      if (formData.sort_order !== undefined) {
        apiFormData.append('sort_order', formData.sort_order);
      }
      
      // Handle images
      if (formData.images && formData.images.length > 0) {
        const newImages = [];
        const existingImages = [];
        
        formData.images.forEach((image) => {
          // Check if image is an object with file property (new upload)
          if (image.file instanceof File) {
            newImages.push(image.file);
          } else if (typeof image === 'string') {
            // This is an existing image URL from the server
            existingImages.push(image);
          } else if (image.url && typeof image.url === 'string') {
            // Handle case where image might be an object with url property
            existingImages.push(image.url);
          }
        });
        
        // Add new images to form data
        newImages.forEach(file => {
          apiFormData.append('images[]', file);
        });
        
        // Add existing images to form data
        existingImages.forEach(url => {
          apiFormData.append('existing_images[]', url);
        });
      } else {
        // If no images, send empty array to clear existing images
        apiFormData.append('existing_images[]', '');
      }
      
      // Handle videos
      if (formData.videos && formData.videos.length > 0) {
        const newVideos = [];
        const existingVideos = [];
        
        formData.videos.forEach((video) => {
          // Check if video is an object with file property (new upload)
          if (video.file instanceof File) {
            newVideos.push(video.file);
          } else if (typeof video === 'string') {
            // This is an existing video URL from the server
            existingVideos.push(video);
          } else if (video.url && typeof video.url === 'string') {
            // Handle case where video might be an object with url property
            existingVideos.push(video.url);
          }
        });
        
        console.log('New videos:', newVideos);
        console.log('Existing videos:', existingVideos);
        
        // Add new videos to form data
        newVideos.forEach(file => {
          apiFormData.append('videos[]', file);
        });
        
        // Add existing videos to form data - ensure we're sending the correct format
        if (existingVideos.length > 0) {
          existingVideos.forEach(url => {
            apiFormData.append('existing_videos[]', url);
          });
        } else {
          // If no videos, send empty array to clear existing videos
          apiFormData.append('existing_videos[]', '');
        }
      }
      
      // Log form data for debugging
      console.log('Form data being sent:', {
        name: formData.name,
        category_id: formData.category_id,
        videos: formData.videos,
        catalog_file: formData.catalog_file
      });
      
      // Handle catalog file
      if (formData.catalog_file instanceof File) {
        // New catalog file upload
        apiFormData.append('catalog_file', formData.catalog_file);
        console.log('Appending new catalog file');
      } else if (formData.catalog_file && typeof formData.catalog_file === 'string') {
        // Keep existing catalog file - no need to send anything to backend
        console.log('Keeping existing catalog file:', formData.catalog_file);
      } else if (formData.remove_catalog || formData.catalog_file === null) {
        // Explicitly remove catalog file
        apiFormData.append('remove_catalog', '1');
        console.log('Removing catalog file');
      }
      
      // Log the FormData contents for debugging
      console.log('FormData entries:');
      for (let pair of apiFormData.entries()) {
        console.log(pair[0], pair[1]);
      }
      
      try {
        let response;
        if (isEditMode) {
          response = await adminAPI.updateProduct(id, apiFormData);
          console.log('Update response:', response.data);
          if (response.data.success) {
            toast.success('Product updated successfully');
            navigate('/admin/products');
          } else {
            toast.error('Error updating product: ' + (response.data.message || 'Unknown error'));
            // Handle validation errors in the response
            if (response.data.errors) {
              console.error('Validation errors in response:', response.data.errors);
              Object.keys(response.data.errors).forEach(field => {
                if (Array.isArray(response.data.errors[field]) && response.data.errors[field].length > 0) {
                  toast.error(`${field}: ${response.data.errors[field][0]}`);
                }
              });
            }
          }
        } else {
          response = await adminAPI.createProduct(apiFormData);
          console.log('Create response:', response.data);
          if (response.data.success) {
            toast.success('Product created successfully');
            navigate(`/admin/products/${response.data.data.id}/edit`);
          } else {
            toast.error('Error creating product: ' + (response.data.message || 'Unknown error'));
            // Handle validation errors in the response
            if (response.data.errors) {
              console.error('Validation errors in response:', response.data.errors);
              Object.keys(response.data.errors).forEach(field => {
                if (Array.isArray(response.data.errors[field]) && response.data.errors[field].length > 0) {
                  toast.error(`${field}: ${response.data.errors[field][0]}`);
                }
              });
            }
          }
        }
      } catch (error) {
        // Log detailed API error information
        console.error('API error details:', error.response?.data);
        
        // Handle validation errors
        if (error.response?.data?.errors) {
          const validationErrors = error.response.data.errors;
          console.error('Validation errors:', validationErrors);
          
          // Display specific field errors
          Object.keys(validationErrors).forEach(field => {
            if (Array.isArray(validationErrors[field]) && validationErrors[field].length > 0) {
              toast.error(`${field}: ${validationErrors[field][0]}`);
            }
          });
        } else {
          toast.error('Failed to save product: ' + (error.message || 'Unknown error'));
        }
      }
    } catch (error) {
      console.error('Error in outer try-catch:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? (readOnly ? 'View Product' : 'Edit Product') : 'Create Product'}
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            {isEditMode ? (readOnly ? 'View product details' : 'Update product information') : 'Add a new product to your catalog'}
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => navigate('/admin/products')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        {/* Category */}
        <div>
          <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            id="category_id"
            name="category_id"
            value={formData.category_id || ''}
            onChange={handleInputChange}
            disabled={readOnly}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:text-gray-500"
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {getLocalized(category.name)}
              </option>
            ))}
          </select>
        </div>

        {/* Localized Name */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Product Name
          </label>
          {languages.map((lang) => (
            <div key={lang.code} className="flex items-center">
              <span className="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                {lang.name}
              </span>
              <input
                type="text"
                value={formData.name?.[lang.code] || ''}
                onChange={(e) => handleLocalizedInputChange('name', lang.code, e.target.value)}
                disabled={readOnly}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-r-md border border-gray-300 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:text-gray-500"
                placeholder={`Product name in ${lang.name}`}
                required={lang.code === 'en'} // At least English is required
              />
            </div>
          ))}
        </div>

        {/* Localized Description */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Product Description
          </label>
          {languages.map((lang) => (
            <div key={lang.code} className="flex flex-col">
              <div className="flex items-center">
                <span className="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  {lang.name}
                </span>
                <div className="flex-1 min-w-0 block w-full rounded-r-md border border-gray-300 focus-within:ring-primary-500 focus-within:border-primary-500">
                  <textarea
                    value={formData.description?.[lang.code] || ''}
                    onChange={(e) => handleLocalizedInputChange('description', lang.code, e.target.value)}
                    disabled={readOnly}
                    rows="4"
                    className="block w-full px-3 py-2 border-0 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder={`Product description in ${lang.name}`}
                    required={lang.code === 'en'} // At least English is required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Status */}
        <div className="flex items-center">
          <input
            id="is_active"
            name="is_active"
            type="checkbox"
            checked={formData.is_active}
            onChange={handleInputChange}
            disabled={readOnly}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
            Active (visible on website)
          </label>
        </div>

        {/* Sort Order */}
        <div>
          <label htmlFor="sort_order" className="block text-sm font-medium text-gray-700 mb-2">
            Sort Order
          </label>
          <input
            type="number"
            id="sort_order"
            name="sort_order"
            value={formData.sort_order || 0}
            onChange={handleInputChange}
            disabled={readOnly}
            min="0"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>

        {/* Localized Specifications */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Product Specifications
          </label>
          {languages.map((lang) => (
            <div key={lang.code} className="flex flex-col">
              <div className="flex items-center">
                <span className="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  {lang.name}
                </span>
                <div className="flex-1 min-w-0 block w-full rounded-r-md border border-gray-300 focus-within:ring-primary-500 focus-within:border-primary-500">
                  <textarea
                    value={formData.specifications?.[lang.code] || ''}
                    onChange={(e) => handleLocalizedInputChange('specifications', lang.code, e.target.value)}
                    disabled={readOnly}
                    rows="4"
                    className="block w-full px-3 py-2 border-0 focus:ring-0 disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder={`Product specifications in ${lang.name}`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Images
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
            {Array.isArray(formData.images) && formData.images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={typeof image === 'string' ? `http://127.0.0.1:8000/storage/${image}` : image.preview}
                  alt={`Product image ${index + 1}`}
                  className="h-32 w-full object-cover rounded-lg"
                />
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            {!readOnly && (
              <div className="h-32 w-full border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <label className="cursor-pointer text-center p-4">
                  <span className="block text-sm font-medium text-gray-700">Add Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Videos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Videos
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
            {Array.isArray(formData.videos) && formData.videos.map((video, index) => (
              <div key={index} className="relative group">
                <div className="h-32 w-full bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-primary-600 mb-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-500 truncate block px-2">
                      {typeof video === 'string' ? video.split('/').pop() : video.file?.name || 'Video'}
                    </span>
                  </div>
                </div>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => removeVideo(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            {!readOnly && (
              <div className="h-32 w-full border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <label className="cursor-pointer text-center p-4">
                  <span className="block text-sm font-medium text-gray-700">Add Video</span>
                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Catalog File */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Catalog (PDF)
          </label>
          <div className="mt-2">
            {formData.catalog_file ? (
              <div className="flex items-center space-x-2">
                <div className="flex-1 p-2 border rounded-md bg-gray-50">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm truncate">
                      {formData.catalog_file instanceof File 
                        ? formData.catalog_file.name 
                        : formData.catalog_file.split('/').pop() || 'Catalog.pdf'}
                    </span>
                  </div>
                </div>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={removeCatalog}
                    className="p-1 bg-red-500 text-white rounded-full"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ) : (
              !readOnly && (
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <div className="mt-2">
                      <label htmlFor="catalog-upload" className="cursor-pointer">
                        <span className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-500">
                          Upload a catalog file (PDF)
                        </span>
                        <input
                          id="catalog-upload"
                          name="catalog_file"
                          type="file"
                          accept=".pdf"
                          onChange={handleCatalogUpload}
                          className="sr-only"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Submit Button */}
        {!readOnly && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent border-white rounded-full"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? 'Update Product' : 'Create Product'}
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProductForm;