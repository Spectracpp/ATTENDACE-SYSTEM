'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useToast } from '@/contexts/ToastContext';
import { QRCodeSVG } from 'qrcode.react';
import ViewQRCodeModal from './QRCode/ViewQRCodeModal';
import { getTimeRemaining } from '@/lib/utils/dateUtils';
import { formatDistanceToNow } from 'date-fns';
import useGeolocation from '@/hooks/useGeolocation';
import { generateQRCode } from '@/lib/api/qrcode';
import { DEFAULT_QR_CODE_SETTINGS, QR_ERROR_MESSAGES } from '@/lib/constants/qrcode';

/**
 * QR Code Generator Component
 * Allows users to generate QR codes for different organizations
 * with customizable validity periods
 */
const QRCodeGenerator = () => {
  const { organizations } = useOrganizationContext();
  const { showToast } = useToast();

  const [selectedOrganization, setSelectedOrganization] = useState('');
  const [validityMinutes, setValidityMinutes] = useState(DEFAULT_QR_CODE_SETTINGS.validityMinutes);
  const [qrCode, setQRCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [location, setLocation] = useState(null);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [qrValue, setQrValue] = useState('');
  const [qrImage, setQrImage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [generationError, setGenerationError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const { location: geolocation, error: locationErrorGeolocation } = useGeolocation();
  const locationTimeoutRef = useRef(null);

  // Get current location for QR code generation
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setFetchingLocation(false);
      return;
    }
    
    setFetchingLocation(true);
    setLocationError(null);
    
    // Set a timeout to handle slow location retrieval
    locationTimeoutRef.current = setTimeout(() => {
      setLocationError("Location retrieval timed out. Using last known location if available.");
      setFetchingLocation(false);
    }, 8000);

    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(locationTimeoutRef.current);
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
          setFetchingLocation(false);
        },
        (error) => {
          clearTimeout(locationTimeoutRef.current);
          console.error("Error getting location:", error);
          let errorMessage = "Failed to get your location.";
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied. Please enable location services.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
          }
          
          setLocationError(errorMessage);
          setFetchingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 7000,
          maximumAge: 0
        }
      );
    } catch (error) {
      clearTimeout(locationTimeoutRef.current);
      console.error("Exception getting location:", error);
      setLocationError("An unexpected error occurred while getting your location.");
      setFetchingLocation(false);
    }
  }, []);

  // Use geolocation from hook as a backup
  useEffect(() => {
    if (geolocation && !location && !fetchingLocation) {
      setLocation({
        latitude: geolocation.latitude,
        longitude: geolocation.longitude,
        accuracy: geolocation.accuracy || 0
      });
    }
  }, [geolocation, location, fetchingLocation]);

  // Handle location error from hook
  useEffect(() => {
    if (locationErrorGeolocation && !locationError) {
      setLocationError(locationErrorGeolocation.message || "Error retrieving location");
    }
  }, [locationErrorGeolocation, locationError]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (locationTimeoutRef.current) {
        clearTimeout(locationTimeoutRef.current);
      }
    };
  }, []);

  // Generate QR code function with enhanced error handling
  const handleGenerateQRCode = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setGenerationError(null);
      
      if (!selectedOrganization) {
        throw new Error("Please select an organization");
      }
      
      if (!validityMinutes || validityMinutes < 1) {
        throw new Error("Please set a valid duration (at least 1 minute)");
      }
      
      // Get current location if not available
      let locationData = location;
      if (!locationData) {
        try {
          setFetchingLocation(true);
          
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
            });
          });
          
          locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          
          setLocation(locationData);
        } catch (locErr) {
          console.warn("Failed to get location for QR generation:", locErr);
          // Continue without location if it fails
          locationData = null;
        } finally {
          setFetchingLocation(false);
        }
      }
      
      // Call API function to generate QR code
      const response = await generateQRCode(selectedOrganization, {
        validityMinutes,
        location: locationData,
        allowedRadius: DEFAULT_QR_CODE_SETTINGS.allowedRadius,
        type: 'attendance',
        validityHours: validityMinutes / 60, // Convert minutes to hours
        allowMultipleScans: DEFAULT_QR_CODE_SETTINGS.allowMultipleScans
      });
      
      // Handle successful response
      if (response && response.success) {
        setQRCode(response.qrCode);
        setQrValue(JSON.stringify({
          id: response.qrCode._id,
          data: response.qrCode.data,
          org: selectedOrganization
        }));
        
        if (response.qrCode.qrImage) {
          setQrImage(response.qrCode.qrImage);
        } else {
          setQrImage('');
        }
        
        showToast("QR code generated successfully", "success");
        setShowQRModal(true);
      } else {
        // Handle API success: false
        throw new Error(response?.message || "Failed to generate QR code");
      }
    } catch (error) {
      console.error("Error generating QR code:", error);
      setGenerationError(error.message || "Failed to generate QR code. Please try again.");
      showToast(error.message || "Failed to generate QR code. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Function to retry QR code generation
  const handleRetry = () => {
    setGenerationError(null);
    setRetryCount(prev => prev + 1);
  };

  // Handle refreshing the component
  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
    setQRCode(null);
    setQrValue('');
    setQrImage('');
    setGenerationError(null);
  };

  // Get validity time remaining display
  const getValidityDisplay = () => {
    if (!qrCode?.validUntil) return "Not generated";
    
    const timeRemaining = getTimeRemaining(new Date(qrCode.validUntil));
    
    if (timeRemaining.isExpired) {
      return "Expired";
    }
    
    if (timeRemaining.days > 0) {
      return `${timeRemaining.days}d ${timeRemaining.hours}h remaining`;
    }
    
    return `${timeRemaining.hours}h ${timeRemaining.minutes}m remaining`;
  };

  // Organization select options
  const orgOptions = organizations.map(org => ({
    value: org._id,
    label: org.name
  }));

  // Validity hour options
  const validityOptions = [
    { value: 15, label: "15 minutes" },
    { value: 30, label: "30 minutes" },
    { value: 60, label: "1 hour" },
    { value: 120, label: "2 hours" },
    { value: 180, label: "3 hours" },
    { value: 360, label: "6 hours" },
    { value: 720, label: "12 hours" },
    { value: 1440, label: "24 hours" },
  ];

  return (
    <div className="qr-generator" key={refreshKey}>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2 space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Generate QR Code</h2>
            
            {generationError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
                <p className="flex items-center gap-2">
                  <span className="text-red-500">⚠️</span>
                  {generationError}
                </p>
                <button 
                  onClick={handleRetry}
                  className="mt-2 text-blue-600 underline text-sm"
                >
                  Try again
                </button>
              </div>
            )}
            
            <form onSubmit={handleGenerateQRCode} className="space-y-4">
              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Organization
                </label>
                <select
                  id="organization"
                  className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  value={selectedOrganization}
                  onChange={(e) => setSelectedOrganization(e.target.value)}
                  required
                >
                  <option value="">Select Organization</option>
                  {orgOptions.map(org => (
                    <option key={org.value} value={org.value}>
                      {org.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="validity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Validity Period
                </label>
                <select
                  id="validity"
                  className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  value={validityMinutes}
                  onChange={(e) => setValidityMinutes(parseInt(e.target.value))}
                  required
                >
                  {validityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location
                </label>
                <div className="flex items-center">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                    onClick={getCurrentLocation}
                    disabled={fetchingLocation}
                  >
                    {fetchingLocation ? "Getting Location..." : location ? "Update Location" : "Get Current Location"}
                  </button>
                  
                  {location && (
                    <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                      ✓ Location {location.accuracy < 100 ? "accurate" : "approximate"}
                    </span>
                  )}
                </div>
                
                {locationError && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {locationError}
                  </p>
                )}
                
                {location && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
                    {location.accuracy && ` (±${Math.round(location.accuracy)}m)`}
                  </p>
                )}
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                  disabled={loading || fetchingLocation}
                >
                  {loading ? "Generating..." : "Generate QR Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="w-full md:w-1/2">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 h-full flex flex-col">
            <h2 className="text-xl font-semibold mb-6">QR Code Preview</h2>
            
            <div className="flex-1 flex flex-col items-center justify-center">
              {qrCode ? (
                <div className="space-y-4 w-full flex flex-col items-center">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    {qrValue ? (
                      <QRCodeSVG
                        value={qrValue}
                        size={250}
                        bgColor={"#ffffff"}
                        fgColor={"#000000"}
                        level={"M"}
                        includeMargin={true}
                      />
                    ) : (
                      <div className="w-250 h-250 flex items-center justify-center bg-gray-100 text-gray-400">
                        QR Code not available
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center space-y-2 w-full">
                    <p className="text-sm font-medium">
                      Organization: <span className="text-gray-600 dark:text-gray-400">
                        {organizations.find(org => org._id === selectedOrganization)?.name || 'Unknown'}
                      </span>
                    </p>
                    
                    <p className="text-sm font-medium">
                      Created: <span className="text-gray-600 dark:text-gray-400">
                        {qrCode.createdAt ? formatDistanceToNow(new Date(qrCode.createdAt), { addSuffix: true }) : 'Unknown'}
                      </span>
                    </p>
                    
                    <p className="text-sm font-medium">
                      Validity: <span className={`font-semibold ${getValidityDisplay().includes('Expired') ? 'text-red-500' : 'text-green-500'}`}>
                        {getValidityDisplay()}
                      </span>
                    </p>
                  </div>
                  
                  <div className="pt-4 flex gap-4 w-full">
                    <button
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                      onClick={() => setShowQRModal(true)}
                    >
                      View Details
                    </button>
                    
                    <button
                      className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                      onClick={handleRefresh}
                    >
                      Generate New
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-250 h-250 mx-auto flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-400 dark:text-gray-500">
                      QR code will appear here
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Fill out the form and click "Generate QR Code" to create a new QR code
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {showQRModal && qrCode && (
        <ViewQRCodeModal
          qrCode={qrCode}
          onClose={() => setShowQRModal(false)}
        />
      )}
    </div>
  );
};

export default QRCodeGenerator;
