/**
 * Utility functions for handling multilingual content
 */

/**
 * Get the localized value from a multilingual object
 * @param {Object|string} content - The multilingual content object or string
 * @param {string} currentLanguage - The current language code (e.g., 'en', 'ar')
 * @param {string} fallbackLanguage - The fallback language code (default: 'en')
 * @returns {string} The localized content
 */
export const getLocalizedContent = (content, currentLanguage = 'en', fallbackLanguage = 'en') => {
  // If content is already a string, return it
  if (typeof content === 'string') {
    return content;
  }

  // If content is null or undefined, return empty string
  if (!content) {
    return '';
  }

  // If content is an object with language keys
  if (typeof content === 'object' && content !== null) {
    // Try to get content in current language
    if (content[currentLanguage]) {
      return content[currentLanguage];
    }

    // Try to get content in fallback language
    if (content[fallbackLanguage]) {
      return content[fallbackLanguage];
    }

    // Try to get the first available language
    const availableLanguages = Object.keys(content);
    if (availableLanguages.length > 0) {
      return content[availableLanguages[0]];
    }
  }

  // Return empty string if nothing found
  return '';
};

/**
 * Hook to get localized content with current language context
 * @param {Function} useLanguage - The useLanguage hook from LanguageContext
 * @returns {Function} Function to get localized content
 */
export const useLocalizedContent = (useLanguage) => {
  const { currentLanguage } = useLanguage();
  
  return (content, fallbackLanguage = 'en') => {
    return getLocalizedContent(content, currentLanguage, fallbackLanguage);
  };
};