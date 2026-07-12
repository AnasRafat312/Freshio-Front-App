import { Injectable, signal } from '@angular/core';
import { ItemModel } from 'src/app/shared/model/freshio/item.model';

@Injectable({
  providedIn: 'root'
})
export class ItemsStore {
  
  // Signal to store the items list
  private itemsSignal = signal<ItemModel[]>([]);
  
  // Read-only accessor for the signal
  readonly items = this.itemsSignal.asReadonly();

  // Signal to store item details
  private itemDetailsSignal = signal<ItemModel | null>(null);
  
  // Read-only accessor for item details
  readonly itemDetails = this.itemDetailsSignal.asReadonly();

  /**
   * Set the items list
   * @param items - Array of item models
   */
  setItems(items: ItemModel[]): void {
    this.itemsSignal.set(items);
  }

  /**
   * Add a single item to the list
   * @param item - Item model to add
   */
  addItem(item: ItemModel): void {
    this.itemsSignal.update(items => [...items, item]);
  }

  /**
   * Update an item in the list
   * @param updatedItem - Updated item model
   */
  updateItem(updatedItem: ItemModel): void {
    this.itemsSignal.update(items => 
      items.map(item => 
        item.ID === updatedItem.ID ? updatedItem : item
      )
    );
  }

  /**
   * Remove an item from the list
   * @param itemId - ID of the item to remove
   */
  removeItem(itemId: number): void {
    this.itemsSignal.update(items => 
      items.filter(item => item.ID !== itemId)
    );
  }

  /**
   * Clear all items
   */
  clearItems(): void {
    this.itemsSignal.set([]);
  }

  /**
   * Get current items value (non-reactive)
   */
  getItemsValue(): ItemModel[] {
    return this.itemsSignal();
  }

  /**
   * Set item details
   * @param details - Item details model
   */
  setItemDetails(details: ItemModel): void {
    this.itemDetailsSignal.set(details);
  }

  /**
   * Clear item details
   */
  clearItemDetails(): void {
    this.itemDetailsSignal.set(null);
  }

  /**
   * Get current item details value (non-reactive)
   */
  getItemDetailsValue(): ItemModel | null {
    return this.itemDetailsSignal();
  }
}
