'use client';

import { useState, useEffect, useCallback } from 'react';
import Modal from '../Modal';
import { 
  FaTimes, FaExclamationTriangle, FaCheckCircle, FaMobile, FaTablet,
  FaDesktop, FaClock, FaMapMarkerAlt, FaQuestionCircle, FaGlobe,
  FaRedoAlt, FaDownload, FaFilter, FaSortAmountDown, FaSortAmountUp
} from 'react-icons/fa';
import { getScanHistory } from '@/lib/api/qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate, formatTime, getTimeAgo } from '@/lib/utils/dateUtils';
import { SCAN_STATUS_COLORS, DEVICE_ICONS, QR_ERROR_MESSAGES } from '@/lib/constants/qrcode';
import toast from 'react-hot-toast';

/**
 * QRCodeHistoryModal Component
 * 
 * Displays a modal with the scan history for a QR code, including
 * user information, timestamps, locations, and device information.
 */
export default function QRCodeHistoryModal({ qrCodeId, onClose }) {
  const [scanHistory, setScanHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [retryInProgress, setRetryInProgress] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  // Load scan history when the component mounts or when we retry
  useEffect(() => {
    loadScanHistory();
    
    // Clean up timeout on unmount
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [qrCodeId, retryCount]);

  // Apply filters whenever scanHistory or filters change
  useEffect(() => {
    applyFilters();
  }, [scanHistory, statusFilter, sortOrder]);

  // Function to load scan history data
  const loadScanHistory = async () => {
    if (!qrCodeId) {
      setError('QR code ID is missing');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    setRetryInProgress(true);
    
    try {
      // Set a timeout to show a message if the request takes too long
      const timeout = setTimeout(() => {
        toast.loading('Still fetching scan history...');
      }, 5000);
      
      setTimeoutId(timeout);
      
      const response = await getScanHistory(qrCodeId);
      
      // Clear the timeout since we got a response
      clearTimeout(timeout);
      setTimeoutId(null);
      
      if (response && response.success) {
        // Process and sort the history data
        const processedHistory = (response.history || []).map(scan => ({
          ...scan,
          // Ensure scannedAt is a valid date or use current time as fallback
          scannedAt: scan.scannedAt ? new Date(scan.scannedAt) : new Date(),
          // Generate a unique ID if one doesn't exist
          id: scan.id || `scan-${Math.random().toString(36).substr(2, 9)}`
        }));
        
        setScanHistory(processedHistory);
        
        // Show toast if using mock data
        if (response.message && response.message.includes('mock data')) {
          toast.info('Using demo data - API endpoint not available', {
            icon: '🔍',
            duration: 4000
          });
        } else if (processedHistory.length === 0) {
          toast.info('No scan history found for this QR code', {
            icon: '📊',
            duration: 3000
          });
        }
      } else {
        setError(response?.message || QR_ERROR_MESSAGES.SERVER_ERROR);
        setScanHistory([]);
        
        toast.error(response?.message || 'Failed to load scan history');
      }
    } catch (error) {
      console.error('Error loading scan history:', error);
      setError(error.message || QR_ERROR_MESSAGES.NETWORK_ERROR);
      setScanHistory([]);
      
      toast.error('An error occurred while loading scan history');
    } finally {
      setLoading(false);
      setRetryInProgress(false);
    }
  };

  // Apply filters to scan history
  const applyFilters = useCallback(() => {
    let filtered = [...scanHistory];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(scan => 
        (scan.status || '').toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    // Apply sort order
    filtered.sort((a, b) => {
      const dateA = new Date(a.scannedAt).getTime();
      const dateB = new Date(b.scannedAt).getTime();
      
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    setFilteredHistory(filtered);
  }, [scanHistory, statusFilter, sortOrder]);

  // Handle retry button click
  const handleRetry = () => {
    if (retryInProgress) return;
    
    setRetryCount(prev => prev + 1);
    toast.loading('Retrying...');
  };

  // Export history to CSV
  const handleExportCSV = () => {
    try {
      if (scanHistory.length === 0) {
        toast.error('No data to export');
        return;
      }
      
      // Create CSV header
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "ID,User,Email,Status,Scanned At,Location,Device,Browser,IP Address\n";
      
      // Add each history item as a row
      scanHistory.forEach(scan => {
        const row = [
          scan.id || '',
          scan.userName || 'Unknown',
          scan.email || '',
          scan.status || 'Unknown',
          scan.scannedAt ? new Date(scan.scannedAt).toISOString() : '',
          scan.location || '',
          scan.deviceInfo || '',
          scan.browser || '',
          scan.ipAddress || ''
        ].map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',');
        
        csvContent += row + '\n';
      });
      
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `qr-scan-history-${qrCodeId}.csv`);
      document.body.appendChild(link);
      
      // Download the CSV file
      link.click();
      document.body.removeChild(link);
      
      toast.success('History exported to CSV');
    } catch (error) {
      console.error('Error exporting history:', error);
      toast.error('Failed to export history');
    }
  };

  // Status badge component with tooltip
  const StatusBadge = ({ status, failureReason }) => {
    const statusLower = status?.toLowerCase() || 'unknown';
    const color = SCAN_STATUS_COLORS[statusLower] || SCAN_STATUS_COLORS.unknown;
    
    if (statusLower === 'success') {
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full bg-${color}-100 text-${color}-800`}>
          <FaCheckCircle className={`text-${color}-600`} />
          <span>Success</span>
        </span>
      );
    } else {
      return (
        <div className="space-y-1">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full bg-${color}-100 text-${color}-800`}
                data-tooltip-id="history-tooltip" 
                data-tooltip-content={failureReason || `Scan status: ${statusLower}`}>
            <FaExclamationTriangle className={`text-${color}-600`} />
            <span>{statusLower === 'failed' ? 'Failed' : statusLower}</span>
          </span>
          {failureReason && (
            <div className="text-xs text-red-600 ml-2 line-clamp-2">{failureReason}</div>
          )}
        </div>
      );
    }
  };

  // Device icon component
  const getDeviceIcon = (deviceInfo) => {
    if (!deviceInfo) return <FaQuestionCircle className="text-gray-400" />;
    
    const deviceLower = deviceInfo.toLowerCase();
    
    if (deviceLower.includes('iphone') || 
        deviceLower.includes('android') || 
        deviceLower.includes('mobile') || 
        deviceLower.includes('phone')) {
      return <FaMobile className="text-blue-500" />;
    }
    
    if (deviceLower.includes('ipad') || 
        deviceLower.includes('tablet') || 
        deviceLower.includes('galaxy tab')) {
      return <FaTablet className="text-purple-500" />;
    }
    
    if (deviceLower.includes('macbook') || 
        deviceLower.includes('windows') || 
        deviceLower.includes('linux') || 
        deviceLower.includes('desktop') || 
        deviceLower.includes('laptop')) {
      return <FaDesktop className="text-green-500" />;
    }
    
    return <FaQuestionCircle className="text-gray-400" />;
  };

  // Browser icon component
  const getBrowserIcon = (browser) => {
    if (!browser) return null;
    return <FaGlobe className="text-gray-400" />;
  };

  return (
    <Modal title="QR Code Scan History" onClose={onClose}>
      <div className="space-y-4">
        {!loading && !error && scanHistory.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 text-sm ${statusFilter === 'all' ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('success')}
                className={`px-3 py-1 text-sm ${statusFilter === 'success' ? 'bg-green-500 text-white' : 'text-gray-700'}`}
              >
                Success
              </button>
              <button
                onClick={() => setStatusFilter('failed')}
                className={`px-3 py-1 text-sm ${statusFilter === 'failed' ? 'bg-red-500 text-white' : 'text-gray-700'}`}
              >
                Failed
              </button>
            </div>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm"
              title={`Sort by ${sortOrder === 'newest' ? 'oldest' : 'newest'} first`}
            >
              {sortOrder === 'newest' ? (
                <>
                  <FaSortAmountDown className="text-gray-500" />
                  <span>Newest</span>
                </>
              ) : (
                <>
                  <FaSortAmountUp className="text-gray-500" />
                  <span>Oldest</span>
                </>
              )}
            </button>
            
            {scanHistory.length > 0 && (
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm ml-auto"
                title="Export history to CSV"
              >
                <FaDownload className="text-green-600" />
                <span>Export</span>
              </button>
            )}
          </div>
        )}
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
            />
            <p className="text-gray-500">Loading scan history...</p>
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <FaExclamationTriangle className="text-yellow-500 text-4xl mx-auto mb-4" />
            <p className="text-red-500">{error}</p>
            <button
              onClick={handleRetry}
              disabled={retryInProgress}
              className={`mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ${retryInProgress ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {retryInProgress ? (
                <span className="flex items-center gap-2">
                  <FaRedoAlt className="animate-spin" />
                  Retrying...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <FaRedoAlt />
                  Retry
                </span>
              )}
            </button>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-8">
            {statusFilter !== 'all' ? (
              <p className="text-gray-500">
                No {statusFilter} scans found for this QR code.
                <button
                  onClick={() => setStatusFilter('all')}
                  className="ml-2 text-blue-500 hover:underline"
                >
                  View all
                </button>
              </p>
            ) : (
              <p className="text-gray-500">No scan history available for this QR code.</p>
            )}
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto pr-2">
            <AnimatePresence>
              {filteredHistory.map((scan, index) => (
                <motion.div
                  key={scan.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {scan.userName || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-gray-500">{scan.email || 'No email provided'}</p>
                      </div>
                      <StatusBadge status={scan.status} failureReason={scan.failureReason} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FaClock className="text-gray-400" />
                        <span>
                          {scan.scannedAt ? (
                            <>
                              <div>{formatDate(new Date(scan.scannedAt))}</div>
                              <div>{formatTime(new Date(scan.scannedAt))}</div>
                              <div className="text-xs text-gray-400">{getTimeAgo(new Date(scan.scannedAt))}</div>
                            </>
                          ) : (
                            'Unknown time'
                          )}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <FaMapMarkerAlt className="text-gray-400" />
                        <span>{scan.location || 'Location not available'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        {getDeviceIcon(scan.deviceInfo)}
                        <span>{scan.deviceInfo || 'Device info not available'}</span>
                      </div>
                      
                      {scan.browser && (
                        <div className="flex items-start gap-2 text-gray-600">
                          {getBrowserIcon(scan.browser)}
                          <span>{scan.browser}</span>
                        </div>
                      )}
                      
                      {scan.ipAddress && (
                        <div className="flex items-start gap-2 text-gray-600">
                          <span className="text-gray-400">IP:</span>
                          <span className="font-mono">{scan.ipAddress}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </Modal>
  );
}
