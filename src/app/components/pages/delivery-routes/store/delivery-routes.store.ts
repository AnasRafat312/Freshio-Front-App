import { Injectable, signal } from '@angular/core';
import { DeliveryRouteModel } from 'src/app/shared/model/freshio/delivery-route.model';

@Injectable({
  providedIn: 'root'
})
export class DeliveryRoutesStore {
  
  // Signal to store the delivery routes list
  private deliveryRoutesSignal = signal<DeliveryRouteModel[]>([]);
  
  // Read-only accessor for the signal
  readonly deliveryRoutes = this.deliveryRoutesSignal.asReadonly();

  // Signal to store delivery route details
  private deliveryRouteDetailsSignal = signal<DeliveryRouteModel | null>(null);
  
  // Read-only accessor for delivery route details
  readonly deliveryRouteDetails = this.deliveryRouteDetailsSignal.asReadonly();

  /**
   * Set the delivery routes list
   * @param deliveryRoutes - Array of delivery route models
   */
  setDeliveryRoutes(deliveryRoutes: DeliveryRouteModel[]): void {
    this.deliveryRoutesSignal.set(deliveryRoutes);
  }

  /**
   * Add a single delivery route to the list
   * @param deliveryRoute - Delivery route model to add
   */
  addDeliveryRoute(deliveryRoute: DeliveryRouteModel): void {
    this.deliveryRoutesSignal.update(deliveryRoutes => [...deliveryRoutes, deliveryRoute]);
  }

  /**
   * Update a delivery route in the list
   * @param updatedDeliveryRoute - Updated delivery route model
   */
  updateDeliveryRoute(updatedDeliveryRoute: DeliveryRouteModel): void {
    this.deliveryRoutesSignal.update(deliveryRoutes => 
      deliveryRoutes.map(deliveryRoute => 
        deliveryRoute.ID === updatedDeliveryRoute.ID ? updatedDeliveryRoute : deliveryRoute
      )
    );
  }

  /**
   * Remove a delivery route from the list
   * @param deliveryRouteId - ID of the delivery route to remove
   */
  removeDeliveryRoute(deliveryRouteId: number): void {
    this.deliveryRoutesSignal.update(deliveryRoutes => 
      deliveryRoutes.filter(deliveryRoute => deliveryRoute.ID !== deliveryRouteId)
    );
  }

  /**
   * Clear all delivery routes
   */
  clearDeliveryRoutes(): void {
    this.deliveryRoutesSignal.set([]);
  }

  /**
   * Get current delivery routes value (non-reactive)
   */
  getDeliveryRoutesValue(): DeliveryRouteModel[] {
    return this.deliveryRoutesSignal();
  }

  /**
   * Set delivery route details
   * @param details - Delivery route details model
   */
  setDeliveryRouteDetails(details: DeliveryRouteModel): void {
    this.deliveryRouteDetailsSignal.set(details);
  }

  /**
   * Clear delivery route details
   */
  clearDeliveryRouteDetails(): void {
    this.deliveryRouteDetailsSignal.set(null);
  }

  /**
   * Get current delivery route details value (non-reactive)
   */
  getDeliveryRouteDetailsValue(): DeliveryRouteModel | null {
    return this.deliveryRouteDetailsSignal();
  }
}
