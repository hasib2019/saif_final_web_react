import React, { createContext, useContext, useState, useEffect } from 'react';
import { publicAPI } from '../services/api';
import { getLocalizedContent } from '../utils/multilingual';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [languages, setLanguages] = useState([]);
  const [isRTL, setIsRTL] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load languages from API
  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const response = await publicAPI.getLanguages();
        if (response.data.success) {
          setLanguages(response.data.data);
        }
      } catch (error) {
        console.error('Failed to load languages:', error);
        // Fallback languages
        setLanguages([
          { code: 'en', name: 'English', native_name: 'English', is_rtl: false },
          { code: 'ar', name: 'Arabic', native_name: 'العربية', is_rtl: true }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadLanguages();
  }, []);

  // Load saved language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && languages.length > 0) {
      const language = languages.find(lang => lang.code === savedLanguage);
      if (language) {
        changeLanguage(savedLanguage);
      }
    } else if (languages.length > 0) {
      // Set default language
      changeLanguage('en');
    }
  }, [languages]);

  const changeLanguage = (languageCode) => {
    const language = languages.find(lang => lang.code === languageCode);
    if (!language) return;

    setCurrentLanguage(languageCode);
    setIsRTL(language.is_rtl);
    
    // Save to localStorage
    localStorage.setItem('language', languageCode);
    
    // Update document attributes
    document.documentElement.lang = languageCode;
    document.documentElement.dir = language.is_rtl ? 'rtl' : 'ltr';
    
    // Update body class for styling
    document.body.className = document.body.className.replace(/lang-\w+/, '');
    document.body.classList.add(`lang-${languageCode}`);
  };

  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === currentLanguage);
  };

  const t = (key, fallback = key) => {
    // Simple translation function - in a real app, you'd use a proper i18n library
    const translations = {
      en: {
        // Navigation
        'nav.home': 'Home',
        'nav.about': 'About',
        'nav.products': 'Products',
        'nav.press': 'Press Releases',
        'nav.partners': 'Partners',
        'nav.contact': 'Contact',
        'nav.admin': 'Admin',
        
        // Common
        'common.loading': 'Loading...',
        'common.error': 'Error',
        'common.success': 'Success',
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.view': 'View',
        'common.search': 'Search',
        'common.filter': 'Filter',
        'common.clear': 'Clear',
        'common.submit': 'Submit',
        'common.back': 'Back',
        'common.next': 'Next',
        'common.previous': 'Previous',
        'common.additional_details': 'Additional Details',
        'common.learn_more': 'Learn More',
        
        // Auth
        'auth.login': 'Login',
        'auth.logout': 'Logout',
        'auth.email': 'Email',
        'auth.password': 'Password',
        'auth.remember': 'Remember me',
        'auth.forgot': 'Forgot password?',
        
        // Company
        'company.name': 'Derown Technology',
        'company.mission': 'Mission',
        'company.history': 'History',
        'company.values': 'Values',
        'company.initiatives': 'Initiatives',
        
        // Contact
        'contact.title': 'Contact Us',
        'contact.name': 'Name',
        'contact.email': 'Email',
        'contact.phone': 'Phone',
        'contact.company': 'Company',
        'contact.subject': 'Subject',
        'contact.message': 'Message',
        'contact.send': 'Send Message',
        
        // Products
        'products.title': 'Products',
        'products.category': 'Category',
        'products.price': 'Price',
        'products.description': 'Description',
        
        // Press
        'press.title': 'Press Releases',
        'press.date': 'Date',
        'press.read_more': 'Read More',
        
        // Partners
        'partners.title': 'Partners',
        'partners.website': 'Website',
      },
      ar: {
        // Navigation
        'nav.home': 'الرئيسية',
        'nav.about': 'حول',
        'nav.products': 'المنتجات',
        'nav.press': 'البيانات الصحفية',
        'nav.partners': 'الشركاء',
        'nav.contact': 'اتصل بنا',
        'nav.admin': 'الإدارة',
        
        // Common
        'common.loading': 'جاري التحميل...',
        'common.error': 'خطأ',
        'common.success': 'نجح',
        'common.save': 'حفظ',
        'common.cancel': 'إلغاء',
        'common.delete': 'حذف',
        'common.edit': 'تعديل',
        'common.view': 'عرض',
        'common.search': 'بحث',
        'common.filter': 'تصفية',
        'common.clear': 'مسح',
        'common.submit': 'إرسال',
        'common.back': 'رجوع',
        'common.next': 'التالي',
        'common.previous': 'السابق',
        'common.additional_details': 'تفاصيل إضافية',
        'common.learn_more': 'اعرف المزيد',
        
        // Auth
        'auth.login': 'تسجيل الدخول',
        'auth.logout': 'تسجيل الخروج',
        'auth.email': 'البريد الإلكتروني',
        'auth.password': 'كلمة المرور',
        'auth.remember': 'تذكرني',
        'auth.forgot': 'نسيت كلمة المرور؟',
        
        // Company
        'company.name': 'تكنولوجيا ديراون',
        'company.mission': 'المهمة',
        'company.history': 'التاريخ',
        'company.values': 'القيم',
        'company.initiatives': 'المبادرات',
        
        // Contact
        'contact.title': 'اتصل بنا',
        'contact.name': 'الاسم',
        'contact.email': 'البريد الإلكتروني',
        'contact.phone': 'الهاتف',
        'contact.company': 'الشركة',
        'contact.subject': 'الموضوع',
        'contact.message': 'الرسالة',
        'contact.send': 'إرسال الرسالة',
        
        // Products
        'products.title': 'المنتجات',
        'products.category': 'الفئة',
        'products.price': 'السعر',
        'products.description': 'الوصف',
        
        // Press
        'press.title': 'البيانات الصحفية',
        'press.date': 'التاريخ',
        'press.read_more': 'اقرأ المزيد',
        
        // Partners
        'partners.title': 'الشركاء',
        'partners.website': 'الموقع الإلكتروني',
      }
    };

    return translations[currentLanguage]?.[key] || fallback;
  };

  // Function to get localized content from multilingual objects
  const getLocalized = (content, fallbackLanguage = 'en') => {
    return getLocalizedContent(content, currentLanguage, fallbackLanguage);
  };

  const value = {
    currentLanguage,
    languages,
    isRTL,
    loading,
    changeLanguage,
    getCurrentLanguage,
    t,
    getLocalized,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};