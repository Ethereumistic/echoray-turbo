'use client';

import { SignIn as ClerkSignIn } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export const SignIn = () => {
  const [afterSignInUrl, setAfterSignInUrl] = useState('/');
  const [afterSignUpUrl, setAfterSignUpUrl] = useState('/');
  
  useEffect(() => {
    // Check for callback parameter in URL
    const searchParams = new URLSearchParams(window.location.search);
    const callback = searchParams.get('callback');
    
    // If callback=survey, redirect to auth-callback page after sign-in
    if (callback === 'survey') {
      setAfterSignInUrl('/auth-callback?callback=survey');
      setAfterSignUpUrl('/auth-callback?callback=survey');
    }
  }, []);
  
  return (
    <ClerkSignIn
      afterSignInUrl={afterSignInUrl}
      afterSignUpUrl={afterSignUpUrl}
      redirectUrl={afterSignInUrl}
      appearance={{
        elements: {
          header: 'hidden',
        },
      }}
    />
  );
};
