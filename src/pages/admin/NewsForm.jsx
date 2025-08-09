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
      setFormData(response.data.data);
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

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append('type', 'image');

    try {
      const response = await adminAPI.post('/upload', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      handleInputChange('image', response.data.url);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (readOnly) return;
    
    setSaving(true);

    try {
      if (id) {
        await adminAPI.updatePressRelease(id, formData);
        toast.success('News article updated successfully');
      } else {
        await adminAPI.createPressRelease(formData);
        toast.success('News article created successfully');
      }
      navigate('/admin/news');
    } catch (error) {
      console.error('Error saving news:', error);
      toast.error('Failed to save news article');
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
                          src={formData.image} 
                          alt="Featured" 
                          className="h-48 w-auto object-cover rounded-md" 
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