'use client';

import { useState, useEffect } from 'react';
import { FaQrcode, FaPlus, FaDownload, FaTrash, FaHistory, FaCopy, FaEye } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import GenerateQRModal from '@/components/QRCode/GenerateQRModal';
import QRCodeHistoryModal from '@/components/QRCode/QRCodeHistoryModal';
import ViewQRCodeModal from '@/components/QRCode/ViewQRCodeModal';
import { getQRCodes, deactivateQRCode } from '@/lib/api/qrcode';

export default function QRCodesPage() {
  const [qrCodes, setQRCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedQRCode, setSelectedQRCode] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showViewQRModal, setShowViewQRModal] = useState(false);

  const fetchQRCodes = async () => {
    try {
      const response = await getQRCodes();
      if (response.success) {
        setQRCodes(response.qrCodes);
      } else {
        toast.error(response.message || 'Failed to fetch QR codes');
      }
    } catch (error) {
      toast.error('An error occurred while fetching QR codes');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQRCodes();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this QR code?')) {
      try {
        const response = await deactivateQRCode(id);
        if (response.success) {
          toast.success('QR code deactivated successfully');
          fetchQRCodes(); // Refresh the list
        } else {
          toast.error(response.message || 'Failed to deactivate QR code');
        }
      } catch (error) {
        toast.error('An error occurred while deactivating QR code');
        console.error('Error:', error);
      }
    }
  };

  const handleDownload = (qrCode) => {
    // Check if QR code has an image
    if (!qrCode.qrImage && !qrCode.imageUrl) {
      toast.error('QR code image is not available for download');
      return;
    }
    
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
          link.download = `qr-code-${qrCode.id || 'download'}.png`;
          document.body.appendChild(link);
          link.click();
          
          // Clean up
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          toast.success('QR code downloaded successfully');
        }, 'image/png');
      };
      
      img.onerror = () => {
        throw new Error('Failed to load QR code image');
      };
      
      // Set the source of the image to the QR code data URL
      img.src = qrCode.qrImage || qrCode.imageUrl;
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast.error('Failed to download QR code');
    }
  };

  const handleCopy = (qrCode) => {
    navigator.clipboard.writeText(qrCode.url).then(() => {
      toast.success('QR code URL copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy URL');
    });
  };

  const handleViewHistory = (qrCode) => {
    setSelectedQRCode(qrCode);
    setShowHistoryModal(true);
  };

  const handleViewQRCode = (qrCode) => {
    // Ensure the QR code has the necessary data for display
    if (!qrCode.qrImage) {
      // If qrImage is not available, try to use imageUrl
      if (qrCode.imageUrl) {
        qrCode.qrImage = qrCode.imageUrl;
      } else {
        toast.error('QR code image is not available');
        return;
      }
    }
    
    setSelectedQRCode(qrCode);
    setShowViewQRModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-[#ff0080]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#ff0080] to-[#7928ca] bg-clip-text text-transparent">
          QR Code Management
        </h1>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#ff0080] to-[#7928ca] text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <FaPlus />
          Generate QR Code
        </button>
      </div>

      {/* QR Code Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-black/40 border border-gray-800">
          <h3 className="text-lg font-semibold text-white">Active QR Codes</h3>
          <p className="text-3xl font-bold text-[#ff0080] mt-2">
            {qrCodes.filter(qr => qr.status === 'active').length}
          </p>
          <p className="text-gray-400 text-sm">Currently in use</p>
        </div>
        <div className="p-6 rounded-xl bg-black/40 border border-gray-800">
          <h3 className="text-lg font-semibold text-white">Total Scans</h3>
          <p className="text-3xl font-bold text-[#7928ca] mt-2">
            {qrCodes.reduce((total, qr) => total + qr.scans, 0)}
          </p>
          <p className="text-gray-400 text-sm">All time</p>
        </div>
        <div className="p-6 rounded-xl bg-black/40 border border-gray-800">
          <h3 className="text-lg font-semibold text-white">Organizations</h3>
          <p className="text-3xl font-bold text-emerald-500 mt-2">
            {new Set(qrCodes.map(qr => qr.organizationId)).size}
          </p>
          <p className="text-gray-400 text-sm">Using QR codes</p>
        </div>
      </div>

      {/* QR Code Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {qrCodes.map((qr, index) => (
          <motion.div
            key={qr.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 rounded-xl bg-black/40 border border-gray-800 backdrop-blur-sm hover:bg-black/60 transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white">{qr.name}</h3>
                <p className="text-gray-400 text-sm">{qr.organization?.name}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleDownload(qr)}
                  className="p-2 rounded-lg bg-[#ff0080]/20 text-[#ff0080] hover:bg-[#ff0080]/30 transition-colors"
                >
                  <FaDownload />
                </button>
                <button 
                  onClick={() => handleDelete(qr.id)}
                  className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                >
                  <FaTrash />
                </button>
                <button 
                  onClick={() => handleViewQRCode(qr)}
                  className="p-2 rounded-lg bg-[#7928ca]/20 text-[#7928ca] hover:bg-[#7928ca]/30 transition-colors"
                >
                  <FaEye />
                </button>
              </div>
            </div>

            {/* QR Code Preview */}
            <div className="aspect-square bg-white p-4 rounded-lg mb-4">
              {qr.imageUrl ? (
                <img 
                  src={qr.imageUrl} 
                  alt={qr.name} 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-[#ff0080]/10 rounded-lg flex items-center justify-center">
                  <FaQrcode className="w-16 h-16 text-[#ff0080]" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 rounded-lg bg-[#ff0080]/10">
                <p className="text-sm font-medium text-[#ff0080]">Status</p>
                <p className="text-white capitalize">{qr.status}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-[#7928ca]/10">
                <p className="text-sm font-medium text-[#7928ca]">Scans</p>
                <p className="text-white">{qr.scans || 0}</p>
              </div>
            </div>

            <div className="mb-4 p-3 rounded-lg bg-gray-800/50">
              <p className="text-sm font-medium text-gray-300 mb-1">Multiple Scans</p>
              <p className="text-white">{qr.allowMultipleScans ? 'Allowed' : 'Not Allowed'}</p>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => handleViewHistory(qr)}
                className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[#ff0080] to-[#7928ca] text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <FaHistory />
                View History
              </button>
              <button 
                onClick={() => handleCopy(qr)}
                className="px-3 py-2 rounded-lg bg-black/40 text-white hover:bg-black/60 transition-colors"
              >
                <FaCopy />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modals */}
      {showGenerateModal && (
        <GenerateQRModal
          onClose={() => setShowGenerateModal(false)}
          onSuccess={(newQRCode) => {
            fetchQRCodes();
            toast.success('QR code generated successfully!');
          }}
        />
      )}

      {showHistoryModal && selectedQRCode && (
        <QRCodeHistoryModal
          qrCodeId={selectedQRCode.id}
          onClose={() => {
            setShowHistoryModal(false);
            setSelectedQRCode(null);
          }}
        />
      )}

      {showViewQRModal && selectedQRCode && (
        <ViewQRCodeModal
          qrCode={selectedQRCode}
          onClose={() => {
            setShowViewQRModal(false);
            setSelectedQRCode(null);
          }}
        />
      )}
    </div>
  );
}
