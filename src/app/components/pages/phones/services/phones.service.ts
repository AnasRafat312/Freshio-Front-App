import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Constant } from 'src/app/core/constants/constant';
import { ResponseModel } from 'src/app/shared/model/response';
import { PhonesStore } from '../store/phones.store';

@Injectable({
  providedIn: 'root'
})
export class PhonesService {

  constructor(
    private http: HttpClient,
    private constant: Constant,
    private phonesStore: PhonesStore
  ) { }

  /**
   * Get all phones from API and update store
   * Subscription is handled internally
   */
  getPhones(): void {
    const url = `${this.constant.API_ENDPOINT}PhoneNumbers/GetAll`;
    this.http.get<ResponseModel>(url).subscribe({
      next: (res: ResponseModel) => {
        if (res?.Success) {
          this.phonesStore.setPhones(res?.Data);
        }
      },
      error: (error) => {
        console.error('Error loading phones:', error);
      }
    });
  }
}
