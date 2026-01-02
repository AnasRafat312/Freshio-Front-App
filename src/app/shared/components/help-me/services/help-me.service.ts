import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Constant } from 'src/app/core/constants/constant';

@Injectable({
  providedIn: 'root'
})
export class HelpMeService {
    constructor(
        private constant: Constant,private http: HttpClient) { }
    sendHelp(routeParameters: any): Observable<any> {
      return this.http.post<any>(this.constant.BASIC_DATA_API_ENDPOINT+`Inquiry/CreateInquery`, routeParameters);
    }
}
