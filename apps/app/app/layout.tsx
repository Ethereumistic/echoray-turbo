import '@repo/design-system/styles/globals.css';
import { DesignSystemProvider } from '@repo/design-system';
import { fonts } from '@repo/design-system/lib/fonts';
import type { ReactNode } from 'react';
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
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          afterSignInUrl="/"
          afterSignUpUrl="/"
        >
          <DesignSystemProvider>{children}</DesignSystemProvider>
        </ClerkProvider>
      </Suspense>
    </body>
  </html>
);

export default RootLayout;
