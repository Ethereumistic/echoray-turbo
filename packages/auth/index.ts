// Custom components with styling - temporarily disabled due to export issues
// export { SignIn } from './components/sign-in';
// export { SignUp } from './components/sign-up';

// Re-export all working Clerk components
export { 
  ClerkProvider,
  SignIn,
  SignUp,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  SignOutButton,
  useAuth,
  useUser,
  useClerk
} from '@clerk/nextjs';

// Custom components with styling (if needed later)
// export { SignIn as CustomSignIn } from './components/sign-in';
// export { SignUp as CustomSignUp } from './components/sign-up'; 