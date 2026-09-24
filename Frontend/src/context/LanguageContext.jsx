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
      return localStorage.getItem('discovery_lang') || 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('discovery_lang', lang);
    } catch (e) {
      console.warn('Language persistence error:', e);
    }
  }, [lang]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'hi' : 'en'));
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



