import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { adminAPI } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  Save,
  ArrowLeft,
  Upload,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

const HeroSlideForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getLocalized } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title_en: '',
    title_ar: '',
    title_bn: '',
    subtitle_en: '',
    subtitle_ar: '',
    subtitle_bn: '',
    description_en: '',
    description_ar: '',
    description_bn: '',
    button_text_en: '',
    button_text_ar: '',
    button_text_bn: '',
    button_url: '',
    image: null,
    background_image: null,
    video_url: '',
    order: 0,
    is_active: true,
    show_overlay: true,
    overlay_opacity: 50,
    text_position: 'center',
    animation_type: 'fade',
  });

  useEffect(() => {
    if (id) {
      fetchSlide();
    }
  }, [id]);

  const fetchSlide = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getHeroSlide(id);
      const slide = response.data.data;
      
      // Transform JSON data to individual form fields
      const transformedData = {
        title_en: slide.title?.en || '',
        title_ar: slide.title?.ar || '',
        title_bn: slide.title?.bn || '',
        subtitle_en: slide.subtitle?.en || '',
        subtitle_ar: slide.subtitle?.ar || '',
        subtitle_bn: slide.subtitle?.bn || '',
        description_en: slide.description?.en || '',
        description_ar: slide.description?.ar || '',
        description_bn: slide.description?.bn || '',
        button_text_en: slide.button_text?.en || '',
        button_text_ar: slide.button_text?.ar || '',
        button_text_bn: slide.button_text?.bn || '',
        button_url: slide.button_link || '',
        image: slide.image || '',
        background_image: slide.background_image || '',
        video_url: slide.video_url || '',
        order: slide.sort_order || 0,
        is_active: slide.is_active ?? true,
        show_overlay: slide.show_overlay ?? true,
        overlay_opacity: slide.overlay_opacity || 50,
        text_position: slide.text_position || 'center',
        animation_type: slide.animation_type || 'fade'
      };
      
      setFormData(transformedData);
    } catch (error) {
      console.error('Error fetching slide:', error);
      toast.error('Failed to fetch slide');
      navigate('/admin/hero-slides');
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

  const handleFileUpload = async (field, file) => {
    if (!file) return;
    
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append('type', 'image');

    try {
      // Use the default api instance instead of adminAPI.post
      const response = await api.post('/upload', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data && response.data.url) {
        handleInputChange(field, response.data.url);
        toast.success('File uploaded successfully');
      } else {
        console.error('Invalid response format:', response.data);
        toast.error('Failed to upload file: Invalid response format');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(error.response?.data?.message || 'Failed to upload file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validate required fields
      if (!formData.title_en) {
        toast.error('Title in English is required');
        setSaving(false);
        return;
      }

      if (!formData.image) {
        toast.error('Main image is required');
        setSaving(false);
        return;
      }

      // Create a copy of the form data to send to the API
      const dataToSubmit = { ...formData };
      
      // Log the data being submitted for debugging
      console.log('Submitting data:', dataToSubmit);
      
      if (id) {
        await adminAPI.updateHeroSlide(id, dataToSubmit);
        toast.success('Hero slide updated successfully');
      } else {
        const response = await adminAPI.createHeroSlide(dataToSubmit);
        console.log('Create response:', response);
        toast.success('Hero slide created successfully');
      }
      navigate('/admin/hero-slides');
    } catch (error) {
      console.error('Error saving slide:', error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else if (error.response && error.response.data && error.response.data.errors) {
        // Handle validation errors
        const errorMessages = Object.values(error.response.data.errors).flat();
        errorMessages.forEach(message => toast.error(message));
      } else {
        toast.error('Failed to save slide');
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
            {id ? 'Edit Hero Slide' : 'Add Hero Slide'}
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <button
            onClick={() => navigate('/admin/hero-slides')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
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
                    />
                    <input
                      type="text"
                      placeholder="Title (Arabic)"
                      value={formData.title_ar}
                      onChange={(e) => handleInputChange('title_ar', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      dir="rtl"
                    />
                    <input
                      type="text"
                      placeholder="Title (Bengali)"
                      value={formData.title_bn}
                      onChange={(e) => handleInputChange('title_bn', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtitle
                  </label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Subtitle (English)"
                      value={formData.subtitle_en}
                      onChange={(e) => handleInputChange('subtitle_en', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                    <input
                      type="text"
                      placeholder="Subtitle (Arabic)"
                      value={formData.subtitle_ar}
                      onChange={(e) => handleInputChange('subtitle_ar', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      dir="rtl"
                    />
                    <input
                      type="text"
                      placeholder="Subtitle (Bengali)"
                      value={formData.subtitle_bn}
                      onChange={(e) => handleInputChange('subtitle_bn', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <div className="space-y-3">
                    <textarea
                      rows={3}
                      placeholder="Description (English)"
                      value={formData.description_en}
                      onChange={(e) => handleInputChange('description_en', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                    <textarea
                      rows={3}
                      placeholder="Description (Arabic)"
                      value={formData.description_ar}
                      onChange={(e) => handleInputChange('description_ar', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      dir="rtl"
                    />
                    <textarea
                      rows={3}
                      placeholder="Description (Bengali)"
                      value={formData.description_bn}
                      onChange={(e) => handleInputChange('description_bn', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                {/* Button Text and URL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Button Text
                    </label>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Button Text (English)"
                        value={formData.button_text_en}
                        onChange={(e) => handleInputChange('button_text_en', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                      <input
                        type="text"
                        placeholder="Button Text (Arabic)"
                        value={formData.button_text_ar}
                        onChange={(e) => handleInputChange('button_text_ar', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        dir="rtl"
                      />
                      <input
                        type="text"
                        placeholder="Button Text (Bengali)"
                        value={formData.button_text_bn}
                        onChange={(e) => handleInputChange('button_text_bn', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Button URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com"
                      value={formData.button_url}
                      onChange={(e) => handleInputChange('button_url', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                {/* Media */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Main Image
                    </label>
                    <div className="space-y-3">
                      {formData.image && (
                        <img src={formData.image} alt="Preview" className="h-32 w-auto rounded-md" />
                      )}
                      <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
                        <Upload className="h-4 w-4 inline mr-2" />
                        Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              handleFileUpload('image', file);
                              // Clear the input value to allow selecting the same file again
                              e.target.value = '';
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Background Image
                    </label>
                    <div className="space-y-3">
                      {formData.background_image && (
                        <img src={formData.background_image} alt="Background Preview" className="h-32 w-auto rounded-md" />
                      )}
                      <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
                        <Upload className="h-4 w-4 inline mr-2" />
                        Upload Background
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              handleFileUpload('background_image', file);
                              // Clear the input value to allow selecting the same file again
                              e.target.value = '';
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => handleInputChange('order', parseInt(e.target.value))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Text Position
                    </label>
                    <select
                      value={formData.text_position}
                      onChange={(e) => handleInputChange('text_position', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Animation
                    </label>
                    <select
                      value={formData.animation_type}
                      onChange={(e) => handleInputChange('animation_type', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="fade">Fade</option>
                      <option value="slide">Slide</option>
                      <option value="zoom">Zoom</option>
                    </select>
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      id="is_active"
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => handleInputChange('is_active', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                      Active
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="show_overlay"
                      type="checkbox"
                      checked={formData.show_overlay}
                      onChange={(e) => handleInputChange('show_overlay', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="show_overlay" className="ml-2 block text-sm text-gray-900">
                      Show Overlay
                    </label>
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

export default HeroSlideForm;