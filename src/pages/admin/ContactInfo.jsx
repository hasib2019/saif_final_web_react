import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { adminAPI } from '../../services/api';
import { MapPin, Mail, Phone, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

// Modified to work as an embedded component in Settings
const ContactInfo = forwardRef((props, ref) => {
  const [contactInfo, setContactInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    address: '',
    business_hours: '',
    map_latitude: '',
    map_longitude: '',
    map_embed_code: '',
    is_active: true
  });

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getContactInfo();
      
      if (response.data.success && response.data.data) {
        const info = response.data.data;
        setContactInfo(info);
        setFormData({
          email: info.email || '',
          phone: info.phone || '',
          address: info.address || '',
          business_hours: info.business_hours || '',
          map_latitude: info.map_latitude || '',
          map_longitude: info.map_longitude || '',
          map_embed_code: info.map_embed_code || '',
          is_active: info.is_active
        });
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
      toast.error('Failed to fetch contact information');
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

  const handleSubmit = async () => {
    setSaving(true);
    
    try {
      if (contactInfo) {
        // Update existing contact info
        const response = await adminAPI.updateContactInfo(contactInfo.id, formData);
        console.log('Update response:', response);
        toast.success('Contact information updated successfully');
      } else {
        // Create new contact info
        const response = await adminAPI.createContactInfo(formData);
        console.log('Create response:', response);
        toast.success('Contact information created successfully');
      }
      
      // Refresh data
      fetchContactInfo();
    } catch (error) {
      console.error('Error saving contact info:', error);
      toast.error('Failed to save contact information');
    } finally {
      setSaving(false);
    }
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    handleSubmit
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Form */}
      <div>
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div>
              <div className="flex items-center mb-2">
                <Mail className="h-5 w-5 text-gray-400 mr-2" />
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="contact@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <div className="flex items-center mb-2">
                <Phone className="h-5 w-5 text-gray-400 mr-2" />
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
              </div>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <div className="flex items-center mb-2">
                <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
              </div>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter address (use line breaks for multiple lines)"
              />
              <p className="mt-1 text-xs text-gray-500">Use line breaks to separate address lines</p>
            </div>

            {/* Business Hours */}
            <div className="md:col-span-2">
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                <label className="block text-sm font-medium text-gray-700">
                  Business Hours
                </label>
              </div>
              <textarea
                value={formData.business_hours}
                onChange={(e) => handleInputChange('business_hours', e.target.value)}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter business hours (use line breaks for multiple lines)"
              />
              <p className="mt-1 text-xs text-gray-500">Example: Monday - Friday: 9:00 AM - 6:00 PM</p>
            </div>

            {/* Map Coordinates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Map Latitude
              </label>
              <input
                type="text"
                value={formData.map_latitude}
                onChange={(e) => handleInputChange('map_latitude', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g. 40.7128"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Map Longitude
              </label>
              <input
                type="text"
                value={formData.map_longitude}
                onChange={(e) => handleInputChange('map_longitude', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g. -74.0060"
              />
            </div>

            {/* Map Embed Code */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Map Embed Code
              </label>
              <textarea
                value={formData.map_embed_code}
                onChange={(e) => handleInputChange('map_embed_code', e.target.value)}
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Paste your Google Maps embed code here"
              />
              <p className="mt-1 text-xs text-gray-500">Paste the embed code from Google Maps or other map providers</p>
            </div>

            {/* Active Status */}
            <div className="md:col-span-2">
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
              <p className="mt-1 text-sm text-gray-500">
                When disabled, contact information will not be displayed on the website
              </p>
            </div>
          </div>

          {/* Map Preview */}
          {formData.map_embed_code && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Map Preview</h3>
              <div className="border border-gray-300 rounded-md overflow-hidden">
                <div dangerouslySetInnerHTML={{ __html: formData.map_embed_code }} />
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
});

export default ContactInfo;