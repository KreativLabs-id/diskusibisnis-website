'use client';

import { useEffect, useCallback, useState, useRef } from 'react';

interface GoogleLoginButtonProps {
  onSuccess: (credential: string) => void;
  onError?: () => void;
  text?: string;
  disabled?: boolean;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          cancel: () => void;
        };
        oauth2: {
          initCodeClient: (config: any) => any;
          initTokenClient: (config: any) => any;
        };
      };
    };
  }
}

export default function GoogleLoginButton({
  onSuccess,
  onError,
  text = 'Lanjutkan dengan Google',
  disabled = false,
}: GoogleLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const handleCredentialResponse = useCallback(
    (response: any) => {
      setIsLoading(false);
      if (response.credential) {
        onSuccess(response.credential);
      } else {
        onError?.();
      }
    },
    [onSuccess, onError]
  );

  useEffect(() => {
    if (!clientId) {
      console.error('Google Client ID not configured');
      return;
    }

    // Check if script already loaded
    const existingScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );

    if (existingScript && window.google) {
      // Script already loaded, just initialize
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        use_fedcm_for_prompt: true, // Use new FedCM API
        itp_support: true, // Support for Intelligent Tracking Prevention
        cancel_on_tap_outside: false,
      });
      setIsReady(true);
      return;
    }

    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          use_fedcm_for_prompt: true, // Use new FedCM API
          itp_support: true, // Support for Intelligent Tracking Prevention
          cancel_on_tap_outside: false,
        });
        setIsReady(true);
      }
    };

    script.onerror = () => {
      console.error('Failed to load Google Identity Services script');
      setIsReady(false);
    };

    document.body.appendChild(script);

    return () => {
      // Don't remove the script on cleanup as it may be used by other components
    };
  }, [clientId, handleCredentialResponse]);

  // Render Google's native button in a hidden div for popup fallback
  useEffect(() => {
    if (isReady && buttonRef.current && window.google) {
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        width: '100%',
      });
    }
  }, [isReady]);

  const handleClick = () => {
    if (!isReady || disabled || isLoading) return;

    setIsLoading(true);

    // First try One Tap prompt
    if (window.google) {
      window.google.accounts.id.prompt((notification: any) => {
        // Check dismissal reason
        if (notification.isNotDisplayed()) {
          const reason = notification.getNotDisplayedReason();
          console.log('One Tap not displayed:', reason);

          // Fallback to clicking the hidden Google button
          setIsLoading(false);
          triggerHiddenButton();
        } else if (notification.isSkippedMoment()) {
          const reason = notification.getSkippedReason();
          console.log('One Tap skipped:', reason);

          setIsLoading(false);
          triggerHiddenButton();
        } else if (notification.isDismissedMoment()) {
          const reason = notification.getDismissedReason();
          console.log('One Tap dismissed:', reason);
          setIsLoading(false);

          // If user clicked outside or escaped, don't show error
          if (reason !== 'credential_returned') {
            // User canceled, don't call onError
          }
        }
      });
    }
  };

  const triggerHiddenButton = () => {
    // Find and click the Google rendered button
    if (buttonRef.current) {
      const googleButton = buttonRef.current.querySelector('div[role="button"]') as HTMLElement;
      if (googleButton) {
        googleButton.click();
      } else {
        // No button found, try triggering prompt again or show error
        onError?.();
      }
    }
  };

  if (!clientId) {
    return null;
  }

  return (
    <>
      {/* Hidden div for Google's native button (fallback) */}
      <div
        ref={buttonRef}
        className="hidden"
        aria-hidden="true"
      />

      {/* Custom styled button */}
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isLoading || !isReady}
        className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
            <span>Memproses...</span>
          </>
        ) : (
          <>
            {/* Google Icon */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>{text}</span>
          </>
        )}
      </button>
    </>
  );
}
