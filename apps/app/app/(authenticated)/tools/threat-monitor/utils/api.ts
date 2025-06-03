// API configuration for threat monitor endpoints

const getApiBaseUrl = () => {
  // In development, use localhost:3002
  // In production, use api.echoray.io
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost') {
      return 'http://localhost:3002';
    } else if (hostname === 'app.echoray.io') {
      return 'https://api.echoray.io';
    }
  }
  
  // Fallback
  return process.env.NODE_ENV === 'production' 
    ? 'https://api.echoray.io' 
    : 'http://localhost:3002';
};

export const API_BASE_URL = getApiBaseUrl();

// Helper function to get auth headers
export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  // In development, we rely on the server-side auth bypass
  // In production, we'll need proper Clerk token handling
  if (process.env.NODE_ENV === 'production') {
    try {
      // For production cross-domain requests, get the session token
      if (typeof window !== 'undefined' && (window as any).Clerk) {
        const session = await (window as any).Clerk.session;
        if (session) {
          const token = await session.getToken();
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
        }
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error);
    }
  }
  
  return headers;
};

// Helper function to make API calls with proper URL and auth
export const threatMonitorFetch = async (endpoint: string, options?: RequestInit) => {
  const url = `${API_BASE_URL}/threat-monitor${endpoint}`;
  
  // Get authentication headers
  const authHeaders = await getAuthHeaders();
  
  // Merge headers properly
  const headers: Record<string, string> = {
    ...authHeaders,
    ...(options?.headers as Record<string, string> || {})
  };
  
  const mergedOptions: RequestInit = {
    ...options,
    headers
  };
  
  const response = await fetch(url, mergedOptions);
  
  // Handle non-JSON responses
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error || errorMessage;
    } catch {
      // Not JSON, use status text
    }
    
    throw new Error(errorMessage);
  }
  
  return response;
}; 