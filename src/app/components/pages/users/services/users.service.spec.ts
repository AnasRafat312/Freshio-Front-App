import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UsersService } from './users.service';
import { UsersStore } from '../store/users.store';
import { Constant } from 'src/app/core/constants/constant';

describe('UsersService', () => {
  let service: UsersService;
  let httpMock: HttpTestingController;
  let store: UsersStore;
  let constant: Constant;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UsersService, UsersStore, Constant]
    });
    service = TestBed.inject(UsersService);
    httpMock = TestBed.inject(HttpTestingController);
    store = TestBed.inject(UsersStore);
    constant = TestBed.inject(Constant);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all users and update store', () => {
    const mockUsers = [
      { 
        ID: 1, Username: 'user1', Email: 'user1@test.com', RoleName: 'Admin', 
        IsActive: true, CompanyId: 1, IsDeleted: false, CreatedBy: 1, 
        CreatedDateTime: new Date() 
      },
      { 
        ID: 2, Username: 'user2', Email: 'user2@test.com', RoleName: 'User', 
        IsActive: true, CompanyId: 1, IsDeleted: false, CreatedBy: 1, 
        CreatedDateTime: new Date() 
      }
    ];
    const mockResponse = { 
      Success: true, 
      Data: mockUsers, 
      Message: 'Success', 
      Errors: [] 
    };

    service.getUsers();

    const req = httpMock.expectOne(`${constant.API_ENDPOINT}Users/GetAll`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    expect(store.getUsersValue()).toEqual(mockUsers);
  });

  it('should get user details and update store', () => {
    const mockUser = { 
      ID: 1, Username: 'user1', Email: 'user1@test.com', RoleName: 'Admin', 
      RoleId: 1, IsActive: true, IsDeleted: false, CreatedBy: 1, 
      CreatedDateTime: new Date() 
    };
    const mockResponse = { 
      Success: true, 
      Data: mockUser, 
      Message: 'Success', 
      Errors: [] 
    };

    service.getUserDetails(1);

    const req = httpMock.expectOne(`${constant.API_ENDPOINT}Users/GetById/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    expect(store.getUserDetailsValue()).toEqual(mockUser);
  });

  it('should create a user', () => {
    const newUser = {
      Username: 'newuser',
      Password: 'password123',
      PasswordConfirmation: 'password123',
      Email: 'newuser@test.com',
      RoleId: 1
    };
    const mockResponse = { 
      Success: true, 
      Data: { ID: 3, ...newUser }, 
      Message: 'User created successfully', 
      Errors: [] 
    };

    service.createUser(newUser).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${constant.API_ENDPOINT}Users/Create`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newUser);
    req.flush(mockResponse);
  });

  it('should update a user', () => {
    const updateData = {
      Username: 'updateduser',
      Email: 'updated@test.com',
      RoleId: 1,
      IsActive: true
    };
    const mockResponse = { 
      Success: true, 
      Data: { ID: 1, ...updateData }, 
      Message: 'User updated successfully', 
      Errors: [] 
    };

    service.updateUser(1, updateData).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${constant.API_ENDPOINT}Users/Update/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateData);
    req.flush(mockResponse);
  });

  it('should delete a user', () => {
    const mockResponse = { 
      Success: true, 
      Data: 'Deleted', 
      Message: 'User deleted successfully', 
      Errors: [] 
    };

    service.deleteUser(1).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${constant.API_ENDPOINT}Users/Delete/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });

  it('should update user password', () => {
    const passwordData = {
      CurrentPassword: 'oldpass',
      NewPassword: 'newpass',
      PasswordConfirmation: 'newpass'
    };
    const mockResponse = { 
      Success: true, 
      Data: 'Updated', 
      Message: 'Password updated successfully', 
      Errors: [] 
    };

    service.updatePassword(1, passwordData).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${constant.API_ENDPOINT}Users/UpdatePassword/1`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(passwordData);
    req.flush(mockResponse);
  });

  it('should upload user image', () => {
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const mockResponse = { 
      Success: true, 
      Data: '/images/user1.jpg', 
      Message: 'Image uploaded successfully', 
      Errors: [] 
    };

    service.uploadImage(1, mockFile).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${constant.API_ENDPOINT}Users/UploadImage/1`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTruthy();
    req.flush(mockResponse);
  });
});
