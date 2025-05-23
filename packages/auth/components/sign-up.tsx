'use client';

import { SignUp as ClerkSignUp } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export const SignUp = () => {
  const [afterSignInUrl, setAfterSignInUrl] = useState('/');
  const [afterSignUpUrl, setAfterSignUpUrl] = useState('/');
  
  useEffect(() => {
    // Check for callback parameter in URL
    const searchParams = new URLSearchParams(window.location.search);
    const callback = searchParams.get('callback');
    
    // If callback=survey, redirect to auth-callback page after sign-up
    if (callback === 'survey') {
      setAfterSignInUrl('/auth-callback?callback=survey');
      setAfterSignUpUrl('/auth-callback?callback=survey');
    }
  }, []);
  
  return (
    <ClerkSignUp
      afterSignInUrl={afterSignInUrl}
      afterSignUpUrl={afterSignUpUrl}
      redirectUrl={afterSignUpUrl}
      appearance={{
        elements: {
          header: 'hidden',
        },
      }}
    />
  );
};
