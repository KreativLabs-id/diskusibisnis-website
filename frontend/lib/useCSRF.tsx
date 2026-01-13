/**
 * CSRF Protection Hook
 * 
 * Manages CSRF token for form submissions and API requests.
 * 
 * Usage:
 * const { csrfToken, getHeaders } = useCSRF();
 * 
 * // For fetch requests:
 * fetch('/api/endpoint', {
 *   method: 'POST',
 *   headers: getHeaders(),
 *   body: JSON.stringify(data)
 * });
 * 
 * // For form submissions, include the token:
 * <input type="hidden" name="_csrf" value={csrfToken} />
 */
'use client';

import { useState, useEffect, useCallback } from 'react';

// Cookie name must match backend configuration
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Read a cookie value by name
 */
function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;

    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const [cookieName, cookieValue] = cookie.trim().split('=');
        if (cookieName === name) {
            return decodeURIComponent(cookieValue);
        }
    }
    return null;
}

/**
 * Hook to manage CSRF token
 */
export function useCSRF() {
    const [csrfToken, setCsrfToken] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetch CSRF token from cookie or API
     */
    const fetchToken = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // First, try to get token from cookie
            let token = getCookie(CSRF_COOKIE_NAME);

            if (!token) {
                // If no cookie, fetch from API
                const response = await fetch('/api/csrf-token', {
                    method: 'GET',
                    credentials: 'include', // Important for cookies
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch CSRF token');
                }

                const data = await response.json();
                token = data.data?.token || data.token;
            }

            if (token) {
                setCsrfToken(token);
            } else {
                throw new Error('No CSRF token received');
            }
        } catch (err) {
            console.error('CSRF token fetch error:', err);
            setError(err instanceof Error ? err.message : 'Failed to get CSRF token');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch token on mount
    useEffect(() => {
        fetchToken();
    }, [fetchToken]);

    /**
     * Get headers with CSRF token for fetch requests
     */
    const getHeaders = useCallback((additionalHeaders: Record<string, string> = {}) => {
        return {
            'Content-Type': 'application/json',
            [CSRF_HEADER_NAME]: csrfToken,
            ...additionalHeaders,
        };
    }, [csrfToken]);

    /**
     * Refresh the CSRF token (call after form submission or on error)
     */
    const refreshToken = useCallback(() => {
        return fetchToken();
    }, [fetchToken]);

    return {
        csrfToken,
        loading,
        error,
        getHeaders,
        refreshToken,
        CSRF_HEADER_NAME,
    };
}

/**
 * Hidden input component for form submissions
 */
export function CSRFInput() {
    const { csrfToken, loading } = useCSRF();

    if (loading) {
        return null;
    }

    return (
        <input 
      type= "hidden"
    name = "_csrf"
    value = { csrfToken }
        />
  );
}

export default useCSRF;
