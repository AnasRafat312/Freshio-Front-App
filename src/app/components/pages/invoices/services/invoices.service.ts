import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Constant } from 'src/app/core/constants/constant';
import { ResponseModel } from 'src/app/shared/model/response';

@Injectable({
  providedIn: 'root'
})
export class InvoicesService {
  constructor(
    private http: HttpClient,
    private constant: Constant
  ) { }

  /**
   * Get invoice data for a sales order
   * @param orderId - Sales Order ID
   */
  getInvoice(orderId: number): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}Invoices/GetByOrder/${orderId}`;
    return this.http.get<ResponseModel>(url);
  }

  /**
   * Download invoice as PDF
   * @param orderId - Sales Order ID
   */
  downloadInvoicePdf(orderId: number): Observable<Blob> {
    const url = `${this.constant.API_ENDPOINT}Invoices/${orderId}/DownloadPdf`;
    return this.http.get(url, { responseType: 'blob' });
  }

  /**
   * Download invoice as Image
   * @param orderId - Sales Order ID
   */
  downloadInvoiceImage(orderId: number): Observable<Blob> {
    const url = `${this.constant.API_ENDPOINT}Invoices/${orderId}/DownloadImage`;
    return this.http.get(url, { responseType: 'blob' });
  }

  /**
   * Send invoice via WhatsApp
   * @param orderId - Sales Order ID
   */
  sendInvoiceWhatsApp(orderId: number): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}Invoices/${orderId}/SendWhatsApp`;
    return this.http.post<ResponseModel>(url, {});
  }
}
