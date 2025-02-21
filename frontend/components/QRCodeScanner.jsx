'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { toast } from 'react-hot-toast';

export default function QRCodeScanner({ onScan }) {
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    // Create scanner instance
    scannerRef.current = new Html5QrcodeScanner('qr-reader', {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 10,
      rememberLastUsedCamera: true,
    });

    // Start scanning
    scannerRef.current.render(
      (decodedText) => {
        if (onScan) {
          onScan(decodedText);
        }
        toast.success('QR Code scanned successfully!');
        // Stop scanning after successful scan
        if (scannerRef.current) {
          scannerRef.current.clear();
        }
      },
      (error) => {
        console.error('QR Code scanning failed:', error);
      }
    );

    setScanning(true);

    // Cleanup
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [onScan]);

  return (
    <div className="qr-scanner-container">
      <div id="qr-reader" className="qr-reader"></div>
      {scanning && (
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
      `}</style>
    </div>
  );
}
