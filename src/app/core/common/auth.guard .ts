import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard  {
  constructor(private router: Router) {}

  canActivate(): boolean {
    // Check if token exists in local storage
    const token = localStorage.getItem('token');

    if (token) {
      return true; // Allow access to the route
    } else {
      this.router.navigate(['/auth/login']);
      return false; // Block access to the route
    }
  }
}
