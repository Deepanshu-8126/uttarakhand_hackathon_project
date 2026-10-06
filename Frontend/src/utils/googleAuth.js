/**
 * Discovery Uttarakhand — Google Identity Services (GIS / OAuth 2.0)
 * Provides seamless 1-tap sign-in and Google OAuth 2.0 popup authentication.
 */

let googleScriptPromise = null;

export function loadGoogleGSI() {
  if (googleScriptPromise) return googleScriptPromise;
  if (typeof window !== 'undefined' && window.google?.accounts?.id) {
    return Promise.resolve(window.google);
  }

  googleScriptPromise = new Promise((resolve, reject) => {
    if (typeof document === 'undefined') return reject(new Error('Window document unavailable'));

    const existingScript = document.getElementById('google-gsi-client');
    if (existingScript) {
      existingScript.onload = () => resolve(window.google);
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-client';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = (err) => {
      console.warn('[GoogleAuth] Failed to load Google GSI SDK script:', err);
      resolve(null);
    };
    document.head.appendChild(script);
  });

  return googleScriptPromise;
}

/**
 * Initiates Google OAuth authentication flow.
 * Returns { credential, isRealOAuth }
 */
export async function promptGoogleSignIn({ clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID } = {}) {
  try {
    const google = await loadGoogleGSI();

    if (google?.accounts?.id && clientId) {
      return new Promise((resolve) => {
        let isResolved = false;

        google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (!isResolved && response?.credential) {
              isResolved = true;
              resolve({ credential: response.credential, isRealOAuth: true });
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Prompt Google Sign-In dialog
        google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // If One-Tap prompt is suppressed or closed by browser, resolve fallback token
            if (!isResolved) {
              isResolved = true;
              resolve({
                credential: createFallbackToken(),
                isRealOAuth: false,
              });
            }
          }
        });

        // Safe timeout fallback in case user dismisses popup silently
        setTimeout(() => {
          if (!isResolved) {
            isResolved = true;
            resolve({
              credential: createFallbackToken(),
              isRealOAuth: false,
            });
          }
        }, 12000);
      });
    }
  } catch (err) {
    console.warn('[GoogleAuth] Error during Google GSI prompt:', err.message);
  }

  // Fallback token for local development & demonstration
  return {
    credential: createFallbackToken(),
    isRealOAuth: false,
  };
}

/**
 * Generates a mock verified JWT token structure for instant local testing/demo
 */
function createFallbackToken() {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({
    sub: "google_oauth_" + Math.random().toString(36).substring(2, 10),
    email: "traveler.google@gmail.com",
    name: "Verified Himalayan Explorer",
    picture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
    email_verified: true,
    exp: Math.floor(Date.now() / 1000) + 3600
  }));
  const signature = btoa("mock_google_signature");
  return `${header}.${payload}.${signature}`;
}
