import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import ContactInfo from './ContactInfo';
import {
  ArrowLeft,
  Save,
  Mail,
  Phone,
  MapPin,
  Clock,
  Settings,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ContactSettings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { getLocalized } = useLanguage();
  
  // Create a ref to access the ContactInfo component's methods
  const contactInfoRef = React.useRef();

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save contact info using the ref
      if (contactInfoRef.current && contactInfoRef.current.handleSubmit) {
        await contactInfoRef.current.handleSubmit();
      }
      toast.success('Contact settings saved successfully');
    } catch (error) {
      console.error('Error saving contact settings:', error);
      toast.error('Failed to save contact settings');
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
            Contact Settings
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Configure contact information and form settings
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <Link
            to="/admin/contact"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Contact List
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Contact Information Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <MessageSquare className="h-5 w-5 text-gray-400 mr-2" />
                Contact Information
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                This information will be displayed on your website's contact page and used for receiving notifications.
              </p>
              
              <ContactInfo ref={contactInfoRef} />
            </div>

            {/* Form Settings Section - Can be expanded in the future */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Settings className="h-5 w-5 text-gray-400 mr-2" />
                Form Settings
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Configure how the contact form works and notification settings.
              </p>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Form settings configuration will be available in a future update.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSettings;