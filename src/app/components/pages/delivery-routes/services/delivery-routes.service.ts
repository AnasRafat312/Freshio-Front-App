import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Constant } from 'src/app/core/constants/constant';
import { ResponseModel } from 'src/app/shared/model/response';
import { DeliveryRoutesStore } from '../store/delivery-routes.store';
import { CreateDeliveryRouteDto } from 'src/app/shared/model/freshio/delivery-route.model';

@Injectable({
  providedIn: 'root'
})
export class DeliveryRoutesService {
  constructor(
    private http: HttpClient,
    private constant: Constant,
    private deliveryRoutesStore: DeliveryRoutesStore
  ) { }

  /**
   * Get all delivery routes from the API and store in signal
   */
  getDeliveryRoutes(): void {
    const url = `${this.constant.API_ENDPOINT}DeliveryRoutes/GetAll`;
    this.http.get<ResponseModel>(url).subscribe({
      next: (res: ResponseModel) => {
        if (res?.Success) {
          this.deliveryRoutesStore.setDeliveryRoutes(res?.Data);
        }
      },
      error: (error) => {
        console.error('Error loading delivery routes:', error);
        this.deliveryRoutesStore.clearDeliveryRoutes();
      }
    });
  }

  /**
   * Get delivery route details by ID
   * @param id - Delivery Route ID
   */
  getDeliveryRouteDetails(id: number): void {
    const url = `${this.constant.API_ENDPOINT}DeliveryRoutes/GetDetails/${id}`;
    this.http.get<ResponseModel>(url).subscribe({
      next: (res: ResponseModel) => {
        if (res?.Success) {
          this.deliveryRoutesStore.setDeliveryRouteDetails(res?.Data);
        }
      },
      error: (error) => {
        console.error('Error loading delivery route details:', error);
        this.deliveryRoutesStore.clearDeliveryRouteDetails();
      }
    });
  }

  /**
   * Create new delivery route
   * @param route - Delivery route data
   */
  createDeliveryRoute(route: CreateDeliveryRouteDto): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}DeliveryRoutes/Create`;
    return this.http.post<ResponseModel>(url, route);
  }

  /**
   * Generate optimized route
   * @param route - Delivery route data
   */
  generateOptimizedRoute(route: CreateDeliveryRouteDto): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}DeliveryRoutes/GenerateRoute`;
    return this.http.post<ResponseModel>(url, route);
  }

  /**
   * Mark stop as delivered
   * @param routeId - Delivery Route ID
   * @param stopId - Stop ID
   */
  markStopAsDelivered(routeId: number, stopId: number): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}DeliveryRoutes/${routeId}/Stops/${stopId}/MarkDelivered`;
    return this.http.put<ResponseModel>(url, {});
  }

  /**
   * Complete delivery route
   * @param id - Delivery Route ID
   */
  completeRoute(id: number): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}DeliveryRoutes/${id}/Complete`;
    return this.http.put<ResponseModel>(url, {});
  }
}
