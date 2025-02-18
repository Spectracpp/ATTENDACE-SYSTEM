'use client';

import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import toast from 'react-hot-toast';

export default function QRScanner({ onScan }) {
  const [scanner, setScanner] = useState(null);

  useEffect(() => {
    const qrScanner = new Html5QrcodeScanner('qr-reader', {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 5,
    });

    qrScanner.render(success, error);
    setScanner(qrScanner);

    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, []);

  const success = (result) => {
    if (scanner) {
      scanner.clear();
    }
    onScan(result);
  };

  const error = (err) => {
    console.error(err);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div id="qr-reader" className="rounded-lg overflow-hidden"></div>
      <p className="text-sm text-gray-500 mt-2 text-center">
        Position the QR code within the frame to scan
      </p>
    </div>
  );
}
