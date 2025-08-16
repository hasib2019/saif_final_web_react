import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Building,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
  Image,
  ArrowLeft,
  Save,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminPartners = ({ isCreating = false, isEditing = false, readOnly = false }) => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [partner, setPartner] = useState({
    name: { en: '', ar: '' },
    description: { en: '', ar: '' },
    website: '',
    order: 0,
    is_active: true,
    logo: null
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const { getLocalized } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (isCreating) {
      setLoading(false);
    } else if (isEditing || readOnly) {
      fetchPartner(id);
    } else {
      fetchPartners();
    }
  }, [id, isCreating, isEditing, readOnly]);

  const fetchPartners = async () => {
    try {
      const response = await adminAPI.getPartners();
      setPartners(response.data.data || []);
    } catch (error) {
      console.error('Error fetching partners:', error);
      toast.error('Failed to fetch partners');
    } finally {
      setLoading(false);
    }
  };

  const fetchPartner = async (partnerId) => {
    try {
      const response = await adminAPI.getPartner(partnerId);
      const partnerData = response.data.data;
      setPartner(partnerData);
      if (partnerData.logo_url) {
        setLogoPreview(partnerData.logo_url);
      }
    } catch (error) {
      console.error('Error fetching partner:', error);
      toast.error('Failed to fetch partner details');
      navigate('/admin/partners');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (partnerId) => {
    if (window.confirm('Are you sure you want to delete this partner?')) {
      try {
        await adminAPI.deletePartner(partnerId);
        toast.success('Partner deleted successfully');
        fetchPartners();
      } catch (error) {
        console.error('Error deleting partner:', error);
        toast.error('Failed to delete partner');
      }
    }
  };

  const handleToggleStatus = async (partnerId, currentStatus) => {
    try {
      await adminAPI.updatePartner(partnerId, {
        is_active: !currentStatus
      });
      toast.success('Partner status updated successfully');
      fetchPartners();
    } catch (error) {
      console.error('Error updating partner status:', error);
      toast.error('Failed to update partner status');
    }
  };

  const filteredPartners = partners.filter(partner =>
    getLocalized(partner.name)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getLocalized(partner.description)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.website?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [field, lang] = name.split('.');
      setPartner(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [lang]: value
        }
      }));
    } else {
      setPartner(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setPartner(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPartner(prev => ({
        ...prev,
        logo: file
      }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    try {
      const formData = new FormData();
      
      // Add all partner data to FormData
      // For name and description fields, send as a string instead of an object
      formData.append('name', JSON.stringify(partner.name));
      formData.append('description', JSON.stringify(partner.description));
      formData.append('website', partner.website);
      formData.append('order', partner.order);
      formData.append('is_active', partner.is_active ? 1 : 0);
      
      if (partner.logo instanceof File) {
        formData.append('logo', partner.logo);
      }
      
      if (isEditing) {
        await adminAPI.updatePartner(id, formData);
        toast.success('Partner updated successfully');
        navigate('/admin/partners');
      } else {
        await adminAPI.createPartner(formData);
        toast.success('Partner created successfully');
        navigate('/admin/partners');
      }
    } catch (error) {
      console.error('Error saving partner:', error);
      
      // Handle validation errors
      if (error.response?.status === 422 && error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        
        // Display the first error message
        const firstErrorField = Object.keys(error.response.data.errors)[0];
        const firstErrorMessage = error.response.data.errors[firstErrorField][0];
        toast.error(`Validation Error: ${firstErrorMessage}`);
      } else {
        toast.error(error.response?.data?.message || 'Failed to save partner');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Partner form for create/edit/view
  if (isCreating || isEditing || readOnly) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {isCreating ? 'Add New Partner' : isEditing ? 'Edit Partner' : 'View Partner'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {isCreating ? 'Create a new business partner' : isEditing ? 'Update partner information' : 'Partner details'}
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              onClick={() => navigate('/admin/partners')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Partners
            </button>
          </div>
        </div>

        {/* Partner Form */}
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Partner Logo</label>
              <div className="flex items-center space-x-6">
                <div className="flex-shrink-0">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Partner logo preview"
                      className="h-24 w-24 object-contain border rounded-lg"
                    />
                  ) : (
                    <div className="h-24 w-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                      <Building className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                {!readOnly && (
                  <div className="flex-1">
                    <input
                      type="file"
                      id="logo"
                      accept="image/jpeg,image/png,image/jpg,image/gif,image/svg+xml"
                      onChange={handleLogoChange}
                      className="hidden"
                      disabled={readOnly}
                    />
                    <label
                      htmlFor="logo"
                      className={`cursor-pointer py-2 px-3 border ${errors.logo ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
                    >
                      <span>Change Logo</span>
                    </label>
                    <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
                    {errors.logo && (
                      <p className="mt-1 text-sm text-red-600">{errors.logo[0]}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name.en" className="block text-sm font-medium text-gray-700 mb-1">
                  Name (English) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name.en"
                  name="name.en"
                  value={partner.name.en}
                  onChange={handleInputChange}
                  required
                  disabled={readOnly}
                  className={`mt-1 block w-full border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>
                )}
              </div>
              <div>
                <label htmlFor="name.ar" className="block text-sm font-medium text-gray-700 mb-1">
                  Name (Arabic) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name.ar"
                  name="name.ar"
                  value={partner.name.ar}
                  onChange={handleInputChange}
                  required
                  disabled={readOnly}
                  className={`mt-1 block w-full border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                  dir="rtl"
                />
              </div>
            </div>

            {/* Description Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="description.en" className="block text-sm font-medium text-gray-700 mb-1">
                  Description (English)
                </label>
                <textarea
                  id="description.en"
                  name="description.en"
                  value={partner.description.en}
                  onChange={handleInputChange}
                  rows="3"
                  disabled={readOnly}
                  className={`mt-1 block w-full border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                ></textarea>
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description[0]}</p>
                )}
              </div>
              <div>
                <label htmlFor="description.ar" className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Arabic)
                </label>
                <textarea
                  id="description.ar"
                  name="description.ar"
                  value={partner.description.ar}
                  onChange={handleInputChange}
                  rows="3"
                  disabled={readOnly}
                  className={`mt-1 block w-full border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                  dir="rtl"
                ></textarea>
              </div>
            </div>

            {/* Website and Order */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={partner.website}
                  onChange={handleInputChange}
                  disabled={readOnly}
                  placeholder="https://example.com"
                  className={`mt-1 block w-full border ${errors.website ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                />
                {errors.website && (
                  <p className="mt-1 text-sm text-red-600">{errors.website[0]}</p>
                )}
              </div>
              <div>
                <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  id="order"
                  name="order"
                  value={partner.order}
                  onChange={handleInputChange}
                  disabled={readOnly}
                  min="0"
                  className={`mt-1 block w-full border ${errors.order ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                />
                <p className="mt-1 text-xs text-gray-500">Lower numbers appear first</p>
                {errors.order && (
                  <p className="mt-1 text-sm text-red-600">{errors.order[0]}</p>
                )}
              </div>
            </div>

            {/* Status */}
            <div>
              <div className="flex items-center">
                <input
                  id="is_active"
                  name="is_active"
                  type="checkbox"
                  checked={partner.is_active}
                  onChange={handleCheckboxChange}
                  disabled={readOnly}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  Active (visible on website)
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="px-6 py-3 bg-gray-50 text-right">
            {!readOnly ? (
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/admin/partners')}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <X className="h-4 w-4 mr-1.5" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Save className="h-4 w-4 mr-1.5" />
                  {isCreating ? 'Create Partner' : 'Update Partner'}
                </button>
              </div>
            ) : (
              <div className="flex justify-end space-x-3">
                <Link
                  to={`/admin/partners/${id}/edit`}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  <Edit className="h-4 w-4 mr-1.5" />
                  Edit Partner
                </Link>
                <button
                  type="button"
                  onClick={() => navigate('/admin/partners')}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <ArrowLeft className="h-4 w-4 mr-1.5" />
                  Back to Partners
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    );
  }

  // Partners list view (default)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Partners & Clients
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage business partners and client relationships
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            to="/admin/partners/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Partner
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Partners
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
                placeholder="Search by name, description, or website..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPartners.length === 0 ? (
          <div className="col-span-full">
            <div className="text-center py-12">
              <Building className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No partners found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding a new partner.
              </p>
              <div className="mt-6">
                <Link
                  to="/admin/partners/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Partner
                </Link>
              </div>
            </div>
          </div>
        ) : (
          filteredPartners.map((partner) => (
            <div key={partner.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Partner Logo/Image */}
                <div className="flex items-center justify-center mb-4">
                  {partner.logo_url ? (
                    <img
                      src={partner.logo_url}
                      alt={getLocalized(partner.name)}
                      className="h-16 w-auto max-w-full object-contain"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Building className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Partner Info */}
                <div className="text-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {getLocalized(partner.name)}
                  </h3>
                  {partner.website && (
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-primary-600 hover:text-primary-900"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Visit Website
                    </a>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-gray-500 mb-4 line-clamp-3 text-center">
                  {getLocalized(partner.description) || 'No description available'}
                </p>

                {/* Status and Actions */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleToggleStatus(partner.id, partner.is_active)}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      partner.is_active 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {partner.is_active ? (
                      <ToggleRight className="h-4 w-4 mr-1" />
                    ) : (
                      <ToggleLeft className="h-4 w-4 mr-1" />
                    )}
                    {partner.is_active ? 'Active' : 'Inactive'}
                  </button>

                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/admin/partners/${partner.id}`}
                      className="text-primary-600 hover:text-primary-900 p-2 rounded-md hover:bg-primary-50"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      to={`/admin/partners/${partner.id}/edit`}
                      className="text-yellow-600 hover:text-yellow-900 p-2 rounded-md hover:bg-yellow-50"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(partner.id)}
                      className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Order: {partner.order || 0}</span>
                    <span>Added: {new Date(partner.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Partners Table (Alternative View) */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Partners List</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Partner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Website
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPartners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {partner.logo_url ? (
                            <img
                              className="h-10 w-10 object-contain"
                              src={partner.logo_url}
                              alt={getLocalized(partner.name)}
                            />
                          ) : (
                            <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Building className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {getLocalized(partner.name)}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {getLocalized(partner.description)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {partner.website ? (
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-900 text-sm flex items-center"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Visit
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">No website</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {partner.order || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        partner.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {partner.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(partner.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/admin/partners/${partner.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/admin/partners/${partner.id}/edit`}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(partner.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPartners;