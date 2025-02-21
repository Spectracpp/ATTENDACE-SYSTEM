import { Space_Grotesk } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Toaster } from 'react-hot-toast';

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export const metadata = {
  title: 'AttendEase - Modern Attendance Management',
  description: 'Next-generation attendance management system with QR code scanning',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} animated-bg`}>
        <AuthProvider>
          <ThemeProvider>
            <main className="min-h-screen">
              {children}
            </main>
            <Toaster 
              position="top-right" 
              toastOptions={{
                style: {
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--bg-accent)',
                  fontFamily: 'var(--font-space-grotesk)',
                },
                success: {
                  iconTheme: {
                    primary: 'var(--primary)',
                    secondary: 'var(--bg-secondary)',
                  },
                },
                error: {
                  iconTheme: {
                    primary: 'var(--accent)',
                    secondary: 'var(--bg-secondary)',
                  },
                },
              }}
            />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
