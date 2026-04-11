import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Constant } from 'src/app/core/constants/constant';
import { ResponseModel } from 'src/app/shared/model/response';
import { BankAccountsStore } from '../store/bank-accounts.store';

@Injectable({
  providedIn: 'root'
})
export class BankAccountsService {

  constructor(
    private http: HttpClient,
    private constant: Constant,
    private bankAccountsStore: BankAccountsStore
  ) { }

  /**
   * Get all bank accounts from API and update store
   * Subscription is handled internally
   */
  getBankAccounts(): void {
    const url = `${this.constant.API_ENDPOINT}BankAccounts/GetAll`;
    this.http.get<ResponseModel>(url).subscribe({
      next: (res: ResponseModel) => {
        if (res?.Success) {
          this.bankAccountsStore.setBankAccounts(res?.Data);
        }
      },
      error: (error) => {
        console.error('Error loading bank accounts:', error);
      }
    });
  }

  /**
   * Get bank account details by ID and update store
   * Subscription is handled internally
   */
  getBankAccountDetails(id: number): void {
    const url = `${this.constant.API_ENDPOINT}BankAccounts/GetDetails/${id}`;
    this.http.get<ResponseModel>(url).subscribe({
      next: (res: ResponseModel) => {
        if (res?.Success) {
          this.bankAccountsStore.setBankAccountDetails(res?.Data);
        } else {
          this.bankAccountsStore.setBankAccountDetails(null);
        }
      },
      error: (error) => {
        console.error('Error loading bank account details:', error);
        this.bankAccountsStore.setBankAccountDetails(null);
      }
    });
  }
}
