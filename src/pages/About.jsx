import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { publicAPI } from '../services/api';
import { Users, Target, Award, Globe, TrendingUp, Shield } from 'lucide-react';

const About = () => {
  const { t, isRTL, getLocalized } = useLanguage();
  const [companyInfo, setCompanyInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const response = await publicAPI.getCompanyInfo();
        if (response.data.success) {
          setCompanyInfo(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching company info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyInfo();
  }, []);

  const values = [
    {
      icon: Target,
      title: 'Innovation',
      description: 'We constantly push the boundaries of technology to deliver cutting-edge solutions that drive business growth.',
    },
    {
      icon: Shield,
      title: 'Reliability',
      description: 'Our commitment to quality and reliability ensures that our clients can depend on us for their critical business needs.',
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'We believe in the power of teamwork and collaboration, both within our organization and with our clients.',
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'With a global perspective, we serve clients worldwide while maintaining local expertise and understanding.',
    },
    {
      icon: TrendingUp,
      title: 'Growth',
      description: 'We are committed to continuous growth and improvement, both for our company and our clients.',
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'Excellence is not just a goal but a standard we maintain in every project and client interaction.',
    },
  ];

  const stats = [
    { number: '500+', label: 'Projects Completed' },
    { number: '50+', label: 'Happy Clients' },
    { number: '10+', label: 'Years Experience' },
    { number: '25+', label: 'Team Members' },
  ];

  const timeline = [
    {
      year: '2014',
      title: 'Company Founded',
      description: 'Derown Technology was established with a vision to transform businesses through innovative technology solutions.',
    },
    {
      year: '2016',
      title: 'First Major Client',
      description: 'Secured our first enterprise client and delivered a comprehensive digital transformation project.',
    },
    {
      year: '2018',
      title: 'International Expansion',
      description: 'Expanded operations internationally and established partnerships across multiple countries.',
    },
    {
      year: '2020',
      title: 'Digital Innovation Hub',
      description: 'Launched our digital innovation hub focusing on AI, IoT, and cloud technologies.',
    },
    {
      year: '2022',
      title: 'Industry Recognition',
      description: 'Received multiple industry awards for excellence in technology solutions and client satisfaction.',
    },
    {
      year: '2024',
      title: 'Future Vision',
      description: 'Continuing to lead in emerging technologies and sustainable business solutions.',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('about.title')}
            </h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              Discover our journey, values, and commitment to delivering exceptional technology solutions.
            </p>
          </div>
        </div>
      </div>

      {/* Company Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Who We Are
            </h2>
            <div className="prose prose-lg text-gray-600">
              {companyInfo?.about ? (
                <div dangerouslySetInnerHTML={{ __html: getLocalized(companyInfo.about) }} />
              ) : (
                <>
                  <p>
                    Derown Technology is a leading provider of innovative technology solutions, 
                    dedicated to helping businesses transform and thrive in the digital age. 
                    Since our founding in 2014, we have been at the forefront of technological 
                    innovation, delivering cutting-edge solutions that drive growth and success.
                  </p>
                  <p>
                    Our team of experienced professionals combines deep technical expertise 
                    with a thorough understanding of business needs to deliver solutions that 
                    not only meet current requirements but also position our clients for future success.
                  </p>
                </>
              )}
            </div>
          </div>
          <div>
            <img
              src="/api/placeholder/600/400"
              alt="About Derown Technology"
              className="rounded-lg shadow-lg w-full h-auto"
            />
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Impact in Numbers
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These numbers reflect our commitment to excellence and the trust our clients place in us.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Our Core Values
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            These values guide everything we do and shape our relationships with clients, partners, and team members.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div key={index} className="card text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A timeline of key milestones that have shaped our company and defined our path forward.
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-gray-200"></div>

            <div className="space-y-12">
              {timeline.map((item, index) => (
                <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  {/* Timeline dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary-600 rounded-full border-4 border-white shadow-lg z-10"></div>
                  
                  {/* Content */}
                  <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="card">
                      <div className="text-2xl font-bold text-primary-600 mb-2">
                        {item.year}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {getLocalized(item.title)}
                      </h3>
                      <p className="text-gray-600">
                        {getLocalized(item.description)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="card">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Our Mission
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              {getLocalized(companyInfo?.mission) || 
                "To empower businesses with innovative technology solutions that drive growth, efficiency, and competitive advantage in an ever-evolving digital landscape."
              }
            </p>
          </div>
          
          <div className="card">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Our Vision
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              {getLocalized(companyInfo?.vision) || 
                "To be the global leader in technology innovation, creating solutions that transform industries and improve lives while building a sustainable future for all."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;