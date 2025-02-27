import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/app/context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Attendance System',
  description: 'Modern attendance tracking system',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-black via-gray-900 to-[#0f0f1a]`}>
        <div className="min-h-screen backdrop-blur-3xl">
          <AuthProvider>
            {children}
            <Toaster 
              position="top-right"
              toastOptions={{
                style: {
                  background: 'rgba(0,0,0,0.9)',
                  color: '#fff',
                  border: '1px solid rgba(255,0,128,0.2)',
                },
                success: {
                  iconTheme: {
                    primary: '#ff0080',
                    secondary: '#000',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ff0080',
                    secondary: '#000',
                  },
                },
              }}
            />
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
