'use client';

import { dark } from '@clerk/themes';
import type { Theme } from '@clerk/types';
import { tailwind } from '@repo/tailwind-config';
import { useTheme } from 'next-themes';
import type { ReactNode } from 'react';

// Workaround for Next.js 15 compatibility
let ClerkProvider: any;

try {
  // Try to dynamically import ClerkProvider at runtime
  ClerkProvider = require('@clerk/nextjs').ClerkProvider;
} catch (error) {
  // Fallback to a simple wrapper if import fails
  console.error('Failed to import ClerkProvider:', error);
  ClerkProvider = ({ children }: { children: ReactNode }) => <>{children}</>;
}

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

  return (
    <ClerkProvider
      {...properties}
      appearance={{ baseTheme, variables, elements }}
    />
  );
};
