import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Globe,
  ToggleLeft,
  ToggleRight,
  Star,
  StarOff,
  Flag,
  Download,
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminLanguages = () => {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { getLocalized, currentLanguage } = useLanguage();

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      const response = await adminAPI.get('/languages');
      setLanguages(response.data.data || []);
    } catch (error) {
      console.error('Error fetching languages:', error);
      toast.error('Failed to fetch languages');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (languageId) => {
    if (window.confirm('Are you sure you want to delete this language? This will remove all translations for this language.')) {
      try {
        await adminAPI.delete(`/languages/${languageId}`);
        toast.success('Language deleted successfully');
        fetchLanguages();
      } catch (error) {
        console.error('Error deleting language:', error);
        toast.error('Failed to delete language');
      }
    }
  };

  const handleToggleStatus = async (languageId, currentStatus) => {
    try {
      await adminAPI.put(`/languages/${languageId}`, {
        is_active: !currentStatus
      });
      toast.success(`Language ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchLanguages();
    } catch (error) {
      console.error('Error updating language status:', error);
      toast.error('Failed to update language status');
    }
  };

  const handleSetDefault = async (languageId) => {
    if (window.confirm('Are you sure you want to set this as the default language?')) {
      try {
        await adminAPI.put(`/languages/${languageId}/set-default`);
        toast.success('Default language updated successfully');
        fetchLanguages();
      } catch (error) {
        console.error('Error setting default language:', error);
        toast.error('Failed to set default language');
      }
    }
  };

  const handleExportTranslations = async (languageCode) => {
    try {
      const response = await adminAPI.get(`/languages/${languageCode}/export`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `translations_${languageCode}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Translations exported successfully');
    } catch (error) {
      console.error('Error exporting translations:', error);
      toast.error('Failed to export translations');
    }
  };

  const handleImportTranslations = async (languageCode, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      await adminAPI.post(`/languages/${languageCode}/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Translations imported successfully');
      fetchLanguages();
    } catch (error) {
      console.error('Error importing translations:', error);
      toast.error('Failed to import translations');
    }
  };

  const getCompletionPercentage = (language) => {
    if (!language.total_keys || language.total_keys === 0) return 0;
    return Math.round((language.translated_keys / language.total_keys) * 100);
  };

  const getCompletionColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600 bg-green-100';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const filteredLanguages = languages.filter(language => {
    const matchesSearch = 
      language.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      language.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      language.native_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && language.is_active) ||
      (statusFilter === 'inactive' && !language.is_active) ||
      (statusFilter === 'default' && language.is_default);

    return matchesSearch && matchesStatus;
  });

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
            Language Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage system languages and translations
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <Link
            to="/admin/languages/translations"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <FileText className="h-4 w-4 mr-2" />
            Manage Translations
          </Link>
          <Link
            to="/admin/languages/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Language
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Globe className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Languages</dt>
                  <dd className="text-lg font-medium text-gray-900">{languages.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Languages</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {languages.filter(l => l.is_active).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Default Language</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {languages.find(l => l.is_default)?.code?.toUpperCase() || 'None'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Translation Keys</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {languages[0]?.total_keys || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Languages
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Search by name, code, or native name..."
              />
            </div>
          </div>

          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Status Filter
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Languages</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="default">Default</option>
            </select>
          </div>
        </div>
      </div>

      {/* Languages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLanguages.length === 0 ? (
          <div className="col-span-full">
            <div className="text-center py-12">
              <Globe className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No languages found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding a new language.
              </p>
              <div className="mt-6">
                <Link
                  to="/admin/languages/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Language
                </Link>
              </div>
            </div>
          </div>
        ) : (
          filteredLanguages.map((language) => {
            const completionPercentage = getCompletionPercentage(language);
            return (
              <div key={language.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Language Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {language.flag_url ? (
                          <img
                            src={language.flag_url}
                            alt={`${language.name} flag`}
                            className="h-8 w-8 rounded object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 bg-gray-100 rounded flex items-center justify-center">
                            <Flag className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {language.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {language.native_name} ({language.code.toUpperCase()})
                        </p>
                      </div>
                    </div>
                    
                    {language.is_default && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Default
                      </span>
                    )}
                  </div>

                  {/* Translation Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Translation Progress</span>
                      <span className={`text-sm font-medium px-2 py-1 rounded ${getCompletionColor(completionPercentage)}`}>
                        {completionPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          completionPercentage >= 90 ? 'bg-green-600' :
                          completionPercentage >= 70 ? 'bg-yellow-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${completionPercentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{language.translated_keys || 0} translated</span>
                      <span>{language.total_keys || 0} total</span>
                    </div>
                  </div>

                  {/* Language Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Direction:</span>
                      <span className="text-gray-900">{language.direction || 'LTR'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Status:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        language.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {language.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleExportTranslations(language.code)}
                        className="text-blue-600 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50"
                        title="Export translations"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <label className="text-green-600 hover:text-green-900 p-2 rounded-md hover:bg-green-50 cursor-pointer">
                        <Upload className="h-4 w-4" />
                        <input
                          type="file"
                          accept=".json"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              handleImportTranslations(language.code, e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      {!language.is_default && (
                        <button
                          onClick={() => handleSetDefault(language.id)}
                          className="text-yellow-600 hover:text-yellow-900 p-2 rounded-md hover:bg-yellow-50"
                          title="Set as default"
                        >
                          <StarOff className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleStatus(language.id, language.is_active)}
                        className={`p-2 rounded-md ${
                          language.is_active 
                            ? 'text-red-600 hover:text-red-900 hover:bg-red-50' 
                            : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                        }`}
                        title={language.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {language.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <Link
                      to={`/admin/languages/${language.id}/translations`}
                      className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                    >
                      Manage Translations
                    </Link>

                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/admin/languages/${language.id}`}
                        className="text-primary-600 hover:text-primary-900 p-2 rounded-md hover:bg-primary-50"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/admin/languages/${language.id}/edit`}
                        className="text-yellow-600 hover:text-yellow-900 p-2 rounded-md hover:bg-yellow-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      {!language.is_default && (
                        <button
                          onClick={() => handleDelete(language.id)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Languages Table (Alternative View) */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Languages Overview</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Language
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Direction
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLanguages.map((language) => {
                  const completionPercentage = getCompletionPercentage(language);
                  return (
                    <tr key={language.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            {language.flag_url ? (
                              <img
                                className="h-8 w-8 rounded object-cover"
                                src={language.flag_url}
                                alt={`${language.name} flag`}
                              />
                            ) : (
                              <div className="h-8 w-8 bg-gray-100 rounded flex items-center justify-center">
                                <Flag className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 flex items-center">
                              {language.name}
                              {language.is_default && (
                                <Star className="h-4 w-4 ml-2 text-yellow-500 fill-current" />
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {language.native_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {language.code.toUpperCase()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className={`h-2 rounded-full ${
                                completionPercentage >= 90 ? 'bg-green-600' :
                                completionPercentage >= 70 ? 'bg-yellow-600' : 'bg-red-600'
                              }`}
                              style={{ width: `${completionPercentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">{completionPercentage}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          language.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {language.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {language.direction || 'LTR'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/admin/languages/${language.id}`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/admin/languages/${language.id}/edit`}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          {!language.is_default && (
                            <button
                              onClick={() => handleDelete(language.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLanguages;