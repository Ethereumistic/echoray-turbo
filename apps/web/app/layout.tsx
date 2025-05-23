import '@repo/design-system/styles/globals.css';
import './styles/web.css';
import { DesignSystemProvider } from '@repo/design-system';
import { fonts } from '@repo/design-system/lib/fonts';
import type { ReactNode } from 'react';
import { Footer } from './components/footer';
import { Header } from './components/header';
import { ClerkProvider } from '@clerk/nextjs';
import { env } from '@repo/env';
import { Suspense } from 'react';

type RootLayoutProperties = {
  readonly children: ReactNode;
};

const RootLayout = ({ children }: RootLayoutProperties) => (
  <html lang="en" className={fonts} suppressHydrationWarning>
    <body>
      <Suspense fallback={<div>Loading authentication...</div>}>
        <ClerkProvider
          publishableKey={env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
          afterSignInUrl={`${env.NEXT_PUBLIC_APP_URL}`}
          afterSignUpUrl={`${env.NEXT_PUBLIC_APP_URL}`}
          signInUrl={`${env.NEXT_PUBLIC_APP_URL}/sign-in`}
          signUpUrl={`${env.NEXT_PUBLIC_APP_URL}/sign-up`}
        >
          <DesignSystemProvider>
            <Header />
            {children}
            <Footer />
          </DesignSystemProvider>
        </ClerkProvider>
      </Suspense>
    </body>
  </html>
);

export default RootLayout;
