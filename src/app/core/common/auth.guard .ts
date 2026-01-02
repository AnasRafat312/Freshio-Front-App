import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard  {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const userId = localStorage.getItem('userId');
    const companyId = localStorage.getItem('companyId');

    if (userId != null && userId != "" && userId != undefined &&companyId != null && companyId != undefined && companyId != "") {
      return true; // Allow access to the route
    } else {
      this.router.navigate(['/auth/login']);
      return false; // Block access to the route
    }
  }
}
