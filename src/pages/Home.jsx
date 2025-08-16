import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { publicAPI } from '../services/api';
import { ArrowRight, Star, Users, Award, TrendingUp } from 'lucide-react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const Home = () => {
  const { t, isRTL, getLocalized } = useLanguage();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [latestNews, setLatestNews] = useState([]);
  const [partners, setPartners] = useState([]);
  const [heroSlides, setHeroSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        console.log('Fetching home data...');
        console.log('API URL:', import.meta.env.VITE_API_URL);
        
        // Fetch hero slides
        try {
          const slidesRes = await publicAPI.getHeroSlides();
          console.log('Hero slides response:', slidesRes);
          if (slidesRes.data && slidesRes.data.success) {
            console.log('Setting hero slides:', slidesRes.data.data);
            setHeroSlides(slidesRes.data.data || []);
          } else {
            console.error('Invalid hero slides response structure:', slidesRes);
            console.log('Response data structure:', JSON.stringify(slidesRes.data));
          }
        } catch (slidesError) {
          console.error('Failed to fetch hero slides:', slidesError);
          console.log('Hero slides error details:', slidesError.message, slidesError.stack);
        }
        
        // Fetch products
        try {
          const productsRes = await publicAPI.getProducts({ limit: 6, featured: true });
          console.log('Products response:', productsRes);
          if (productsRes.data && productsRes.data.success) {
            console.log('Setting featured products:', productsRes.data.data.data);
            setFeaturedProducts(productsRes.data.data.data || []);
          } else {
            console.error('Invalid products response structure:', productsRes);
            console.log('Response data structure:', JSON.stringify(productsRes.data));
          }
        } catch (productError) {
          console.error('Failed to fetch products:', productError);
          console.log('Product error details:', productError.message, productError.stack);
        }
        
        // Fetch news
        try {
          const newsRes = await publicAPI.getPressReleases({ limit: 3 });
          console.log('News response:', newsRes);
          if (newsRes.data && newsRes.data.success) {
            console.log('Setting latest news:', newsRes.data.data.data);
            setLatestNews(newsRes.data.data.data || []);
          } else {
            console.error('Invalid news response structure:', newsRes);
            console.log('Response data structure:', JSON.stringify(newsRes.data));
          }
        } catch (newsError) {
          console.error('Failed to fetch news:', newsError);
          console.log('News error details:', newsError.message, newsError.stack);
        }
        
        // Fetch partners
        try {
          const partnersRes = await publicAPI.getPartners({ limit: 8 });
          console.log('Partners response:', partnersRes);
          if (partnersRes.data && partnersRes.data.success) {
            console.log('Setting partners:', partnersRes.data.data.data);
            setPartners(partnersRes.data.data.data || []);
          } else {
            console.error('Invalid partners response structure:', partnersRes);
            console.log('Response data structure:', JSON.stringify(partnersRes.data));
          }
        } catch (partnersError) {
          console.error('Failed to fetch partners:', partnersError);
          console.log('Partners error details:', partnersError.message, partnersError.stack);
        }
      } catch (error) {
        console.error('Failed to load home data:', error);
        console.log('Error details:', error.message, error.stack);
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

  // Hero slider settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    arrows: true,
    adaptiveHeight: true,
    rtl: isRTL,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false
        }
      }
    ]
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - Carousel */}
      <section className="relative overflow-hidden">
        {heroSlides.length > 0 ? (
          <Slider {...sliderSettings} className="hero-slider">
            {heroSlides.map((slide, index) => (
              <div key={slide.id || index} className="relative">
                {/* Background Image */}
                <div className="relative h-[600px] w-full">
                  <img 
                    src={slide.image || slide.background_image} 
                    alt={getLocalized(slide.title)} 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Overlay */}
                  {slide.show_overlay && (
                    <div className="absolute inset-0 bg-black" style={{ opacity: (slide.overlay_opacity || 50) / 100 }}></div>
                  )}
                  
                  {/* Content */}
                  <div className={`relative h-full flex items-center justify-${slide.text_position || 'center'} text-white`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 text-center">
                      <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        {getLocalized(slide.title)}
                      </h1>
                      {getLocalized(slide.subtitle) && (
                        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-100">
                          {getLocalized(slide.subtitle)}
                        </p>
                      )}
                      {getLocalized(slide.button_text) && (
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                          <Link
                            to={slide.button_link || '#'}
                            className="inline-flex items-center px-8 py-3 bg-white hover:bg-gray-100 text-primary-700 font-semibold rounded-lg transition-colors duration-200 shadow-md"
                          >
                            {getLocalized(slide.button_text)}
                            <ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        ) : (
          <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-30"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
              <div className="text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  Welcome to{' '}
                  <span className="text-primary-300">{t('company.name')}</span>
                </h1>
                <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-100">
                  Leading the future with innovative industrial equipment solutions that transform businesses 
                  and empower growth in the manufacturing sector.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/products"
                    className="inline-flex items-center px-8 py-3 bg-white hover:bg-gray-100 text-primary-700 font-semibold rounded-lg transition-colors duration-200 shadow-md"
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
            <div className="absolute -bottom-10 left-0 right-0 h-20 bg-white transform -skew-y-3"></div>
          </div>
        )}
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              About DEROWN Tech
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Industrial Equipment Supplier providing comprehensive solutions across multiple industry sectors
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">DEROWN Service Resources Limited</h3>
              <p className="text-gray-600 mb-6">
                We are a leading industrial equipment supplier dedicated to providing comprehensive solutions across multiple industry sectors. Our commitment to excellence drives us to deliver innovative products and exceptional service.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                    <span className="text-primary-600 text-lg font-bold">✓</span>
                  </div>
                  <p className="text-gray-700"><span className="font-semibold">Industry Leadership:</span> Recognized as pioneers in our field with deep technical expertise</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                    <span className="text-primary-600 text-lg font-bold">✓</span>
                  </div>
                  <p className="text-gray-700"><span className="font-semibold">Quality Standards:</span> Committed to maintaining highest quality standards in all products</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                    <span className="text-primary-600 text-lg font-bold">✓</span>
                  </div>
                  <p className="text-gray-700"><span className="font-semibold">Innovative Design:</span> Continuous research to develop cutting-edge solutions</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="bg-gray-50 p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                      <Icon className="w-8 h-8 text-primary-600" />
                    </div>
                    <div className="text-3xl font-bold text-primary-700 mb-2">{stat.value}</div>
                    <div className="text-gray-600">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Our Products/Services Section */}
      {featuredProducts.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our <span className="text-primary-600">Products</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Discover our comprehensive range of industrial equipment solutions
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100 group">
                  {product.image && (
                    <div className="relative overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors duration-200">
                      {typeof product.name === 'object' ? getLocalized(product.name) : product.name}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {typeof product.description === 'object' ? getLocalized(product.description) : product.description}
                    </p>
                    <Link
                      to={`/products/${product.id}`}
                      className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium group-hover:underline"
                    >
                      Learn More
                      <ArrowRight className={`w-4 h-4 ${isRTL ? 'mr-2' : 'ml-2'} transition-transform group-hover:translate-x-1`} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link
                to="/products"
                className="inline-flex items-center px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md"
              >
                View All Products
                <ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'}`} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Latest News/Press Releases */}
      {latestNews.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Latest <span className="text-primary-600">News</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Stay updated with our latest announcements and industry insights
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestNews.map((news) => (
                <article key={news.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group">
                  {news.featured_image && (
                    <div className="relative overflow-hidden h-48">
                      <img
                        src={news.featured_image}
                        alt={news.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-0 right-0 bg-primary-600 text-white px-3 py-1 text-sm font-medium">
                        {new Date(news.published_at).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors duration-200">
                      {typeof news.title === 'object' ? getLocalized(news.title) : news.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {typeof news.excerpt === 'object' ? getLocalized(news.excerpt) : (news.excerpt || (typeof news.description === 'object' ? getLocalized(news.description) : news.description))}
                    </p>
                    <div className="flex justify-between items-center">
                      <Link
                        to={`/press-releases/${news.id}`}
                        className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium group-hover:underline"
                      >
                        {t('press.read_more')}
                        <ArrowRight className={`w-4 h-4 ${isRTL ? 'mr-2' : 'ml-2'} transition-transform group-hover:translate-x-1`} />
                      </Link>
                      <span className="text-xs text-gray-500 italic">#{news.id}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link
                to="/press-releases"
                className="inline-flex items-center px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md"
              >
                View All News
                <ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'}`} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Our Partners Section */}
      {partners.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our <span className="text-primary-600">Partners</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Trusted by leading industrial companies worldwide
              </p>
            </div>
            
            <div className="bg-gray-50 py-12 px-6 rounded-xl shadow-sm border border-gray-100">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
                {partners.map((partner) => (
                  <div key={partner.id} className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 w-full h-32">
                    {partner.logo ? (
                      <img
                        src={partner.logo}
                        alt={typeof partner.name === 'object' ? getLocalized(partner.name) : partner.name}
                        className="max-h-20 w-auto hover:scale-105 transition-all duration-200"
                      />
                    ) : (
                      <div className="h-20 w-full bg-gray-100 rounded flex items-center justify-center p-4">
                        <span className="text-sm font-medium text-gray-700">{typeof partner.name === 'object' ? getLocalized(partner.name) : partner.name}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center mt-12 space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full">
                  <span className="text-2xl font-bold text-primary-600">50+</span>
                </div>
                <p className="text-lg font-medium text-gray-700">Global Partners</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-800"></div>
        <div className="absolute inset-0 opacity-10 bg-grid-pattern"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Work Together?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Contact us today to discuss your project requirements and discover how we can help you achieve your goals
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center px-8 py-3 bg-white text-primary-700 hover:bg-gray-100 font-semibold rounded-lg transition-colors duration-200 shadow-lg"
            >
              {t('contact.title')}
              <ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'}`} />
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-3 border-2 border-white text-white hover:bg-white hover:text-primary-700 font-semibold rounded-lg transition-colors duration-200"
            >
              Our Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;