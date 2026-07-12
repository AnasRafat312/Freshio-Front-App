import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Constant } from 'src/app/core/constants/constant';
import { ResponseModel } from 'src/app/shared/model/response';
import { ReportsStore } from '../store/reports.store';
import { StockShortageReportFilterDto } from 'src/app/shared/model/freshio/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  constructor(
    private http: HttpClient,
    private constant: Constant,
    private reportsStore: ReportsStore
  ) { }

  /**
   * Get stock shortages report
   * @param filter - Report filter
   */
  getStockShortagesReport(filter?: StockShortageReportFilterDto): void {
    let params = new HttpParams();
    if (filter?.FromDate) {
      params = params.set('fromDate', filter.FromDate.toISOString());
    }
    if (filter?.ToDate) {
      params = params.set('toDate', filter.ToDate.toISOString());
    }
    if (filter?.CustomerEntityId) {
      params = params.set('customerEntityId', filter.CustomerEntityId.toString());
    }
    if (filter?.ItemId) {
      params = params.set('itemId', filter.ItemId.toString());
    }

    const url = `${this.constant.API_ENDPOINT}Reports/GetStockShortageReport`;
    this.http.get<ResponseModel>(url, { params }).subscribe({
      next: (res: ResponseModel) => {
        if (res?.Success) {
          this.reportsStore.setStockShortagesReport(res?.Data);
        }
      },
      error: (error) => {
        console.error('Error loading stock shortages report:', error);
        this.reportsStore.clearStockShortagesReport();
      }
    });
  }

  /**
   * Get dashboard statistics
   */
  getDashboardStats(): void {
    const url = `${this.constant.API_ENDPOINT}Reports/DashboardStats`;
    this.http.get<ResponseModel>(url).subscribe({
      next: (res: ResponseModel) => {
        if (res?.Success) {
          this.reportsStore.setDashboardStats(res?.Data);
        }
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
      }
    });
  }

  /**
   * Get top selling items
   * @param limit - Number of items to return
   */
  getTopSellingItems(limit: number = 10): void {
    const url = `${this.constant.API_ENDPOINT}Reports/TopSellingItems?limit=${limit}`;
    this.http.get<ResponseModel>(url).subscribe({
      next: (res: ResponseModel) => {
        if (res?.Success) {
          this.reportsStore.setTopSellingItems(res?.Data);
        }
      },
      error: (error) => {
        console.error('Error loading top selling items:', error);
      }
    });
  }

  /**
   * Get latest orders
   * @param limit - Number of orders to return
   */
  getLatestOrders(limit: number = 10): void {
    const url = `${this.constant.API_ENDPOINT}Reports/LatestOrders?limit=${limit}`;
    this.http.get<ResponseModel>(url).subscribe({
      next: (res: ResponseModel) => {
        if (res?.Success) {
          this.reportsStore.setLatestOrders(res?.Data);
        }
      },
      error: (error) => {
        console.error('Error loading latest orders:', error);
      }
    });
  }

  /**
   * Export stock shortages report to Excel
   */
  exportStockShortagesExcel(filter?: StockShortageReportFilterDto): Observable<Blob> {
    let params = new HttpParams();
    if (filter?.FromDate) {
      params = params.set('fromDate', filter.FromDate.toISOString());
    }
    if (filter?.ToDate) {
      params = params.set('toDate', filter.ToDate.toISOString());
    }
    if (filter?.CustomerEntityId) {
      params = params.set('customerEntityId', filter.CustomerEntityId.toString());
    }
    if (filter?.ItemId) {
      params = params.set('itemId', filter.ItemId.toString());
    }

    const url = `${this.constant.API_ENDPOINT}Reports/StockShortages/ExportExcel`;
    return this.http.get(url, { params, responseType: 'blob' });
  }
}
