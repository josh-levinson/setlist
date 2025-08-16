// Environment-based configuration for the application
export const config = {
  // Base URL for the application
  baseUrl: import.meta.env.VITE_APP_URL || 
           (import.meta.env.DEV ? 'http://localhost:5173' : window.location.origin),
  
  // Auth redirect URLs
  auth: {
    callbackUrl: import.meta.env.VITE_AUTH_CALLBACK_URL || 
                 `${import.meta.env.VITE_APP_URL || (import.meta.env.DEV ? 'http://localhost:5173' : window.location.origin)}/auth/callback`,
    
    resetPasswordUrl: import.meta.env.VITE_AUTH_RESET_PASSWORD_URL || 
                      `${import.meta.env.VITE_APP_URL || (import.meta.env.DEV ? 'http://localhost:5173' : window.location.origin)}/auth/callback?next=/auth/reset-password`,
  },
  
  // Development helpers
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
}

// Helper function to get the current base URL
export const getBaseUrl = () => {
  if (import.meta.env.VITE_APP_URL) {
    return import.meta.env.VITE_APP_URL
  }
  
  if (import.meta.env.DEV) {
    return 'http://localhost:5173'
  }
  
  return window.location.origin
}

// Helper function to build auth redirect URLs
export const getAuthRedirectUrl = (path: string = '/auth/callback') => {
  const baseUrl = getBaseUrl()
  return `${baseUrl}${path}`
}