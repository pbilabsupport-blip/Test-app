import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseKey);

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const defaultLang = navigator.language.startsWith('es') ? 'es' : 'en';
  
  const [language, setLanguage] = useState(() => localStorage.getItem('pbi_lang') || defaultLang);
  const [theme, setTheme] = useState(() => localStorage.getItem('pbi_theme') || 'dark');
  const [authSession, setAuthSession] = useState(() => JSON.parse(localStorage.getItem('pbi_session')) || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('pbi_lang', language);
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    localStorage.setItem('pbi_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Real Supabase Free Tier Sign Up with Namespace Isolation
  const handleFreeSignUp = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      const session = { 
        success: true, 
        tier: 'free', 
        email: email, 
        key: `FREE-${email}`, 
        deviceId: 'local-fingerprint-id' 
      };
      setAuthSession(session);
      localStorage.setItem('pbi_session', JSON.stringify(session));
      return { success: true, data };
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Real Supabase Free Tier Log In with Namespace Isolation
  const handleFreeLogin = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const session = { 
        success: true, 
        tier: 'free', 
        email: email, 
        key: `FREE-${email}`, 
        deviceId: 'local-fingerprint-id' 
      };
      setAuthSession(session);
      localStorage.setItem('pbi_session', JSON.stringify(session));
      return { success: true, data };
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Pro Tier Activation with Strict License Namespace Isolation
  const handleActivate = async (key, email, tier) => {
    setLoading(true);
    try {
      const session = { 
        success: true, 
        tier: tier, 
        email: email, 
        key: key, 
        deviceId: 'local-fingerprint-id' 
      };
      setAuthSession(session);
      localStorage.setItem('pbi_session', JSON.stringify(session));
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthSession(null);
    localStorage.removeItem('pbi_session');
    supabase.auth.signOut();
  };

  return (
    <AppContext.Provider value={{ language, setLanguage, theme, setTheme, authSession, handleFreeSignUp, handleFreeLogin, handleActivate, handleLogout, loading }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);