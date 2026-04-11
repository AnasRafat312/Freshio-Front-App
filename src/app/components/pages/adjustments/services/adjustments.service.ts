import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Constant } from 'src/app/core/constants/constant';
import { AdjustmentModel } from '../core/models/adjustment.model';
import { ResponseModel } from 'src/app/shared/model/response';
import { AdjustmentsStore } from '../store/adjustments.store';

@Injectable({
  providedIn: 'root'
})
export class AdjustmentsService {

  constructor(
    private http: HttpClient,
    private constant: Constant,
    private adjustmentsStore: AdjustmentsStore
  ) { }

  /**
   * Get all adjustments from the API and store in AdjustmentsStore
   * @returns Observable<ResponseModel>
   */
  getAdjustments(): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}Adjustments/GetAll`;
    return this.http.get<ResponseModel>(url).pipe(
      tap((res: ResponseModel) => {
        if (res?.Success && res?.Data) {
          this.adjustmentsStore.setAdjustments(res.Data);
        }
      })
    );
  }

  /**
   * Add adjustment - calls API and updates store
   */
  addAdjustment(adjustment: any): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}Adjustments/Add`;
    return this.http.post<ResponseModel>(url, adjustment).pipe(
      tap((res: ResponseModel) => {
        if (res?.Success && res?.Data) {
          this.adjustmentsStore.addAdjustment(res.Data);
        }
      })
    );
  }

  /**
   * Update adjustment - calls API and updates store
   */
  updateAdjustment(id: number, adjustment: any): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}Adjustments/Update/${id}`;
    return this.http.put<ResponseModel>(url, adjustment).pipe(
      tap((res: ResponseModel) => {
        if (res?.Success && res?.Data) {
          this.adjustmentsStore.updateAdjustment(res.Data);
        }
      })
    );
  }

  /**
   * Delete adjustment - calls API and updates store
   */
  removeAdjustment(id: number): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}Adjustments/Delete/${id}`;
    return this.http.delete<ResponseModel>(url).pipe(
      tap((res: ResponseModel) => {
        if (res?.Success) {
          this.adjustmentsStore.removeAdjustment(id);
        }
      })
    );
  }

  /**
   * Get adjustment by ID - calls API
   */
  getAdjustmentById(id: number): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}Adjustments/GetById/${id}`;
    return this.http.get<ResponseModel>(url);
  }

  /**
   * Clear adjustments from store
   */
  clearAdjustments(): void {
    this.adjustmentsStore.clearAdjustments();
  }
}
