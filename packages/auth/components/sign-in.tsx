import { SignIn as ClerkSignIn } from '@clerk/nextjs';

export const SignIn = () => {
  return (
    <ClerkSignIn
      appearance={{
        elements: {
          header: 'hidden',
        },
      }}
    />
  );
};
