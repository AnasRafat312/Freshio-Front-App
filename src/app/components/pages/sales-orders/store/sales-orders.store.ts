import { Injectable, signal } from '@angular/core';
import { SalesOrderModel } from 'src/app/shared/model/freshio/sales-order.model';

@Injectable({
  providedIn: 'root'
})
export class SalesOrdersStore {
  
  // Signal to store the sales orders list
  private salesOrdersSignal = signal<SalesOrderModel[]>([]);
  
  // Read-only accessor for the signal
  readonly salesOrders = this.salesOrdersSignal.asReadonly();

  // Signal to store sales order details
  private salesOrderDetailsSignal = signal<SalesOrderModel | null>(null);
  
  // Read-only accessor for sales order details
  readonly salesOrderDetails = this.salesOrderDetailsSignal.asReadonly();

  /**
   * Set the sales orders list
   * @param salesOrders - Array of sales order models
   */
  setSalesOrders(salesOrders: SalesOrderModel[]): void {
    this.salesOrdersSignal.set(salesOrders);
  }

  /**
   * Add a single sales order to the list
   * @param salesOrder - Sales order model to add
   */
  addSalesOrder(salesOrder: SalesOrderModel): void {
    this.salesOrdersSignal.update(salesOrders => [salesOrder, ...salesOrders]);
  }

  /**
   * Update a sales order in the list
   * @param updatedSalesOrder - Updated sales order model
   */
  updateSalesOrder(updatedSalesOrder: SalesOrderModel): void {
    this.salesOrdersSignal.update(salesOrders => 
      salesOrders.map(salesOrder => 
        salesOrder.ID === updatedSalesOrder.ID ? updatedSalesOrder : salesOrder
      )
    );
  }

  /**
   * Remove a sales order from the list
   * @param salesOrderId - ID of the sales order to remove
   */
  removeSalesOrder(salesOrderId: number): void {
    this.salesOrdersSignal.update(salesOrders => 
      salesOrders.filter(salesOrder => salesOrder.ID !== salesOrderId)
    );
  }

  /**
   * Clear all sales orders
   */
  clearSalesOrders(): void {
    this.salesOrdersSignal.set([]);
  }

  /**
   * Get current sales orders value (non-reactive)
   */
  getSalesOrdersValue(): SalesOrderModel[] {
    return this.salesOrdersSignal();
  }

  /**
   * Set sales order details
   * @param details - Sales order details model
   */
  setSalesOrderDetails(details: SalesOrderModel): void {
    this.salesOrderDetailsSignal.set(details);
  }

  /**
   * Clear sales order details
   */
  clearSalesOrderDetails(): void {
    this.salesOrderDetailsSignal.set(null);
  }

  /**
   * Get current sales order details value (non-reactive)
   */
  getSalesOrderDetailsValue(): SalesOrderModel | null {
    return this.salesOrderDetailsSignal();
  }
}
