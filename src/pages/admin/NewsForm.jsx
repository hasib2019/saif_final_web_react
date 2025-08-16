import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  Save,
  ArrowLeft,
  Upload,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

const NewsForm = ({ readOnly = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getLocalized } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title_en: '',
    title_ar: '',
    title_bn: '',
    excerpt_en: '',
    excerpt_ar: '',
    excerpt_bn: '',
    content_en: '',
    content_ar: '',
    content_bn: '',
    image: null,
    featured_image: null, // Store the actual file object here
    is_active: true,
    published_at: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (id) {
      fetchNews();
    }
  }, [id]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getPressRelease(id);
      console.log('Fetched news data:', response);
      
      // Handle different response formats
      let newsData;
      if (response.data && response.data.data) {
        // Standard format with data property
        newsData = response.data.data;
      } else if (response.data && response.data.success && response.data.data) {
        // Success format with nested data
        newsData = response.data.data;
      } else {
        // Direct data format
        newsData = response.data;
      }
      
      console.log('Processed news data:', newsData);
      
      // Map the data to the form fields
      const mappedData = {
        title_en: newsData.title?.en || '',
        title_ar: newsData.title?.ar || '',
        title_bn: newsData.title?.bn || '',
        excerpt_en: newsData.excerpt?.en || '',
        excerpt_ar: newsData.excerpt?.ar || '',
        excerpt_bn: newsData.excerpt?.bn || '',
        content_en: newsData.content?.en || '',
        content_ar: newsData.content?.ar || '',
        content_bn: newsData.content?.bn || '',
        image: newsData.image || newsData.featured_image || '',
        featured_image: null, // Reset featured_image to null since we're not uploading a new file yet
        is_active: newsData.is_active !== undefined ? newsData.is_active : true,
        published_at: newsData.published_at ? newsData.published_at.split('T')[0] : new Date().toISOString().split('T')[0],
      };
      
      console.log('Mapped form data:', mappedData);
      setFormData(mappedData);
    } catch (error) {
      console.error('Error fetching news:', error);
      toast.error('Failed to fetch news article');
      navigate('/admin/news');
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Store the file object directly for form submission
    handleInputChange('featured_image', file);
    
    // Also create a preview URL for display
    const previewUrl = URL.createObjectURL(file);
    handleInputChange('image', previewUrl);
    
    toast.success('Image selected successfully');
    
    // Optional: You can still upload the image immediately if needed
    // But for this fix, we'll just store the file and upload it with the form
    /*
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append('type', 'image');
    formDataUpload.append('folder', 'news');

    try {
      const response = await adminAPI.uploadFile(formDataUpload);
      console.log('Image upload response:', response);
      
      // Handle different response formats
      let imageUrl = null;
      
      if (response.data) {
        if (response.data.success && response.data.url) {
          // Format: { success: true, url: '...' }
          imageUrl = response.data.url;
        } else if (response.data.success && response.data.data && response.data.data.url) {
          // Format: { success: true, data: { url: '...' } }
          imageUrl = response.data.data.url;
        } else if (response.data.url) {
          // Format: { url: '...' }
          imageUrl = response.data.url;
        } else if (typeof response.data === 'string') {
          // Format: Direct URL string
          imageUrl = response.data;
        }
      }
      
      if (imageUrl) {
        console.log('Image uploaded successfully:', imageUrl);
        handleInputChange('image', imageUrl);
        toast.success('Image uploaded successfully');
      } else {
        console.error('Invalid response format:', response.data);
        toast.error('Failed to upload image: Invalid response format');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image');
    }
    */
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (readOnly) return;
    
    setSaving(true);

    try {
      // Check if we need to use FormData (when we have a file)
      const hasNewImage = formData.featured_image instanceof File;
      
      let apiData;
      if (hasNewImage) {
        // Use FormData when we have a file to upload
        apiData = new FormData();
        
        // Add title as an array with language keys
        apiData.append('title[en]', formData.title_en || '');
        apiData.append('title[ar]', formData.title_ar || '');
        apiData.append('title[bn]', formData.title_bn || '');
        
        // Add excerpt as an array with language keys
        apiData.append('excerpt[en]', formData.excerpt_en || '');
        apiData.append('excerpt[ar]', formData.excerpt_ar || '');
        apiData.append('excerpt[bn]', formData.excerpt_bn || '');
        
        // Add content as an array with language keys
        apiData.append('content[en]', formData.content_en || '');
        apiData.append('content[ar]', formData.content_ar || '');
        apiData.append('content[bn]', formData.content_bn || '');
        
        // Add the file directly
        apiData.append('featured_image', formData.featured_image);
        
        // Add other fields - convert boolean to string 'true'/'false' for proper handling
        apiData.append('is_active', formData.is_active !== undefined ? String(formData.is_active) : 'true');
        apiData.append('published_at', formData.published_at || new Date().toISOString().split('T')[0]);
      } else {
        // Use FormData even without a file to ensure proper array format
        apiData = new FormData();
        
        // Add title as an array with language keys
        apiData.append('title[en]', formData.title_en || '');
        apiData.append('title[ar]', formData.title_ar || '');
        apiData.append('title[bn]', formData.title_bn || '');
        
        // Add excerpt as an array with language keys
        apiData.append('excerpt[en]', formData.excerpt_en || '');
        apiData.append('excerpt[ar]', formData.excerpt_ar || '');
        apiData.append('excerpt[bn]', formData.excerpt_bn || '');
        
        // Add content as an array with language keys
        apiData.append('content[en]', formData.content_en || '');
        apiData.append('content[ar]', formData.content_ar || '');
        apiData.append('content[bn]', formData.content_bn || '');
        
        // Add other fields
         apiData.append('image', formData.image || '');
         apiData.append('is_active', formData.is_active !== undefined ? String(formData.is_active) : 'true');
         apiData.append('published_at', formData.published_at || new Date().toISOString().split('T')[0]);
      }

      console.log('Submitting news data:', hasNewImage ? 'FormData with file' : apiData);

      if (id) {
        const response = await adminAPI.updatePressRelease(id, apiData);
        console.log('Update response:', response);
        toast.success('News article updated successfully');
      } else {
        const response = await adminAPI.createPressRelease(apiData);
        console.log('Create response:', response);
        toast.success('News article created successfully');
      }
      navigate('/admin/news');
    } catch (error) {
      console.error('Error saving news:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save news article';
      toast.error(errorMessage);
      
      // Display validation errors if available
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0];
        if (firstError && firstError[0]) {
          toast.error(firstError[0]);
        }
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
            {readOnly ? 'View News Article' : id ? 'Edit News Article' : 'Add News Article'}
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <button
            onClick={() => navigate('/admin/news')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
          {!readOnly && (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saving ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 gap-6">
                {/* Title in multiple languages */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Title (English)"
                      value={formData.title_en}
                      onChange={(e) => handleInputChange('title_en', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      disabled={readOnly}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Title (Arabic)"
                      value={formData.title_ar}
                      onChange={(e) => handleInputChange('title_ar', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      dir="rtl"
                      disabled={readOnly}
                    />
                    <input
                      type="text"
                      placeholder="Title (Bengali)"
                      value={formData.title_bn}
                      onChange={(e) => handleInputChange('title_bn', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      disabled={readOnly}
                    />
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Excerpt
                  </label>
                  <div className="space-y-3">
                    <textarea
                      placeholder="Excerpt (English)"
                      value={formData.excerpt_en}
                      onChange={(e) => handleInputChange('excerpt_en', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      rows="3"
                      disabled={readOnly}
                      required
                    />
                    <textarea
                      placeholder="Excerpt (Arabic)"
                      value={formData.excerpt_ar}
                      onChange={(e) => handleInputChange('excerpt_ar', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      rows="3"
                      dir="rtl"
                      disabled={readOnly}
                    />
                    <textarea
                      placeholder="Excerpt (Bengali)"
                      value={formData.excerpt_bn}
                      onChange={(e) => handleInputChange('excerpt_bn', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      rows="3"
                      disabled={readOnly}
                    />
                  </div>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <div className="space-y-3">
                    <textarea
                      placeholder="Content (English)"
                      value={formData.content_en}
                      onChange={(e) => handleInputChange('content_en', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      rows="6"
                      disabled={readOnly}
                      required
                    />
                    <textarea
                      placeholder="Content (Arabic)"
                      value={formData.content_ar}
                      onChange={(e) => handleInputChange('content_ar', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      rows="6"
                      dir="rtl"
                      disabled={readOnly}
                    />
                    <textarea
                      placeholder="Content (Bengali)"
                      value={formData.content_bn}
                      onChange={(e) => handleInputChange('content_bn', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      rows="6"
                      disabled={readOnly}
                    />
                  </div>
                </div>

                {/* Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Featured Image
                  </label>
                  <div className="space-y-3">
                    {formData.image && (
                      <div className="mt-2">
                        <img 
                          src={formData.image.startsWith('http') ? formData.image : `/storage/${formData.image}`} 
                          alt="Featured" 
                          className="h-48 w-auto object-cover rounded-md" 
                          onError={(e) => {
                            console.error('Image load error, trying alternative path');
                            // Try alternative path if the first one fails
                            if (!e.target.src.includes('/storage/')) {
                              e.target.src = `/storage/${formData.image}`;
                            } else if (!e.target.src.includes('/public/')) {
                              e.target.src = `/public/storage/${formData.image}`;
                            } else {
                              // If all attempts fail, show a placeholder
                              e.target.src = '/logo.svg';
                            }
                          }}
                        />
                      </div>
                    )}
                    {!readOnly && (
                      <div className="mt-2">
                        <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          {formData.image ? 'Change Image' : 'Upload Image'}
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleFileUpload}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Published Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Published Date
                  </label>
                  <input
                    type="date"
                    value={formData.published_at ? formData.published_at.split('T')[0] : ''}
                    onChange={(e) => handleInputChange('published_at', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    disabled={readOnly}
                    required
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => handleInputChange('is_active', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      disabled={readOnly}
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {formData.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewsForm;