import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { publicAPI } from '../services/api';
import { Search, Calendar, Clock, ArrowRight, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

const News = () => {
  const { t, isRTL, getLocalized } = useLanguage();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('published_at');

  useEffect(() => {
    fetchNews();
  }, [currentPage, searchTerm, sortBy]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        search: searchTerm,
        sort: sortBy,
        per_page: 12,
      };

      const response = await publicAPI.getPressReleases(params);
      if (response.data.success) {
        setNews(response.data.data.data);
        setTotalPages(response.data.data.last_page);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchNews();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getReadingTime = (content) => {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  const NewsCard = ({ article, featured = false }) => (
    <article className={`card group hover:shadow-lg transition-all duration-300 ${featured ? 'md:col-span-2 lg:col-span-3' : ''}`}>
      <div className={`${featured ? 'md:flex md:gap-6' : ''}`}>
        <div className={`relative overflow-hidden rounded-lg mb-4 ${featured ? 'md:w-1/2 md:mb-0' : ''}`}>
          <img
            src={article.featured_image || '/api/placeholder/600/400'}
            alt={getLocalized(article.title)}
            className={`w-full object-cover group-hover:scale-105 transition-transform duration-300 ${
              featured ? 'h-64 md:h-80' : 'h-48'
            }`}
          />
          <div className="absolute top-4 left-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {article.type || 'News'}
          </div>
        </div>
        
        <div className={`${featured ? 'md:w-1/2 flex flex-col' : ''}`}>
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{formatDate(article.published_at)}</span>
            <span className="mx-2">•</span>
            <Clock className="w-4 h-4 mr-2" />
            <span>{getReadingTime(article.content)}</span>
          </div>
          
          <h2 className={`font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors ${
            featured ? 'text-2xl md:text-3xl' : 'text-xl'
          }`}>
            <Link to={`/news/${article.slug}`}>
              {getLocalized(article.title)}
            </Link>
          </h2>
          
          <p className={`text-gray-600 mb-4 ${featured ? 'text-lg flex-1' : ''}`}>
            {getLocalized(article.excerpt) || getLocalized(article.content)?.replace(/<[^>]*>/g, '').substring(0, 150) + '...'}
          </p>
          
          <div className="flex items-center justify-between">
            <Link
              to={`/news/${article.slug}`}
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold transition-colors"
            >
              Read More
              <ArrowRight className={`w-4 h-4 ${isRTL ? 'mr-2' : 'ml-2'} group-hover:translate-x-1 transition-transform`} />
            </Link>
            
            {article.author && (
              <div className="text-sm text-gray-500">
                By {article.author}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('news.title')}
            </h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              Stay updated with the latest news, insights, and developments from Derown Technology.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search news and articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </form>

            {/* Sort */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="published_at">Latest First</option>
                  <option value="title">Alphabetical</option>
                  <option value="views">Most Popular</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* News Articles */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : news.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {news.map((article, index) => (
                <NewsCard 
                  key={article.id} 
                  article={article} 
                  featured={index === 0 && currentPage === 1}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 border rounded-lg transition-colors ${
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
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or check back later for new content.</p>
          </div>
        )}

        {/* Newsletter Signup */}
        <div className="bg-primary-600 text-white rounded-lg p-8 mt-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
            <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
              Subscribe to our newsletter to receive the latest news, insights, and updates directly in your inbox.
            </p>
            <form className="max-w-md mx-auto flex gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary-300 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-white text-primary-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default News;