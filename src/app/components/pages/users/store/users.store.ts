import { Injectable, signal } from '@angular/core';
import { UserModel } from '../core/models/user.model';
import { UserDetailsModel } from '../core/models/user-details.model';

@Injectable({
  providedIn: 'root'
})
export class UsersStore {
  
  // Signal to store the users list
  private usersSignal = signal<UserModel[]>([]);
  
  // Read-only accessor for the signal
  readonly users = this.usersSignal.asReadonly();

  // Signal to store the selected user details
  private userDetailsSignal = signal<UserDetailsModel | null>(null);
  
  // Read-only accessor for the details signal
  readonly userDetails = this.userDetailsSignal.asReadonly();

  /**
   * Set the users list
   * @param users - Array of user models
   */
  setUsers(users: UserModel[]): void {
    this.usersSignal.set(users);
  }

  /**
   * Add a single user to the list
   * @param user - User model to add
   */
  addUser(user: UserModel): void {
    this.usersSignal.update(users => [...users, user]);
  }

  /**
   * Update a user in the list
   * @param updatedUser - Updated user model
   */
  updateUser(updatedUser: UserModel): void {
    this.usersSignal.update(users => 
      users.map(user => 
        user.Id === updatedUser.Id ? updatedUser : user
      )
    );
  }

  /**
   * Remove a user from the list
   * @param userId - ID of the user to remove
   */
  removeUser(userId: number): void {
    this.usersSignal.update(users => 
      users.filter(user => user.Id !== userId)
    );
  }

  /**
   * Clear all users
   */
  clearUsers(): void {
    this.usersSignal.set([]);
  }

  /**
   * Get current users value (non-reactive)
   */
  getUsersValue(): UserModel[] {
    return this.usersSignal();
  }

  /**
   * Set the user details
   * @param details - User details model
   */
  setUserDetails(details: UserDetailsModel | null): void {
    this.userDetailsSignal.set(details);
  }

  /**
   * Clear user details
   */
  clearUserDetails(): void {
    this.userDetailsSignal.set(null);
  }

  /**
   * Get current user details value (non-reactive)
   */
  getUserDetailsValue(): UserDetailsModel | null {
    return this.userDetailsSignal();
  }
}
