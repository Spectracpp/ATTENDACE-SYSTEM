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
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
        {/* Hero Section */}
        <div className="relative">
          <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
              {/* Left side - Main content */}
              <div className="lg:w-1/2">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-400 mb-4">
                  <span className="px-3 py-1 rounded-full bg-gray-800">What's new</span>
                  <span>Just launched rewards →</span>
                </div>
                
                <h1 className="text-5xl font-bold tracking-tight mb-6">
                  <span className="text-[#00f2ea]">Gamify</span>{' '}
                  <span className="text-[#a855f7]">Productivity</span>,<br />
                  <span className="text-[#8b5cf6]">Reward</span>{' '}
                  <span className="text-[#6366f1]">Success!</span>
                </h1>
                
                <p className="text-lg text-gray-400 mb-8">
                  Transform your daily attendance into valuable rewards. Earn tokens, maintain streaks, and redeem for crypto, gift cards, or exclusive perks.
                </p>

                <div className="flex items-center gap-4">
                  <Link 
                    href="/rewards"
                    className="inline-flex items-center px-6 py-3 rounded-lg bg-[#00f2ea] text-black font-semibold hover:bg-[#00d8d8] transition-colors"
                  >
                    View Rewards →
                  </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-8 mt-16">
                  {stats.map((stat, index) => (
                    <div 
                      key={index} 
                      className="border border-gray-800 rounded-lg p-4 bg-black/50 backdrop-blur-sm hover:bg-gray-900/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{stat.icon}</span>
                        <span className="text-2xl font-bold text-white">{stat.value}</span>
                      </div>
                      <p className="text-sm text-gray-400">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right side - Popular Rewards */}
              <div className="lg:w-1/2">
                <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-gray-800">
                  <h2 className="text-xl font-semibold mb-6">
                    <span className="text-[#00f2ea]">Popular</span>{' '}
                    <span className="text-white">Rewards</span>
                  </h2>
                  
                  <div className="space-y-4">
                    {popularRewards.map((reward, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-4 rounded-lg bg-black/50 border border-gray-800 hover:border-gray-700 hover:bg-gray-900/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-lg bg-gray-800">
                            <reward.icon className="h-6 w-6 text-[#00f2ea]" />
                          </div>
                          <div>
                            <h3 className="font-medium text-white">{reward.name}</h3>
                            <p className="text-sm text-gray-400">{reward.tokens}</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-400">{reward.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Section */}
        <div className="relative py-24 sm:py-32">
          {/* Animated background effect */}
          <div className="absolute inset-x-0 top-0 -z-10 transform-gpu overflow-hidden blur-3xl">
            <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-primary to-secondary opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"></div>
          </div>

          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-primary">
                Advanced Features
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight gradient-text sm:text-4xl">
                Everything you need to manage attendance
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                Our system combines QR technology with blockchain rewards to make
                attendance tracking both efficient and rewarding.
              </p>
            </div>

            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                {/* QR Scanning */}
                <div className="cyber-border p-6 hover:border-primary transition-colors duration-300">
                  <div className="flex flex-col gap-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                      <FaQrcode className="h-8 w-8" />
                    </div>
                    <div>
                      <dt className="text-lg font-semibold leading-7 text-primary">
                        Quick QR Scanning
                      </dt>
                      <dd className="mt-2 text-base leading-7 text-gray-300">
                        Instant attendance marking with our advanced QR scanning system. 
                        Simply scan and earn your daily rewards.
                      </dd>
                    </div>
                  </div>
                </div>

                {/* Reward System */}
                <div className="cyber-border p-6 hover:border-secondary transition-colors duration-300">
                  <div className="flex flex-col gap-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 text-secondary ring-1 ring-inset ring-secondary/20">
                      <FaBitcoin className="h-8 w-8" />
                    </div>
                    <div>
                      <dt className="text-lg font-semibold leading-7 text-secondary">
                        Token Rewards
                      </dt>
                      <dd className="mt-2 text-base leading-7 text-gray-300">
                        Earn tokens for consistent attendance. Build streaks and multiply
                        your rewards with our innovative reward system.
                      </dd>
                    </div>
                  </div>
                </div>

                {/* Analytics */}
                <div className="cyber-border p-6 hover:border-primary transition-colors duration-300">
                  <div className="flex flex-col gap-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                      <FaChartBar className="h-8 w-8" />
                    </div>
                    <div>
                      <dt className="text-lg font-semibold leading-7 text-primary">
                        Real-time Analytics
                      </dt>
                      <dd className="mt-2 text-base leading-7 text-gray-300">
                        Track your attendance patterns, view reward history, and monitor
                        your progress with detailed analytics.
                      </dd>
                    </div>
                  </div>
                </div>

                {/* Smart Contracts */}
                <div className="cyber-border p-6 hover:border-secondary transition-colors duration-300">
                  <div className="flex flex-col gap-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 text-secondary ring-1 ring-inset ring-secondary/20">
                      <FaGift className="h-8 w-8" />
                    </div>
                    <div>
                      <dt className="text-lg font-semibold leading-7 text-secondary">
                        Blockchain Rewards
                      </dt>
                      <dd className="mt-2 text-base leading-7 text-gray-300">
                        Secure and transparent reward distribution through smart contracts.
                        Your earnings are safe and verifiable.
                      </dd>
                    </div>
                  </div>
                </div>

                {/* Mobile App */}
                <div className="cyber-border p-6 hover:border-primary transition-colors duration-300">
                  <div className="flex flex-col gap-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                      <FaCoffee className="h-8 w-8" />
                    </div>
                    <div>
                      <dt className="text-lg font-semibold leading-7 text-primary">
                        Mobile Ready
                      </dt>
                      <dd className="mt-2 text-base leading-7 text-gray-300">
                        Access your attendance and rewards on the go with our
                        mobile-optimized platform.
                      </dd>
                    </div>
                  </div>
                </div>

                {/* Reports */}
                <div className="cyber-border p-6 hover:border-secondary transition-colors duration-300">
                  <div className="flex flex-col gap-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 text-secondary ring-1 ring-inset ring-secondary/20">
                      <FaFileAlt className="h-8 w-8" />
                    </div>
                    <div>
                      <dt className="text-lg font-semibold leading-7 text-secondary">
                        Detailed Reports
                      </dt>
                      <dd className="mt-2 text-base leading-7 text-gray-300">
                        Generate comprehensive reports for attendance and rewards.
                        Export data in multiple formats.
                      </dd>
                    </div>
                  </div>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Rewards Slideshow Section */}
        <RewardsSlideshow />

        {/* Footer Section */}
        <Footer />
      </div>
    </HomeLayout>
  );
}
