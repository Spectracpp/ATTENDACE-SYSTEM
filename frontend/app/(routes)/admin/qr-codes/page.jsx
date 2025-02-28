'use client';

import { useState, useEffect } from 'react';
import { FaQrcode, FaPlus, FaDownload, FaTrash, FaHistory, FaCopy, FaSearch, FaTimes, FaClock, FaLayerGroup, FaCalendarAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import ViewQRCodeModal from '@/components/QRCode/ViewQRCodeModal';
import QRCodeHistoryModal from '@/components/QRCode/QRCodeHistoryModal';
import { getQRCodes, deactivateQRCode, generateQRCode } from '@/lib/api/qrcode';
import { getOrganizations } from '@/lib/api/organizations';

// Placeholder QR code as a data URL (simple black and white QR pattern SVG)
const QR_PLACEHOLDER = "data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' shape-rendering='crispEdges'%3e%3cpath fill='%23ffffff' d='M0 0h100v100H0z'/%3e%3cpath stroke='%23000000' d='M15 15h7M15 16h7M15 17h7M15 18h7M15 19h7M15 20h7M15 21h7M22 15h7M22 21h7M29 15h7M29 16h7M29 17h7M29 18h7M29 19h7M29 20h7M29 21h7M36 15h7M36 21h7M43 15h7M43 21h7M50 15h7M50 16h7M50 17h7M50 18h7M50 19h7M50 20h7M50 21h7M64 15h7M64 16h7M64 17h7M64 18h7M64 19h7M64 20h7M64 21h7M71 15h7M71 21h7M78 15h7M78 16h7M78 17h7M78 18h7M78 19h7M78 20h7M78 21h7M15 29h7M15 35h7M15 36h7M15 37h7M15 38h7M15 39h7M15 40h7M15 41h7M15 42h7M15 43h7M15 49h7M15 50h7M15 51h7M15 52h7M15 53h7M15 54h7M15 55h7M15 56h7M15 57h7M15 64h7M15 65h7M15 66h7M15 67h7M15 68h7M15 69h7M15 70h7M15 71h7M15 72h7M15 78h7M15 79h7M15 80h7M15 81h7M15 82h7M15 83h7M15 84h7M22 29h7M22 35h7M22 43h7M22 49h7M22 57h7M22 71h7M22 78h7M29 29h7M29 35h7M29 43h7M29 49h7M29 57h7M29 64h7M29 65h7M29 66h7M29 67h7M29 68h7M29 69h7M29 70h7M29 71h7M29 78h7M36 29h7M36 35h7M36 36h7M36 37h7M36 38h7M36 39h7M36 40h7M36 41h7M36 42h7M36 43h7M36 49h7M36 56h7M36 57h7M36 64h7M36 71h7M36 78h7M43 29h7M43 43h7M43 49h7M43 57h7M43 64h7M43 71h7M43 78h7M50 29h7M50 30h7M50 31h7M50 32h7M50 33h7M50 34h7M50 35h7M50 43h7M50 49h7M50 50h7M50 51h7M50 52h7M50 53h7M50 54h7M50 55h7M50 56h7M50 57h7M50 64h7M50 71h7M50 72h7M50 73h7M50 74h7M50 75h7M50 76h7M50 77h7M50 78h7M57 29h7M57 35h7M57 43h7M57 64h7M57 71h7M64 29h7M64 35h7M64 43h7M64 49h7M64 50h7M64 51h7M64 52h7M64 53h7M64 54h7M64 55h7M64 56h7M64 57h7M64 64h7M64 71h7M71 29h7M71 35h7M71 43h7M71 49h7M71 57h7M71 64h7M71 71h7M78 29h7M78 30h7M78 31h7M78 32h7M78 33h7M78 34h7M78 35h7M78 43h7M78 49h7M78 50h7M78 51h7M78 52h7M78 53h7M78 54h7M78 55h7M78 56h7M78 57h7M78 64h7M78 65h7M78 66h7M78 67h7M78 68h7M78 69h7M78 70h7M78 71h7'/%3e%3c/svg%3e";

export default function QRCodesPage() {
  const [qrCodes, setQRCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQRCode, setSelectedQRCode] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [filteredQRCodes, setFilteredQRCodes] = useState([]);
  const [scanHistory, setScanHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    organizationId: '',
    name: '',
    description: '',
    type: 'attendance',
    validityHours: 24,
    allowMultipleScans: false,
  });
  const [organizations, setOrganizations] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchQRCodes = async () => {
    try {
      setIsLoading(true);
      const response = await getQRCodes();
      if (response.success) {
        setQRCodes(response.qrCodes || []);
        setFilteredQRCodes(response.qrCodes || []);
      } else {
        setError(response.message || 'Failed to fetch QR codes');
        toast.error(response.message || 'Failed to fetch QR codes');
      }
    } catch (error) {
      console.error('Error fetching QR codes:', error);
      setError('An unexpected error occurred. Please try again.');
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const response = await getOrganizations();
      if (response.success) {
        setOrganizations(response.organizations || []);
      } else {
        console.error('Failed to fetch organizations:', response.message);
        toast.error('Failed to fetch organizations');
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast.error('Failed to fetch organizations');
    }
  };

  useEffect(() => {
    fetchQRCodes();
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredQRCodes(qrCodes);
      return;
    }

    const lowerCaseSearch = searchTerm.toLowerCase();
    const filtered = qrCodes.filter(qr => 
      (qr.name && qr.name.toLowerCase().includes(lowerCaseSearch)) ||
      (qr.type && qr.type.toLowerCase().includes(lowerCaseSearch)) ||
      (qr.organization?.name && qr.organization.name.toLowerCase().includes(lowerCaseSearch)) ||
      (qr._id && qr._id.toLowerCase().includes(lowerCaseSearch))
    );

    setFilteredQRCodes(filtered);
  }, [searchTerm, qrCodes]);

  const handleDelete = async (qrCodeId) => {
    setShowDeleteModal(true);
    setSelectedQRCode(qrCodeId);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deactivateQRCode(selectedQRCode);
      toast.success('QR code deactivated successfully');
      fetchQRCodes(); // Refresh the list
    } catch (error) {
      console.error('Error deactivating QR code:', error);
      toast.error('Failed to deactivate QR code');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleDownloadQRCode = (qrCode) => {
    if (!qrCode.qrImage) {
      toast.error('QR code image not available for download');
      return;
    }
    
    // Create a link and trigger download
    const link = document.createElement('a');
    link.href = qrCode.qrImage;
    link.download = `qrcode-${qrCode.name || qrCode._id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('QR code downloaded successfully');
  };

  const handleCopy = (qrCode) => {
    if (!qrCode.qrImage) {
      toast.error('QR code URL not available');
      return;
    }
    
    navigator.clipboard.writeText(qrCode.qrImage)
      .then(() => {
        toast.success('QR code URL copied to clipboard');
      })
      .catch((error) => {
        console.error('Error copying to clipboard:', error);
        toast.error('Failed to copy QR code URL');
      });
  };

  const handleViewHistory = (qrCode) => {
    setSelectedQRCode(qrCode);
    setShowHistoryModal(true);
  };

  const handleViewQRCode = (qrCode) => {
    // Ensure the QR code has the expected structure
    const formattedQRCode = {
      ...qrCode,
      // Ensure qrImage is available (might be in imageUrl in some responses)
      qrImage: qrCode.qrImage || qrCode.imageUrl,
      // Ensure organization data is properly structured
      organization: {
        id: qrCode.organizationId || (qrCode.organization && qrCode.organization.id) || '',
        name: qrCode.organizationName || (qrCode.organization && qrCode.organization.name) || 'N/A'
      }
    };
    
    setSelectedQRCode(formattedQRCode);
    setShowViewModal(true);
  };

  const handleGenerateQRCode = async (e) => {
    if (e) e.preventDefault();
    
    try {
      setGenerating(true);
      
      // Form validation
      if (!formData.name?.trim()) {
        toast.error('Please enter a name for the QR code');
        setGenerating(false);
        return;
      }
      
      if (!formData.organizationId) {
        toast.error('Please select an organization');
        setGenerating(false);
        return;
      }
      
      if (!formData.type) {
        toast.error('Please select a QR code type');
        setGenerating(false);
        return;
      }
      
      const organizationId = formData.organizationId;
      
      // Format the data according to the API requirements
      const formattedData = {
        name: formData.name.trim(),
        description: formData.description || '',
        type: formData.type || 'standard',
        validityHours: parseInt(formData.validityHours) || 24,
        allowMultipleScans: formData.allowMultipleScans || false,
        meta: {
          createdAt: new Date().toISOString(),
        }
      };

      // Show loading toast
      const loadingToastId = toast.loading('Generating QR code...');

      try {
        // Call the API to generate the QR code
        const response = await generateQRCode(organizationId, formattedData);
        
        // Dismiss the loading toast
        toast.dismiss(loadingToastId);
        
        if (response.success) {
          // Success! Update the QR codes list
          toast.success('QR code generated successfully');
          setShowGenerateModal(false);
          setFormData({
            organizationId: '',
            name: '',
            description: '',
            type: 'attendance',
            validityHours: 24,
            allowMultipleScans: false,
          });
          
          // Fetch updated QR codes
          fetchQRCodes();
        } else {
          // API returned error
          toast.error(response.message || 'Failed to generate QR code');
          console.error('Failed to generate QR code:', response);
        }
      } catch (apiError) {
        // API call failed
        toast.dismiss(loadingToastId);
        toast.error('Error generating QR code. Please try again.');
        console.error('API error generating QR code:', apiError);
      }
    } catch (error) {
      // General error
      toast.error('An unexpected error occurred');
      console.error('Error in handleGenerateQRCode:', error);
    } finally {
      setGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 border-4 border-t-[#ff0080] border-r-[#ff0080] border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-white text-lg">Loading QR codes...</p>
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
        <motion.div 
          className="p-6 rounded-xl bg-gradient-to-br from-[#1f1f2b] to-[#121218] shadow-lg border border-gray-800 hover:border-[#ff0080] transition-all"
          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        >
          <div className="flex items-center mb-3">
            <div className="p-2 rounded-lg bg-[#ff0080]/20">
              <FaQrcode className="text-xl text-[#ff0080]" />
            </div>
            <h3 className="text-lg font-semibold text-white ml-3">Active QR Codes</h3>
          </div>
          <p className="text-3xl font-bold text-[#ff0080] mt-2">
            {Array.isArray(filteredQRCodes) ? filteredQRCodes.filter(qr => 
              qr.isActive === true || 
              qr.status === 'active' || 
              qr.active === true
            ).length : 0}
          </p>
          <p className="text-gray-400 text-sm mt-1">Currently in use</p>
        </motion.div>
        <motion.div 
          className="p-6 rounded-xl bg-gradient-to-br from-[#1f1f2b] to-[#121218] shadow-lg border border-gray-800 hover:border-[#7928ca] transition-all"
          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        >
          <div className="flex items-center mb-3">
            <div className="p-2 rounded-lg bg-[#7928ca]/20">
              <FaHistory className="text-xl text-[#7928ca]" />
            </div>
            <h3 className="text-lg font-semibold text-white ml-3">Total Scans</h3>
          </div>
          <p className="text-3xl font-bold text-[#7928ca] mt-2">
            {Array.isArray(filteredQRCodes) ? filteredQRCodes.reduce((total, qr) => total + (qr.scans || 0), 0) : 0}
          </p>
          <p className="text-gray-400 text-sm mt-1">All time</p>
        </motion.div>
        <motion.div 
          className="p-6 rounded-xl bg-gradient-to-br from-[#1f1f2b] to-[#121218] shadow-lg border border-gray-800 hover:border-emerald-500 transition-all"
          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        >
          <div className="flex items-center mb-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <FaQrcode className="text-xl text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold text-white ml-3">Organizations</h3>
          </div>
          <p className="text-3xl font-bold text-emerald-500 mt-2">
            {Array.isArray(filteredQRCodes) ? new Set(filteredQRCodes.map(qr => qr.organizationId).filter(Boolean)).size : 0}
          </p>
          <p className="text-gray-400 text-sm mt-1">Using QR codes</p>
        </motion.div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <FaSearch className="text-gray-400" />
        </div>
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, type, organization or ID..."
          className="w-full p-3.5 pl-10 text-sm rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff0080] focus:border-transparent transition-all"
        />
      </div>

      {/* QR Code Table */}
      <div className="overflow-x-auto rounded-xl">
        {!Array.isArray(filteredQRCodes) || filteredQRCodes.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center p-12 rounded-xl bg-gradient-to-br from-[#1f1f2b] to-[#121218] border border-gray-800"
          >
            <FaQrcode className="mx-auto text-5xl text-[#ff0080] mb-6" />
            <h3 className="text-2xl font-medium text-white mb-3">No QR Codes Found</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">Create your first QR code by clicking the "Generate QR Code" button above.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowGenerateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#ff0080] to-[#7928ca] text-white rounded-lg shadow-lg hover:shadow-[#ff0080]/20 transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
            >
              <FaPlus />
              Generate QR Code
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQRCodes.map((qrCode, index) => (
              <motion.div
                key={qrCode._id || index}
                className="bg-gradient-to-br from-[#1a1a25] to-[#14141c] rounded-lg shadow-xl border border-gray-800 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                {/* QR Code Image */}
                <div className="relative aspect-square bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4 overflow-hidden">
                  {qrCode.qrImage ? (
                    <img 
                      src={qrCode.qrImage} 
                      alt={`QR Code: ${qrCode.name}`} 
                      className="max-w-full max-h-full object-contain rounded-md shadow-md transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = QR_PLACEHOLDER; 
                        console.error(`Failed to load QR image for ${qrCode.name}`);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900 rounded-md">
                      <FaQrcode className="text-gray-700 text-5xl" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium shadow-lg ${
                    qrCode.isActive || qrCode.status === 'active' || qrCode.active
                      ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                      : 'bg-red-500/20 text-red-400 border border-red-500/50'
                  }`}>
                    {qrCode.isActive || qrCode.status === 'active' || qrCode.active === true ? 'Active' : 'Inactive'}
                  </div>
                </div>
                
                {/* QR Code Details */}
                <div className="p-4">
                  <h3 className="font-semibold text-white text-lg truncate">{qrCode.name}</h3>
                  
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center text-sm text-gray-400">
                      <FaLayerGroup className="mr-2 text-gray-500" />
                      <span className="truncate">
                        {qrCode.organization?.name || 
                         (qrCode.organizationDetails && qrCode.organizationDetails.name) || 
                         'Unknown organization'}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-400">
                      <FaCalendarAlt className="mr-2 text-gray-500" />
                      <span>
                        Created: {new Date(qrCode.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-400">
                      <FaClock className="mr-2 text-gray-500" />
                      <span>
                        {qrCode.validityHours ? `${qrCode.validityHours} hour validity` : 'No expiration'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <div className="flex-1">
                      <button
                        onClick={() => handleViewQRCode(qrCode)}
                        className="w-full py-2 bg-gradient-to-r from-[#2d3748] to-[#1a202c] rounded-lg text-white font-medium flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:from-[#3a4a61] hover:to-[#2a3441]"
                      >
                        <FaQrcode className="mr-2" />
                        View
                      </button>
                    </div>
                    
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleDownloadQRCode(qrCode)}
                        className="p-2 bg-gradient-to-r from-[#2d3748] to-[#1a202c] rounded-lg text-white transition-all duration-300 hover:shadow-lg hover:from-[#3a4a61] hover:to-[#2a3441]"
                        title="Download QR Code"
                      >
                        <FaDownload className="text-sm" />
                      </button>
                      
                      <button
                        onClick={() => handleCopy(qrCode)}
                        className="p-2 bg-gradient-to-r from-[#2d3748] to-[#1a202c] rounded-lg text-white transition-all duration-300 hover:shadow-lg hover:from-[#3a4a61] hover:to-[#2a3441]"
                        title="Copy QR Code URL"
                      >
                        <FaCopy className="text-sm" />
                      </button>
                      
                      <button
                        onClick={() => handleViewHistory(qrCode)}
                        className="p-2 bg-gradient-to-r from-[#2d3748] to-[#1a202c] rounded-lg text-white transition-all duration-300 hover:shadow-lg hover:from-[#3a4a61] hover:to-[#2a3441]"
                        title="View Scan History"
                      >
                        <FaHistory className="text-sm" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(qrCode._id)}
                        className="p-2 bg-gradient-to-r from-[#e53e3e] to-[#c53030] rounded-lg text-white transition-all duration-300 hover:shadow-lg hover:from-[#f56565] hover:to-[#e53e3e]"
                        title="Delete QR Code"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-gradient-to-br from-[#1f1f2b] to-[#121218] rounded-xl shadow-2xl border border-gray-800 max-w-lg w-full overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="border-b border-gray-800 py-4 px-6 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center">
                <FaQrcode className="mr-2 text-[#ff0080]" />
                Generate New QR Code
              </h3>
              <button 
                onClick={() => setShowGenerateModal(false)}
                className="p-1 text-gray-400 hover:text-white transition-colors hover:bg-gray-800 rounded-lg"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            
            <div className="p-6">
              <form onSubmit={(e) => handleGenerateQRCode(e)} className="space-y-4">
                <div>
                  <label htmlFor="organizationId" className="block text-sm font-medium text-gray-300 mb-1">
                    Organization
                  </label>
                  <select
                    id="organizationId"
                    value={formData.organizationId}
                    onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff0080] focus:border-transparent"
                    required
                  >
                    <option value="">Select an organization</option>
                    {/* Map through organizations dynamically if available */}
                    {Array.isArray(organizations) && organizations.map((org) => (
                      <option key={org._id} value={org._id}>{org.name}</option>
                    ))}
                    {/* Fallback static options if no dynamic data available */}
                    {(!Array.isArray(organizations) || organizations.length === 0) && (
                      <>
                        <option value="org1">Organization 1</option>
                        <option value="org2">Organization 2</option>
                        <option value="org3">Organization 3</option>
                      </>
                    )}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                    QR Code Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff0080] focus:border-transparent"
                    placeholder="Enter a name for this QR code"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                    QR Code Description
                  </label>
                  <input
                    type="text"
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff0080] focus:border-transparent"
                    placeholder="Enter a description for this QR code"
                  />
                </div>
                
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-1">
                    QR Code Type
                  </label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff0080] focus:border-transparent"
                    required
                  >
                    <option value="">Select type</option>
                    <option value="attendance">Attendance</option>
                    <option value="event">Event</option>
                    <option value="access">Access Control</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="validityHours" className="block text-sm font-medium text-gray-300 mb-1">
                    Validity Period (Hours)
                  </label>
                  <input
                    type="number"
                    id="validityHours"
                    min="1"
                    max="168"
                    value={formData.validityHours}
                    onChange={(e) => setFormData({ ...formData, validityHours: e.target.value })}
                    className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff0080] focus:border-transparent"
                    placeholder="Enter validity period in hours"
                    required
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allowMultipleScans"
                    checked={formData.allowMultipleScans}
                    onChange={(e) => setFormData({ ...formData, allowMultipleScans: e.target.checked })}
                    className="w-4 h-4 text-[#ff0080] bg-gray-900 border-gray-700 rounded focus:ring-2 focus:ring-[#ff0080] focus:border-transparent"
                  />
                  <label htmlFor="allowMultipleScans" className="ml-2 text-sm font-medium text-gray-300">
                    Allow multiple scans
                  </label>
                </div>
                
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowGenerateModal(false)}
                    className="px-5 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all duration-300 flex-1"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={generating}
                    className={`px-5 py-2.5 bg-gradient-to-r from-[#ff0080] to-[#7928ca] text-white rounded-lg shadow-lg hover:shadow-[#ff0080]/20 transition-all duration-300 flex-1 flex items-center justify-center ${
                      generating ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {generating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <FaQrcode className="mr-2" />
                        Generate QR Code
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {selectedQRCode && showHistoryModal && (
        <QRCodeHistoryModal 
          qrCodeId={selectedQRCode._id || selectedQRCode.id} 
          qrCodeName={selectedQRCode.name}
          onClose={() => setShowHistoryModal(false)} 
        />
      )}

      {selectedQRCode && showViewModal && (
        <ViewQRCodeModal 
          qrCode={selectedQRCode} 
          isOpen={showViewModal} 
          onClose={() => setShowViewModal(false)} 
        />
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-gradient-to-br from-[#1f1f2b] to-[#121218] rounded-xl shadow-2xl border border-gray-800 max-w-md w-full overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="border-b border-gray-800 py-4 px-6 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center">
                <FaTrash className="mr-2 text-red-500" />
                Delete QR Code
              </h3>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="p-1 text-gray-400 hover:text-white transition-colors hover:bg-gray-800 rounded-lg"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6 text-center">
                <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                  <FaTrash className="text-red-500 text-2xl" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Are you sure?</h4>
                <p className="text-gray-400">
                  This action cannot be undone. This will permanently delete the QR code and all associated data.
                </p>
              </div>
              
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDeleteModal(false)}
                  className="px-5 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all duration-300 flex-1"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={confirmDelete}
                  disabled={deleting}
                  className={`px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg shadow-lg hover:shadow-red-600/20 transition-all duration-300 flex-1 flex items-center justify-center ${
                    deleting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {deleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FaTrash className="mr-2" />
                      Delete QR Code
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
