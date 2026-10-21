import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import getFingerprint from '../services/fingerprint';
import { verifyLicense } from '../services/licenseApi';

const SESSION_KEY = 'pbi_session';
export const LICENSE_STORAGE_KEY = 'pbi_license_key';

function readStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.success !== true || !parsed.email) return null;
    return {
      success: true,
      tier: parsed.tier === 'pro' ? 'pro' : 'free',
      email: parsed.email
    };
  } catch (err) {
    return null;
  }
}

function persistSession(session) {
  if (!session) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    success: true,
    tier: session.tier,
    email: session.email
  }));
}

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const defaultLang = navigator.language.startsWith('es') ? 'es' : 'en';
  const [language, setLanguage] = useState(() => localStorage.getItem('pbi_lang') || defaultLang);
  const [theme, setTheme] = useState(() => localStorage.getItem('pbi_theme') || 'dark');
  const [authSession, setAuthSession] = useState(() => readStoredSession());
  const [loading, setLoading] = useState(() => readStoredSession()?.tier === 'pro');
  const [authNotice, setAuthNotice] = useState(null);
  const clearAuthNotice = useCallback(() => setAuthNotice(null), []);

  useEffect(() => {
    localStorage.setItem('pbi_lang', language);
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    localStorage.setItem('pbi_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const clearLocalSession = useCallback(() => {
    setAuthSession(null);
    persistSession(null);
    localStorage.removeItem(LICENSE_STORAGE_KEY);
  }, []);

  const getAccessToken = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  }, []);

  useEffect(() => {
    if (authSession?.tier !== 'pro') {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    const check = async () => {
      const licenseKey = localStorage.getItem(LICENSE_STORAGE_KEY);
      if (!licenseKey || !authSession.email) {
        clearLocalSession();
        setAuthNotice('INVALID_LICENSE');
        setLoading(false);
        return;
      }
      try {
        const deviceId = await getFingerprint();
        await verifyLicense({
          licenseKey,
          email: authSession.email,
          deviceId,
          mode: 'heartbeat'
        });
        if (!cancelled) setLoading(false);
      } catch (err) {
        if (cancelled) return;
        const fatal = err.code === 'INVALID_LICENSE' || err.code === 'EMAIL_MISMATCH' || err.code === 'SEAT_LIMIT';
        if (fatal) {
          clearLocalSession();
          setAuthNotice(err.code);
        }
        setLoading(false);
      }
    };

    check();
    const timer = setInterval(check, 15 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [authSession?.tier, authSession?.email, clearLocalSession]);

  const handleFreeSignUp = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      const session = { success: true, tier: 'free', email };
      setAuthSession(session);
      persistSession(session);
      localStorage.removeItem(LICENSE_STORAGE_KEY);
      return { success: true, data };
    } finally {
      setLoading(false);
    }
  };

  const handleFreeLogin = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const session = { success: true, tier: 'free', email: data.user?.email || email };
      setAuthSession(session);
      persistSession(session);
      localStorage.removeItem(LICENSE_STORAGE_KEY);
      return { success: true, data };
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (key, email) => {
    setLoading(true);
    setAuthNotice(null);
    try {
      const deviceId = await getFingerprint();
      const result = await verifyLicense({
        licenseKey: key.trim(),
        email: email.trim(),
        deviceId,
        mode: 'activate'
      });
      const session = { success: true, tier: 'pro', email: result.email || email.trim() };
      localStorage.setItem(LICENSE_STORAGE_KEY, key.trim());
      setAuthSession(session);
      persistSession(session);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const email = authSession?.email;
    const tier = authSession?.tier;
    const licenseKey = localStorage.getItem(LICENSE_STORAGE_KEY);
    clearLocalSession();
    try {
      await supabase.auth.signOut();
    } catch (err) {
      // Local sign-out still stands if Supabase is unreachable.
    }
    if (tier === 'pro' && licenseKey && email) {
      try {
        const deviceId = await getFingerprint();
        await verifyLicense({ licenseKey, email, deviceId, mode: 'release' });
      } catch (err) {
        // The seat is released the next time this device tries to sign in.
      }
    }
  };

  return (
    <AppContext.Provider value={{
      language,
      setLanguage,
      theme,
      setTheme,
      authSession,
      handleFreeSignUp,
      handleFreeLogin,
      handleActivate,
      handleLogout,
      loading,
      authNotice,
      clearAuthNotice,
      getAccessToken
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
