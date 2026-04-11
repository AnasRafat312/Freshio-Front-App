import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Constant } from 'src/app/core/constants/constant';
import { YellowCardModel } from '../core/models/yellow-card.model';
import { ResponseModel } from 'src/app/shared/model/response';
import { YellowCardsStore } from '../store/yellow-cards.store';

@Injectable({
  providedIn: 'root'
})
export class YellowCardsService {

  constructor(
    private http: HttpClient,
    private constant: Constant,
    private yellowCardsStore: YellowCardsStore
  ) { }

  /**
   * Get all yellow cards from API and update store
   * Subscription is handled internally
   */
  getYellowCards(): void {
    const url = `${this.constant.API_ENDPOINT}YellowCards/GetAll`;
    this.http.get<ResponseModel>(url).subscribe({
      next: (res: ResponseModel) => {
        if (res?.Success) {
          this.yellowCardsStore.setYellowCards(res?.Data);
        }
      },
      error: (error) => {
        console.error('Error loading yellow cards:', error);
      }
    });
  }

  /**
   * Add new yellow card via API
   */
  addYellowCard(yellowCard: YellowCardModel): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}YellowCards/Create`;
    return this.http.post<ResponseModel>(url, yellowCard);
  }

  /**
   * Update existing yellow card via API
   */
  updateYellowCard(yellowCard: YellowCardModel): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}YellowCards/Update/${yellowCard?.Id}`;
    return this.http.put<ResponseModel>(url, yellowCard);
  }

  /**
   * Delete yellow card via API
   */
  deleteYellowCard(id: number): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}YellowCards/Delete/${id}`;
    return this.http.delete<ResponseModel>(url);
  }

  /**
   * Get yellow card by ID
   */
  getYellowCardById(id: number): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}YellowCards/GetById/${id}`;
    return this.http.get<ResponseModel>(url);
  }

  /**
   * Get yellow card details by ID from the API and store in signal
   * Automatically subscribes and updates the store
   * @param id - Yellow card ID
   */
  getYellowCardDetails(id: number): void {
    const url = `${this.constant.API_ENDPOINT}YellowCards/GetDetails/${id}`;
    this.http.get<ResponseModel>(url).subscribe({
      next: (res: ResponseModel) => {
        if (res?.Success) {
          this.yellowCardsStore.setYellowCardDetails(res?.Data);
        }
      },
      error: (error) => {
        console.error('Error loading yellow card details:', error);
        this.yellowCardsStore.clearYellowCardDetails();
      }
    });
  }
}
