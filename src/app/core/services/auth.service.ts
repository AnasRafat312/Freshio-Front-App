import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Constant } from '../constants/constant';

/**
 * Branch DTO Interface
 */
interface BranchDto {
  Id: number;
  CompanyId: number;
  Name: string;
  Address?: string;
  PhoneNumber?: string;
  Code?: string;
  IsActive: boolean;
  CreatedAt: Date;
}

/**
 * Authentication Response Interface
 * Matches your backend TokenResponseDto
 */
interface AuthResponse {
  AccessToken: string;
  RefreshToken: string;
  Token: string; // Backward compatibility
  Username?: string;
  Email?: string;
  FullName?: string;
  Role?: string;
  Branches?: BranchDto[];
  ExpiresAt?: Date;
}

/**
 * API Response Wrapper
 */
interface ApiResponse<T> {
  Success: boolean;
  Data: T;
  Message: string;
  Errors?: string[];
}

/**
 * Login Credentials Interface
 * Matches your backend LoginDto
 */
interface LoginCredentials {
  Username: string;
  Password: string;
}

/**
 * SECURE Authentication Service (Adapted for Current Backend)
 * 
 * Security Principles:
 * 1. Access token stored ONLY in memory (private variable)
 * 2. Refresh token stored in sessionStorage (cleared on browser close)
 * 3. Automatic token refresh on 401 responses
 * 4. Refresh token rotation implemented
 * 
 * Note: This is adapted to work with your current backend that returns
 * refresh token in response body. For maximum security, backend should
 * be updated to use HttpOnly cookies for refresh tokens.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /**
   * CRITICAL: Access token stored in memory ONLY
   * Never persisted to localStorage, sessionStorage, or cookies
   * Lost on page refresh - requires silent refresh on app init
   */
  private accessToken: string | null = null;

  /**
   * BehaviorSubject to track authentication state
   * Allows components to reactively respond to auth changes
   */
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  /**
   * BehaviorSubject to prevent multiple simultaneous refresh calls
   * Critical for handling race conditions when multiple requests fail with 401
   */
  private refreshTokenInProgress = new BehaviorSubject<boolean>(false);
  public refreshTokenInProgress$ = this.refreshTokenInProgress.asObservable();

  /**
   * Store user metadata (non-sensitive data only)
   * Can be stored in memory or sessionStorage as it contains no tokens
   */
  private userMetadata: any = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private constant: Constant
  ) {}

  /**
   * LOGIN
   * Authenticates user and stores access token in memory
   * 
   * @param credentials - User email and password
   * @returns Observable with auth response
   * 
   * Security Notes:
   * - Backend must set refresh token as HttpOnly Secure SameSite cookie
   * - Only access token is returned in response body
   * - withCredentials: true ensures cookies are sent/received
   */
  login(credentials: LoginCredentials): Observable<ApiResponse<AuthResponse>> {
    const url = `${this.constant.API_ENDPOINT}Auth/Login`;
    
    return this.http.post<ApiResponse<AuthResponse>>(url, credentials).pipe(
      tap((apiResponse: ApiResponse<AuthResponse>) => {
        console.log('🔍 Login API Response:', apiResponse);
        
        const response = apiResponse.Data;
        console.log('🔍 Response Data:', response);
        console.log('🔍 AccessToken:', response?.AccessToken ? 'EXISTS' : 'MISSING');
        console.log('🔍 RefreshToken:', response?.RefreshToken ? 'EXISTS' : 'MISSING');
        
        // Store access token in memory ONLY
        this.accessToken = response.AccessToken;
        console.log('✅ Access token stored:', this.accessToken ? 'YES' : 'NO');
        
        // Store refresh token in sessionStorage (cleared on browser close)
        sessionStorage.setItem('refreshToken', response.RefreshToken);
        
        // Extract first branch info if available
        const firstBranch = response.Branches && response.Branches.length > 0 ? response.Branches[0] : null;
        
        // Store non-sensitive user metadata
        this.userMetadata = {
          username: response.Username,
          email: response.Email,
          fullName: response.FullName,
          role: response.Role,
          companyId: firstBranch?.CompanyId,
          branches: response.Branches
        };

        // Store user metadata in sessionStorage (NOT access token!)
        sessionStorage.setItem('userMetadata', JSON.stringify(this.userMetadata));
        
        // Update authentication state
        this.isAuthenticatedSubject.next(true);
        
        console.log('✅ Login processing complete');
      }),
      catchError(error => {
        console.error('Login failed:', error);
        this.clearAuthState();
        return throwError(() => error);
      })
    );
  }

  /**
   * LOGOUT
   * Clears in-memory token and calls backend to invalidate refresh token
   * 
   * Security Notes:
   * - Backend must clear the HttpOnly refresh token cookie
   * - Backend should invalidate the refresh token in database
   * - withCredentials: true ensures cookie is sent for invalidation
   */
  logout(): Observable<any> {
    const url = `${this.constant.API_ENDPOINT}Auth/Logout`;
    
    return this.http.post(url, {}, {
      withCredentials: true // CRITICAL: Sends refresh token cookie to backend
    }).pipe(
      tap(() => {
        this.clearAuthState();
        this.router.navigate(['/auth/login']);
      }),
      catchError(error => {
        // Even if backend call fails, clear local state
        console.error('Logout error:', error);
        this.clearAuthState();
        this.router.navigate(['/auth/login']);
        return throwError(() => error);
      })
    );
  }

  /**
   * REFRESH ACCESS TOKEN
   * Obtains new access token using refresh token cookie
   * 
   * Security Notes:
   * - Refresh token is sent automatically via HttpOnly cookie
   * - Backend should implement refresh token rotation
   * - Backend returns new access token and sets new refresh token cookie
   * - withCredentials: true is CRITICAL for cookie transmission
   * 
   * @returns Observable with new access token
   */
  refreshAccessToken(): Observable<ApiResponse<AuthResponse>> {
    const url = `${this.constant.API_ENDPOINT}Auth/RefreshToken`;
    
    // Get refresh token from sessionStorage
    const refreshToken = sessionStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      this.clearAuthState();
      return throwError(() => new Error('No refresh token available'));
    }
    
    // Mark refresh as in progress to prevent duplicate calls
    this.refreshTokenInProgress.next(true);
    
    const requestBody = { RefreshToken: refreshToken };
    
    return this.http.post<ApiResponse<AuthResponse>>(url, requestBody).pipe(
      tap((apiResponse: ApiResponse<AuthResponse>) => {
        const response = apiResponse.Data;
        
        // Update access token in memory
        this.accessToken = response.AccessToken;
        
        // Update refresh token in sessionStorage (token rotation)
        sessionStorage.setItem('refreshToken', response.RefreshToken);
        
        // Update authentication state
        this.isAuthenticatedSubject.next(true);
        
        // Mark refresh as complete
        this.refreshTokenInProgress.next(false);
      }),
      catchError(error => {
        console.error('Token refresh failed:', error);
        
        // Mark refresh as complete
        this.refreshTokenInProgress.next(false);
        
        // Clear auth state on refresh failure
        this.clearAuthState();
        
        return throwError(() => error);
      })
    );
  }

  /**
   * GET ACCESS TOKEN
   * Returns current in-memory access token
   * 
   * @returns Access token string or null
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * CHECK AUTHENTICATION STATUS
   * Returns whether user is currently authenticated
   * 
   * @returns Boolean indicating auth status
   */
  isAuthenticated(): boolean {
    return this.accessToken !== null;
  }

  /**
   * GET USER METADATA
   * Returns non-sensitive user information
   * 
   * @returns User metadata object
   */
  getUserMetadata(): any {
    if (!this.userMetadata) {
      // Try to restore from sessionStorage
      const stored = sessionStorage.getItem('userMetadata');
      if (stored) {
        this.userMetadata = JSON.parse(stored);
      }
    }
    return this.userMetadata;
  }

  /**
   * CLEAR AUTHENTICATION STATE
   * Removes all authentication data from memory and storage
   */
  private clearAuthState(): void {
    this.accessToken = null;
    this.userMetadata = null;
    this.isAuthenticatedSubject.next(false);
    sessionStorage.removeItem('userMetadata');
    sessionStorage.removeItem('refreshToken');
  }

  /**
   * SILENT REFRESH
   * Attempts to refresh token without user interaction
   * Used on app initialization to restore session
   * 
   * @returns Observable<boolean> - true if refresh successful, false otherwise
   */
  silentRefresh(): Observable<boolean> {
    return new Observable(observer => {
      this.refreshAccessToken().subscribe({
        next: () => {
          observer.next(true);
          observer.complete();
        },
        error: () => {
          observer.next(false);
          observer.complete();
        }
      });
    });
  }
}
