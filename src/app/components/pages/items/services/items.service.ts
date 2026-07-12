import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Constant } from 'src/app/core/constants/constant';
import { ResponseModel } from 'src/app/shared/model/response';
import { ItemsStore } from '../store/items.store';
import { ItemDto, ItemModel } from 'src/app/shared/model/freshio/item.model';

@Injectable({
  providedIn: 'root'
})
export class ItemsService {
  constructor(
    private http: HttpClient,
    private constant: Constant,
    private itemsStore: ItemsStore
  ) { }

  /**
   * Get all items from the API and store in signal
   */
  getItems(): void {
    
    const url = `${this.constant.API_ENDPOINT}Items/GetAllItems`;
    this.http.get<ResponseModel>(url).subscribe({
      next: (res: ResponseModel) => {
        if (res?.Success) {
          this.itemsStore.setItems(res?.Data);
        }
      },
      error: (error) => {
        console.error('Error loading items:', error);
        this.itemsStore.clearItems();
      }
    });
  }

  /**
   * Get item details by ID
   * @param id - Item ID
   */
  getItemDetails(id: number): void {
    const url = `${this.constant.API_ENDPOINT}Items/GetItem/${id}`;
    this.http.get<ResponseModel>(url).subscribe({
      next: (res: ResponseModel) => {
        if (res?.Success) {
          this.itemsStore.setItemDetails(res?.Data);
        }
      },
      error: (error) => {
        console.error('Error loading item details:', error);
        this.itemsStore.clearItemDetails();
      }
    });
  }

  /**
   * Create new item
   * @param item - Item data
   */
  createItem(item: ItemDto): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}Items/CreateItem`;
    return this.http.post<ResponseModel>(url, item);
  }

  /**
   * Update existing item
   * @param id - Item ID
   * @param item - Updated item data
   */
  updateItem(id: number, item: ItemDto): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}Items/UpdateItem/${id}`;
    return this.http.put<ResponseModel>(url, item);
  }

  /**
   * Disable item
   * @param id - Item ID
   */
  disableItem(id: number): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}Items/DeleteItem/${id}`;
    return this.http.put<ResponseModel>(url, {});
  }

  /**
   * Enable item
   * @param id - Item ID
   */
  enableItem(id: number): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}Items/DeleteItem/${id}`;
    return this.http.put<ResponseModel>(url, {});
  }
}
