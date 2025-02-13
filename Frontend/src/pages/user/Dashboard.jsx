import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaQrcode, FaTrophy, FaChartLine, FaGift, FaTicketAlt, FaFlag } from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGenerateQR = () => {
    navigate('/qr-generator');
  };

  return (
    <div className="min-h-screen bg-white text-black p-8">
      {/* Header */}
      <h1 className="text-4xl font-bold mb-8">AXONROME</h1>

      {/* Profile Section */}
      <div className="mb-8">
        <img 
          src={user?.profileImage || '/profile-placeholder.png'} 
          alt="Profile" 
          className="w-16 h-16 rounded-full mb-4"
        />
        <h2 className="text-2xl font-bold mb-2">WELCOME "{user?.name || 'Test User'}"</h2>
        <p className="text-gray-600">USER-ID: {user?.user_id || 'test123'}</p>
      </div>

      {/* Navigation Grid */}
      <div className="space-y-6">
        {/* Subjects Section */}
        <div>
          <h3 className="text-xl font-bold mb-2">SUBJECTS</h3>
          <p className="text-gray-600 mb-4">Generate QR for attendance</p>
          <div className="flex items-center space-x-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <FaQrcode className="w-8 h-8 text-blue-600" />
            </div>
            <button
              onClick={handleGenerateQR}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <FaQrcode className="w-5 h-5" />
              <span>Generate QR Code</span>
            </button>
          </div>
        </div>

        {/* Performance Tracker */}
        <div>
          <Link 
            to="/performance"
            className="block text-blue-600 hover:text-blue-700 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <FaChartLine className="w-6 h-6" />
              <h3 className="text-xl font-bold">PERFORMANCE TRACKER</h3>
            </div>
          </Link>
        </div>

        {/* Crypto Rewards */}
        <div>
          <Link 
            to="/rewards"
            className="block text-blue-600 hover:text-blue-700 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <FaGift className="w-6 h-6" />
              <h3 className="text-xl">Crypto Rewards</h3>
            </div>
          </Link>
        </div>

        {/* Voucher Rewards */}
        <div>
          <Link 
            to="/vouchers"
            className="block text-blue-600 hover:text-blue-700 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <FaTicketAlt className="w-6 h-6" />
              <h3 className="text-xl">VOUCHER REWARDS</h3>
            </div>
          </Link>
        </div>

        {/* Milestones */}
        <div>
          <Link 
            to="/milestones"
            className="block text-blue-600 hover:text-blue-700 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <FaFlag className="w-6 h-6" />
              <h3 className="text-xl">MILESTONES</h3>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
