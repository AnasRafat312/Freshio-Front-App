import { Injectable, signal } from '@angular/core';
import { InventoryModel } from 'src/app/shared/model/freshio/inventory.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryStore {
  
  // Signal to store the inventory list
  private inventorySignal = signal<InventoryModel[]>([]);
  
  // Read-only accessor for the signal
  readonly inventory = this.inventorySignal.asReadonly();

  /**
   * Set the inventory list
   * @param inventory - Array of inventory models
   */
  setInventory(inventory: InventoryModel[]): void {
    this.inventorySignal.set(inventory);
  }

  /**
   * Update an inventory item in the list
   * @param updatedItem - Updated inventory model
   */
  updateInventoryItem(updatedItem: InventoryModel): void {
    this.inventorySignal.update(inventory => 
      inventory.map(item => 
        item.ItemId === updatedItem.ItemId ? updatedItem : item
      )
    );
  }

  /**
   * Clear all inventory
   */
  clearInventory(): void {
    this.inventorySignal.set([]);
  }

  /**
   * Get current inventory value (non-reactive)
   */
  getInventoryValue(): InventoryModel[] {
    return this.inventorySignal();
  }
}
