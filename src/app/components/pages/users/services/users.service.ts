import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Constant } from 'src/app/core/constants/constant';
import { ResponseModel } from 'src/app/shared/model/response';
import { UsersStore } from '../store/users.store';
import { CreateUserModel } from '../core/models/create-user.model';
import { UpdateUserModel } from '../core/models/update-user.model';
import { UpdateUserPasswordModel } from '../core/models/users.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(
    private http: HttpClient,
    private constant: Constant,
    private usersStore: UsersStore
  ) { }

  /**
   * Get all users from API and update store
   * Subscription is handled internally
   */
  getUsers(): void {
    const url = `${this.constant.API_ENDPOINT}Users/GetAll`;
    this.http.get<ResponseModel>(url).subscribe({
      next: (res: ResponseModel) => {
        if (res?.Success) {
          this.usersStore.setUsers(res?.Data);
        }
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  /**
   * Get user details by ID and update store
   * Subscription is handled internally
   */
  getUserDetails(id: number): void {
    const url = `${this.constant.API_ENDPOINT}Users/GetById/${id}`;
    this.http.get<ResponseModel>(url).subscribe({
      next: (res: ResponseModel) => {
        if (res?.Success) {
          this.usersStore.setUserDetails(res?.Data);
        } else {
          this.usersStore.setUserDetails(null);
        }
      },
      error: (error) => {
        console.error('Error loading user details:', error);
        this.usersStore.setUserDetails(null);
      }
    });
  }

  /**
   * Create a new user
   * Returns Observable for component to handle response
   */
  createUser(user: CreateUserModel): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}Users/Create`;
    return this.http.post<ResponseModel>(url, user);
  }

  /**
   * Update an existing user
   * Returns Observable for component to handle response
   */
  updateUser(id: number, user: UpdateUserModel): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}Users/Update/${id}`;
    return this.http.put<ResponseModel>(url, user);
  }

  /**
   * Delete a user by ID
   * Returns Observable for component to handle response
   */
  deleteUser(id: number): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}Users/Delete/${id}`;
    return this.http.delete<ResponseModel>(url);
  }

  /**
   * Update user password
   * Returns Observable for component to handle response
   */
  updatePassword(id: number, passwordData: UpdateUserPasswordModel): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}Users/UpdatePassword/${id}`;
    return this.http.post<ResponseModel>(url, passwordData);
  }

  /**
   * Upload user image
   * Returns Observable for component to handle response
   */
  uploadImage(id: number, imageFile: File): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}Users/UploadImage/${id}`;
    const formData = new FormData();
    formData.append('image', imageFile);
    return this.http.post<ResponseModel>(url, formData);
  }
}
