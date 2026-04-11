import { Injectable, signal } from '@angular/core';
import { AdjustmentModel } from '../core/models/adjustment.model';

@Injectable({
  providedIn: 'root'
})
export class AdjustmentsStore {
  
  // Signal to store the adjustments list
  private adjustmentsSignal = signal<AdjustmentModel[]>([]);
  
  // Read-only accessor for the signal
  readonly adjustments = this.adjustmentsSignal.asReadonly();

  /**
   * Set the adjustments list
   * @param adjustments - Array of adjustment models
   */
  setAdjustments(adjustments: AdjustmentModel[]): void {
    this.adjustmentsSignal.set(adjustments);
  }

  /**
   * Add a single adjustment to the list
   * @param adjustment - Adjustment model to add
   */
  addAdjustment(adjustment: AdjustmentModel): void {
    this.adjustmentsSignal.update(adjustments => [...adjustments, adjustment]);
  }

  /**
   * Update an adjustment in the list
   * @param updatedAdjustment - Updated adjustment model
   */
  updateAdjustment(updatedAdjustment: AdjustmentModel): void {
    this.adjustmentsSignal.update(adjustments => 
      adjustments.map(adjustment => 
        adjustment.Id === updatedAdjustment.Id ? updatedAdjustment : adjustment
      )
    );
  }

  /**
   * Remove an adjustment from the list
   * @param adjustmentId - ID of the adjustment to remove
   */
  removeAdjustment(adjustmentId: number): void {
    this.adjustmentsSignal.update(adjustments => 
      adjustments.filter(adjustment => adjustment.Id !== adjustmentId)
    );
  }

  /**
   * Clear all adjustments
   */
  clearAdjustments(): void {
    this.adjustmentsSignal.set([]);
  }

  /**
   * Get current adjustments value (non-reactive)
   */
  getAdjustmentsValue(): AdjustmentModel[] {
    return this.adjustmentsSignal();
  }
}
