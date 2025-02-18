'use client';

import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import toast from 'react-hot-toast';

export default function QRCodeScanner({ onScan, onError }) {
  const [scanner, setScanner] = useState(null);

  useEffect(() => {
    // Initialize scanner
    const qrScanner = new Html5QrcodeScanner('qr-reader', {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 10,
    });

    // Success callback
    const success = (decodedText, decodedResult) => {
      if (onScan) {
        onScan(decodedText, decodedResult);
        qrScanner.clear();
      }
    };

    // Error callback
    const error = (errorMessage) => {
      if (onError) {
        onError(errorMessage);
      }
    };

    // Start scanning
    qrScanner.render(success, error);
    setScanner(qrScanner);

    // Cleanup
    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      <div id="qr-reader" className="rounded-lg overflow-hidden"></div>
      <style jsx>{`
        #qr-reader {
          border: none !important;
          padding: 0 !important;
        }
        #qr-reader__scan_region {
          background: #1f2937 !important;
          border-radius: 0.5rem !important;
        }
        #qr-reader__scan_region img {
          display: none;
        }
        #qr-reader__dashboard {
          padding: 0 !important;
          background: transparent !important;
          border: none !important;
        }
        #qr-reader__dashboard button {
          background: #00f2ea !important;
          color: black !important;
          border: none !important;
          padding: 0.5rem 1rem !important;
          border-radius: 0.5rem !important;
          margin: 0.5rem !important;
          cursor: pointer !important;
          font-weight: 500 !important;
          transition: background-color 0.2s !important;
        }
        #qr-reader__dashboard button:hover {
          background: #00d8d8 !important;
        }
        #qr-reader__camera_selection {
          background: #374151 !important;
          border: 1px solid #4b5563 !important;
          color: white !important;
          padding: 0.5rem !important;
          border-radius: 0.5rem !important;
          margin: 0.5rem !important;
          width: auto !important;
        }
        #qr-reader__status_span {
          background: transparent !important;
          color: #9ca3af !important;
          font-size: 0.875rem !important;
        }
      `}</style>
    </div>
  );
}
