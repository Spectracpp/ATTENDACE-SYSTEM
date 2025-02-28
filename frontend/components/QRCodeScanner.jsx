'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { toast } from 'react-hot-toast';
import { FaSyncAlt, FaExclamationTriangle } from 'react-icons/fa';

export default function QRCodeScanner({ onScan }) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const scannerRef = useRef(null);
  const scanAttemptRef = useRef(0);
  const maxRetryAttempts = 3;

  useEffect(() => {
    // Create scanner instance with improved configuration
    try {
      scannerRef.current = new Html5QrcodeScanner('qr-reader', {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 10,
        rememberLastUsedCamera: true,
        aspectRatio: 1,
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
      });

      // Start scanning with enhanced error handling
      scannerRef.current.render(
        (decodedText) => {
          try {
            // Reset scan attempts on success
            scanAttemptRef.current = 0;
            setError(null);
            
            if (onScan) {
              // Try to parse JSON if it looks like JSON
              let parsedData = decodedText;
              
              if (decodedText.startsWith('{') && decodedText.endsWith('}')) {
                try {
                  parsedData = JSON.parse(decodedText);
                } catch (e) {
                  console.log('QR code data is not valid JSON, using raw string');
                }
              }
              
              onScan(parsedData);
            }
            
            toast.success('QR Code scanned successfully!');
            
            // Stop scanning after successful scan
            if (scannerRef.current) {
              scannerRef.current.clear();
            }
          } catch (err) {
            console.error('Error processing scan result:', err);
            setError('Failed to process scan result. Please try again.');
            toast.error('Error processing scan result');
          }
        },
        (error) => {
          // Only log errors, don't display to user unless persistent
          console.error('QR Code scanning failed:', error);
          
          // Increment scan attempts
          scanAttemptRef.current += 1;
          
          // If we have multiple consecutive errors, show to user
          if (scanAttemptRef.current > 5) {
            setError('Having trouble scanning? Make sure there is good lighting and the QR code is clear.');
          }
        }
      );

      setScanning(true);
    } catch (err) {
      console.error('Failed to initialize QR scanner:', err);
      setError('Failed to initialize camera. Please ensure camera permissions are granted and try again.');
      toast.error('Failed to initialize camera');
    }

    // Cleanup
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (err) {
          console.error('Error cleaning up scanner:', err);
        }
      }
    };
  }, [onScan, retryCount]);

  const handleRetry = () => {
    setError(null);
    scanAttemptRef.current = 0;
    setRetryCount(prev => prev + 1);
    toast.info('Restarting scanner...');
  };

  return (
    <div className="qr-scanner-container">
      {error && (
        <div className="error-container mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center">
          <FaExclamationTriangle className="text-red-500 mr-2" />
          <div className="flex-1">{error}</div>
          <button 
            onClick={handleRetry}
            className="ml-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
          >
            <FaSyncAlt className="mr-1" /> Retry
          </button>
        </div>
      )}
      
      <div id="qr-reader" className="qr-reader"></div>
      
      {scanning && !error && (
        <div className="mt-4 text-center text-gray-400">
          Position the QR code within the frame to scan
        </div>
      )}
      
      <style jsx>{`
        .qr-scanner-container {
          max-width: 600px;
          margin: 0 auto;
        }
        .qr-reader {
          width: 100%;
          background: var(--bg-secondary);
          border-radius: 12px;
          overflow: hidden;
          border: 2px solid var(--bg-accent);
        }
        :global(#qr-reader__scan_region) {
          background: var(--bg-secondary) !important;
        }
        :global(#qr-reader__dashboard) {
          background: var(--bg-secondary) !important;
          border-top: 2px solid var(--bg-accent) !important;
          padding: 1rem !important;
        }
        :global(#qr-reader__dashboard button) {
          background: var(--primary) !important;
          border: none !important;
          color: black !important;
          padding: 0.5rem 1rem !important;
          border-radius: 6px !important;
          cursor: pointer !important;
        }
        :global(#qr-reader__camera_selection) {
          background: var(--bg-primary) !important;
          border: 1px solid var(--bg-accent) !important;
          color: var(--text-primary) !important;
          padding: 0.5rem !important;
          border-radius: 6px !important;
          margin-bottom: 1rem !important;
        }
        :global(#qr-reader__status_span) {
          color: var(--text-secondary) !important;
        }
        .error-container {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
