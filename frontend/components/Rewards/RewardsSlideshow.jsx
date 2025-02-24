'use client';
import { useEffect, useRef } from 'react';

const rewards = [
  {
    id: 1,
    name: 'Extra Day Off',
    tokens: 500,
    icon: '🏖️',
    description: 'Earn a full day of paid leave'
  },
  {
    id: 2,
    name: 'Premium Coffee',
    tokens: 50,
    icon: '☕',
    description: 'Free premium coffee for a week'
  },
  {
    id: 3,
    name: 'Lunch Voucher',
    tokens: 100,
    icon: '🍱',
    description: 'Free lunch at partner restaurants'
  },
  {
    id: 4,
    name: 'Gym Membership',
    tokens: 300,
    icon: '💪',
    description: 'One month gym membership'
  },
  {
    id: 5,
    name: 'Movie Tickets',
    tokens: 150,
    icon: '🎬',
    description: 'Two premium movie tickets'
  },
  {
    id: 6,
    name: 'Tech Gadget',
    tokens: 1000,
    icon: '🎮',
    description: 'Choose from selected gadgets'
  },
  {
    id: 7,
    name: 'Spa Day',
    tokens: 400,
    icon: '💆',
    description: 'Full day spa treatment'
  },
  {
    id: 8,
    name: 'Book Bundle',
    tokens: 200,
    icon: '📚',
    description: 'Bundle of bestseller books'
  }
];

const RewardCard = ({ reward }) => (
  <div className="cyberpunk-card min-w-[300px] p-6 mx-4 transform transition-all duration-500 hover:scale-105 group cursor-pointer">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 rounded-lg bg-[#ff0080]/10 border border-[#ff0080]/20 group-hover:border-[#ff0080]/40 transition-colors">
        <span className="text-4xl">{reward.icon}</span>
      </div>
      <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-[#ff0080]/10 border border-[#ff0080]/20">
        <span className="text-white font-bold">{reward.tokens}</span>
        <span className="text-[#ff0080]">🪙</span>
      </div>
    </div>
    <h3 className="text-xl font-bold mb-2 group-hover:text-[#ff0080] transition-colors">{reward.name}</h3>
    <p className="text-gray-400 text-sm">{reward.description}</p>
  </div>
);

const RewardsSlideshow = () => {
  const scrollRef = useRef(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const totalWidth = scrollContainer.scrollWidth;
    const viewportWidth = scrollContainer.offsetWidth;
    let currentScroll = 0;
    let direction = 1;
    let isHovered = false;

    const handleMouseEnter = () => {
      isHovered = true;
    };

    const handleMouseLeave = () => {
      isHovered = false;
    };

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);

    const animate = () => {
      if (!isHovered) {
        currentScroll += direction;

        if (currentScroll >= totalWidth - viewportWidth) {
          direction = -1;
        } else if (currentScroll <= 0) {
          direction = 1;
        }

        scrollContainer.scrollLeft = currentScroll;
      }
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="w-full py-20 overflow-hidden bg-black/50 backdrop-blur-xl relative">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-10 pointer-events-none"></div>
      
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-12 text-center">
          <span className="cyberpunk-text-gradient">Featured</span>{' '}
          <span className="text-white">Rewards</span>
        </h2>
      </div>

      <div 
        ref={scrollRef}
        className="flex overflow-x-hidden relative"
        style={{ 
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
        }}
      >
        <div className="flex">
          {[...rewards, ...rewards].map((reward, index) => (
            <RewardCard key={`${reward.id}-${index}`} reward={reward} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RewardsSlideshow;
