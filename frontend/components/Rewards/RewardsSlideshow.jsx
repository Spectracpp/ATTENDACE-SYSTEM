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
  <div className="reward-card min-w-[280px] p-6 mx-4 cyber-border bg-background/80 backdrop-blur-sm transform transition-all duration-500 hover:scale-105 hover:bg-accent-1/50">
    <div className="flex items-center justify-between mb-4">
      <span className="text-4xl">{reward.icon}</span>
      <div className="flex items-center space-x-1">
        <span className="text-primary font-bold">{reward.tokens}</span>
        <span className="text-primary">🪙</span>
      </div>
    </div>
    <h3 className="text-xl font-bold mb-2 gradient-text">{reward.name}</h3>
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
      if (!isHovered && scrollContainer) {
        currentScroll += direction * 0.5;

        if (currentScroll >= totalWidth / 2) {
          currentScroll = 0;
        }
        if (currentScroll < 0) {
          currentScroll = totalWidth / 2;
        }

        scrollContainer.style.transform = `translateX(-${currentScroll}px)`;
      }
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Duplicate the rewards array to create a seamless loop
  const duplicatedRewards = [...rewards, ...rewards];

  return (
    <section className="py-20 overflow-hidden relative bg-gradient-to-b from-background via-accent-1/20 to-background">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 gradient-text animate-pulse-slow px-4">
          Available Rewards
        </h2>
        
        <div className="relative">
          {/* Gradient overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background via-background/80 to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background via-background/80 to-transparent z-10"></div>
          
          {/* Scrolling container */}
          <div className="overflow-hidden">
            <div 
              className="flex py-8 transition-transform duration-300 ease-linear"
              style={{ willChange: 'transform' }}
              ref={scrollRef}
            >
              {duplicatedRewards.map((reward, index) => (
                <RewardCard key={`${reward.id}-${index}`} reward={reward} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RewardsSlideshow;
