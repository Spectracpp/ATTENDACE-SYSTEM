'use client';

import Header from '@/components/Header/Header';

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className="pt-16">
        <div className="container mx-auto px-4">
          {children}
        </div>
      </main>
    </div>
  );
}
