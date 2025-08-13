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
    images: []
  });

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
        // Ensure images is always an array
        const productData = response.data.data;
        if (!productData.images) {
          productData.images = [];
        }
        // Ensure all required fields are properly initialized
        const normalizedData = {
          name: { en: productData.name?.en || '', ar: productData.name?.ar || '' },
          description: { en: productData.description?.en || '', ar: productData.description?.ar || '' },
          specifications: { en: productData.specifications?.en || '', ar: productData.specifications?.ar || '' },
          category_id: productData.category_id || '',
          is_active: productData.is_active ?? true,
          sort_order: productData.sort_order || 0,
          images: productData.images || []
        };
        setFormData(normalizedData);
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
    try {
      // Create a FormData object for file uploads
      const apiFormData = new FormData();
      
      // Add name and description as JSON strings
      apiFormData.append('name[en]', formData.name?.en || '');
      apiFormData.append('name[ar]', formData.name?.ar || '');
      
      if (formData.description) {
        apiFormData.append('description[en]', formData.description?.en || '');
        apiFormData.append('description[ar]', formData.description?.ar || '');
      }
      
      if (formData.specifications) {
        apiFormData.append('specifications[en]', formData.specifications?.en || '');
        apiFormData.append('specifications[ar]', formData.specifications?.ar || '');
      }
      
      // Add other fields
      apiFormData.append('category_id', formData.category_id);
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
      
      let response;
      if (isEditMode) {
        response = await adminAPI.updateProduct(id, apiFormData);
        toast.success('Product updated successfully');
      } else {
        response = await adminAPI.createProduct(apiFormData);
        toast.success('Product created successfully');
        navigate(`/admin/products/${response.data.data.id}/edit`);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      
      if (error.response && error.response.status === 422) {
        // Handle validation errors
        const validationErrors = error.response.data.errors;
        if (validationErrors) {
          // Display all validation errors
          Object.entries(validationErrors).forEach(([field, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              toast.error(`${field}: ${messages[0]}`);
            }
          });
          
          // Log all validation errors for debugging
          console.error('Validation errors:', validationErrors);
        } else {
          toast.error('Validation failed. Please check your inputs.');
        }
      } else {
        toast.error('Failed to save product: ' + (error.message || 'Unknown error'));
      }
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