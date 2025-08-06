import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  Save,
  RefreshCw,
  FileText,
  Image,
  Globe,
  Building,
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminAbout = () => {
  const [aboutData, setAboutData] = useState({
    mission: { en: '', ar: '', bn: '' },
    vision: { en: '', ar: '', bn: '' },
    values: { en: '', ar: '', bn: '' },
    history: { en: '', ar: '', bn: '' },
    team_description: { en: '', ar: '', bn: '' },
    company_overview: { en: '', ar: '', bn: '' }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('en');
  const { getLocalized } = useLanguage();

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      const response = await adminAPI.getCompanyInfo();
      if (response.data.data) {
        setAboutData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching about data:', error);
      toast.error('Failed to fetch about content');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminAPI.updateCompanyInfo(aboutData);
      toast.success('About content updated successfully');
    } catch (error) {
      console.error('Error saving about data:', error);
      toast.error('Failed to save about content');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, language, value) => {
    setAboutData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [language]: value
      }
    }));
  };

  const tabs = [
    { id: 'en', name: 'English', flag: '🇺🇸' },
    { id: 'ar', name: 'العربية', flag: '🇸🇦' },
    { id: 'bn', name: 'বাংলা', flag: '🇧🇩' }
  ];

  const sections = [
    {
      key: 'company_overview',
      title: 'Company Overview',
      icon: Building,
      description: 'General company description and overview'
    },
    {
      key: 'mission',
      title: 'Mission Statement',
      icon: FileText,
      description: 'Company mission and purpose'
    },
    {
      key: 'vision',
      title: 'Vision Statement',
      icon: Globe,
      description: 'Company vision and future goals'
    },
    {
      key: 'values',
      title: 'Core Values',
      icon: FileText,
      description: 'Company values and principles'
    },
    {
      key: 'history',
      title: 'Company History',
      icon: FileText,
      description: 'Company background and history'
    },
    {
      key: 'team_description',
      title: 'Team Description',
      icon: FileText,
      description: 'About the team and leadership'
    }
  ];

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
            About Content Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage company information, mission, vision, and about content
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <button
            onClick={fetchAboutData}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Save className={`h-4 w-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Language Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <span>{tab.flag}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Sections */}
        <div className="p-6 space-y-8">
          {sections.map((section) => (
            <div key={section.key} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <section.icon className="h-5 w-5 text-primary-600 mr-2" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{section.title}</h3>
                  <p className="text-sm text-gray-500">{section.description}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  {section.title} ({tabs.find(t => t.id === activeTab)?.name})
                </label>
                <textarea
                  value={aboutData[section.key]?.[activeTab] || ''}
                  onChange={(e) => handleInputChange(section.key, activeTab, e.target.value)}
                  rows={section.key === 'company_overview' || section.key === 'history' ? 8 : 4}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder={`Enter ${section.title.toLowerCase()} in ${tabs.find(t => t.id === activeTab)?.name}...`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Content Preview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => (
            <div key={section.key} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <section.icon className="h-4 w-4 text-primary-600 mr-2" />
                <h4 className="text-sm font-medium text-gray-900">{section.title}</h4>
              </div>
              <p className="text-xs text-gray-500 line-clamp-3">
                {aboutData[section.key]?.[activeTab] || 'No content available'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAbout;