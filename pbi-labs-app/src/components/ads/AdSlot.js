import React, { useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';

const CLIENT = process.env.REACT_APP_ADSENSE_CLIENT;

export default function AdSlot({ slot }) {
  const { authSession } = useAppContext();
  const insRef = useRef(null);
  const pushed = useRef(false);
  const enabled = authSession?.tier !== 'pro' && Boolean(CLIENT) && Boolean(slot);

  useEffect(() => {
    if (!enabled || !insRef.current || pushed.current) return undefined;
    const selector = 'script[data-pbi-adsense="1"]';
    if (!document.querySelector(selector)) {
      const script = document.createElement('script');
      script.async = true;
      script.dataset.pbiAdsense = '1';
      script.crossOrigin = 'anonymous';
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(CLIENT)}`;
      document.head.appendChild(script);
    }
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch (err) {
      pushed.current = true;
    }
    return undefined;
  }, [enabled]);

  if (!enabled) return null;

  return (
    <ins
      ref={insRef}
      className="adsbygoogle"
      style={{ display: 'block', minHeight: 90, margin: '0 auto', overflow: 'hidden' }}
      data-ad-client={CLIENT}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
