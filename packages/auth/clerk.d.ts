// Type declarations for @clerk/nextjs exports that exist at runtime but are missing from TypeScript definitions
declare module '@clerk/nextjs' {
  import { ReactNode } from 'react';

  // ClerkProvider props
  export interface ClerkProviderProps {
    children: ReactNode;
    publishableKey?: string;
    signInUrl?: string;
    signUpUrl?: string;
    dynamic?: boolean;
    [key: string]: any;
  }

  // Component exports
  export const ClerkProvider: React.ComponentType<ClerkProviderProps>;
  export const SignIn: React.ComponentType<any>;
  export const SignUp: React.ComponentType<any>;
  export const SignInButton: React.ComponentType<any>;
  export const SignUpButton: React.ComponentType<any>;
  export const SignedIn: React.ComponentType<any>;
  export const SignedOut: React.ComponentType<any>;
  export const UserButton: React.ComponentType<any>;
  export const SignOutButton: React.ComponentType<any>;

  // Hook exports
  export function useAuth(): any;
  export function useUser(): any;
  export function useClerk(): any;
} 