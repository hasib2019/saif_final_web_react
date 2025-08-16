import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { publicAPI } from '../services/api';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';

const Contact = () => {
  const { t, isRTL, getLocalized } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const schema = yup.object({
    name: yup.string().required('Name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    phone: yup.string(),
    company: yup.string(),
    subject: yup.string().required('Subject is required'),
    message: yup.string().required('Message is required').min(10, 'Message must be at least 10 characters'),
    type: yup.string().required('Type is required'),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      type: 'general',
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await publicAPI.submitContactForm(data);
      
      if (response.data.success) {
        toast.success('Message sent successfully! We will get back to you soon.');
        reset();
      } else {
        toast.error(response.data.message || 'Failed to send message');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send message';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [contactInfo, setContactInfo] = useState([
    {
      icon: Mail,
      title: 'Email',
      details: ['Loading...'],
    },
    {
      icon: Phone,
      title: 'Phone',
      details: ['Loading...'],
    },
    {
      icon: MapPin,
      title: 'Address',
      details: ['Loading...'],
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: ['Loading...'],
    },
  ]);
  
  const [mapEmbedCode, setMapEmbedCode] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await publicAPI.getContactInfo();
        
        if (response.data.success && response.data.data) {
          const info = response.data.data;
          
          // Update contact info with data from API
          const updatedInfo = [
            {
              icon: Mail,
              title: 'Email',
              details: info.email ? [info.email] : ['No email available'],
            },
            {
              icon: Phone,
              title: 'Phone',
              details: info.phone ? [info.phone] : ['No phone available'],
            },
            {
              icon: MapPin,
              title: 'Address',
              details: info.address ? info.address.split('\n') : ['No address available'],
            },
            {
              icon: Clock,
              title: 'Business Hours',
              details: info.business_hours ? info.business_hours.split('\n') : ['No business hours available'],
            },
          ];
          
          setContactInfo(updatedInfo);
          setMapEmbedCode(info.map_embed_code || '');
        }
      } catch (error) {
        console.error('Error fetching contact info:', error);
        // Keep default values if there's an error
      } finally {
        setLoading(false);
      }
    };
    
    fetchContactInfo();
  }, []);

  const inquiryTypes = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'contact', label: 'Contact' },
    { value: 'support', label: 'Technical Support' },
    { value: 'quote', label: 'Quote Request' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="py-16 text-white bg-primary-600">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              {t('contact.title')}
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-primary-100">
              Get in touch with our team. We're here to help you with any questions or inquiries.
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Get in Touch</h2>
            <p className="mb-8 text-gray-600">
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>

            <div className="space-y-6">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="flex justify-center items-center w-12 h-12 rounded-lg bg-primary-100">
                        <Icon className="w-6 h-6 text-primary-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-1 text-lg font-semibold text-gray-900">
                        {info.title}
                      </h3>
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-gray-600">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Map */}
            <div className="mt-8">
              {loading ? (
                <div className="flex justify-center items-center w-full h-48 bg-gray-200 rounded-lg">
                  <p className="text-gray-500">Loading map...</p>
                </div>
              ) : mapEmbedCode ? (
                <div className="overflow-hidden w-full h-64 rounded-lg" dangerouslySetInnerHTML={{ __html: mapEmbedCode }} />
              ) : (
                <div className="flex justify-center items-center w-full h-48 bg-gray-200 rounded-lg">
                  <p className="text-gray-500">Map not available</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">Send us a Message</h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700">
                      {t('contact.name')} *
                    </label>
                    <input
                      type="text"
                      id="name"
                      {...register('name')}
                      className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                      placeholder="Your full name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
                      {t('contact.email')} *
                    </label>
                    <input
                      type="email"
                      id="email"
                      {...register('email')}
                      className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                      placeholder="your.email@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-700">
                      {t('contact.phone')}
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      {...register('phone')}
                      className="input-field"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label htmlFor="company" className="block mb-2 text-sm font-medium text-gray-700">
                      {t('contact.company')}
                    </label>
                    <input
                      type="text"
                      id="company"
                      {...register('company')}
                      className="input-field"
                      placeholder="Your company name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="type" className="block mb-2 text-sm font-medium text-gray-700">
                    Inquiry Type *
                  </label>
                  <select
                    id="type"
                    {...register('type')}
                    className={`input-field ${errors.type ? 'border-red-500' : ''}`}
                  >
                    {inquiryTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.type && (
                    <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="subject" className="block mb-2 text-sm font-medium text-gray-700">
                    {t('contact.subject')} *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    {...register('subject')}
                    className={`input-field ${errors.subject ? 'border-red-500' : ''}`}
                    placeholder="Brief description of your inquiry"
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-700">
                    {t('contact.message')} *
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    {...register('message')}
                    className={`input-field ${errors.message ? 'border-red-500' : ''}`}
                    placeholder="Please provide details about your inquiry..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex justify-center items-center px-8 py-3 w-full font-semibold text-white rounded-lg transition-colors duration-200 md:w-auto bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="mr-2 w-5 h-5 rounded-full border-b-2 border-white animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                        {t('contact.send')}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;