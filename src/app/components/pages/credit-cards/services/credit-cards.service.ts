import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Constant } from 'src/app/core/constants/constant';
import { CreditCardModel } from '../core/models/credit-card.model';
import { ResponseModel } from 'src/app/shared/model/response';
import { CreditCardsStore } from '../store/credit-cards.store';

@Injectable({
  providedIn: 'root'
})
export class CreditCardsService {

  constructor(
    private http: HttpClient,
    private constant: Constant,
    private creditCardsStore: CreditCardsStore
  ) { }

  /**
   * Get all credit cards from API and update store
   * Subscription is handled internally
   */
  getCreditCards(): void {
    const url = `${this.constant.API_ENDPOINT}CreditCards/GetAll`;
    this.http.get<ResponseModel>(url).subscribe({
      next: (res: ResponseModel) => {
        if (res?.Success) {
          this.creditCardsStore.setCreditCards(res?.Data);
        }
      },
      error: (error) => {
        console.error('Error loading credit cards:', error);
      }
    });
  }

  /**
   * Add new credit card via API
   */
  addCreditCard(creditCard: CreditCardModel): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}CreditCards/Create`;
    return this.http.post<ResponseModel>(url, creditCard);
  }

  /**
   * Update existing credit card via API
   */
  updateCreditCard(creditCard: CreditCardModel): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}CreditCards/Update/${creditCard?.Id}`;
    return this.http.put<ResponseModel>(url, creditCard);
  }

  /**
   * Delete credit card via API
   */
  deleteCreditCard(id: number): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}CreditCards/Delete/${id}`;
    return this.http.delete<ResponseModel>(url);
  }

  /**
   * Get credit card by ID
   */
  getCreditCardById(id: number): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}CreditCards/GetById/${id}`;
    return this.http.get<ResponseModel>(url);
  }

  /**
   * Get credit card details by ID from the API and store in signal
   * Automatically subscribes and updates the store
   * @param id - Credit card ID
   */
  getCreditCardDetails(id: number): void {
    const url = `${this.constant.API_ENDPOINT}CreditCards/GetDetails/${id}`;
    this.http.get<ResponseModel>(url).subscribe({
      next: (res: ResponseModel) => {
        if (res?.Success) {
          this.creditCardsStore.setCreditCardDetails(res?.Data);
        }
      },
      error: (error) => {
        console.error('Error loading credit card details:', error);
        this.creditCardsStore.clearCreditCardDetails();
      }
    });
  }
}
