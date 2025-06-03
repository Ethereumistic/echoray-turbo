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
import { Menu, MoveRight, X, User, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useCrossDomainAuth } from '../../hooks/use-cross-domain-auth';

import Image from 'next/image';
import Logo from './logo1.svg';

export const Header = () => {
  const { authenticated, user, loading, error, debug, signOut } = useCrossDomainAuth();
  
  // Debug logging
  useEffect(() => {
    console.log('🎨 Header re-rendered with auth status:', { authenticated, user, loading, error, debug });
  }, [authenticated, user, loading, error, debug]);

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

  // Handle sign out with loading state
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  // Render auth buttons based on authentication status
  const renderAuthButtons = () => {
    if (loading) {
      return (
        <div className="flex gap-4">
          <Button variant="ghost" disabled>
            Checking...
          </Button>
        </div>
      );
    }

    if (authenticated && user) {
      return (
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="hidden md:inline" onClick={handleSignOut}>

            Sign out
          </Button>
          <Button variant="default" asChild>
            <Link href={`${env.NEXT_PUBLIC_APP_URL}`}>
              Dashboard
            </Link>
          </Button>

        </div>
      );
    }

    // Not authenticated - show default sign in/up buttons
    return (
      <div className="flex gap-4">
        <Button variant="outline" asChild>
          <Link href={`${env.NEXT_PUBLIC_APP_URL}/sign-in`}>Sign in</Link>
        </Button>
        <Button variant="default" asChild>
          <Link href={`${env.NEXT_PUBLIC_APP_URL}/sign-up`}>Get started</Link>
        </Button>
      </div>
    );
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
          <Button variant="ghost" className="hidden md:inline" asChild>
            <Link href="/contact">Contact us</Link>
          </Button>
          <div className="hidden border-r md:inline" />
          <ModeToggle />
          {renderAuthButtons()}
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
              
              {/* Mobile auth section */}
              <div className="border-t pt-4">
                {authenticated && user ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-muted-foreground">
                      Welcome, {user.firstName || 'User'}
                    </p>
                    <Link
                      href={`${env.NEXT_PUBLIC_APP_URL}`}
                      className="flex items-center justify-between"
                    >
                      <span className="text-lg">Dashboard</span>
                      <MoveRight className="h-4 w-4 stroke-1 text-muted-foreground" />
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center justify-between text-left"
                    >
                      <span className="text-lg">Sign out</span>
                      <MoveRight className="h-4 w-4 stroke-1 text-muted-foreground" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      href={`${env.NEXT_PUBLIC_APP_URL}/sign-in`}
                      className="flex items-center justify-between"
                    >
                      <span className="text-lg">Sign in</span>
                      <MoveRight className="h-4 w-4 stroke-1 text-muted-foreground" />
                    </Link>
                    <Link
                      href={`${env.NEXT_PUBLIC_APP_URL}/sign-up`}
                      className="flex items-center justify-between"
                    >
                      <span className="text-lg">Get started</span>
                      <MoveRight className="h-4 w-4 stroke-1 text-muted-foreground" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Debug info - only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-blue-900 dark:bg-blue-600 p-2 text-xs border-b">
          <strong>Auth Debug:</strong> {loading ? 'Loading...' : authenticated ? `✅ Authenticated as ${user?.firstName || 'User'}` : '❌ Not authenticated'} 
          {error && <span className="text-red-600 ml-2">Error: {error}</span>}
          {debug && <span className="ml-2">({debug})</span>}
        </div>
      )}
    </header>
  );
};
