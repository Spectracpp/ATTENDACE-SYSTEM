'use client';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import RewardsSlideshow from '../components/Rewards/RewardsSlideshow';
import { 
  FaBitcoin, 
  FaGift, 
  FaCoffee,
  FaQrcode,
  FaChartBar,
  FaFileAlt
} from 'react-icons/fa';

const features = [
  {
    name: 'QR Code Scanning',
    description:
      'Quick and accurate attendance marking with QR codes. No more manual entry or paperwork.',
    icon: FaQrcode,
  },
  {
    name: 'Real-time Tracking',
    description:
      'Monitor attendance in real-time. Get instant updates and notifications.',
    icon: FaChartBar,
  },
  {
    name: 'Detailed Reports',
    description:
      'Generate comprehensive reports with just a few clicks. Export in multiple formats.',
    icon: FaFileAlt,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        {/* Hero Section */}
        <div className="relative isolate">
          {/* Animated background */}
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-secondary opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
          </div>

          <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
            <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
              <div className="mt-24 sm:mt-32 lg:mt-16">
                <a href="#rewards" className="inline-flex space-x-6">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold leading-6 text-primary ring-1 ring-inset ring-primary/10">
                    What's new
                  </span>
                  <span className="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-gray-300">
                    <span>Just launched rewards</span>
                    <span aria-hidden="true">→</span>
                  </span>
                </a>
              </div>
              <h1 className="mt-10 text-4xl font-bold tracking-tight gradient-text sm:text-6xl">
                Gamify Productivity, Reward Success!
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                Transform your daily attendance into valuable rewards. Earn tokens, maintain streaks,
                and redeem for crypto, gift cards, or exclusive perks.
              </p>
              <div className="mt-10 flex items-center gap-x-6">
                <Link
                  href="/register"
                  className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-black shadow-sm hover:bg-primary-dark transition-colors"
                >
                  Get started
                </Link>
                <Link href="/rewards/store" className="text-sm font-semibold leading-6 text-gray-300 hover:text-primary transition-colors">
                  View Rewards <span aria-hidden="true">→</span>
                </Link>
              </div>

              {/* Reward Stats */}
              <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-3">
                <div className="flex flex-col cyber-border p-4">
                  <dt className="text-sm font-medium leading-6 text-gray-300">Daily Tokens</dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-primary">15 🪙</dd>
                </div>
                <div className="flex flex-col cyber-border p-4">
                  <dt className="text-sm font-medium leading-6 text-gray-300">Streak Bonus</dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-secondary">3x 🔥</dd>
                </div>
                <div className="flex flex-col cyber-border p-4">
                  <dt className="text-sm font-medium leading-6 text-gray-300">Rewards Starting</dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-primary">$10 💰</dd>
                </div>
              </div>
            </div>

            {/* Right side with rewards preview */}
            <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
              <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
                <div className="cyber-border p-6 bg-accent-1/10 backdrop-blur-sm">
                  <h3 className="text-2xl font-bold gradient-text mb-6">Popular Rewards</h3>
                  <div className="space-y-4">
                    {/* Crypto Reward */}
                    <div className="cyber-card bg-accent-2/20 p-4 flex justify-between items-center group hover:bg-accent-2/30 transition-all duration-300">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <FaBitcoin className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-white">0.001 ETH</h4>
                          <p className="text-gray-400">500 tokens</p>
                        </div>
                      </div>
                      <span className="text-primary bg-primary/10 px-4 py-1 rounded-full text-sm font-medium">
                        Crypto
                      </span>
                    </div>

                    {/* Gift Card Reward */}
                    <div className="cyber-card bg-accent-2/20 p-4 flex justify-between items-center group hover:bg-accent-2/30 transition-all duration-300">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <FaGift className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-white">$10 Amazon</h4>
                          <p className="text-gray-400">300 tokens</p>
                        </div>
                      </div>
                      <span className="text-primary bg-primary/10 px-4 py-1 rounded-full text-sm font-medium">
                        Gift Card
                      </span>
                    </div>

                    {/* Coffee Reward */}
                    <div className="cyber-card bg-accent-2/20 p-4 flex justify-between items-center group hover:bg-accent-2/30 transition-all duration-300">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <FaCoffee className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-white">15% Off Coffee</h4>
                          <p className="text-gray-400">100 tokens</p>
                        </div>
                      </div>
                      <span className="text-primary bg-primary/10 px-4 py-1 rounded-full text-sm font-medium">
                        Coupon
                      </span>
                    </div>
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
      </main>
    </div>
  );
}
