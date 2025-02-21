import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Box, Container } from '@mui/material';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'AttendEase - Modern Attendance Management',
  description: 'Streamline your attendance tracking with AttendEase',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ margin: 0, padding: 0 }}>
        <Providers>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                bgcolor: 'background.default',
                pt: { xs: 2, sm: 3 },
                pb: { xs: 2, sm: 3 },
              }}
            >
              <Container maxWidth="xl">
                {children}
              </Container>
            </Box>
          </Box>
        </Providers>
      </body>
    </html>
  );
}
