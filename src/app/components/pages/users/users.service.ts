import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from './users.model';
import { Observable, Subject } from 'rxjs';
import { Constant } from 'src/app/core/constants/constant';
import { ResponseModel } from 'src/app/shared/model/response';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  userSubject = new Subject();
  constructor(
        private constant: Constant,public http: HttpClient) { }

  getAllusers() :Observable<User[]>{
    return  this.http.get<User[]>(this.constant.GETWAY_API_ENDPOINT + 'AssembleUser/GetAccountUsers/'+ localStorage.getItem('accountId'))
  }
  getUsersCompany(token:string) :Observable<User[]>{
    return  this.http.get<User[]>(this.constant.GETWAY_API_ENDPOINT + 'AssembleUser/GetCompanyUsers/'+ token)
  }

  checkEmailExists(email: string): Observable<boolean> {
    const requestBody = { Email: email };
    return this.http.post<boolean>(this.constant.GETWAY_API_ENDPOINT +'AssembleUser/CheckUserEmailExists',  requestBody );
  }
}
