import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { cookieConsentStorage } from '../../utils/cookieConsentStorage';
import { initAnalytics, trackPageView } from '../analytics';

const PRIVATE_PREFIXES = ['/app', '/master', '/checkout', '/bloqueado'];

export const AnalyticsListener: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const sync = () => {
      if (cookieConsentStorage.allowsAnalytics()) initAnalytics();
    };
    sync();
    window.addEventListener(cookieConsentStorage.changeEvent, sync);
    return () => window.removeEventListener(cookieConsentStorage.changeEvent, sync);
  }, []);

  useEffect(() => {
    if (PRIVATE_PREFIXES.some(prefix => location.pathname.startsWith(prefix))) return;
    trackPageView(`${location.pathname}${location.search}`, document.title);
  }, [location.pathname, location.search]);

  return null;
};
