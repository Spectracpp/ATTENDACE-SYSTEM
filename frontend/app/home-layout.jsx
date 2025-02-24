'use client';

import Header from '@/components/Header/Header';

export default function HomeLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}
