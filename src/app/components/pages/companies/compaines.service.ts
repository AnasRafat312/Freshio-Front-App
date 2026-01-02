import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Constant } from 'src/app/core/constants/constant';

import { Company } from './compaines.model';

@Injectable({
  providedIn: 'root'
})
export class CompainesService {
  compantSubject = new Subject();
  constructor(
        private constant: Constant,public http: HttpClient) { }

  getAllCompaines() :Observable<Company[]> {
    return this.http.get<Company[]>(this.constant.GETWAY_API_ENDPOINT + 'Company/GetCompanyByAccountId/'+ localStorage.getItem('accountId'))
  }

  addCompany(company:any){
    return this.http.post<Company>(this.constant.GETWAY_API_ENDPOINT  + 'Company/CreateCompany',company)
  }

  updateCompany(form:any){
    return this.http.put<Company>(this.constant.GETWAY_API_ENDPOINT  + 'Company/UpdateCompany',form)
  }

  getCompanyById(id){
    return this.http.get<Company>(this.constant.GETWAY_API_ENDPOINT  + 'Company/GetCompany/' + id)
  }
}
