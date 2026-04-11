import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  Router, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot,
  UrlTree 
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * SECURE AUTHENTICATION GUARD
 * 
 * Responsibilities:
 * 1. Protect routes from unauthorized access
 * 2. Check for valid access token in memory
 * 3. Attempt silent refresh if no token exists
 * 4. Redirect to login if authentication fails
 * 
 * Security Features:
 * - Uses in-memory token validation
 * - Attempts silent refresh before denying access
 * - Preserves intended destination URL for post-login redirect
 * - No localStorage dependency
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  /**
   * CAN ACTIVATE
   * Determines if route can be activated based on authentication status
   * 
   * Flow:
   * 1. Check if user has valid access token
   * 2. If yes, allow access
   * 3. If no, attempt silent refresh
   * 4. If refresh succeeds, allow access
   * 5. If refresh fails, redirect to login
   * 
   * @param route - Activated route snapshot
   * @param state - Router state snapshot
   * @returns Observable<boolean | UrlTree> - true if access allowed, UrlTree for redirect
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    // Check if user is already authenticated (has access token in memory)
    if (this.authService.isAuthenticated()) {
      return true;
    }

    // No access token - attempt silent refresh using refresh token cookie
    return this.authService.silentRefresh().pipe(
      map(success => {
        if (success) {
          // Silent refresh successful - allow access
          return true;
        } else {
          // Silent refresh failed - redirect to login
          // Preserve intended URL for post-login redirect
          return this.router.createUrlTree(['/auth/login'], {
            queryParams: { returnUrl: state.url }
          });
        }
      }),
      catchError(() => {
        // Error during refresh - redirect to login
        return [this.router.createUrlTree(['/auth/login'], {
          queryParams: { returnUrl: state.url }
        })];
      })
    );
  }
}
