import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Constant } from 'src/app/core/constants/constant';

import * as CryptoJS from 'crypto-js';
@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(
        private constant: Constant,public http: HttpClient) { }

  //go to asp.net core web app (HR)
  goToHR(sessionModel: any): void{
    const body = encodeURIComponent(JSON.stringify(sessionModel));
    const HR_Web_URL = (this.constant.PAYROLL_HR_ENDPOINT+'Home/Navigator?data=' + body);
    window.location.href = HR_Web_URL;
    // Encrypt the sessionModel data
    /* const encryptedData = CryptoJS.AES.encrypt(JSON.stringify({
        CompanyID: sessionModel.CompanyID,
        RoleID: sessionModel.RoleID,
        UserID: sessionModel.UserID,
        accountId: sessionModel.accountId,
    }), 'Assemble').toString();

    const targetURL = `${this.constant.NEW_HR_WEB_ENDPOINT}?data=${encodeURIComponent(encryptedData)}`;
    window.location.href = targetURL; */
  }
  //go to asp.net core web app (HR)
  goToPipeLine(sessionModel: any): void {
    const body = encodeURIComponent(JSON.stringify(sessionModel));
    const PIPELINE_Web_URL = (this.constant.PIPELINE_WEB_ENDPOINT+'Home/Navigator?data=' + body);
    window.location.href = PIPELINE_Web_URL;
  }

  //go to asp.net core web app (Warehouses)
  goToWarehouse(sessionModel: any): void{

    const queryParams = new URLSearchParams({
      CompanyID: sessionModel.CompanyID.toString(),
      RoleID: sessionModel.RoleID.toString(),
      UserID: sessionModel.UserID.toString(),
      accountId: sessionModel.accountId.toString(),
      token:sessionModel.token.toString()
    });

    const targetURL = `${this.constant.WAREHOUSE_WEB_ENDPOINT}?${queryParams.toString()}`;
    window.location.href = targetURL;
  }

  goToFinance(sessionModel: any): void{
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify({
        CompanyID: sessionModel.CompanyID,
        RoleID: sessionModel.RoleID,
        UserID: sessionModel.UserID,
        accountId: sessionModel.accountId,
        token:sessionModel.token
    }), 'Assemble').toString();

    const targetURL = `${this.constant.NEWFINANCE_WEB_ENDPOINT}?data=${encodeURIComponent(encryptedData)}`;
    window.location.href = targetURL;
  }
  goToProjectManagement(sessionModel: any): void{
    
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify({
        CompanyID: sessionModel.CompanyID,
        RoleID: sessionModel.RoleID,
        UserID: sessionModel.UserID,
        accountId: sessionModel.accountId,
        UserName: sessionModel.UserName,
        token:sessionModel.token
    }), 'Assemble').toString();

    const targetURL = `${this.constant.PROJECTMANAGEMENT_WEB_ENDPOINT}?data=${encodeURIComponent(encryptedData)}`;
    window.location.href = targetURL;
  }
  goToNewHR(sessionModel: any): void{
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify({
        CompanyID: sessionModel.CompanyID,
        RoleID: sessionModel.RoleID,
        UserID: sessionModel.UserID,
        accountId: sessionModel.accountId,
        token:sessionModel.token
    }), 'Assemble').toString();

    const targetURL = `${this.constant.NEW_HR_WEB_ENDPOINT}?data=${encodeURIComponent(encryptedData)}`;
    window.location.href = targetURL;
  }
  goToSRM(sessionModel: any): void{
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify({
        CompanyID: sessionModel.CompanyID,
        RoleID: sessionModel.RoleID,
        UserID: sessionModel.UserID,
        accountId: sessionModel.accountId,
        token:sessionModel.token
    }), 'Assemble').toString();

    const targetURL = `${this.constant.SRM_WEB_ENDPOINT}?data=${encodeURIComponent(encryptedData)}`;
    window.location.href = targetURL;
  }

  //go to asp.net core web app (Activity)
  goToActivity(sessionModel: any): void{
    const body = encodeURIComponent(JSON.stringify(sessionModel));
    const HR_Web_URL = (this.constant.ACTIVITY_WEB_ENDPOINT +'Home/Navigator?data=' + body);
    window.location.href = HR_Web_URL;
  }
}
