'use client';

import { useState, useRef, useEffect } from 'react';
import Modal from '../Modal';
import { FaDownload, FaCopy, FaHistory, FaTimes, FaCheck } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import { QRCodeCanvas } from 'qrcode.react';
import toast from 'react-hot-toast';
import { formatDate, formatTime, getTimeRemaining, isQRCodeValid } from '@/lib/utils/dateUtils';
import QRCodeHistoryModal from './QRCodeHistoryModal';
import { motion } from 'framer-motion';
import { QR_PLACEHOLDER } from '@/lib/constants';

export default function ViewQRCodeModal({ qrCode, onClose }) {
  const [qrImageUrl, setQrImageUrl] = useState(qrCode?.qrImage || '');
  const [loadingImage, setLoadingImage] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [qrDataValue, setQrDataValue] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const qrCanvasRef = useRef(null);

  useEffect(() => {
    if (qrCode) {
      // Prepare QR code data for rendering and copying
      const data = {
        id: qrCode._id,
        org: qrCode.organization?._id || qrCode.organization
      };
      
      setQrDataValue(JSON.stringify(data));
      
      // Try to load the QR image if available
      if (qrCode.qrImage && typeof qrCode.qrImage === 'string') {
        setQrImageUrl(qrCode.qrImage);
      } else {
        // Use placeholder and rely on canvas
        setImageError(true);
        setQrImageUrl(QR_PLACEHOLDER);
      }
      
      setLoadingImage(true);
    }
  }, [qrCode]);

  const handleImageLoad = () => {
    setLoadingImage(false);
    setImageError(false);
  };

  const handleImageError = () => {
    console.error('Failed to load QR code image, falling back to canvas');
    setLoadingImage(false);
    setImageError(true);
    setQrImageUrl(QR_PLACEHOLDER);
  };

  const handleDownload = () => {
    try {
      // Try to download the image directly if we have a URL
      if (qrImageUrl && !imageError && qrImageUrl !== QR_PLACEHOLDER) {
        const downloadLink = document.createElement('a');
        downloadLink.href = qrImageUrl;
        
        // Create a better filename with organization name and timestamp
        const orgName = typeof qrCode.organization === 'object' ? 
            qrCode.organization.name?.replace(/\s+/g, '_').toLowerCase() : 
            'organization';
        const timestamp = new Date().toISOString().replace(/:/g, '-').substring(0, 19);
        downloadLink.download = `qr-code-${orgName}-${timestamp}.png`;
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        toast.success('QR code downloaded successfully');
        return;
      }
      
      // Fallback to canvas if image failed
      const canvas = qrCanvasRef.current;
      if (!canvas) {
        throw new Error('QR code canvas not found');
      }
      
      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      
      // Create a better filename with organization name and timestamp
      const orgName = typeof qrCode.organization === 'object' ? 
          qrCode.organization.name?.replace(/\s+/g, '_').toLowerCase() : 
          'organization';
      const timestamp = new Date().toISOString().replace(/:/g, '-').substring(0, 19);
      downloadLink.download = `qr-code-${orgName}-${timestamp}.png`;
      
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      toast.success('QR code downloaded successfully');
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast.error('Failed to download QR code');
    }
  };

  const handleCopyData = () => {
    try {
      const dataToCopy = qrDataValue || JSON.stringify({
        id: qrCode._id,
        org: qrCode.organization?._id || qrCode.organization
      });
      
      navigator.clipboard.writeText(dataToCopy).then(
        () => {
          setCopySuccess(true);
          toast.success('QR code data copied to clipboard');
          // Reset copy status after 2 seconds
          setTimeout(() => setCopySuccess(false), 2000);
        },
        (err) => {
          console.error('Error copying to clipboard:', err);
          toast.error('Failed to copy QR code data');
        }
      );
    } catch (error) {
      console.error('Error copying QR code data:', error);
      toast.error('Failed to copy QR code data');
    }
  };

  const handleViewHistory = () => {
    setShowHistory(true);
  };

  // Calculate validity information using dateUtils
  const getValidityInfo = () => {
    if (!qrCode?.validUntil) return null;
    
    try {
      const validUntil = new Date(qrCode.validUntil);
      const validFrom = new Date(qrCode.validFrom || qrCode.createdAt);
      const timeRemaining = getTimeRemaining(validUntil);
      
      return {
        isValid: isQRCodeValid(validUntil),
        validFrom: formatDate(validFrom),
        validFromTime: formatTime(validFrom),
        validUntil: formatDate(validUntil),
        validUntilTime: formatTime(validUntil),
        timeRemaining
      };
    } catch (error) {
      console.error('Error calculating validity info:', error);
      return null;
    }
  };

  // Format remaining time for display
  const formatRemainingTime = (timeRemaining) => {
    if (!timeRemaining) return 'Unknown';
    
    if (timeRemaining.isExpired) {
      return "Expired";
    }
    
    if (timeRemaining.days > 0) {
      return `${timeRemaining.days}d ${timeRemaining.hours}h ${timeRemaining.minutes}m remaining`;
    }
    
    if (timeRemaining.hours > 0) {
      return `${timeRemaining.hours}h ${timeRemaining.minutes}m ${timeRemaining.seconds}s remaining`;
    }
    
    return `${timeRemaining.minutes}m ${timeRemaining.seconds}s remaining`;
  };

  // Format validity dates
  const validityInfo = getValidityInfo();
  const validFrom = validityInfo ? `${validityInfo.validFrom} ${validityInfo.validFromTime}` : 'Not specified';
  const validUntil = validityInfo ? `${validityInfo.validUntil} ${validityInfo.validUntilTime}` : 'Not specified';
  const isValid = validityInfo?.isValid || false;
  const timeRemaining = validityInfo?.timeRemaining;

  return (
    <>
      <Modal title="QR Code Details" onClose={onClose}>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-64 h-64 flex items-center justify-center bg-white p-2 rounded-lg shadow-sm">
              {/* Loading spinner */}
              {loadingImage && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-70 z-10">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"
                  />
                </div>
              )}
              
              {/* QR Image with fallback */}
              {!imageError ? (
                <img
                  src={qrImageUrl}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <QRCodeCanvas
                    ref={qrCanvasRef}
                    value={qrDataValue || qrCode._id || 'fallback'}
                    size={240}
                    level="H"
                    includeMargin={true}
                  />
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                data-tooltip-id="tooltip"
                data-tooltip-content="Download QR Code"
              >
                <FaDownload />
                <span className="hidden sm:inline">Download</span>
              </button>
              
              <button
                onClick={handleCopyData}
                className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                data-tooltip-id="tooltip"
                data-tooltip-content="Copy QR Code Data"
              >
                {copySuccess ? <FaCheck /> : <FaCopy />}
                <span className="hidden sm:inline">{copySuccess ? 'Copied!' : 'Copy Data'}</span>
              </button>
              
              <button
                onClick={handleViewHistory}
                className="flex items-center gap-2 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                data-tooltip-id="tooltip"
                data-tooltip-content="View Scan History"
              >
                <FaHistory />
                <span className="hidden sm:inline">History</span>
              </button>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-500">ID</h3>
                <p className="text-gray-800 font-mono text-sm break-all">{qrCode?._id || 'Not available'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-gray-500">Organization</h3>
                <p className="text-gray-800">
                  {qrCode?.organization?.name || 'Not available'}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-gray-500">Created By</h3>
                <p className="text-gray-800">
                  {qrCode?.createdBy?.name || 'Not available'}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-gray-500">Status</h3>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {isValid ? 'Active' : 'Expired'}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-gray-500">Valid Period</h3>
                <div className="text-gray-800">
                  <p>From: {validFrom}</p>
                  <p>Until: {validUntil}</p>
                </div>
              </div>
              
              {timeRemaining && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500">Time Remaining</h3>
                  <p className={`text-${isValid ? 'green' : 'red'}-600 font-medium`}>
                    {formatRemainingTime(timeRemaining)}
                  </p>
                </div>
              )}
              
              {qrCode?.location && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500">Location</h3>
                  <p className="text-gray-800">
                    {qrCode.location.coordinates ? 
                      `Lat: ${qrCode.location.coordinates[1]}, Long: ${qrCode.location.coordinates[0]}` : 
                      'Location data not available'}
                  </p>
                </div>
              )}
              
              {qrCode?.settings?.locationRadius && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500">Location Radius</h3>
                  <p className="text-gray-800">{qrCode.settings.locationRadius} meters</p>
                </div>
              )}
              
              {qrCode?.allowMultipleScans !== undefined && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500">Multiple Scans</h3>
                  <p className="text-gray-800">{qrCode.allowMultipleScans ? 'Allowed' : 'Not Allowed'}</p>
                </div>
              )}
              
              {qrCode?.scanHistory && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500">Scan Count</h3>
                  <p className="text-gray-800">
                    {qrCode.scanHistory.filter(scan => scan.status === 'success').length}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
      
      {/* QR Code History Modal */}
      {showHistory && (
        <QRCodeHistoryModal
          qrCodeId={qrCode._id}
          onClose={() => setShowHistory(false)}
        />
      )}
      
      <Tooltip id="tooltip" />
    </>
  );
}
