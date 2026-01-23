// Auth utilities for cookie-based JWT authentication
// Tokens are stored in HttpOnly cookies - NOT accessible via JS
// Auth state is managed through AuthContext by calling /profile endpoint

// These functions are deprecated - auth state is managed server-side via cookies
// Keeping empty implementations for backward compatibility if referenced elsewhere

/** @deprecated Use AuthContext user state instead */
export const isLoggedIn = () => {
    console.warn('isLoggedIn() is deprecated. Use AuthContext user state instead.');
    return false; // Cannot determine from JS - use AuthContext
};

// Token functions removed - HttpOnly cookies are not accessible via JavaScript
// This is by design for security (prevents XSS token theft)
