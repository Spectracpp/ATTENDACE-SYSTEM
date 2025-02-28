'use client';

import Link from 'next/link';
import Image from 'next/image';
import RewardsSlideshow from '@/components/Rewards/RewardsSlideshow';
import Footer from '@/components/Footer/Footer';
import HomeLayout from './home-layout';
import { 
  FaBitcoin, 
  FaGift, 
  FaCoffee,
  FaQrcode,
  FaChartBar,
  FaFileAlt,
  FaFire
} from 'react-icons/fa';

const popularRewards = [
  {
    name: '0.001 ETH',
    tokens: '500 tokens',
    type: 'Crypto',
    icon: FaBitcoin,
  },
  {
    name: '$10 Amazon',
    tokens: '300 tokens',
    type: 'Gift Card',
    icon: FaGift,
  },
  {
    name: '15% Off Coffee',
    tokens: '100 tokens',
    type: 'Coupon',
    icon: FaCoffee,
  },
];

const stats = [
  {
    value: '15',
    label: 'Daily Tokens',
    icon: '💰',
  },
  {
    value: '3x',
    label: 'Streak Bonus',
    icon: '🔥',
  },
  {
    value: '$10',
    label: 'Rewards Starting',
    icon: '🎁',
  },
];

export default function Home() {
  return (
    <HomeLayout>
      <div className="min-h-screen bg-black/90">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#ff0080]/20 via-[#7928ca]/20 to-transparent"></div>
          
          <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40 relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
              {/* Left side - Main content */}
              <div className="lg:w-1/2">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-400 mb-4">
                  <span className="px-3 py-1 rounded-full bg-[#ff0080]/10 border border-[#ff0080]/20">
                    What's new
                  </span>
                  <span className="cyberpunk-text-gradient">Just launched rewards →</span>
                </div>
                
                <h1 className="text-6xl font-bold tracking-tight mb-6 leading-tight">
                  <span className="cyberpunk-text-gradient">Gamify</span>{' '}
                  <span className="text-white">Your</span><br />
                  <span className="text-white">Daily</span>{' '}
                  <span className="cyberpunk-text-gradient">Grind</span>
                </h1>
                
                <p className="text-lg text-gray-400 mb-8 backdrop-blur-xl bg-black/40 p-4 rounded-lg border border-[#ff0080]/20">
                  Transform your daily attendance into valuable rewards. Earn tokens, maintain streaks, and redeem for crypto, gift cards, or exclusive perks.
                </p>

                <div className="flex items-center gap-4">
                  <Link 
                    href="/auth/register/user"
                    className="cyberpunk-button px-8 py-4 text-lg group"
                  >
                    Get Started 
                    <span className="group-hover:translate-x-1 transition-transform inline-block ml-2">
                      →
                    </span>
                  </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-8 mt-16">
                  {stats.map((stat, index) => (
                    <div 
                      key={index} 
                      className="cyberpunk-card p-4 group hover:border-[#ff0080]/40 transition-all duration-300"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl group-hover:scale-110 transition-transform">{stat.icon}</span>
                        <span className="text-2xl font-bold cyberpunk-text-gradient">{stat.value}</span>
                      </div>
                      <p className="text-sm text-gray-400">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right side - Popular Rewards */}
              <div className="lg:w-1/2">
                <div className="cyberpunk-card p-8">
                  <h2 className="text-2xl font-bold mb-6">
                    <span className="cyberpunk-text-gradient">Popular</span>{' '}
                    <span className="text-white">Rewards</span>
                  </h2>
                  
                  <div className="space-y-4">
                    {popularRewards.map((reward, index) => (
                      <div 
                        key={index}
                        className="cyberpunk-card p-4 hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-[#ff0080]/10 border border-[#ff0080]/20 group-hover:border-[#ff0080]/40 transition-colors">
                              <reward.icon className="h-6 w-6 text-[#ff0080]" />
                            </div>
                            <div>
                              <h3 className="font-medium text-white group-hover:text-[#ff0080] transition-colors">{reward.name}</h3>
                              <p className="text-sm text-gray-400">{reward.tokens}</p>
                            </div>
                          </div>
                          <span className="text-sm px-3 py-1 rounded-full bg-[#ff0080]/10 border border-[#ff0080]/20">{reward.type}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rewards Slideshow */}
        <RewardsSlideshow />

        {/* Features Section */}
        <div className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#ff0080]/20 via-[#7928ca]/20 to-transparent"></div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <h2 className="text-4xl font-bold text-center mb-16">
              <span className="cyberpunk-text-gradient">Key</span>{' '}
              <span className="text-white">Features</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: FaQrcode,
                  title: 'QR Code Check-in',
                  description: 'Quick and secure attendance tracking with QR code scanning.'
                },
                {
                  icon: FaChartBar,
                  title: 'Analytics Dashboard',
                  description: 'Detailed insights into attendance patterns and rewards earned.'
                },
                {
                  icon: FaFileAlt,
                  title: 'Attendance Reports',
                  description: 'Generate comprehensive reports for better management.'
                },
                {
                  icon: FaBitcoin,
                  title: 'Crypto Rewards',
                  description: 'Earn and redeem rewards in cryptocurrency.'
                },
                {
                  icon: FaFire,
                  title: 'Streak System',
                  description: 'Maintain attendance streaks for bonus rewards.'
                },
                {
                  icon: FaGift,
                  title: 'Gift Cards',
                  description: 'Exchange tokens for popular gift cards.'
                }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="cyberpunk-card p-6 hover:scale-[1.02] transition-all duration-300 group"
                >
                  <div className="p-4 rounded-lg bg-[#ff0080]/10 border border-[#ff0080]/20 group-hover:border-[#ff0080]/40 transition-colors w-fit mb-4">
                    <feature.icon className="h-8 w-8 text-[#ff0080]" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-[#ff0080] transition-colors">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </HomeLayout>
  );
}
