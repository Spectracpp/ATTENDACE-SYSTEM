'use client';

import { useState } from 'react';
import { FaTimes, FaDownload, FaCopy } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function ViewQRCodeModal({ qrCode, onClose }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Check if qrCode exists and has the necessary properties
  if (!qrCode || !qrCode.qrImage) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-md overflow-hidden p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">QR Code</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes />
            </button>
          </div>
          <div className="text-center py-8">
            <p className="text-red-400">Error: QR code data is missing or invalid.</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleDownload = () => {
    setIsDownloading(true);
    try {
      // Create a canvas element to draw the QR code
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Set canvas dimensions to match the image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the image on the canvas
        ctx.drawImage(img, 0, 0);
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          // Create a download link
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `qr-code-${qrCode._id || 'download'}.png`;
          document.body.appendChild(link);
          link.click();
          
          // Clean up
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          setIsDownloading(false);
          toast.success('QR code downloaded successfully');
        }, 'image/png');
      };
      
      img.onerror = () => {
        throw new Error('Failed to load QR code image');
      };
      
      // Set the source of the image to the QR code data URL
      img.src = qrCode.qrImage;
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast.error('Failed to download QR code');
      setIsDownloading(false);
    }
  };

  const handleCopy = () => {
    if (!qrCode.data) {
      toast.error('No QR code data to copy');
      return;
    }
    
    navigator.clipboard.writeText(qrCode.data)
      .then(() => {
        toast.success('QR code data copied to clipboard');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => toast.error('Failed to copy QR code data'));
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">QR Code</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* QR Code Image */}
          <div className="bg-white p-4 rounded-lg flex items-center justify-center">
            {qrCode.qrImage ? (
              <img
                src={qrCode.qrImage}
                alt="QR Code"
                className="max-w-full max-h-64 object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZmlsbD0iIzY2NiI+UVIgSW1hZ2UgRXJyb3I8L3RleHQ+PC9zdmc+';
                }}
              />
            ) : (
              <div className="w-full h-64 flex items-center justify-center bg-gray-100">
                <p className="text-gray-500">QR code image not available</p>
              </div>
            )}
          </div>

          {/* QR Code Details */}
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400">Organization</p>
              <p className="text-white font-medium">{qrCode.organization || 'Unknown'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-400">Valid Until</p>
              <p className="text-white font-medium">
                {qrCode.validUntil ? new Date(qrCode.validUntil).toLocaleString() : 'Not specified'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-400">Type</p>
              <p className="text-white font-medium capitalize">{qrCode.type || 'Unknown'}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[#ff0080] to-[#7928ca] text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isDownloading ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Downloading...
                </>
              ) : (
                <>
                  <FaDownload />
                  Download
                </>
              )}
            </button>
            <button
              onClick={handleCopy}
              disabled={!qrCode.data}
              className="px-4 py-2 rounded-lg bg-black/40 text-white hover:bg-black/60 transition-colors disabled:opacity-50 flex items-center justify-center"
              title={qrCode.data ? 'Copy QR code data' : 'No data to copy'}
            >
              {copied ? 'Copied!' : <FaCopy />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
