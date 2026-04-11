import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ILogin, IUserRole } from './login.model';
import { Observable } from 'rxjs';
import { Constant } from 'src/app/core/constants/constant';

@Injectable({
    providedIn: 'root',
})
export class LoginService {
    constructor(
        private constant: Constant,public http: HttpClient) {}
    login(model: any) {
        
        return this.http.post<any>(
            this.constant.API_ENDPOINT + 'Auth/Login',
            model
        );
    }

    getUserRoleInCompanyAndPrivilege(): Observable<any[]> {
        let model = {
            CompanyID: localStorage.getItem('companyId'),
            UserID: localStorage.getItem('userId'),
            ModuleID: 10,
        };
        return this.http.post<any[]>(
            this.constant.API_ENDPOINT + 'UserRole/GetUserRoleInCompany',
            model
        );
    }
    sendForgetPasswordEmail(email): Observable<any> {
        return this.http.post<any>(
            this.constant.API_ENDPOINT + 'AssembleUser/ForgetPassword',
            email
        );
    }
    CreateRegistration(model): Observable<any> {
        return this.http.post<any>(
            this.constant.API_ENDPOINT + 'Account/Register',
            model
        );
    }
    getAllModules(): Observable<any[]> {
        return this.http.get<any[]>(
            this.constant.API_ENDPOINT +
                `ModuleConfigration/GetModuleConfigrationsNotDeletedActive`
        );
    }
    getAllIndustries(): Observable<any[]> {
        return this.http.get<any[]>(
            this.constant.API_ENDPOINT + `Industry/GetIndustriesLookup`
        );
    }
    getAllcountries() {
        //return this.http.get<any[]>('https://restcountries.com/v3.1/all')
        return this.http.get<any[]>(
            this.constant.API_ENDPOINT +
                'Country/GetCountrysNotDeletedForAll'
        );
    }
}
