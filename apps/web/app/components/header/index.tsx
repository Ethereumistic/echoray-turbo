'use client';

import { ModeToggle } from '@repo/design-system/components/mode-toggle';
import { Button } from '@repo/design-system/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@repo/design-system/components/ui/navigation-menu';
import { env } from '@repo/env';
import { Menu, MoveRight, X, LogOut, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth, useClerk } from '@clerk/nextjs';

import Image from 'next/image';
import Logo from './logo1.svg';

export const Header = () => {
  const navigationItems = [
    {
      title: 'Home',
      href: '/',
      description: '',
    },
    {
      title: 'Product',
      description: 'Managing a small business today is already tough.',
      items: [
        {
          title: 'Pricing',
          href: '/pricing',
        },
        {
          title: 'Pricing',
          href: '/pricing',
        },
        {
          title: 'Pricing',
          href: '/pricing',
        },
        {
          title: 'Pricing',
          href: '/pricing',
        },
      ],
    },
    {
      title: 'Blog',
      href: '/blog',
      description: '',
    },
    {
      title: 'Docs',
      href: env.NEXT_PUBLIC_DOCS_URL,
      description: '',
    },
  ];

  const [isOpen, setOpen] = useState(false);
  const { user } = useAuth();
  const { signOut } = useClerk();
  
  // Cross-domain authentication state
  const [crossDomainUser, setCrossDomainUser] = useState<any>(null);
  const [authCheckLoading, setAuthCheckLoading] = useState(true);
  
  // Check authentication status from app domain
  useEffect(() => {
    const checkCrossDomainAuth = async () => {
      try {
        // First check if we have a local Clerk user
        if (user) {
          setCrossDomainUser(user);
          setAuthCheckLoading(false);
          return;
        }
        
        // If no local user, check session token in storage
        const sessionToken = sessionStorage.getItem('clerk-session-token');
        if (sessionToken) {
          // Verify the session token with our API
          const baseUrl = env.NEXT_PUBLIC_API_URL || 'https://api.echoray.io';
          const apiUrl = baseUrl.endsWith('/') ? `${baseUrl}auth/check` : `${baseUrl}/auth/check`;
          
          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${sessionToken}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });
          
          if (response.ok) {
            const authData = await response.json();
            if (authData.isAuthenticated && authData.userId) {
              setCrossDomainUser({ id: authData.userId });
            } else {
              // Session is invalid, clear it
              console.log('🔄 Session invalid, clearing auth state');
              sessionStorage.removeItem('clerk-session-token');
              localStorage.removeItem('echoray-auth-data');
              setCrossDomainUser(null);
            }
          } else {
            // API call failed, likely session expired
            console.log('🔄 Session validation failed, clearing auth state');
            sessionStorage.removeItem('clerk-session-token');
            localStorage.removeItem('echoray-auth-data');
            setCrossDomainUser(null);
          }
        } else {
          // No session token, ensure user state is clear
          setCrossDomainUser(null);
        }
      } catch (error) {
        console.log('Cross-domain auth check failed:', error);
      } finally {
        setAuthCheckLoading(false);
      }
    };
    
    checkCrossDomainAuth();
    
    // Listen for session token changes (from survey authentication)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'clerk-session-token' && e.newValue) {
        // Session token was added, re-check authentication
        setAuthCheckLoading(true);
        checkCrossDomainAuth();
      }
    };
    
    // Also listen for manual storage updates (not just cross-window)
    const handleManualStorageCheck = () => {
      const sessionToken = sessionStorage.getItem('clerk-session-token');
      if (sessionToken && !crossDomainUser) {
        setAuthCheckLoading(true);
        checkCrossDomainAuth();
      }
    };
    
    // Listen for localStorage auth completion (both survey and navbar)
    const handleAuthCompletion = () => {
      try {
        const authDataStr = localStorage.getItem('echoray-auth-data');
        if (authDataStr) {
          const authData = JSON.parse(authDataStr);
          if (authData?.source === 'echoray-auth-callback' && 
              (authData?.type === 'SURVEY_AUTH_COMPLETE' || authData?.type === 'NAVBAR_AUTH_COMPLETE') && 
              authData?.userId && authData?.sessionToken) {
            
            console.log('🔄 Header detected auth completion:', authData.type);
            
            // Store session token
            sessionStorage.setItem('clerk-session-token', authData.sessionToken);
            localStorage.removeItem('echoray-auth-data'); // Clean up
            
            // Update auth state
            setCrossDomainUser({ id: authData.userId });
            setAuthCheckLoading(false);
          }
        }
      } catch (error) {
        console.log('Error processing auth completion:', error);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Check for auth completion and session validity
    const interval = setInterval(() => {
      handleManualStorageCheck();
      handleAuthCompletion();
    }, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [user, crossDomainUser]);
  
  // Use either local Clerk user or cross-domain user
  const currentUser = user || crossDomainUser;

  // Handle sign out with proper cleanup
  const handleSignOut = async () => {
    try {
      // Clear any stored session tokens
      sessionStorage.removeItem('clerk-session-token');
      localStorage.removeItem('echoray-auth-data');
      
      // Clear cross-domain user state
      setCrossDomainUser(null);
      
      // Sign out from Clerk if user exists locally
      if (user) {
        await signOut();
      }
      
      // Redirect to home page to ensure clean state
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      // Fallback: still redirect to home
      window.location.href = '/';
    }
  };

  return (
    <header className="sticky top-0 left-0 z-40 w-full border-b bg-background">
      <div className="container relative mx-auto flex min-h-20 flex-row items-center gap-4 lg:grid lg:grid-cols-3">
        <div className="hidden flex-row items-center justify-start gap-4 lg:flex">
          <NavigationMenu className="flex items-start justify-start">
            <NavigationMenuList className="flex flex-row justify-start gap-4">
              {navigationItems.map((item) => (
                <NavigationMenuItem key={item.title}>
                  {item.href ? (
                    <>
                      <NavigationMenuLink asChild>
                        <Button variant="ghost" asChild>
                          <Link href={item.href}>{item.title}</Link>
                        </Button>
                      </NavigationMenuLink>
                    </>
                  ) : (
                    <>
                      <NavigationMenuTrigger className="font-medium text-sm">
                        {item.title}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="!w-[450px] p-4">
                        <div className="flex grid-cols-2 flex-col gap-4 lg:grid">
                          <div className="flex h-full flex-col justify-between">
                            <div className="flex flex-col">
                              <p className="text-base">{item.title}</p>
                              <p className="text-muted-foreground text-sm">
                                {item.description}
                              </p>
                            </div>
                            <Button size="sm" className="mt-10" asChild>
                              <Link href="/contact">Book a call today</Link>
                            </Button>
                          </div>
                          <div className="flex h-full flex-col justify-end text-sm">
                            {item.items?.map((subItem) => (
                              <NavigationMenuLink
                                href={subItem.href}
                                key={subItem.title}
                                className="flex flex-row items-center justify-between rounded px-4 py-2 hover:bg-muted"
                              >
                                <span>{subItem.title}</span>
                                <MoveRight className="h-4 w-4 text-muted-foreground" />
                              </NavigationMenuLink>
                            ))}
                          </div>
                        </div>
                      </NavigationMenuContent>
                    </>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex items-center gap-2 lg:justify-center">
          <Link href="/">
          <Image
            src="https://cdn.jsdelivr.net/gh/Ethereumistic/echo-ray-assets/logo/echoray-dark.png"
            alt="Logo"
            width={200}
            height={100}
            className="dark:invert"
            priority
            onError={(e) => {
              console.error('Logo failed to load, error:', e);
              // Fall back to SVG logo if available
              if (Logo) {
                const target = e.target as HTMLImageElement;
                target.src = Logo;
              }
            }}
          />
          </Link>
        </div>
        <div className="flex w-full justify-end gap-4">
          {authCheckLoading ? (
            // Loading state
            <>
              <Button variant="ghost" className="hidden md:inline" asChild>
                <Link href="/contact">Contact us</Link>
              </Button>
              <div className="hidden border-r md:inline" />
              <ModeToggle />
              <Button variant="outline" disabled>
                Loading...
              </Button>
              <Button variant="default" disabled>
                Loading...
              </Button>
            </>
          ) : currentUser ? (
            // Signed in user buttons
            <>
              <Button variant="ghost" className="hidden md:inline" asChild>
                <Link href="/contact">Contact us</Link>
              </Button>
              <div className="hidden border-r md:inline" />
              <ModeToggle />
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
              <Button variant="default" asChild>
                <Link href={env.NEXT_PUBLIC_APP_URL || 'https://app.echoray.io'} className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
            </>
          ) : (
            // Not signed in user buttons
            <>
              <Button variant="ghost" className="hidden md:inline" asChild>
                <Link href="/contact">Contact us</Link>
              </Button>
              <div className="hidden border-r md:inline" />
              <ModeToggle />
              <Button variant="outline" asChild>
                <Link href={`${env.NEXT_PUBLIC_APP_URL}/sign-in?callback=navbar`}>Sign in</Link>
              </Button>
              <Button variant="default" asChild>
                <Link href={`${env.NEXT_PUBLIC_APP_URL}/sign-up?callback=navbar`}>Get started</Link>
              </Button>
            </>
          )}
        </div>
        <div className="flex w-12 shrink items-end justify-end lg:hidden">
          <Button variant="ghost" onClick={() => setOpen(!isOpen)}>
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          {isOpen && (
            <div className="container absolute top-20 right-0 flex w-full flex-col gap-8 border-t bg-background py-4 shadow-lg">
              {navigationItems.map((item) => (
                <div key={item.title}>
                  <div className="flex flex-col gap-2">
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="flex items-center justify-between"
                        target={
                          item.href.startsWith('http') ? '_blank' : undefined
                        }
                        rel={
                          item.href.startsWith('http')
                            ? 'noopener noreferrer'
                            : undefined
                        }
                      >
                        <span className="text-lg">{item.title}</span>
                        <MoveRight className="h-4 w-4 stroke-1 text-muted-foreground" />
                      </Link>
                    ) : (
                      <p className="text-lg">{item.title}</p>
                    )}
                    {item.items?.map((subItem) => (
                      <Link
                        key={subItem.title}
                        href={subItem.href}
                        className="flex items-center justify-between"
                      >
                        <span className="text-muted-foreground">
                          {subItem.title}
                        </span>
                        <MoveRight className="h-4 w-4 stroke-1" />
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              
              {/* Mobile Auth Buttons */}
              <div className="flex flex-col gap-4 border-t pt-4">
                <Link
                  href="/contact"
                  className="flex items-center justify-between"
                >
                  <span className="text-lg">Contact us</span>
                  <MoveRight className="h-4 w-4 stroke-1 text-muted-foreground" />
                </Link>
                
                {authCheckLoading ? (
                  // Loading state for mobile
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-lg text-muted-foreground">Loading...</span>
                    </div>
                  </>
                ) : currentUser ? (
                  // Signed in user mobile buttons
                  <>
                    <Link
                      href={env.NEXT_PUBLIC_APP_URL || 'https://app.echoray.io'}
                      className="flex items-center justify-between"
                    >
                      <span className="text-lg flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </span>
                      <MoveRight className="h-4 w-4 stroke-1 text-muted-foreground" />
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center justify-between text-left"
                    >
                      <span className="text-lg flex items-center gap-2">
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </span>
                      <MoveRight className="h-4 w-4 stroke-1 text-muted-foreground" />
                    </button>
                  </>
                ) : (
                  // Not signed in user mobile buttons
                  <>
                    <Link
                      href={`${env.NEXT_PUBLIC_APP_URL}/sign-in?callback=navbar`}
                      className="flex items-center justify-between"
                    >
                      <span className="text-lg">Sign in</span>
                      <MoveRight className="h-4 w-4 stroke-1 text-muted-foreground" />
                    </Link>
                    <Link
                      href={`${env.NEXT_PUBLIC_APP_URL}/sign-up?callback=navbar`}
                      className="flex items-center justify-between"
                    >
                      <span className="text-lg">Get started</span>
                      <MoveRight className="h-4 w-4 stroke-1 text-muted-foreground" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
