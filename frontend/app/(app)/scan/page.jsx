'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { jsQR } from 'jsqr';
import toast from 'react-hot-toast';
import { FaCamera, FaSync, FaQrcode } from 'react-icons/fa';

export default function ScanPage() {
  const webcamRef = useRef(null);
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState(null);
  const [camera, setCamera] = useState('environment'); // 'environment' or 'user'

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      // Convert base64 to image data
      const image = new Image();
      image.src = imageSrc;
      image.onload = () => {
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
          toast.success('QR Code detected!');
          handleAttendance(code.data);
        }
      };
    }
  }, [webcamRef]);

  const handleAttendance = async (qrData) => {
    try {
      const response = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ qrData })
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message || 'Attendance marked successfully!');
      } else {
        toast.error(data.message || 'Failed to mark attendance');
        setScanning(true);
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error('Failed to mark attendance');
      setScanning(true);
    }
  };

  // Scan for QR code every 500ms while scanning is true
  useEffect(() => {
    let interval;
    if (scanning) {
      interval = setInterval(() => {
        capture();
      }, 500);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [scanning, capture]);

  const handleReset = () => {
    setResult(null);
    setScanning(true);
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
            >
              <FaCamera />
              Switch Camera
            </button>

            {!scanning && (
              <button
                onClick={handleReset}
                className="cyberpunk-button flex-1 flex items-center justify-center gap-2"
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
        </ul>
      </div>
    </div>
  );
}
