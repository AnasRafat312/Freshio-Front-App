import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Constant } from 'src/app/core/constants/constant';
import { ResponseModel } from 'src/app/shared/model/response';
import { WasteStore } from '../store/waste.store';
import { CreateWasteDto } from 'src/app/shared/model/freshio/waste.model';

@Injectable({
  providedIn: 'root'
})
export class WasteService {
  constructor(
    private http: HttpClient,
    private constant: Constant,
    private wasteStore: WasteStore
  ) { }

  /**
   * Get all waste records from the API and store in signal
   */
  getWasteRecords(): void {
    // Try alternative endpoint - backend might use 'Waste' instead of 'WasteOrder'
    const url = `${this.constant.API_ENDPOINT}WasteOrder/GetAllWasteOrders`;
    this.http.get<ResponseModel>(url).subscribe({
      next: (res: ResponseModel) => {
        if (res?.Success) {
          this.wasteStore.setWasteRecords(res?.Data || []);
        } else {
          this.wasteStore.setWasteRecords([]);
        }
      },
      error: (error) => {
        // Set empty array to prevent crash
        this.wasteStore.setWasteRecords([]);
      }
    });
  }

  /**
   * Get waste record details by ID
   * @param id - Waste Record ID
   */
  getWasteDetails(id: number): void {
    const url = `${this.constant.API_ENDPOINT}WasteOrder/GetWasteOrderById/${id}`;
    this.http.get<ResponseModel>(url).subscribe({
      next: (res: ResponseModel) => {
        if (res?.Success) {
          this.wasteStore.setWasteDetails(res?.Data);
        }
      },
      error: (error) => {
        this.wasteStore.clearWasteDetails();
      }
    });
  }

  /**
   * Create new waste record
   * @param waste - Waste data
   */
  createWaste(waste: CreateWasteDto): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}WasteOrder/CreateWasteOrder`;
    return this.http.post<ResponseModel>(url, waste);
  }

  /**
   * Delete waste record
   * @param id - Waste Record ID
   */
  deleteWaste(id: number): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}WasteOrder/DeleteWasteOrder/${id}`;
    return this.http.delete<ResponseModel>(url);
  }
}
