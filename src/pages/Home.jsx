import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { publicAPI } from '../services/api';
import { ArrowRight, Star, Users, Award, TrendingUp } from 'lucide-react';

const Home = () => {
  const { t, isRTL, getLocalized } = useLanguage();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [latestNews, setLatestNews] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [productsRes, newsRes, partnersRes] = await Promise.all([
          publicAPI.getProducts({ limit: 6, featured: true }),
          publicAPI.getPressReleases({ limit: 3 }),
          publicAPI.getPartners({ limit: 8 })
        ]);

        if (productsRes.data.success) {
          setFeaturedProducts(productsRes.data.data.data || []);
        }
        if (newsRes.data.success) {
          setLatestNews(newsRes.data.data.data || []);
        }
        if (partnersRes.data.success) {
          setPartners(partnersRes.data.data.data || []);
        }
      } catch (error) {
        console.error('Failed to load home data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const stats = [
    { icon: Users, label: 'Happy Clients', value: '500+' },
    { icon: Award, label: 'Awards Won', value: '25+' },
    { icon: TrendingUp, label: 'Projects Completed', value: '1000+' },
    { icon: Star, label: 'Years Experience', value: '10+' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to{' '}
              <span className="text-yellow-400">{t('company.name')}</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-100">
              Leading the future with innovative technology solutions that transform businesses 
              and empower growth in the digital age.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="inline-flex items-center px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold rounded-lg transition-colors duration-200"
              >
                Explore Products
                <ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'}`} />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center px-8 py-3 border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold rounded-lg transition-colors duration-200"
              >
                {t('contact.title')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                    <Icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Featured {t('products.title')}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Discover our latest and most innovative technology solutions
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <div key={product.id} className="card hover:shadow-lg transition-shadow duration-200">
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {getLocalized(product.name)}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {getLocalized(product.description)}
                  </p>
                  <Link
                    to={`/products/${product.id}`}
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Learn More
                    <ArrowRight className={`w-4 h-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                  </Link>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link
                to="/products"
                className="btn-primary"
              >
                View All Products
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Latest News */}
      {latestNews.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Latest {t('press.title')}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Stay updated with our latest announcements and industry insights
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestNews.map((news) => (
                <article key={news.id} className="card hover:shadow-lg transition-shadow duration-200">
                  {news.featured_image && (
                    <img
                      src={news.featured_image}
                      alt={news.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <div className="text-sm text-gray-500 mb-2">
                    {new Date(news.published_at).toLocaleDateString()}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {getLocalized(news.title)}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {getLocalized(news.excerpt)}
                  </p>
                  <Link
                    to={`/press-releases/${news.id}`}
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {t('press.read_more')}
                    <ArrowRight className={`w-4 h-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                  </Link>
                </article>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link
                to="/press-releases"
                className="btn-primary"
              >
                View All News
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Partners */}
      {partners.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our {t('partners.title')}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Trusted by leading companies worldwide
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8">
              {partners.map((partner) => (
                <div key={partner.id} className="flex items-center justify-center">
                  {partner.logo ? (
                    <img
                      src={partner.logo}
                      alt={getLocalized(partner.name)}
                      className="h-12 w-auto grayscale hover:grayscale-0 transition-all duration-200"
                    />
                  ) : (
                    <div className="h-12 w-24 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-500">{getLocalized(partner.name)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Get in touch with our experts to discuss how we can help you achieve your goals
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center px-8 py-3 bg-white text-primary-600 hover:bg-gray-100 font-semibold rounded-lg transition-colors duration-200"
          >
            {t('contact.title')}
            <ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'}`} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;