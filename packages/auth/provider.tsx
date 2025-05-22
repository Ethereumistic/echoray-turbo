'use client';

import { dark } from '@clerk/themes';
import type { Theme } from '@clerk/types';
import { tailwind } from '@repo/tailwind-config';
import { useTheme } from 'next-themes';
import type { ReactNode } from 'react';
import { Suspense } from 'react';

// Import Clerk correctly for Next.js 15
let ClerkProviderModule;
try {
  // Dynamic import at runtime
  ClerkProviderModule = require('@clerk/nextjs');
} catch (error) {
  console.error('Failed to import ClerkProvider:', error);
}

// Use proper fallback if import fails
const ClerkProvider = ClerkProviderModule?.ClerkProvider || 
  (({ children }: { children: ReactNode }) => <>{children}</>);

type AuthProviderProps = {
  children: ReactNode;
  [key: string]: any;
};

export const AuthProvider = (properties: AuthProviderProps) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const baseTheme = isDark ? dark : undefined;
  const variables: Theme['variables'] = {
    // Core
    fontFamily: tailwind.theme.fontFamily.sans.join(', '),
    fontFamilyButtons: tailwind.theme.fontFamily.sans.join(', '),
    fontSize: tailwind.theme.fontSize.sm[0],
    fontWeight: {
      bold: tailwind.theme.fontWeight.bold,
      normal: tailwind.theme.fontWeight.normal,
      medium: tailwind.theme.fontWeight.medium,
    },
    spacingUnit: tailwind.theme.spacing[4],
  };

  const elements: Theme['elements'] = {
    dividerLine: 'bg-border',
    socialButtonsIconButton: 'bg-card',
    navbarButton: 'text-foreground',
    organizationSwitcherTrigger__open: 'bg-background',
    organizationPreviewMainIdentifier: 'text-foreground',
    organizationSwitcherTriggerIcon: 'text-muted-foreground',
    organizationPreview__organizationSwitcherTrigger: 'gap-2',
    organizationPreviewAvatarContainer: 'shrink-0',
  };

  // Update deprecated props to new format
  const clerkProps = { ...properties };
  
  // Replace deprecated props with newer versions
  if (clerkProps.afterSignInUrl) {
    clerkProps.signInFallbackRedirectUrl = clerkProps.afterSignInUrl;
    delete clerkProps.afterSignInUrl;
  }
  
  if (clerkProps.afterSignUpUrl) {
    clerkProps.signUpFallbackRedirectUrl = clerkProps.afterSignUpUrl;
    delete clerkProps.afterSignUpUrl;
  }

  // Use Suspense for Next.js 15 compatibility
  return (
    <Suspense fallback={<div>Loading authentication...</div>}>
      <ClerkProvider
        {...clerkProps}
        appearance={{ baseTheme, variables, elements }}
      />
    </Suspense>
  );
};
