import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Header from '@/components/Header/Header';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: 'AttendEase - Smart Attendance System',
  description: 'Modern attendance tracking with rewards',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>
        <AuthProvider>
          <Header />
          <main className="min-h-screen pt-16 bg-background text-foreground">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
