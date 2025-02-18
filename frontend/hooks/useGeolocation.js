'use client';

import { useState, useEffect } from 'react';

export default function useGeolocation(options = {}) {
  const [location, setLocation] = useState({
    loaded: false,
    coordinates: { lat: null, lng: null },
    error: null
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation({
        loaded: true,
        error: {
          code: 0,
          message: "Geolocation is not supported"
        }
      });
      return;
    }

    const onSuccess = (position) => {
      setLocation({
        loaded: true,
        coordinates: {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        },
        error: null
      });
    };

    const onError = (error) => {
      setLocation({
        loaded: true,
        coordinates: { lat: null, lng: null },
        error
      });
    };

    try {
      navigator.geolocation.getCurrentPosition(
        onSuccess,
        onError,
        options
      );
    } catch (error) {
      setLocation({
        loaded: true,
        coordinates: { lat: null, lng: null },
        error
      });
    }
  }, [options]);

  return location;
}
