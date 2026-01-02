import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Constant } from 'src/app/core/constants/constant';
import { PageInfo } from '../core/page-info';

@Injectable({
  providedIn: 'root'
})
export class PageInfoService {

  constructor(
        private constant: Constant,private http : HttpClient) { }


getGuide(name:string) : Observable<PageInfo>{
  return this.http.get<PageInfo>(this.constant.BASIC_DATA_API_ENDPOINT+ "PageInfo/GetPageInfoByName/"+name)
}
getNewGuide(name:string) : Observable<any>{
  return this.http.get<any>(this.constant.BASIC_DATA_API_ENDPOINT+ "PageInfo/GetPageInfoByNameNew/"+name)
}
GetAllKeyWords() : Observable<any>{
  return this.http.get<any>(this.constant.BASIC_DATA_API_ENDPOINT+ "KeyWords/GetKeyWords")
}
GetpageByIdentitifer(name:string) : Observable<any>{
  return this.http.get<any>(this.constant.BASIC_DATA_API_ENDPOINT+ "PageInfo/GetPageInfoByIdentifier/"+name)
}
GetAllPages():Observable<any>{
  return this.http.get<any>(this.constant.BASIC_DATA_API_ENDPOINT+ "PageInfo/GetAllPagesWithSteps")
}
}
