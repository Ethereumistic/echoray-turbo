// Debug Auth Script - Run this in your browser console on echoray.io
// This will help you test cross-domain authentication

console.log('🔍 Starting auth debug test...');
console.log('🌐 Current URL:', window.location.href);

// Test 1: Check if authDebug is available
if (window.authDebug) {
  console.log('✅ authDebug found:', window.authDebug);
  console.log('📊 Auth Status:', {
    authenticated: window.authDebug.authenticated,
    user: window.authDebug.user,
    loading: window.authDebug.loading,
    error: window.authDebug.error,
    debug: window.authDebug.debug
  });
} else {
  console.log('❌ authDebug not found - check if component is loaded');
}

// Test 2: Manually test the API endpoint
const testAuthEndpoint = async () => {
  try {
    console.log('🔍 Testing auth endpoint manually...');
    const response = await fetch(`${window.location.protocol}//app.${window.location.hostname.replace('www.', '')}:3000/api/auth/check`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📡 Manual test response status:', response.status);
    const data = await response.json();
    console.log('📨 Manual test response data:', data);
    
    return data;
  } catch (error) {
    console.error('🚨 Manual test error:', error);
    return null;
  }
};

// Test 3: Check environment variables
console.log('🌍 Environment check:');
console.log('- NEXT_PUBLIC_APP_URL should be available in the page source');

// Run manual test
testAuthEndpoint();

// Helper function to recheck auth
window.recheckAuth = () => {
  if (window.authDebug && window.authDebug.recheckAuth) {
    window.authDebug.recheckAuth();
  } else {
    console.log('⚠️ Recheck function not available, refreshing page...');
    window.location.reload();
  }
};

console.log('✨ Debug script loaded! Available commands:');
console.log('- window.authDebug: Check current auth status');
console.log('- window.recheckAuth(): Recheck authentication');
console.log('- testAuthEndpoint(): Manually test the auth API'); 