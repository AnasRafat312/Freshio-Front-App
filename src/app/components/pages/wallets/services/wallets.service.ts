import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Constant } from 'src/app/core/constants/constant';
import { WalletModel } from '../core/models/wallet.model';
import { ResponseModel } from 'src/app/shared/model/response';
import { WalletsStore } from '../store/wallets.store';

@Injectable({
  providedIn: 'root'
})
export class WalletsService {
  constructor(
    private http: HttpClient,
    private constant: Constant,
    private WalletsStore: WalletsStore,

  ) { }

  /**
   * Get all electronic wallets from the API and store in signal
   * Automatically subscribes and updates the store
   */
  getElectronicWallets(): void {
    const url = `${this.constant.API_ENDPOINT}ElectronicWallets/GetAll`;
    this.http.get<ResponseModel>(url).subscribe({
      next: (res: ResponseModel) => {
        if (res?.Success) {
          this.WalletsStore.setWallets(res?.Data);
        }
      },
      error: (error) => {
        console.error('Error loading wallets:', error);
      }
    });
  }

  /**
   * Get wallet details by ID from the API and store in signal
   * Automatically subscribes and updates the store
   * @param id - Wallet ID
   */
  getWalletDetails(id: number): void {
    const url = `${this.constant.API_ENDPOINT}ElectronicWallets/GetDetails/${id}`;
    this.http.get<ResponseModel>(url).subscribe({
      next: (res: ResponseModel) => {
        if (res?.Success) {
          this.WalletsStore.setWalletDetails(res?.Data);
        }
      },
      error: (error) => {
        console.error('Error loading wallet details:', error);
        this.WalletsStore.clearWalletDetails();
      }
    });
  }

}
