import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResponseModel } from '../../model/response';

@Injectable({
  providedIn: 'root'
})
export class DeleteService {
  constructor(public http: HttpClient) { }
  deleteFun(url:any,id?:any,data?:any): Observable<ResponseModel>{
    if(data) {
      return this.http.post<ResponseModel>(url,data)
    }else {
      return this.http.delete<ResponseModel>(url+ '/' + id,{})
    }
  }
}
