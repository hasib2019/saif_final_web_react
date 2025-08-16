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
  Calendar,
  FileText,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { getLocalized } = useLanguage();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await adminAPI.getPressReleases();
      console.log('API Response:', response); // Debug log
      console.log('API Response Data:', response.data); // Debug log
      
      // Handle the specific response format from the API
      if (response && response.data) {
        let newsData;
        
        // Check if the response has the pagination format
        if (response.data.data && Array.isArray(response.data.data)) {
          newsData = response.data.data;
        } 
        // Check if the response has the success format
        else if (response.data.success && response.data.data && response.data.data.data) {
          newsData = response.data.data.data;
        }
        // Fallback to the response data itself
        else {
          newsData = Array.isArray(response.data) ? response.data : [];
        }
        
        console.log('News Data:', newsData); // Debug log
        console.log('News Data Type:', Array.isArray(newsData) ? 'Array' : typeof newsData); // Debug log
        console.log('News Data Length:', Array.isArray(newsData) ? newsData.length : 'Not an array'); // Debug log
        
        setNews(Array.isArray(newsData) ? newsData : []);
      } else {
        console.error('Invalid response format:', response);
        toast.error('Invalid response format from server');
        setNews([]);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      toast.error('Failed to fetch news');
      setNews([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (newsId) => {
    if (!newsId) {
      toast.error('Cannot delete: Invalid news ID');
      return;
    }
    if (window.confirm('Are you sure you want to delete this news article?')) {
      try {
        await adminAPI.deletePressRelease(newsId);
        toast.success('News article deleted successfully');
        fetchNews();
      } catch (error) {
        console.error('Error deleting news:', error);
        toast.error('Failed to delete news article');
      }
    }
  };

  const handleToggleStatus = async (newsId, currentStatus) => {
    if (!newsId) {
      toast.error('Cannot update status: Invalid news ID');
      return;
    }
    try {
      console.log(`Toggling status for news ID ${newsId} from ${currentStatus} to ${!currentStatus}`);
      
      // First fetch the current press release data
      const currentData = await adminAPI.getPressRelease(newsId);
      console.log('Current press release data:', currentData);
      
      if (!currentData || !currentData.data) {
        throw new Error('Failed to fetch current press release data');
      }
      
      const pressReleaseData = currentData.data.success && currentData.data.data ? 
        currentData.data.data : currentData.data;
      
      // Create a structured data object for the API with all required fields
      const updateData = {
        title: pressReleaseData.title || { en: '', ar: '' },
        content: pressReleaseData.content || { en: '', ar: '' },
        description: pressReleaseData.description || { en: '', ar: '' },
        is_active: !currentStatus,
        published_at: pressReleaseData.published_at || null
      };
      
      console.log('Sending update data:', updateData);
      
      const response = await adminAPI.updatePressRelease(newsId, updateData);
      console.log('Status update response:', response);
      
      toast.success('News status updated successfully');
      fetchNews();
    } catch (error) {
      console.error('Error updating news status:', error);
      toast.error('Failed to update news status: ' + (error.response?.data?.message || error.message));
    }
  };

  // Ensure news is an array before filtering
  const filteredNews = Array.isArray(news) 
    ? news.filter(item =>
        getLocalized(item?.title)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getLocalized(item?.excerpt)?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

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
            News & Press Releases
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage news articles and press releases
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            to="/admin/news/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add News Article
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search News
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
                placeholder="Search by title or excerpt..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* News Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Excerpt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Published Date
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
                {filteredNews.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-sm text-gray-500">
                      No news articles found
                    </td>
                  </tr>
                ) : (
                  filteredNews.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                              <FileText className="h-5 w-5 text-primary-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                              {getLocalized(item?.title) || 'Untitled'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {getLocalized(item?.excerpt) || 'No excerpt available'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {item?.published_date ? new Date(item.published_date).toLocaleDateString() : 'Not set'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(item?.id, item?.is_active)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item?.is_active 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {item?.is_active ? (
                            <ToggleRight className="h-4 w-4 mr-1" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 mr-1" />
                          )}
                          {item?.is_active ? 'Published' : 'Draft'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item?.created_at ? new Date(item.created_at).toLocaleDateString() : 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/admin/news/${item?.id || ''}`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/admin/news/${item?.id || ''}/edit`}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => item?.id && handleDelete(item.id)}
                            className="text-red-600 hover:text-red-900"
                            disabled={!item?.id}
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

export default AdminNews;