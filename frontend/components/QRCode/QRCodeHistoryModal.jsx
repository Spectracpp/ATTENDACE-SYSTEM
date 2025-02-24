'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaUser, FaClock } from 'react-icons/fa';
import { getQRCodeHistory } from '@/lib/api/qrcode';
import { toast } from 'react-hot-toast';

export default function QRCodeHistoryModal({ qrCodeId, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await getQRCodeHistory(qrCodeId);
        if (response.success) {
          setHistory(response.history);
        } else {
          toast.error(response.message || 'Failed to fetch history');
        }
      } catch (error) {
        toast.error('An error occurred while fetching history');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [qrCodeId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 p-6 rounded-xl w-full max-w-2xl relative max-h-[80vh] overflow-hidden flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <FaTimes />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">QR Code Scan History</h2>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-[#ff0080]">Loading...</div>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1">
            {history.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No scan history available
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((scan) => (
                  <div
                    key={scan.id}
                    className="p-4 rounded-lg bg-black/40 border border-gray-800"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-[#ff0080]/20">
                        <FaUser className="text-[#ff0080]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-white font-medium">{scan.userName}</h3>
                          <span className="text-sm text-gray-400 flex items-center gap-2">
                            <FaClock />
                            {new Date(scan.scannedAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">{scan.location || 'No location data'}</p>
                        <div className="mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            scan.status === 'success' ? 'bg-green-500/20 text-green-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {scan.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
