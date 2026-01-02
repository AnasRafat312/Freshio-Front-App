import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidator, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, map, debounceTime, take } from 'rxjs/operators';
import { UsersService } from './users.service';

@Injectable({ providedIn: 'root' })
export class UserEmailExistsValidator implements AsyncValidator {
  constructor(private usersService:UsersService) {}

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
     ;
    return this.checkEmailExists(control.value).pipe(
      debounceTime(500), // Optional: Add debounce time to reduce the number of API requests
      take(1), // Take only one result to complete the observable
      map((exists) => (exists ? { emailExists: true } : null)), // Return error if email exists
      catchError(() => of(null)) // Handle errors gracefully
    );
  }

  private checkEmailExists(email: string): Observable<boolean> {
  return this.usersService.checkEmailExists(email);
  }
}
