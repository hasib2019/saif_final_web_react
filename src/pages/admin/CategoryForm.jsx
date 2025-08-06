import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  Save,
  ArrowLeft,
  Tag,
  ToggleLeft,
  ToggleRight,
  Upload,
  X,
  Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

const CategoryForm = ({ readOnly = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { languages } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: {},
    description: {},
    is_active: true,
    image: null,
    imagePreview: null,
  });

  useEffect(() => {
    if (id) {
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getProductCategory(id);
      setFormData(response.data.data);
    } catch (error) {
      console.error('Error fetching category:', error);
      toast.error('Failed to fetch category');
      navigate('/admin/categories');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a preview URL for the image
      const imagePreview = URL.createObjectURL(file);
      
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: imagePreview
      }));
    }
  };
  
  const removeImage = () => {
    // Revoke the object URL to prevent memory leaks
    if (formData.imagePreview && !formData.imagePreview.startsWith('http')) {
      URL.revokeObjectURL(formData.imagePreview);
    }
    
    setFormData(prev => ({
      ...prev,
      image: null,
      imagePreview: null
    }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Create a FormData object to handle file uploads
      const formDataToSubmit = new FormData();
      
      // Add localized fields (name, description)
      Object.entries(formData.name || {}).forEach(([lang, value]) => {
        formDataToSubmit.append(`name[${lang}]`, value || '');
      });
      
      Object.entries(formData.description || {}).forEach(([lang, value]) => {
        formDataToSubmit.append(`description[${lang}]`, value || '');
      });
      
      // Add other fields
      formDataToSubmit.append('is_active', formData.is_active ? '1' : '0');
      
      if (formData.sort_order) {
        formDataToSubmit.append('sort_order', formData.sort_order);
      }
      
      // Handle image if present
      if (formData.image && formData.image instanceof File) {
        formDataToSubmit.append('image', formData.image);
      }
      
      if (id) {
        await adminAPI.updateProductCategory(id, formDataToSubmit);
        toast.success('Category updated successfully');
      } else {
        await adminAPI.createProductCategory(formDataToSubmit);
        toast.success('Category created successfully');
      }
      navigate('/admin/categories');
    } catch (error) {
      console.error('Error saving category:', error);
      if (error.response?.status === 422) {
        // Validation errors
        const validationErrors = error.response.data.errors;
        const errorMessage = Object.values(validationErrors).flat().join('\n');
        toast.error(errorMessage || 'Validation failed');
      } else {
        toast.error(error.response?.data?.message || 'Failed to save category');
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
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            {readOnly ? 'View Category' : id ? 'Edit Category' : 'Create New Category'}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {readOnly ? 'View product category details' : id ? 'Update existing product category' : 'Add a new product category to the system'}
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <button
            type="button"
            onClick={() => navigate('/admin/categories')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </button>
          {!readOnly && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Category'}
            </button>
          )}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200">
        <div className="space-y-8 divide-y divide-gray-200">
          <div>
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {/* Category Name */}
              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-gray-700">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 space-y-4">
                  {languages.map(lang => (
                    <div key={lang.code} className="flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mr-2">
                        {lang.name}
                      </span>
                      <input
                        type="text"
                        value={formData.name?.[lang.code] || ''}
                        onChange={(e) => handleLocalizedInputChange('name', lang.code, e.target.value)}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder={`Category name in ${lang.name}`}
                        required={lang.code === 'en'}
                        disabled={readOnly}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Description */}
              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-gray-700">
                  Category Description
                </label>
                <div className="mt-1 space-y-4">
                  {languages.map(lang => (
                    <div key={lang.code} className="flex items-start">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mr-2 mt-2">
                        {lang.name}
                      </span>
                      <textarea
                        rows={3}
                        value={formData.description?.[lang.code] || ''}
                        onChange={(e) => handleLocalizedInputChange('description', lang.code, e.target.value)}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder={`Category description in ${lang.name}`}
                        disabled={readOnly}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Image */}
              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-gray-700">
                  Category Image
                </label>
                <div className="mt-1 flex items-center space-x-6">
                  {formData.imagePreview ? (
                    <div className="relative">
                      <img 
                        src={formData.imagePreview} 
                        alt="Category preview" 
                        className="h-32 w-32 object-cover rounded-md" 
                      />
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 shadow-sm hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="h-32 w-32 border-2 border-gray-300 border-dashed rounded-md flex items-center justify-center text-gray-400">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}
                  
                  {!readOnly && (
                    <div>
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <span className="flex items-center">
                          <Upload className="h-4 w-4 mr-2" />
                          {formData.imagePreview ? 'Change Image' : 'Upload Image'}
                        </span>
                        <input
                          id="image-upload"
                          name="image-upload"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleImageUpload}
                          disabled={readOnly}
                        />
                      </label>
                      <p className="mt-1 text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Status */}
              <div className="sm:col-span-6">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <button
                    type="button"
                    onClick={() => !readOnly && handleInputChange('is_active', !formData.is_active)}
                    className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm ${formData.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} ${readOnly ? 'opacity-70 cursor-not-allowed' : ''}`}
                    disabled={readOnly}
                  >
                    {formData.is_active ? (
                      <>
                        <ToggleRight className="h-4 w-4 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="h-4 w-4 mr-1" />
                        Inactive
                      </>
                    )}
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {formData.is_active 
                    ? 'This category will be visible on the website.'
                    : 'This category will be hidden from the website.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {!readOnly && (
          <div className="pt-5">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/admin/categories')}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : id ? 'Update Category' : 'Create Category'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default CategoryForm;