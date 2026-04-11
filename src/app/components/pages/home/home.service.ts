import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Constant } from 'src/app/core/constants/constant';
import { Observable } from 'rxjs';
import { ResponseModel } from 'src/app/shared/model/response';
import { BalanceSummaryModel } from './models/balance-summary.model';

import * as CryptoJS from 'crypto-js';
@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(
        private constant: Constant,public http: HttpClient) { }

  /**
   * Get balance summary for all account types
   */
  getBalances(): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}Summary/GetBalances`;
    return this.http.get<ResponseModel>(url);
  }
}
