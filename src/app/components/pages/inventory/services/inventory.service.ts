import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Constant } from 'src/app/core/constants/constant';
import { ResponseModel } from 'src/app/shared/model/response';
import { InventoryStore } from '../store/inventory.store';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  constructor(
    private http: HttpClient,
    private constant: Constant,
    private inventoryStore: InventoryStore
  ) { }

  /**
   * Get all inventory items from the API and store in signal
   * Uses Items stock summary endpoint per API guide
   */
  getInventory(): void {
    const url = `${this.constant.API_ENDPOINT}Items/GetAllItemsStockSummary`;
    this.http.get<ResponseModel>(url).subscribe({
      next: (res: ResponseModel) => {
        if (res?.Success) {
          this.inventoryStore.setInventory(res?.Data);
        }
      },
      error: (error) => {
        console.error('Error loading inventory:', error);
        this.inventoryStore.clearInventory();
      }
    });
  }

  /**
   * Get low stock items
   * Note: Backend should filter or frontend filters after loading all items
   */
  getLowStockItems(): void {
    const url = `${this.constant.API_ENDPOINT}Items/GetAllItemsStockSummary`;
    this.http.get<ResponseModel>(url).subscribe({
      next: (res: ResponseModel) => {
        if (res?.Success) {
          this.inventoryStore.setInventory(res?.Data);
        }
      },
      error: (error) => {
        console.error('Error loading low stock items:', error);
      }
    });
  }

  /**
   * Export inventory to Excel
   * Note: Backend endpoint may need to be added
   */
  exportToExcel(): Observable<Blob> {
    const url = `${this.constant.API_ENDPOINT}Reports/GetInventoryReport`;
    return this.http.get(url, { responseType: 'blob' });
  }
}
