import { Injectable, signal } from '@angular/core';
import { WasteOrderModel } from 'src/app/shared/model/freshio/waste.model';

@Injectable({
  providedIn: 'root'
})
export class WasteStore {
  
  // Signal to store the waste records list
  private wasteRecordsSignal = signal<WasteOrderModel[]>([]);
  
  // Read-only accessor for the signal
  readonly wasteRecords = this.wasteRecordsSignal.asReadonly();

  // Signal to store waste details
  private wasteDetailsSignal = signal<WasteOrderModel | null>(null);
  
  // Read-only accessor for waste details
  readonly wasteDetails = this.wasteDetailsSignal.asReadonly();

  /**
   * Set the waste records list
   * @param wasteRecords - Array of waste order models
   */
  setWasteRecords(wasteRecords: WasteOrderModel[]): void {
    this.wasteRecordsSignal.set(wasteRecords);
  }

  /**
   * Add a single waste record to the list
   * @param wasteRecord - Waste order model to add
   */
  addWasteRecord(wasteRecord: WasteOrderModel): void {
    this.wasteRecordsSignal.update(wasteRecords => [...wasteRecords, wasteRecord]);
  }

  /**
   * Update a waste record in the list
   * @param updatedWasteRecord - Updated waste order model
   */
  updateWasteRecord(updatedWasteRecord: WasteOrderModel): void {
    this.wasteRecordsSignal.update(wasteRecords => 
      wasteRecords.map(wasteRecord => 
        wasteRecord.ID === updatedWasteRecord.ID ? updatedWasteRecord : wasteRecord
      )
    );
  }

  /**
   * Remove a waste record from the list
   * @param wasteRecordId - ID of the waste record to remove
   */
  removeWasteRecord(wasteRecordId: number): void {
    this.wasteRecordsSignal.update(wasteRecords => 
      wasteRecords.filter(wasteRecord => wasteRecord.ID !== wasteRecordId)
    );
  }

  /**
   * Clear all waste records
   */
  clearWasteRecords(): void {
    this.wasteRecordsSignal.set([]);
  }

  /**
   * Get current waste records value (non-reactive)
   */
  getWasteRecordsValue(): WasteOrderModel[] {
    return this.wasteRecordsSignal();
  }

  /**
   * Set waste details
   * @param details - Waste details model
   */
  setWasteDetails(details: WasteOrderModel): void {
    this.wasteDetailsSignal.set(details);
  }

  /**
   * Clear waste details
   */
  clearWasteDetails(): void {
    this.wasteDetailsSignal.set(null);
  }

  /**
   * Get current waste details value (non-reactive)
   */
  getWasteDetailsValue(): WasteOrderModel | null {
    return this.wasteDetailsSignal();
  }
}
