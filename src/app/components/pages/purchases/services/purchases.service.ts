import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Constant } from 'src/app/core/constants/constant';
import { ResponseModel } from 'src/app/shared/model/response';
import { PurchasesStore } from '../store/purchases.store';
import { CreatePurchaseDto } from 'src/app/shared/model/freshio/purchase.model';

@Injectable({
  providedIn: 'root'
})
export class PurchasesService {
  constructor(
    private http: HttpClient,
    private constant: Constant,
    private purchasesStore: PurchasesStore
  ) { }

  /**
   * Get all purchases from the API and store in signal
   */
  getPurchases(): void {
    const url = `${this.constant.API_ENDPOINT}PurchaseOrder/GetAllPurchaseOrders`;
    this.http.get<ResponseModel>(url).subscribe({
      next: (res: ResponseModel) => {
        if (res?.Success) {
          this.purchasesStore.setPurchases(res?.Data);
        }
      },
      error: (error) => {
        console.error('Error loading purchases:', error);
        this.purchasesStore.clearPurchases();
      }
    });
  }

  /**
   * Get purchase details by ID
   * @param id - Purchase ID
   */
  getPurchaseDetails(id: number): void {
    const url = `${this.constant.API_ENDPOINT}PurchaseOrder/GetPurchaseOrderById/${id}`;
    this.http.get<ResponseModel>(url).subscribe({
      next: (res: ResponseModel) => {
        if (res?.Success) {
          this.purchasesStore.setPurchaseDetails(res?.Data);
        }
      },
      error: (error) => {
        console.error('Error loading purchase details:', error);
        this.purchasesStore.clearPurchaseDetails();
      }
    });
  }

  /**
   * Create new purchase
   * @param purchase - Purchase data
   */
  createPurchase(purchase: CreatePurchaseDto): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}PurchaseOrder/CreatePurchaseOrder`;
    return this.http.post<ResponseModel>(url, purchase);
  }

  /**
   * Update existing purchase
   * @param id - Purchase ID
   * @param purchase - Updated purchase data
   */
  updatePurchase(id: number, purchase: CreatePurchaseDto): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}PurchaseOrder/UpdatePurchaseOrder/${id}`;
    return this.http.put<ResponseModel>(url, purchase);
  }

  /**
   * Delete purchase
   * @param id - Purchase ID
   */
  deletePurchase(id: number): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}PurchaseOrder/DeletePurchaseOrder/${id}`;
    return this.http.delete<ResponseModel>(url);
  }
}
