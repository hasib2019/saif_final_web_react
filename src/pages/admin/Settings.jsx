import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import ContactInfo from './ContactInfo';
import {
  Save,
  Settings as SettingsIcon,
  Globe,
  Mail,
  Shield,
  Database,
  Image,
  Bell,
  Palette,
  Code,
  Server,
  Key,
  Upload,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const { getLocalized } = useLanguage();

  const tabs = [
    { id: 'general', name: 'General', icon: SettingsIcon },
    { id: 'site', name: 'Site Settings', icon: Globe },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'media', name: 'Media', icon: Image },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'advanced', name: 'Advanced', icon: Code },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await adminAPI.getSettings();
      setSettings(response.data.data || {});
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminAPI.updateSettings(settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleFileUpload = async (key, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('key', key);

    try {
      const response = await adminAPI.uploadSettingFile(formData);
      
      handleInputChange(key, response.data.url);
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    }
  };

  const handleClearCache = async () => {
    try {
      await adminAPI.clearCache();
      toast.success('Cache cleared successfully');
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast.error('Failed to clear cache');
    }
  };

  const handleBackupSettings = async () => {
    try {
      const response = await adminAPI.backupSettings();
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `settings_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Settings backup downloaded');
    } catch (error) {
      console.error('Error backing up settings:', error);
      toast.error('Failed to backup settings');
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Name
            </label>
            <input
              type="text"
              value={settings.site_name || ''}
              onChange={(e) => handleInputChange('site_name', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Tagline
            </label>
            <input
              type="text"
              value={settings.site_tagline || ''}
              onChange={(e) => handleInputChange('site_tagline', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Description
            </label>
            <textarea
              rows={3}
              value={settings.site_description || ''}
              onChange={(e) => handleInputChange('site_description', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Language
            </label>
            <select
              value={settings.default_language || 'en'}
              onChange={(e) => handleInputChange('default_language', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="en">English</option>
              <option value="ar">Arabic</option>
              <option value="bn">Bengali</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={settings.timezone || 'UTC'}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="UTC">UTC</option>
              <option value="Asia/Dhaka">Asia/Dhaka</option>
              <option value="Asia/Dubai">Asia/Dubai</option>
              <option value="America/New_York">America/New_York</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSiteSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Site Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site URL
            </label>
            <input
              type="url"
              value={settings.site_url || ''}
              onChange={(e) => handleInputChange('site_url', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Email
            </label>
            <input
              type="email"
              value={settings.admin_email || ''}
              onChange={(e) => handleInputChange('admin_email', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Logo
            </label>
            <div className="flex items-center space-x-4">
              {settings.site_logo && (
                <img src={settings.site_logo} alt="Site Logo" className="h-12 w-auto" />
              )}
              <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <Upload className="h-4 w-4 inline mr-2" />
                Upload Logo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      handleFileUpload('site_logo', e.target.files[0]);
                    }
                  }}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Favicon
            </label>
            <div className="flex items-center space-x-4">
              {settings.site_favicon && (
                <img src={settings.site_favicon} alt="Favicon" className="h-8 w-8" />
              )}
              <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <Upload className="h-4 w-4 inline mr-2" />
                Upload Favicon
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      handleFileUpload('site_favicon', e.target.files[0]);
                    }
                  }}
                />
              </label>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center">
              <input
                id="maintenance_mode"
                type="checkbox"
                checked={settings.maintenance_mode || false}
                onChange={(e) => handleInputChange('maintenance_mode', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="maintenance_mode" className="ml-2 block text-sm text-gray-900">
                Enable Maintenance Mode
              </label>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              When enabled, only administrators can access the site.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Email Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SMTP Host
            </label>
            <input
              type="text"
              value={settings.smtp_host || ''}
              onChange={(e) => handleInputChange('smtp_host', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SMTP Port
            </label>
            <input
              type="number"
              value={settings.smtp_port || ''}
              onChange={(e) => handleInputChange('smtp_port', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SMTP Username
            </label>
            <input
              type="text"
              value={settings.smtp_username || ''}
              onChange={(e) => handleInputChange('smtp_username', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SMTP Password
            </label>
            <input
              type="password"
              value={settings.smtp_password || ''}
              onChange={(e) => handleInputChange('smtp_password', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Email
            </label>
            <input
              type="email"
              value={settings.mail_from_address || ''}
              onChange={(e) => handleInputChange('mail_from_address', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Name
            </label>
            <input
              type="text"
              value={settings.mail_from_name || ''}
              onChange={(e) => handleInputChange('mail_from_name', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Security Configuration</h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={settings.session_timeout || '120'}
                onChange={(e) => handleInputChange('session_timeout', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Login Attempts
              </label>
              <input
                type="number"
                value={settings.max_login_attempts || '5'}
                onChange={(e) => handleInputChange('max_login_attempts', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="force_https"
                type="checkbox"
                checked={settings.force_https || false}
                onChange={(e) => handleInputChange('force_https', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="force_https" className="ml-2 block text-sm text-gray-900">
                Force HTTPS
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="two_factor_auth"
                type="checkbox"
                checked={settings.two_factor_auth || false}
                onChange={(e) => handleInputChange('two_factor_auth', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="two_factor_auth" className="ml-2 block text-sm text-gray-900">
                Enable Two-Factor Authentication
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="password_reset_enabled"
                type="checkbox"
                checked={settings.password_reset_enabled || true}
                onChange={(e) => handleInputChange('password_reset_enabled', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="password_reset_enabled" className="ml-2 block text-sm text-gray-900">
                Allow Password Reset
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdvancedSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Configuration</h3>
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Warning
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    These settings can affect system performance and functionality. 
                    Only modify if you understand the implications.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cache TTL (seconds)
              </label>
              <input
                type="number"
                value={settings.cache_ttl || '3600'}
                onChange={(e) => handleInputChange('cache_ttl', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Rate Limit (per minute)
              </label>
              <input
                type="number"
                value={settings.api_rate_limit || '60'}
                onChange={(e) => handleInputChange('api_rate_limit', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="debug_mode"
                type="checkbox"
                checked={settings.debug_mode || false}
                onChange={(e) => handleInputChange('debug_mode', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="debug_mode" className="ml-2 block text-sm text-gray-900">
                Enable Debug Mode
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="api_logging"
                type="checkbox"
                checked={settings.api_logging || false}
                onChange={(e) => handleInputChange('api_logging', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="api_logging" className="ml-2 block text-sm text-gray-900">
                Enable API Logging
              </label>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">System Actions</h4>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleClearCache}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear Cache
              </button>

              <button
                onClick={handleBackupSettings}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Backup Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Create a ref to access the AdminContactInfo component's methods
  const contactInfoRef = React.useRef();
  
  // Function to save contact info when the main settings save button is clicked
  const saveContactInfo = async () => {
    if (contactInfoRef.current && contactInfoRef.current.handleSubmit) {
      await contactInfoRef.current.handleSubmit();
    }
  };
  
  // Create an enhanced save function that also saves contact info
  const enhancedHandleSave = async () => {
    try {
      await handleSave();
      if (activeTab === 'appearance') {
        console.log('Saving contact info...');
        await saveContactInfo();
        console.log('Contact info saved successfully');
      }
    } catch (error) {
      console.error('Error in enhancedHandleSave:', error);
    }
  };
  
  const renderAppearanceSettings = () => {

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Appearance Settings</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Contact Information</h4>
                <p className="text-sm text-gray-500 mb-4">
                  Manage your organization's contact information that will be displayed on the website.
                </p>
                <ContactInfo ref={contactInfoRef} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'site':
        return renderSiteSettings();
      case 'email':
        return renderEmailSettings();
      case 'security':
        return renderSecuritySettings();
      case 'advanced':
        return renderAdvancedSettings();
      case 'appearance':
        return renderAppearanceSettings();
      default:
        return <div>Tab content not implemented yet.</div>;
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
            System Settings
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Configure system-wide settings and preferences
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
              type="button"
              onClick={activeTab === 'appearance' ? enhancedHandleSave : handleSave}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
        </div>
      </div>

      {/* Settings Content */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200">
            <nav className="space-y-1 p-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700 border-primary-500'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;