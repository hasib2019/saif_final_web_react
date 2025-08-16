import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { publicAPI } from '../services/api';
import { Search, Filter, Grid, List, ChevronDown, Star, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const Products = () => {
  const { t, isRTL, getLocalized } = useLanguage();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [currentPage, searchTerm, selectedCategory, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        search: searchTerm,
        category: selectedCategory,
        sort: sortBy,
        per_page: 12,
      };

      const response = await publicAPI.getProducts(params);
      if (response.data.success) {
        setProducts(response.data.data.data);
        setTotalPages(response.data.data.last_page);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await publicAPI.getProductCategories();
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handleSortChange = (sortOption) => {
    setSortBy(sortOption);
    setCurrentPage(1);
  };

  const ProductCard = ({ product }) => (
    <div className="card group hover:shadow-lg transition-shadow duration-300">
      <div className="relative overflow-hidden rounded-lg mb-4">
        <img
            src={product.images && product.images.length > 0 ? `http://127.0.0.1:8000/storage/${product.images[0]}` : '/api/placeholder/400/300'}
            alt={getLocalized(product.name)}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        {product.is_featured && (
          <div className="absolute top-2 left-2 bg-primary-600 text-white px-2 py-1 rounded text-xs font-semibold">
            Featured
          </div>
        )}
        <div className="absolute top-2 right-2 flex items-center bg-white rounded px-2 py-1 text-xs">
          <Star className="w-3 h-3 text-yellow-400 mr-1" />
          <span className="font-semibold">4.8</span>
        </div>
      </div>
      
      <div className="flex-1">
        <div className="mb-2">
          <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
            {getLocalized(product.category?.name)}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
          {getLocalized(product.name)}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {getLocalized(product.short_description)}
        </p>
        
        <div className="flex items-center justify-between">
          <Link
            to={`/products/${product.slug}`}
            className="btn-primary text-sm"
          >
            Learn More
          </Link>
          
          {product.external_link && (
            <a
              href={product.external_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary-600 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );

  const ProductListItem = ({ product }) => (
    <div className="card flex flex-col md:flex-row gap-6 hover:shadow-lg transition-shadow duration-300">
      <div className="md:w-1/3">
        <div className="relative overflow-hidden rounded-lg">
          <img
            src={product.images && product.images.length > 0 ? `http://127.0.0.1:8000/storage/${product.images[0]}` : '/api/placeholder/400/300'}
            alt={getLocalized(product.name)}
            className="w-full h-48 md:h-32 object-cover"
          />
          {product.is_featured && (
            <div className="absolute top-2 left-2 bg-primary-600 text-white px-2 py-1 rounded text-xs font-semibold">
              Featured
            </div>
          )}
        </div>
      </div>
      
      <div className="md:w-2/3 flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <div>
            <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded mb-2">
              {getLocalized(product.category?.name)}
            </span>
            <h3 className="text-xl font-semibold text-gray-900 hover:text-primary-600 transition-colors">
              {getLocalized(product.name)}
            </h3>
          </div>
          <div className="flex items-center bg-white rounded px-2 py-1 text-xs">
            <Star className="w-3 h-3 text-yellow-400 mr-1" />
            <span className="font-semibold">4.8</span>
          </div>
        </div>
        
        <p className="text-gray-600 mb-4 flex-1">
          {getLocalized(product.short_description)}
        </p>
        
        <div className="flex items-center justify-between">
          <Link
            to={`/products/${product.slug}`}
            className="btn-primary"
          >
            Learn More
          </Link>
          
          {product.external_link && (
            <a
              href={product.external_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary-600 transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('products.title')}
            </h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              Discover our comprehensive range of innovative technology solutions designed to transform your business.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </form>

            {/* Controls */}
            <div className="flex items-center gap-4">
              {/* Category Filter */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {getLocalized(category.name)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="name">Sort by Name</option>
                  <option value="created_at">Sort by Date</option>
                  <option value="featured">Featured First</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* View Mode */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : products.length > 0 ? (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="space-y-6 mb-8">
                {products.map((product) => (
                  <ProductListItem key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 border rounded-lg ${
                        currentPage === page
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or browse all categories.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;