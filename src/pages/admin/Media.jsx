import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import {
  Upload,
  Search,
  Trash2,
  Download,
  Eye,
  Image,
  File,
  Video,
  Music,
  FileText,
  Grid,
  List,
  Filter,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminMedia = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const response = await adminAPI.getMedia();
      setMedia(response.data.data || []);
    } catch (error) {
      console.error('Error fetching media:', error);
      toast.error('Failed to fetch media files');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });

    try {
      await adminAPI.uploadMedia(formData);
      toast.success(`${files.length} file(s) uploaded successfully`);
      fetchMedia();
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDelete = async (mediaId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await adminAPI.deleteMedia(mediaId);
        toast.success('File deleted successfully');
        fetchMedia();
      } catch (error) {
        console.error('Error deleting file:', error);
        toast.error('Failed to delete file');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedFiles.length} selected file(s)?`)) {
      try {
        await Promise.all(
          selectedFiles.map(id => adminAPI.deleteMedia(id))
        );
        toast.success(`${selectedFiles.length} file(s) deleted successfully`);
        setSelectedFiles([]);
        fetchMedia();
      } catch (error) {
        console.error('Error deleting files:', error);
        toast.error('Failed to delete files');
      }
    }
  };

  const getFileIcon = (type) => {
    if (type?.startsWith('image/')) return Image;
    if (type?.startsWith('video/')) return Video;
    if (type?.startsWith('audio/')) return Music;
    if (type?.includes('pdf') || type?.includes('document')) return FileText;
    return File;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredMedia = media.filter(item => {
    const matchesSearch = item.original_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.alt_text?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || item.mime_type?.startsWith(selectedType);
    return matchesSearch && matchesType;
  });

  const fileTypes = [
    { value: '', label: 'All Files' },
    { value: 'image', label: 'Images' },
    { value: 'video', label: 'Videos' },
    { value: 'audio', label: 'Audio' },
    { value: 'application', label: 'Documents' },
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
            Media Library
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage images, videos, documents and other media files
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          {selectedFiles.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected ({selectedFiles.length})
            </button>
          )}
          <label className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer">
            <Upload className={`h-4 w-4 mr-2 ${uploading ? 'animate-spin' : ''}`} />
            {uploading ? 'Uploading...' : 'Upload Files'}
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Files
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
                placeholder="Search by filename or alt text..."
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-2">
              File Type
            </label>
            <select
              id="type-filter"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              {fileTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              View Mode
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${
                  viewMode === 'grid'
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${
                  viewMode === 'list'
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Media Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredMedia.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No media files</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by uploading some files.
              </p>
            </div>
          ) : (
            filteredMedia.map((item) => {
              const FileIcon = getFileIcon(item.mime_type);
              const isSelected = selectedFiles.includes(item.id);
              
              return (
                <div
                  key={item.id}
                  className={`relative group bg-white rounded-lg shadow hover:shadow-md transition-shadow ${
                    isSelected ? 'ring-2 ring-primary-500' : ''
                  }`}
                >
                  <div className="aspect-square p-4">
                    {item.mime_type?.startsWith('image/') ? (
                      <img
                        src={item.url}
                        alt={item.alt_text || item.original_name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-md">
                        <FileIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {item.original_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(item.size)}
                    </p>
                  </div>

                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                    <button
                      onClick={() => {
                        if (isSelected) {
                          setSelectedFiles(prev => prev.filter(id => id !== item.id));
                        } else {
                          setSelectedFiles(prev => [...prev, item.id]);
                        }
                      }}
                      className={`p-2 rounded-full ${
                        isSelected ? 'bg-primary-600' : 'bg-white'
                      } text-${isSelected ? 'white' : 'gray-700'} hover:bg-primary-700`}
                    >
                      {isSelected ? <X className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <a
                      href={item.url}
                      download={item.original_name}
                      className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 bg-red-600 rounded-full text-white hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedFiles.length === filteredMedia.length && filteredMedia.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFiles(filteredMedia.map(item => item.id));
                          } else {
                            setSelectedFiles([]);
                          }
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uploaded
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMedia.map((item) => {
                    const FileIcon = getFileIcon(item.mime_type);
                    const isSelected = selectedFiles.includes(item.id);
                    
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedFiles(prev => [...prev, item.id]);
                              } else {
                                setSelectedFiles(prev => prev.filter(id => id !== item.id));
                              }
                            }}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {item.mime_type?.startsWith('image/') ? (
                                <img
                                  className="h-10 w-10 rounded-lg object-cover"
                                  src={item.url}
                                  alt={item.alt_text || item.original_name}
                                />
                              ) : (
                                <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <FileIcon className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {item.original_name}
                              </div>
                              {item.alt_text && (
                                <div className="text-sm text-gray-500">
                                  {item.alt_text}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.mime_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatFileSize(item.size)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(item.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-900"
                            >
                              <Eye className="h-4 w-4" />
                            </a>
                            <a
                              href={item.url}
                              download={item.original_name}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
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
      )}
    </div>
  );
};

export default AdminMedia;