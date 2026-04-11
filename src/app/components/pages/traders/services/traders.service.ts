import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Constant } from 'src/app/core/constants/constant';
import { ResponseModel } from 'src/app/shared/model/response';
import { TradersStore } from '../store/traders.store';

@Injectable({
  providedIn: 'root'
})
export class TradersService {

  constructor(
    private http: HttpClient,
    private constant: Constant,
    private tradersStore: TradersStore
  ) { }

  /**
   * Get all traders from API and update store
   * Subscription is handled internally
   */
  getTraders(): void {
    const url = `${this.constant.API_ENDPOINT}Traders/GetAll`;
    this.http.get<ResponseModel>(url).subscribe({
      next: (res: ResponseModel) => {
        if (res?.Success) {
          this.tradersStore.setTraders(res?.Data);
        }
      },
      error: (error) => {
        console.error('Error loading traders:', error);
      }
    });
  }

  /**
   * Get trader details by ID from the API and store in signal
   * Automatically subscribes and updates the store
   * @param id - Trader ID
   */
  getTraderDetails(id: number): void {
    const url = `${this.constant.API_ENDPOINT}Traders/GetDetails/${id}`;
    this.http.get<ResponseModel>(url).subscribe({
      next: (res: ResponseModel) => {
        if (res?.Success) {
          this.tradersStore.setTraderDetails(res?.Data);
        }
      },
      error: (error) => {
        console.error('Error loading trader details:', error);
        this.tradersStore.clearTraderDetails();
      }
    });
  }
}
