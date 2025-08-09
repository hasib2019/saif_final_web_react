import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  Shield,
  Key,
  Check,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

const UserForm = ({ readOnly = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getLocalized } = useLanguage();
  const isEditMode = Boolean(id);
  const isCreateMode = !isEditMode;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    is_active: true,
    password: '',
    password_confirmation: '',
  });

  useEffect(() => {
    fetchRoles();
    if (isEditMode) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchRoles = async () => {
    try {
      const response = await adminAPI.getRoles();
      setRoles(response.data || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('Failed to load user roles');
    }
  };

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUser(id);
      console.log('User data response:', response);
      
      // Check if response has the expected structure
      if (response && response.data && response.data.success) {
        const userData = response.data.data;
        console.log('Processing user data:', userData);
        
        // Extract role from roles array
        const role = userData.roles && userData.roles.length > 0 ? userData.roles[0].name : 'user';
        
        // Determine if user is active based on email_verified_at
        const is_active = !!userData.email_verified_at;
        
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          role: role,
          is_active: is_active,
          password: '',
          password_confirmation: '',
        });
        
        console.log('Form data set:', {
          name: userData.name,
          email: userData.email,
          role: role,
          is_active: is_active
        });
      } else {
        console.error('Invalid API response format:', response);
        toast.error('Failed to load user data: Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error('Failed to load user data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (readOnly) return;
    
    try {
      setSaving(true);
      
      // Validate form
      if (!formData.name || !formData.email) {
        toast.error('Name and email are required');
        return;
      }
      
      // For create mode, password is required
      if (isCreateMode && (!formData.password || formData.password.length < 8)) {
        toast.error('Password must be at least 8 characters');
        return;
      }
      
      // For create mode, passwords must match
      if (isCreateMode && formData.password !== formData.password_confirmation) {
        toast.error('Passwords do not match');
        return;
      }
      
      // Prepare data for API
      const apiData = { ...formData };
      
      // Only include password fields if they have values
      if (!apiData.password) {
        delete apiData.password;
        delete apiData.password_confirmation;
      }
      
      // For edit mode, convert is_active to email_verified_at
      if (isEditMode) {
        // Set email_verified_at based on is_active status
        apiData.email_verified_at = apiData.is_active ? new Date().toISOString() : null;
        delete apiData.is_active; // Remove is_active as backend doesn't use it
        
        console.log('Sending update data:', apiData);
        
        const response = await adminAPI.updateUser(id, apiData);
        console.log('Update response:', response);
        toast.success('User updated successfully');
      } else {
        console.log('Sending create data:', apiData);
        
        const response = await adminAPI.createUser(apiData);
        console.log('Create response:', response);
        toast.success('User created successfully');
        navigate('/admin/users');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      const errorMessage = error.response?.data?.errors ? 
        Object.values(error.response.data.errors).flat().join(', ') : 
        error.response?.data?.message || 'Failed to save user';
      
      toast.error(errorMessage);
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
            {isCreateMode ? 'Create New User' : readOnly ? 'User Details' : 'Edit User'}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {isCreateMode ? 'Add a new user to the system' : readOnly ? 'View user information' : 'Modify user information'}
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={() => navigate('/admin/users')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowLeft className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
            Back to Users
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200 bg-white shadow rounded-lg p-6">
        <div className="space-y-8 divide-y divide-gray-200">
          <div>
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">User Information</h3>
              <p className="mt-1 text-sm text-gray-500">
                Basic information about the user account.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={readOnly}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={readOnly}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number (Optional)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={readOnly}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  User Role
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    disabled={readOnly}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    {roles.length > 0 ? (
                      roles.map(role => (
                        <option key={role.name} value={role.name}>{role.display_name || role.name}</option>
                      ))
                    ) : (
                      <>
                        <option value="admin">Admin</option>
                        <option value="moderator">Moderator</option>
                        <option value="editor">Editor</option>
                        <option value="user">User</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-6">
                <div className="flex items-center">
                  <input
                    id="is_active"
                    name="is_active"
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={handleChange}
                    disabled={readOnly}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded disabled:cursor-not-allowed"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                    Active Account
                  </label>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Inactive accounts cannot log in to the system.
                </p>
              </div>
            </div>
          </div>

          {!readOnly && (
            <div className="pt-8">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {isCreateMode ? 'Set Password' : 'Change Password'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {isCreateMode 
                    ? 'Create a secure password for this user.' 
                    : 'Leave blank to keep the current password.'}
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password {isCreateMode && <span className="text-red-500">*</span>}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder={isCreateMode ? 'Required' : 'Leave blank to keep current'}
                      required={isCreateMode}
                      minLength={8}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Minimum 8 characters
                  </p>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                    Confirm Password {isCreateMode && <span className="text-red-500">*</span>}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      name="password_confirmation"
                      id="password_confirmation"
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Confirm password"
                      required={isCreateMode}
                      minLength={8}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {!readOnly && (
          <div className="pt-5">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/admin/users')}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <span className="animate-spin -ml-1 mr-2 h-4 w-4 text-white">&#8987;</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="-ml-1 mr-2 h-5 w-5" />
                    {isCreateMode ? 'Create User' : 'Update User'}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default UserForm;