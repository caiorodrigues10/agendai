import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { sendTrafficBeacon } from '../../infra/trafficBeaconApi';

/**
 * Listener for the privacy-safe traffic beacon.
 *
 * It is mounted globally alongside the other application listeners. The ref
 * prevents React StrictMode's development double-effect from sending the same
 * pathname twice.
 */
export const TrafficBeaconListener: React.FC = () => {
  const location = useLocation();
  const lastPathname = useRef<string | null>(null);

  useEffect(() => {
    const pathname = location.pathname;
    if (lastPathname.current === pathname) return;

    lastPathname.current = pathname;
    sendTrafficBeacon({ pathname });
  }, [location.pathname]);

  return null;
};
