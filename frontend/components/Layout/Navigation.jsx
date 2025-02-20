'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../app/context/AuthContext';
import { useOrganization } from '../../app/context/OrganizationContext';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Tooltip,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  alpha,
  Button,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  QrCode as QrCodeIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  People as PeopleIcon,
  Close as CloseIcon
} from '@mui/icons-material';

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { currentOrganization } = useOrganization();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const isAdmin = user?.role === 'admin' || currentOrganization?.members?.find(
    m => m.user === user?._id && m.role === 'admin'
  );

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const navigationItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      href: isAdmin ? '/admin/dashboard' : '/dashboard',
      roles: ['user', 'admin']
    },
    {
      text: 'Organizations',
      icon: <PeopleIcon />,
      href: '/admin/organizations',
      roles: ['admin']
    },
    {
      text: 'Settings',
      icon: <SettingsIcon />,
      href: '/settings',
      roles: ['user', 'admin']
    }
  ];

  const userMenuItems = [
    {
      text: 'Profile',
      onClick: () => {
        router.push('/settings/profile');
        handleCloseUserMenu();
      }
    },
    {
      text: 'Change Password',
      onClick: () => {
        router.push('/settings/change-password');
        handleCloseUserMenu();
      }
    },
    {
      text: 'Logout',
      onClick: () => {
        handleLogout();
        handleCloseUserMenu();
      }
    }
  ];

  const isAuthPage = pathname?.startsWith('/auth/');

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
        }}
      >
        <Container maxWidth={false}>
          <Toolbar
            disableGutters
            sx={{
              minHeight: { xs: 56, sm: 64, md: 70 },
              px: { xs: 1, sm: 2, md: 3 },
              gap: 1
            }}
          >
            {user && (
              <IconButton
                size={isMobile ? "small" : "medium"}
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={() => setDrawerOpen(true)}
                sx={{ mr: { xs: 0.5, sm: 1 } }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <QrCodeIcon 
              sx={{ 
                display: 'flex',
                fontSize: { xs: 24, sm: 28, md: 32 },
                color: 'primary.main',
                mr: { xs: 0.5, sm: 1 }
              }} 
            />
            
            <Typography
              variant={isMobile ? "subtitle1" : "h6"}
              noWrap
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                textDecoration: 'none',
                cursor: 'pointer',
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
              onClick={() => {
                if (user) {
                  router.push(isAdmin ? '/admin/dashboard' : '/dashboard');
                } else {
                  router.push('/');
                }
              }}
            >
              AttendEase
            </Typography>

            <Box sx={{ flexGrow: 1 }} />

            {currentOrganization && (
              <Typography
                variant="subtitle2"
                noWrap
                sx={{
                  display: { xs: 'none', sm: 'block' },
                  color: 'text.secondary',
                  fontWeight: 500,
                  fontSize: { sm: '0.875rem', md: '1rem' }
                }}
              >
                {currentOrganization.name}
              </Typography>
            )}

            {!isAuthPage && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1, md: 2 } }}>
                {user ? (
                  <>
                    <Tooltip title="Account settings">
                      <IconButton 
                        onClick={handleOpenUserMenu} 
                        sx={{ 
                          p: { xs: 0.25, sm: 0.5 },
                          ml: { xs: 0.5, sm: 1 }
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            width: { xs: 32, sm: 36, md: 40 },
                            height: { xs: 32, sm: 36, md: 40 },
                            fontSize: { xs: '1rem', sm: '1.25rem' }
                          }}
                        >
                          {user?.name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                      </IconButton>
                    </Tooltip>
                    <Menu
                      sx={{ mt: '45px' }}
                      id="menu-appbar"
                      anchorEl={anchorElUser}
                      anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                      keepMounted
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                      open={Boolean(anchorElUser)}
                      onClose={handleCloseUserMenu}
                      PaperProps={{
                        elevation: 2,
                        sx: {
                          borderRadius: 2,
                          minWidth: { xs: 160, sm: 180 }
                        }
                      }}
                    >
                      {userMenuItems.map((item) => (
                        <MenuItem
                          key={item.text}
                          onClick={item.onClick}
                          sx={{
                            py: { xs: 1, sm: 1.5 },
                            px: { xs: 2, sm: 2.5 }
                          }}
                        >
                          <Typography 
                            variant="body2"
                            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                          >
                            {item.text}
                          </Typography>
                        </MenuItem>
                      ))}
                    </Menu>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => router.push('/auth/login/user')}
                    sx={{ 
                      ml: { xs: 1, sm: 2 },
                      py: { xs: 0.5, sm: 0.75 },
                      px: { xs: 1.5, sm: 2 },
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                  >
                    Sign In
                  </Button>
                )}
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {user && (
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{
            sx: {
              width: { xs: '80%', sm: 280 },
              borderRight: `1px solid ${theme.palette.divider}`,
            }
          }}
        >
          <Box
            sx={{
              py: { xs: 2, sm: 2.5 },
              px: { xs: 1.5, sm: 2 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <QrCodeIcon sx={{ 
                color: 'primary.main', 
                mr: 1,
                fontSize: { xs: 24, sm: 28 }
              }} />
              <Typography 
                variant="h6" 
                color="text.primary" 
                fontWeight={700}
                sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }}
              >
                AttendEase
              </Typography>
            </Box>
            <IconButton
              edge="end"
              color="inherit"
              onClick={() => setDrawerOpen(false)}
              sx={{ display: { sm: 'none' } }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ py: { xs: 1.5, sm: 2 } }}>
            <List>
              {navigationItems
                .filter(item => item.roles.includes(user?.role))
                .map((item) => (
                  <ListItem
                    key={item.text}
                    button
                    onClick={() => {
                      router.push(item.href);
                      setDrawerOpen(false);
                    }}
                    selected={pathname === item.href}
                    sx={{
                      mx: { xs: 0.5, sm: 1 },
                      borderRadius: 1,
                      mb: 0.5,
                      py: { xs: 1, sm: 1.5 },
                      '&.Mui-selected': {
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.12),
                        },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: pathname === item.href ? 'primary.main' : 'text.secondary',
                        minWidth: { xs: 36, sm: 40 },
                        '& svg': {
                          fontSize: { xs: 20, sm: 24 }
                        }
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontWeight: pathname === item.href ? 600 : 400,
                        color: pathname === item.href ? 'primary.main' : 'text.primary',
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      }}
                    />
                  </ListItem>
                ))}
            </List>
            <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />
            <List>
              <ListItem
                button
                onClick={handleLogout}
                sx={{
                  mx: { xs: 0.5, sm: 1 },
                  borderRadius: 1,
                  color: 'error.main',
                  py: { xs: 1, sm: 1.5 }
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: 'error.main', 
                    minWidth: { xs: 36, sm: 40 },
                    '& svg': {
                      fontSize: { xs: 20, sm: 24 }
                    }
                  }}
                >
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Logout"
                  primaryTypographyProps={{
                    color: 'error.main',
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                />
              </ListItem>
            </List>
          </Box>
        </Drawer>
      )}
    </>
  );
}
