import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  Filter,
  Download,
  Star,
  StarOff,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminContact = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const { getLocalized } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  
  console.log('Auth state:', { user, isAuthenticated });

  useEffect(() => {
    if (isAuthenticated) {
      fetchContacts();
    } else {
      console.warn('User is not authenticated. Cannot fetch contacts.');
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchContacts = async () => {
    try {
      // Use the correct API method for form submissions
      console.log('Fetching form submissions...');
      const response = await adminAPI.getFormSubmissions();
      console.log('Contact submissions response:', response);
      
      // Make sure we're handling the response data structure correctly
      if (response.data && response.data.success && response.data.data) {
        // Backend returns data in a nested data property within success response
        console.log('Setting contacts from response.data.data:', response.data.data.data);
        setContacts(response.data.data.data);
      } else if (response.data && response.data.data && Array.isArray(response.data.data.data)) {
        // Handle the nested data structure correctly
        console.log('Setting contacts from response.data.data.data array:', response.data.data.data);
        setContacts(response.data.data.data);
      } else if (Array.isArray(response.data)) {
        console.log('Setting contacts from response.data array:', response.data);
        setContacts(response.data);
      } else {
        // Fallback to empty array for any other case
        console.warn('Unexpected response format:', response.data);
        setContacts([]);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      console.error('Error details:', error.response ? error.response.data : 'No response data');
      toast.error('Failed to fetch contact submissions');
      // Ensure contacts is always an array even on error
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (contactId) => {
    if (window.confirm('Are you sure you want to delete this contact submission?')) {
      try {
        await adminAPI.deleteFormSubmission(contactId);
        toast.success('Contact submission deleted successfully');
        fetchContacts();
      } catch (error) {
        console.error('Error deleting contact:', error);
        toast.error('Failed to delete contact submission');
      }
    }
  };

  const handleMarkAsRead = async (contactId, isRead) => {
    try {
      await adminAPI.updateFormSubmission(contactId, {
        is_read: !isRead
      });
      toast.success(`Contact marked as ${!isRead ? 'read' : 'unread'}`);
      fetchContacts();
    } catch (error) {
      console.error('Error updating contact status:', error);
      toast.error('Failed to update contact status');
    }
  };

  const handleMarkAsImportant = async (contactId, isImportant) => {
    try {
      await adminAPI.updateFormSubmission(contactId, {
        is_important: !isImportant
      });
      toast.success(`Contact marked as ${!isImportant ? 'important' : 'normal'}`);
      fetchContacts();
    } catch (error) {
      console.error('Error updating contact importance:', error);
      toast.error('Failed to update contact importance');
    }
  };

  const handleReply = async (contactId) => {
    // This would typically open a modal or navigate to a reply page
    toast.info('Reply functionality would be implemented here');
  };

  const exportContacts = () => {
    // Export functionality
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Email,Phone,Subject,Message,Type,Status,Date\n"
      + filteredContacts.map(contact => 
          `"${contact.name}","${contact.email}","${contact.phone || ''}","${contact.subject}","${contact.message}","${contact.type || 'general'}","${contact.is_read ? 'Read' : 'Unread'}","${new Date(contact.created_at).toLocaleDateString()}"`
        ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "contact_submissions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Remove the test contact code that was forcing a test contact to show
  console.log('Contacts before filtering:', contacts);
  
  let filteredContacts = [];
  
  if (contacts?.filter) {
    filteredContacts = contacts.filter(contact => {
      const matchesSearch = searchTerm === '' || (
        (contact.name && contact.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (contact.subject && contact.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (contact.message && contact.message.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'read' && contact.is_read) ||
        (statusFilter === 'unread' && !contact.is_read) ||
        (statusFilter === 'important' && contact.is_important);

      const matchesType = typeFilter === 'all' || contact.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }
  
  console.log('Filtered contacts:', filteredContacts);
  
  // Remove the test contact code
  // if (filteredContacts.length === 0 && contacts?.length > 0) {
  //   console.log('No filtered contacts but we have contacts, showing test contact');
  //   filteredContacts = [contacts.find(c => c.name === 'Test Contact') || contacts[0]];
  // }

  const getStatusColor = (contact) => {
    if (contact.is_important) return 'bg-red-100 text-red-800';
    if (!contact.is_read) return 'bg-blue-100 text-blue-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (contact) => {
    if (contact.is_important) return 'Important';
    if (!contact.is_read) return 'Unread';
    return 'Read';
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
            Contact Submissions
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage customer inquiries and contact form submissions
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <button
            onClick={exportContacts}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
          <Link
            to="/admin/contact/settings"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Edit className="h-4 w-4 mr-2" />
            Contact Settings
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessageSquare className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Submissions</dt>
                  <dd className="text-lg font-medium text-gray-900">{contacts?.length || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Mail className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Unread</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {contacts?.filter ? contacts.filter(c => !c.is_read).length : 0}
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
                <Star className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Important</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {contacts?.filter ? contacts.filter(c => c.is_important).length : 0}
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
                <Clock className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Today</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {contacts?.filter ? contacts.filter(c => 
                      new Date(c.created_at).toDateString() === new Date().toDateString()
                    ).length : 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Submissions
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
                placeholder="Search by name, email, subject, or message..."
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
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="important">Important</option>
            </select>
          </div>

          <div>
            <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Type Filter
            </label>
            <select
              id="type-filter"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Types</option>
              <option value="general">General Inquiry</option>
              <option value="support">Support</option>
              <option value="sales">Sales</option>
              <option value="partnership">Partnership</option>
              <option value="complaint">Complaint</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contact Submissions Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject & Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No contact submissions</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        No contact submissions match your current filters.
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Debug info: Contacts array length: {contacts?.length || 0}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((contact) => (
                    <tr key={contact.id} className={`hover:bg-gray-50 ${!contact.is_read ? 'bg-blue-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {contact.name}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {contact.email}
                            </div>
                            {contact.phone && (
                              <div className="text-sm text-gray-500 flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {contact.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {contact.subject}
                        </div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {contact.message}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          {contact.type || 'General'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(contact)}`}>
                          {getStatusText(contact)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{new Date(contact.created_at).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(contact.created_at).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleMarkAsImportant(contact.id, contact.is_important)}
                            className={`p-2 rounded-md ${
                              contact.is_important 
                                ? 'text-red-600 hover:text-red-900 hover:bg-red-50' 
                                : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                            }`}
                            title={contact.is_important ? 'Remove from important' : 'Mark as important'}
                          >
                            {contact.is_important ? <Star className="h-4 w-4 fill-current" /> : <StarOff className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleMarkAsRead(contact.id, contact.is_read)}
                            className={`p-2 rounded-md ${
                              contact.is_read 
                                ? 'text-gray-400 hover:text-blue-600 hover:bg-blue-50' 
                                : 'text-blue-600 hover:text-blue-900 hover:bg-blue-50'
                            }`}
                            title={contact.is_read ? 'Mark as unread' : 'Mark as read'}
                          >
                            {contact.is_read ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </button>
                          <Link
                            to={`/admin/contact/${contact.id}`}
                            className="text-primary-600 hover:text-primary-900 p-2 rounded-md hover:bg-primary-50"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleReply(contact.id)}
                            className="text-green-600 hover:text-green-900 p-2 rounded-md hover:bg-green-50"
                          >
                            <Mail className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(contact.id)}
                            className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContact;