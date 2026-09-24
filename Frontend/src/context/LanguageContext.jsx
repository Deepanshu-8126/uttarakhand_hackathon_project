import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    nav_explore: 'Explore',
    nav_planner: 'Trip Planner',
    nav_stays: 'Stays',
    nav_rentals: 'Rentals',
    nav_spiritual: 'Spiritual',
    nav_map: 'Map',
    nav_copilot: 'AI Copilot',
    nav_signin: 'Sign In',
    nav_signout: 'Sign Out',
    nav_profile: 'Profile',
    nav_plantrip: 'Plan Trip',
    hero_title: 'Experience Sacred Uttarakhand',
    hero_subtitle: 'Discover serene high-altitude shrines, pristine trails, and authentic Himalayan stays.',
    hero_cta: 'Explore Destinations',
    search_placeholder: 'Search 200+ destinations, valleys, or shrines...',
    category_spiritual: 'Spiritual & Sacred',
    category_adventure: 'Adventure & Treks',
    category_stays: 'Eco & Heritage Stays',
    category_culture: 'Culture & Living',
    auth_welcome_back: 'Welcome Back',
    auth_create_account: 'Create Your Account',
    auth_email_phone: 'Email or Phone Number',
    auth_password: 'Password',
    auth_login_btn: 'Sign In to Account',
    copilot_title: 'AI Himalayan Travel Copilot',
    copilot_subtitle: 'Real-time conversational mountain intelligence in Hindi & English',
    voice_live_mode: 'Live Voice Mode',
    voice_listening: 'Listening to your voice…',
    voice_speaking: 'Copilot is speaking…',
    voice_thinking: 'Thinking & preparing response…',
    voice_tap_to_speak: 'Tap to Speak',
    voice_tap_to_stop: 'Tap to Stop',
    voice_close: 'Exit Voice Mode'
  },
  hi: {
    nav_explore: 'खोजें',
    nav_planner: 'यात्रा प्लानर',
    nav_stays: 'होमस्टे व होटल',
    nav_rentals: 'वाहन किराया',
    nav_spiritual: 'धार्मिक तीर्थ',
    nav_map: 'नक्शा (Map)',
    nav_copilot: 'AI साथी',
    nav_signin: 'साइन इन',
    nav_signout: 'लॉग आउट',
    nav_profile: 'प्रोफाइल',
    nav_plantrip: 'यात्रा बनाएं',
    hero_title: 'देवभूमि उत्तराखंड का अनुभव करें',
    hero_subtitle: 'पवित्र चार धाम, ऊंचे हिमालयी बुग्याल और प्रामाणिक होमस्टे का सफर।',
    hero_cta: 'स्थल देखें',
    search_placeholder: '200+ स्थल, मंदिर या बुग्याल खोजें...',
    category_spiritual: 'पवित्र तीर्थ व धाम',
    category_adventure: 'ट्रेकिंग व एडवेंचर',
    category_stays: 'पारंपरिक होमस्टे',
    category_culture: 'संस्कृति व जीवनशैली',
    auth_welcome_back: 'पुनः स्वागत है',
    auth_create_account: 'नया खाता बनाएं',
    auth_email_phone: 'ईमेल या मोबाइल नंबर',
    auth_password: 'पासवर्ड',
    auth_login_btn: 'खाते में साइन इन करें',
    copilot_title: 'AI हिमालयी यात्रा साथी',
    copilot_subtitle: 'हिंदी और अंग्रेजी में वास्तविक समय की यात्रा सलाह',
    voice_live_mode: 'लाइव वॉइस मोड',
    voice_listening: 'आपकी आवाज़ सुन रहे हैं…',
    voice_speaking: 'AI साथी बोल रहा है…',
    voice_thinking: 'उत्तर तैयार किया जा रहा है…',
    voice_tap_to_speak: 'बोलने के लिए दबाएं',
    voice_tap_to_stop: 'रोकने के लिए दबाएं',
    voice_close: 'वॉइस मोड बंद करें'
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem('discovery_lang');
      if (saved) return saved;
      // Check cookies
      const match = document.cookie.match(/googtrans=\/en\/([a-z]{2})/i);
      return match ? match[1] : 'en';
    } catch {
      return 'en';
    }
  });

  const applyGoogleTranslate = (targetLang) => {
    try {
      // 1. Set Google Translate Cookies for root and current domain
      const host = window.location.hostname;
      const domainParts = host.split('.');
      const topDomain = domainParts.length > 1 ? `.${domainParts.slice(-2).join('.')}` : host;

      document.cookie = `googtrans=/en/${targetLang}; path=/;`;
      document.cookie = `googtrans=/en/${targetLang}; domain=${host}; path=/;`;
      if (topDomain !== host) {
        document.cookie = `googtrans=/en/${targetLang}; domain=${topDomain}; path=/;`;
      }

      if (targetLang === 'en') {
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${host}; path=/;`;
        if (topDomain !== host) {
          document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${topDomain}; path=/;`;
        }
      }

      // 2. Programmatically trigger Google Translate select combo if present
      const select = document.querySelector('.goog-te-combo');
      if (select) {
        select.value = targetLang;
        select.dispatchEvent(new Event('change'));
      } else {
        // If Google Translate element isn't attached yet, reload briefly to apply cookie
        setTimeout(() => {
          const combo = document.querySelector('.goog-te-combo');
          if (combo) {
            combo.value = targetLang;
            combo.dispatchEvent(new Event('change'));
          } else if (targetLang !== 'en') {
            window.location.reload();
          }
        }, 300);
      }
    } catch (err) {
      console.warn('Google translate dispatch error:', err);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem('discovery_lang', lang);
      applyGoogleTranslate(lang);
    } catch (e) {
      console.warn('Language persistence error:', e);
    }
  }, [lang]);

  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'hi' : 'en';
    setLang(nextLang);
    applyGoogleTranslate(nextLang);
    if (nextLang === 'en') {
      // When resetting back to English, reload ensures pristine original DOM text
      setTimeout(() => {
        window.location.reload();
      }, 150);
    }
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations.en?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      lang: 'en',
      setLang: () => {},
      toggleLanguage: () => {},
      t: (key) => translations.en?.[key] || key
    };
  }
  return context;
};

