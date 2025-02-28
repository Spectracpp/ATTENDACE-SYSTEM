'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { jsQR } from 'jsqr';
import toast from 'react-hot-toast';
import { FaCamera, FaSync, FaQrcode, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { scanQRCode } from '@/lib/api/qrcode';

export default function ScanPage() {
  const webcamRef = useRef(null);
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState(null);
  const [camera, setCamera] = useState('environment'); // 'environment' or 'user'
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanAttempts, setScanAttempts] = useState(0);
  const [scanHistory, setScanHistory] = useState([]);
  const [retryCount, setRetryCount] = useState(0);
  const maxConsecutiveFailures = 5;
  const scanTimeoutRef = useRef(null);

  const capture = useCallback(() => {
    if (isProcessing) return; // Prevent multiple simultaneous processing

    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      console.warn('Failed to capture screenshot - camera may not be ready');
      return;
    }

    setIsProcessing(true);
    
    // Convert base64 to image data
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Scan QR code
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          setResult(code.data);
          setScanning(false);
          setError(null);
          setScanAttempts(0);
          toast.success('QR Code detected!');
          clearTimeout(scanTimeoutRef.current);
          handleAttendance(code.data);
        } else {
          // No QR code found in this frame
          setScanAttempts(prev => {
            const newCount = prev + 1;
            if (newCount % 10 === 0) {
              // Provide feedback every 10 attempts
              toast.info('Still searching for QR code. Please make sure QR is visible and well-lit.');
            }
            return newCount;
          });
        }
      } catch (err) {
        console.error('Error processing image data:', err);
        setError(`Error processing camera image: ${err.message || 'Unknown error'}`);
      } finally {
        setIsProcessing(false);
      }
    };

    image.onerror = () => {
      console.error('Failed to load captured image');
      setError('Failed to process camera image. Please try again.');
      setIsProcessing(false);
    };
  }, [webcamRef, isProcessing]);

  const handleAttendance = async (qrData) => {
    try {
      setIsProcessing(true);
      
      let dataToSend = qrData;
      
      // Try to parse JSON if it's in string format
      if (typeof qrData === 'string' && qrData.trim().startsWith('{')) {
        try {
          dataToSend = JSON.parse(qrData);
        } catch (e) {
          console.warn('QR code data is not valid JSON:', e);
          // Continue with the string data
        }
      }
      
      // Get geolocation for better verification
      let locationData = null;
      try {
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
      } catch (geoError) {
        console.warn('Geolocation not available:', geoError);
        // Continue without location data
      }
      
      // Prepare full data object
      const fullData = {
        qrData: dataToSend,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          screenSize: `${window.screen.width}x${window.screen.height}`
        },
        location: locationData,
        timestamp: new Date().toISOString()
      };

      // Call the API function
      const response = await scanQRCode(
        typeof dataToSend === 'object' && dataToSend.org ? dataToSend.org : 'unknown', 
        fullData
      );
      
      if (response.success) {
        toast.success(response.message || 'Attendance marked successfully!');
        // Add to scan history for this session
        setScanHistory(prev => [...prev, {
          timestamp: new Date(),
          success: true,
          data: dataToSend,
          response
        }]);
      } else {
        toast.error(response.message || 'Failed to mark attendance');
        setError(response.message || 'Failed to mark attendance. Please try again.');
        setScanning(true);
        // Add failed scan to history 
        setScanHistory(prev => [...prev, {
          timestamp: new Date(),
          success: false,
          data: dataToSend,
          error: response.message
        }]);
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error('Failed to mark attendance');
      setError(`Error: ${error.message || 'Failed to connect to server'}. Please try again.`);
      setScanning(true);
      // Add error to history
      setScanHistory(prev => [...prev, {
        timestamp: new Date(),
        success: false,
        data: qrData,
        error: error.message
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Scan for QR code with improved error handling
  useEffect(() => {
    let interval;
    let consecutiveFailures = 0;
    
    if (scanning && !error) {
      // Set a timeout to notify user if scanning takes too long
      scanTimeoutRef.current = setTimeout(() => {
        setError('Taking a while to find a QR code. Make sure your QR code is visible and well-lit.');
      }, 20000); // 20 seconds timeout
      
      interval = setInterval(() => {
        try {
          if (webcamRef.current) {
            capture();
          } else {
            consecutiveFailures++;
            if (consecutiveFailures > maxConsecutiveFailures) {
              setError('Camera stream not available. Please check camera permissions and try again.');
              clearInterval(interval);
            }
          }
        } catch (err) {
          console.error('Error during scan cycle:', err);
          consecutiveFailures++;
          if (consecutiveFailures > maxConsecutiveFailures) {
            setError(`Scanning error: ${err.message || 'Unknown error'}. Please try again.`);
            clearInterval(interval);
          }
        }
      }, 500);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, [scanning, capture, error]);

  const handleReset = () => {
    setResult(null);
    setScanning(true);
    setError(null);
    setScanAttempts(0);
    setRetryCount(prev => prev + 1);
  };

  const toggleCamera = () => {
    setCamera(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const videoConstraints = {
    width: 720,
    height: 720,
    facingMode: camera
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="cyberpunk-card-gradient p-8">
        <h1 className="text-3xl font-bold cyberpunk-text-gradient mb-2">
          QR Code Scanner
        </h1>
        <p className="text-gray-400">
          Position the QR code within the frame to mark your attendance
        </p>
      </div>

      {error && (
        <div className="cyberpunk-card p-4 bg-red-900/30 border border-red-500/50">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="text-red-500 text-xl flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-red-400 font-medium">Scanning Error</h3>
              <p className="text-gray-300 mt-1">{error}</p>
              <button
                onClick={handleReset}
                className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-2 transition-colors"
              >
                <FaSync /> Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="cyberpunk-card overflow-hidden">
        <div className="relative aspect-square">
          {scanning ? (
            <>
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="w-full h-full object-cover"
                onUserMediaError={(err) => {
                  console.error('Camera error:', err);
                  setError(`Camera error: ${err.name}. Please check permissions and try again.`);
                }}
              />
              <div className="absolute inset-0 border-2 border-[#ff0080] opacity-50">
                <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#ff0080]" />
                <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-[#ff0080]" />
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-[#ff0080]" />
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[#ff0080]" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-[#ff0080] rounded-lg animate-pulse" />
              </div>
              {isProcessing && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white">Processing QR code...</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full bg-black/90">
              <div className="text-center">
                <FaQrcode className="w-16 h-16 text-[#ff0080] mx-auto mb-4" />
                <h2 className="text-2xl font-bold cyberpunk-text-gradient">
                  QR Code Scanned!
                </h2>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          {result && (
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-[#ff0080]">
                Scanned Result
              </h3>
              <div className="cyberpunk-card-gradient p-4">
                <p className="text-gray-300 break-all font-mono">
                  {result}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={toggleCamera}
              className="cyberpunk-button flex-1 flex items-center justify-center gap-2"
              disabled={isProcessing}
            >
              <FaCamera />
              Switch Camera
            </button>

            {!scanning && (
              <button
                onClick={handleReset}
                className="cyberpunk-button flex-1 flex items-center justify-center gap-2"
                disabled={isProcessing}
              >
                <FaSync />
                Scan Again
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="cyberpunk-card p-6">
        <h3 className="text-lg font-medium cyberpunk-text-gradient mb-2">
          Instructions
        </h3>
        <ul className="space-y-2 text-gray-400">
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#ff0080]" />
            Ensure good lighting conditions
          </li>
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#7928ca]" />
            Hold your device steady
          </li>
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#4f46e5]" />
            Position QR code within the frame
          </li>
          {scanAttempts > 15 && (
            <li className="flex items-start gap-2 pt-2 border-t border-gray-800 mt-2">
              <FaInfoCircle className="text-blue-400 mt-1 flex-shrink-0" />
              <span className="text-blue-300">
                Having trouble? Make sure the QR code is well-lit and not damaged. Try switching cameras.
              </span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
