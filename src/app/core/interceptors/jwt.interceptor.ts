import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap, finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

/**
 * JWT INTERCEPTOR
 * 
 * Responsibilities:
 * 1. Attach Authorization header with access token to outgoing requests
 * 2. Handle 401 Unauthorized responses
 * 3. Automatically refresh access token on 401
 * 4. Retry failed requests with new token
 * 5. Prevent multiple simultaneous refresh calls (race condition handling)
 * 
 * Security Features:
 * - Uses in-memory access token from AuthService
 * - Implements token refresh queue to prevent duplicate refresh calls
 * - Handles refresh token rotation
 * - Fails gracefully and redirects to login on refresh failure
 */
@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  /**
   * Flag to track if token refresh is in progress
   * Prevents multiple parallel refresh calls
   */
  private isRefreshing = false;

  /**
   * Subject to queue requests while refresh is in progress
   * Emits new access token once refresh completes
   */
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  /**
   * URLs that should bypass authentication
   * Add endpoints that don't require authentication
   */
  private readonly BYPASS_URLS = [
    '/Auth/Login',
    '/Auth/RefreshToken',  // Your backend endpoint
    '/Auth/Register',
    '/Auth/ForgotPassword',
    'config.json',  // Config file
    'assets/'  // Static assets
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * INTERCEPT HTTP REQUESTS
   * 
   * Flow:
   * 1. Check if URL should bypass authentication
   * 2. Add Authorization header if access token exists
   * 3. Handle request
   * 4. On 401 error, attempt token refresh and retry
   * 
   * @param request - HTTP request
   * @param next - HTTP handler
   * @returns Observable of HTTP event
   */
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip authentication for bypass URLs
    if (this.shouldBypassAuth(request.url)) {
      return next.handle(request);
    }

    // Add authorization header if token exists
    const modifiedRequest = this.addAuthHeader(request);

    // Handle request and catch 401 errors
    return next.handle(modifiedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 Unauthorized - token expired or invalid
        if (error.status === 401) {
          return this.handle401Error(modifiedRequest, next);
        }

        // Handle 403 Forbidden - insufficient permissions
        if (error.status === 403) {
          console.error('Access forbidden - insufficient permissions');
          // Optionally redirect to access denied page
          // this.router.navigate(['/auth/access-denied']);
        }

        return throwError(() => error);
      })
    );
  }

  /**
   * ADD AUTHORIZATION HEADER
   * Attaches Bearer token to request if available
   * 
   * @param request - Original HTTP request
   * @returns Cloned request with Authorization header
   */
  private addAuthHeader(request: HttpRequest<any>): HttpRequest<any> {
    const accessToken = this.authService.getAccessToken();

    // If no token, send request without Authorization header
    if (!accessToken) {
      console.warn('⚠️ No access token for:', request.url);
      return request;
    }

    // Clone request and add Authorization header
    console.log('✅ Adding token to:', request.url);
    console.log('Token preview:', accessToken.substring(0, 20) + '...');
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  }

  /**
   * HANDLE 401 UNAUTHORIZED ERROR
   * Implements token refresh logic with race condition prevention
   * 
   * Strategy:
   * 1. If refresh already in progress, queue the request
   * 2. If not refreshing, initiate refresh
   * 3. Retry original request with new token
   * 4. On refresh failure, redirect to login
   * 
   * @param request - Failed HTTP request
   * @param next - HTTP handler
   * @returns Observable of HTTP event
   */
  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // If refresh is already in progress
    if (this.isRefreshing) {
      // Queue this request until refresh completes
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null), // Wait for new token
        take(1), // Take only the first emission
        switchMap(token => {
          // Retry request with new token
          return next.handle(this.addAuthHeader(request));
        })
      );
    }

    // Mark refresh as in progress
    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);

    // Attempt to refresh access token
    return this.authService.refreshAccessToken().pipe(
      switchMap((apiResponse) => {
        // Refresh successful
        this.isRefreshing = false;
        
        // Emit new token to queued requests
        this.refreshTokenSubject.next(apiResponse.Data.AccessToken);

        // Retry original request with new token
        return next.handle(this.addAuthHeader(request));
      }),
      catchError((error) => {
        // Refresh failed - user needs to re-authenticate
        this.isRefreshing = false;
        this.refreshTokenSubject.next(null);

        console.error('Token refresh failed, redirecting to login');
        
        // Clear auth state and redirect to login
        this.router.navigate(['/auth/login'], {
          queryParams: { returnUrl: this.router.url }
        });

        return throwError(() => error);
      }),
      finalize(() => {
        // Ensure flag is reset even if error occurs
        this.isRefreshing = false;
      })
    );
  }

  /**
   * CHECK IF URL SHOULD BYPASS AUTHENTICATION
   * Determines if request should skip auth header attachment
   * 
   * @param url - Request URL
   * @returns Boolean indicating if auth should be bypassed
   */
  private shouldBypassAuth(url: string): boolean {
    return this.BYPASS_URLS.some(bypassUrl => url.includes(bypassUrl));
  }
}
