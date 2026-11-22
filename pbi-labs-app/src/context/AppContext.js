import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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

function hasRecoveryParamsInUrl() {
  try {
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    const searchParams = new URLSearchParams(search);
    return hash.includes('type=recovery') || searchParams.get('type') === 'recovery';
  } catch (err) {
    return false;
  }
}

function cleanAuthParamsFromUrl() {
  try {
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    if (
      hash.includes('access_token=') ||
      hash.includes('type=recovery') ||
      search.includes('code=') ||
      search.includes('type=recovery')
    ) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  } catch (err) {
    // Ignore history cleanup errors
  }
}

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const defaultLang = navigator.language.startsWith('es') ? 'es' : 'en';
  const [language, setLanguage] = useState(() => localStorage.getItem('pbi_lang') || defaultLang);
  const [theme, setTheme] = useState(() => localStorage.getItem('pbi_theme') || 'dark');
  const [authSession, setAuthSession] = useState(() => readStoredSession());
  const [loading, setLoading] = useState(() => readStoredSession()?.tier === 'pro');
  const [authNotice, setAuthNotice] = useState(null);
  const [recoveryMode, setRecoveryMode] = useState(() => hasRecoveryParamsInUrl());

  const authSessionRef = useRef(authSession);
  useEffect(() => {
    authSessionRef.current = authSession;
  }, [authSession]);

  const clearAuthNotice = useCallback(() => setAuthNotice(null), []);

  useEffect(() => {
    localStorage.setItem('pbi_lang', language);
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    localStorage.setItem('pbi_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Listen for Supabase auth & password recovery events
  useEffect(() => {
    if (hasRecoveryParamsInUrl()) {
      setRecoveryMode(true);
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryMode(true);
      }
    });

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const clearLocalSession = useCallback(() => {
    setAuthSession(null);
    persistSession(null);
    localStorage.removeItem(LICENSE_STORAGE_KEY);
  }, []);

  const getAccessToken = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  }, []);

  // Heartbeat check for active Pro sessions
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

  // FREE SIGN UP
  const handleFreeSignUp = async (email, password) => {
    const cleanEmail = email.trim();
    const { data, error } = await supabase.auth.signUp({ email: cleanEmail, password });
    if (error) throw error;

    // Supabase returns empty identities if user already exists when email confirmation is enabled
    if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      throw new Error('User already registered');
    }

    // If Confirm Email is OFF (returns active session), log them straight in
    if (data?.session) {
      const session = {
        success: true,
        tier: 'free',
        email: data.user?.email || cleanEmail
      };
      setAuthSession(session);
      persistSession(session);
      localStorage.removeItem(LICENSE_STORAGE_KEY);
      return { success: true, needsEmailConfirmation: false, data };
    }

    // Fallback if Confirm Email is ever turned ON in Supabase
    return { success: true, needsEmailConfirmation: true, data };
  };

  // RESEND CONFIRMATION EMAIL (Fallback if Confirm Email is enabled)
  const handleResendConfirmation = async (email) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin }
    });
    if (error) throw error;
    return { success: true };
  };

  // FREE LOGIN
  const handleFreeLogin = async (email, password) => {
    const cleanEmail = email.trim();
    const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    if (error) throw error;
    const session = { success: true, tier: 'free', email: data.user?.email || cleanEmail };
    setAuthSession(session);
    persistSession(session);
    localStorage.removeItem(LICENSE_STORAGE_KEY);
    return { success: true, data };
  };

  // REQUEST PASSWORD RESET EMAIL
  const handleRequestPasswordReset = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin
    });
    if (error) throw error;
    return { success: true };
  };

  // UPDATE PASSWORD (Works both from recovery email link AND while logged in)
  const handleUpdatePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;

    let userEmail = data?.user?.email;
    if (!userEmail) {
      const { data: userData } = await supabase.auth.getUser();
      userEmail = userData?.user?.email;
    }

    // Log the Free user straight into the app after resetting via email link
    if (userEmail && authSessionRef.current?.tier !== 'pro') {
      const session = { success: true, tier: 'free', email: userEmail };
      setAuthSession(session);
      persistSession(session);
      localStorage.removeItem(LICENSE_STORAGE_KEY);
    }

    setRecoveryMode(false);
    cleanAuthParamsFromUrl();
    return { success: true };
  };

  // CANCEL PASSWORD RECOVERY MODAL
  const cancelRecoveryMode = async () => {
    setRecoveryMode(false);
    cleanAuthParamsFromUrl();
    if (!authSessionRef.current) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        // Ignore signOut errors on cancel
      }
    }
  };

  // PRO ACTIVATION
  const handleActivate = async (key, email) => {
    setAuthNotice(null);
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
  };

  const handleLogout = async () => {
    const email = authSession?.email;
    const tier = authSession?.tier;
    const licenseKey = localStorage.getItem(LICENSE_STORAGE_KEY);
    clearLocalSession();
    try {
      await supabase.auth.signOut();
    } catch (err) {
      // Local sign-out still stands
    }
    if (tier === 'pro' && licenseKey && email) {
      try {
        const deviceId = await getFingerprint();
        await verifyLicense({ licenseKey, email, deviceId, mode: 'release' });
      } catch (err) {
        // Seat freed on next heartbeat
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
      handleResendConfirmation,
      handleFreeLogin,
      handleRequestPasswordReset,
      handleActivate,
      handleLogout,
      loading,
      authNotice,
      clearAuthNotice,
      getAccessToken,
      recoveryMode,
      handleUpdatePassword,
      cancelRecoveryMode
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);