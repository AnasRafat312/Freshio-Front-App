import { AuthService } from '../services/auth.service';

/**
 * APPLICATION AUTHENTICATION INITIALIZER
 * 
 * Purpose:
 * Runs before Angular application bootstraps to restore user session
 * 
 * Flow:
 * 1. Application starts
 * 2. This initializer runs BEFORE app renders
 * 3. Attempts silent refresh using HttpOnly refresh token cookie
 * 4. If successful, user is authenticated without login
 * 5. If failed, user will be redirected to login by AuthGuard
 * 
 * Security Benefits:
 * - Seamless user experience (no re-login on page refresh)
 * - Validates refresh token on every app start
 * - Detects expired/invalid refresh tokens early
 * - Prevents unauthorized access even if user tries to manipulate client
 * 
 * Usage:
 * Register in app.module.ts or app.config.ts providers:
 * 
 * providers: [
 *   {
 *     provide: APP_INITIALIZER,
 *     useFactory: initializeAuth,
 *     deps: [AuthService],
 *     multi: true
 *   }
 * ]
 */

/**
 * INITIALIZE AUTHENTICATION
 * Factory function for APP_INITIALIZER
 * 
 * @param authService - Injected AuthService
 * @returns Promise that resolves when initialization completes
 */
export function initializeAuth(authService: AuthService): () => Promise<void> {
  return (): Promise<void> => {
    return new Promise((resolve) => {
      // Attempt silent authentication using refresh token cookie
      authService.silentRefresh().subscribe({
        next: (success) => {
          if (success) {
            console.log('✓ Silent authentication successful');
          } else {
            console.log('✗ Silent authentication failed - user will need to login');
          }
          // Always resolve to allow app to continue loading
          // AuthGuard will handle redirect to login if needed
          resolve();
        },
        error: (error) => {
          console.error('✗ Silent authentication error:', error);
          // Resolve anyway to prevent app from hanging
          resolve();
        }
      });
    });
  };
}

/**
 * ALTERNATIVE: Synchronous Initializer (if you prefer non-blocking)
 * 
 * This version doesn't wait for refresh to complete
 * Useful if you want faster app startup
 * AuthGuard will still handle authentication on route navigation
 */
export function initializeAuthNonBlocking(authService: AuthService): () => void {
  return (): void => {
    // Trigger silent refresh but don't wait for it
    authService.silentRefresh().subscribe({
      next: (success) => {
        if (success) {
          console.log('✓ Silent authentication successful');
        }
      },
      error: (error) => {
        console.error('✗ Silent authentication failed:', error);
      }
    });
  };
}
