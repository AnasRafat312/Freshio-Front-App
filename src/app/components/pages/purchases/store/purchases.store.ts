import { Injectable, signal } from '@angular/core';
import { PurchaseOrderModel } from 'src/app/shared/model/freshio/purchase.model';

@Injectable({
  providedIn: 'root'
})
export class PurchasesStore {
  
  // Signal to store the purchases list
  private purchasesSignal = signal<PurchaseOrderModel[]>([]);
  
  // Read-only accessor for the signal
  readonly purchases = this.purchasesSignal.asReadonly();

  // Signal to store purchase details
  private purchaseDetailsSignal = signal<PurchaseOrderModel | null>(null);
  
  // Read-only accessor for purchase details
  readonly purchaseDetails = this.purchaseDetailsSignal.asReadonly();

  /**
   * Set the purchases list
   * @param purchases - Array of purchase models
   */
  setPurchases(purchases: PurchaseOrderModel[]): void {
    this.purchasesSignal.set(purchases);
  }

  /**
   * Add a single purchase to the list
   * @param purchase - Purchase model to add
   */
  addPurchase(purchase: PurchaseOrderModel): void {
    this.purchasesSignal.update(purchases => [purchase,...purchases]);
  }

  /**
   * Update a purchase in the list
   * @param updatedPurchase - Updated purchase model
   */
  updatePurchase(updatedPurchase: PurchaseOrderModel): void {
    this.purchasesSignal.update(purchases => 
      purchases.map(purchase => 
        purchase.ID === updatedPurchase.ID ? updatedPurchase : purchase
      )
    );
  }

  /**
   * Remove a purchase from the list
   * @param purchaseId - ID of the purchase to remove
   */
  removePurchase(purchaseId: number): void {
    this.purchasesSignal.update(purchases => 
      purchases.filter(purchase => purchase.ID !== purchaseId)
    );
  }

  /**
   * Clear all purchases
   */
  clearPurchases(): void {
    this.purchasesSignal.set([]);
  }

  /**
   * Get current purchases value (non-reactive)
   */
  getPurchasesValue(): PurchaseOrderModel[] {
    return this.purchasesSignal();
  }

  /**
   * Set purchase details
   * @param details - Purchase details model
   */
  setPurchaseDetails(details: PurchaseOrderModel): void {
    this.purchaseDetailsSignal.set(details);
  }

  /**
   * Clear purchase details
   */
  clearPurchaseDetails(): void {
    this.purchaseDetailsSignal.set(null);
  }

  /**
   * Get current purchase details value (non-reactive)
   */
  getPurchaseDetailsValue(): PurchaseOrderModel | null {
    return this.purchaseDetailsSignal();
  }
}
