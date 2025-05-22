// Global type declarations for @clerk/nextjs to resolve missing exports
declare module '@clerk/nextjs' {
  import { ReactNode } from 'react';

  // ClerkProvider props
  interface ClerkProviderProps {
    children: ReactNode;
    publishableKey?: string;
    signInUrl?: string;
    signUpUrl?: string;
    dynamic?: boolean;
    [key: string]: any;
  }

  // Component exports that exist at runtime but are missing from TypeScript definitions
  export const ClerkProvider: React.ComponentType<ClerkProviderProps>;
  export const SignIn: React.ComponentType<any>;
  export const SignUp: React.ComponentType<any>;
  export const SignInButton: React.ComponentType<any>;
  export const SignUpButton: React.ComponentType<any>;
  export const SignedIn: React.ComponentType<{ children: ReactNode }>;
  export const SignedOut: React.ComponentType<{ children: ReactNode }>;
  export const UserButton: React.ComponentType<any>;
  export const SignOutButton: React.ComponentType<any>;
  export const OrganizationSwitcher: React.ComponentType<any>;
  export const OrganizationProfile: React.ComponentType<any>;
  export const CreateOrganization: React.ComponentType<any>;
  export const OrganizationList: React.ComponentType<any>;

  // Hook exports
  export function useAuth(): any;
  export function useUser(): any;
  export function useClerk(): any;
  export function useSession(): any;
  export function useSignIn(): any;
  export function useSignUp(): any;
  export function useOrganization(): any;
  export function useOrganizationList(): any;
} 