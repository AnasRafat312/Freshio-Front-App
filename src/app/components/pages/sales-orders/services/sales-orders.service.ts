import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Constant } from 'src/app/core/constants/constant';
import { ResponseModel } from 'src/app/shared/model/response';
import { SalesOrdersStore } from '../store/sales-orders.store';
import { 
  CreateSalesOrderDto, 
  PartialApproveOrderDto, 
  RejectOrderDto 
} from 'src/app/shared/model/freshio/sales-order.model';

@Injectable({
  providedIn: 'root'
})
export class SalesOrdersService {
  constructor(
    private http: HttpClient,
    private constant: Constant,
    private salesOrdersStore: SalesOrdersStore
  ) { }

  /**
   * Get all sales orders from the API and store in signal
   */
  getSalesOrders(): void {
    const url = `${this.constant.API_ENDPOINT}SalesOrder/GetAllSalesOrders`;
    this.http.get<ResponseModel>(url).subscribe({
      next: (res: ResponseModel) => {
        if (res?.Success) {
          this.salesOrdersStore.setSalesOrders(res?.Data);
        }
      },
      error: (error) => {
        console.error('Error loading sales orders:', error);
        this.salesOrdersStore.clearSalesOrders();
      }
    });
  }

  /**
   * Get sales order details by ID
   * @param id - Sales Order ID
   */
  getSalesOrderDetails(id: number): void {
    const url = `${this.constant.API_ENDPOINT}SalesOrder/GetSalesOrderById/${id}`;
    this.http.get<ResponseModel>(url).subscribe({
      next: (res: ResponseModel) => {
        if (res?.Success) {
          this.salesOrdersStore.setSalesOrderDetails(res?.Data);
        }
      },
      error: (error) => {
        console.error('Error loading sales order details:', error);
        this.salesOrdersStore.clearSalesOrderDetails();
      }
    });
  }

  /**
   * Create new sales order
   * @param order - Sales order data
   */
  createSalesOrder(order: CreateSalesOrderDto): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}SalesOrder/CreateSalesOrder`;
    return this.http.post<ResponseModel>(url, order);
  }

  /**
   * Update existing sales order
   * @param id - Sales Order ID
   * @param order - Updated sales order data
   */
  updateSalesOrder(id: number, order: CreateSalesOrderDto): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}SalesOrder/UpdateSalesOrder/${id}`;
    return this.http.put<ResponseModel>(url, order);
  }

  /**
   * Approve sales order (full approval)
   * @param id - Sales Order ID
   */
  approveSalesOrder(id: number): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}SalesOrder/ApproveSalesOrder/${id}`;
    return this.http.post<ResponseModel>(url, {});
  }

  /**
   * Partial approve sales order
   * @param id - Sales Order ID
   * @param data - Partial approval data
   */
  partialApproveSalesOrder(id: number, data: PartialApproveOrderDto): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}SalesOrder/PartiallyApproveSalesOrder/${id}`;
    return this.http.post<ResponseModel>(url, data);
  }

  /**
   * Reject sales order
   * @param id - Sales Order ID
   * @param data - Rejection data
   */
  rejectSalesOrder(id: number, data: RejectOrderDto): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}SalesOrder/RejectSalesOrder/${id}`;
    return this.http.post<ResponseModel>(url, data);
  }

  /**
   * Get order shortages
   * @param id - Sales Order ID
   */
  getOrderShortages(id: number): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}SalesOrder/GetOrderShortages/${id}`;
    return this.http.get<ResponseModel>(url);
  }

  /**
   * Get available orders for delivery (Approved/PartiallyApproved and not delivered)
   */
  getAvailableOrdersForDelivery(): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}SalesOrder/GetPendingSalesOrders`;
    return this.http.get<ResponseModel>(url);
  }
}
