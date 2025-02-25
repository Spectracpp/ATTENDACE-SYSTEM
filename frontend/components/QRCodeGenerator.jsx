'use client';

import { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { FaDownload, FaSync, FaClock } from 'react-icons/fa';
import toast from 'react-hot-toast';
import useGeolocation from '@/hooks/useGeolocation';
import OrganizationSelect from './Organization/OrganizationSelect';

export default function QRCodeGenerator() {
  const [qrValue, setQrValue] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [validityMinutes, setValidityMinutes] = useState(15);
  const [loading, setLoading] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState('');
  const { location, error: locationError } = useGeolocation();

  useEffect(() => {
    if (selectedOrganization) {
      generateQRCode();
    }
  }, [selectedOrganization, refreshKey]);

  const generateQRCode = async () => {
    if (!location) {
      toast.error('Please enable location services to generate QR code');
      return;
    }

    if (!selectedOrganization) {
      toast.error('Please select an organization');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/attendance/qr-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          organizationId: selectedOrganization,
          validityMinutes,
          location: {
            type: 'Point',
            coordinates: [location.longitude, location.latitude]
          },
          allowedRadius: 100 // 100 meters radius
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate QR code');
      }

      const data = await response.json();
      setQrValue(JSON.stringify(data.qrCode));
      toast.success('QR code generated successfully');
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error(error.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleDownload = () => {
    const canvas = document.getElementById('qr-code');
    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `attendance-qr-${new Date().toISOString()}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <OrganizationSelect
            value={selectedOrganization}
            onChange={setSelectedOrganization}
            className="w-full"
          />
        </div>
        
        <div className="flex items-center gap-4 mb-4">
          <FaClock className="text-gray-500" />
          <input
            type="number"
            value={validityMinutes}
            onChange={(e) => setValidityMinutes(Math.max(1, Math.min(60, parseInt(e.target.value))))}
            className="w-20 px-3 py-2 border rounded-lg"
            min="1"
            max="60"
          />
          <span className="text-gray-500">minutes validity</span>
        </div>

        {qrValue && (
          <div className="flex flex-col items-center space-y-4 p-4 border rounded-lg">
            <QRCodeCanvas
              id="qr-code"
              value={qrValue}
              size={256}
              level="H"
              includeMargin={true}
              className="bg-white p-2"
            />
            <div className="flex gap-4">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                disabled={loading}
              >
                <FaSync className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <FaDownload />
                Download
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
