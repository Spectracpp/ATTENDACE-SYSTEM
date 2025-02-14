'use client';
import { useState } from 'react';
import Header from '../../../components/Header/Header';

export default function RewardsStore() {
  // Mock data - Replace with actual data from your backend
  const [rewards] = useState([
    {
      id: 1,
      type: 'coupon',
      title: '15% Off at Starbucks',
      description: 'Get 15% off on any drink at participating Starbucks locations',
      tokenCost: 100,
      image: '/rewards/starbucks.png',
      expiresIn: '30 days',
    },
    {
      id: 2,
      type: 'crypto',
      title: '0.001 ETH',
      description: 'Redeem your tokens for Ethereum cryptocurrency',
      tokenCost: 500,
      image: '/rewards/eth.png',
      network: 'Ethereum',
    },
    {
      id: 3,
      type: 'voucher',
      title: 'Amazon Gift Card',
      description: '$10 Amazon Gift Card',
      tokenCost: 300,
      image: '/rewards/amazon.png',
      vendor: 'Amazon',
    },
    // Add more rewards as needed
  ]);

  const [userTokens] = useState(150); // Replace with actual user token balance

  const handleRedeem = (reward) => {
    if (userTokens >= reward.tokenCost) {
      // Implement redemption logic
      console.log(`Redeeming ${reward.title}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Balance Bar */}
          <div className="bg-white shadow-sm rounded-lg p-4 mb-8 mt-8 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Your Balance</h2>
              <p className="text-3xl font-bold text-blue-600">{userTokens} 🪙</p>
            </div>
            <Link
              href="/rewards/history"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View History →
            </Link>
          </div>

          {/* Rewards Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{reward.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{reward.description}</p>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {reward.tokenCost} 🪙
                    </span>
                  </div>

                  {reward.expiresIn && (
                    <p className="text-sm text-gray-500 mt-2">
                      Expires in: {reward.expiresIn}
                    </p>
                  )}
                  {reward.network && (
                    <p className="text-sm text-gray-500 mt-2">
                      Network: {reward.network}
                    </p>
                  )}
                  {reward.vendor && (
                    <p className="text-sm text-gray-500 mt-2">
                      Vendor: {reward.vendor}
                    </p>
                  )}

                  <button
                    onClick={() => handleRedeem(reward)}
                    disabled={userTokens < reward.tokenCost}
                    className={`mt-4 w-full px-4 py-2 rounded-md text-sm font-medium ${
                      userTokens >= reward.tokenCost
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {userTokens >= reward.tokenCost ? 'Redeem Now' : 'Insufficient Tokens'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
