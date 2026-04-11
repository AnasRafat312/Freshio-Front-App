import { Injectable, signal } from '@angular/core';
import { TraderModel } from '../core/models/trader.model';
import { TraderDetailsModel } from '../core/models/trader-details.model';

@Injectable({
  providedIn: 'root'
})
export class TradersStore {
  
  // Signal to store the traders list
  private tradersSignal = signal<TraderModel[]>([]);
  
  // Read-only accessor for the signal
  readonly traders = this.tradersSignal.asReadonly();

  // Signal to store trader details
  private traderDetailsSignal = signal<TraderDetailsModel | null>(null);
  
  // Read-only accessor for trader details
  readonly traderDetails = this.traderDetailsSignal.asReadonly();

  /**
   * Set the traders list
   * @param traders - Array of trader models
   */
  setTraders(traders: TraderModel[]): void {
    this.tradersSignal.set(traders);
  }

  /**
   * Add a single trader to the list
   * @param trader - Trader model to add
   */
  addTrader(trader: TraderModel): void {
    this.tradersSignal.update(traders => [...traders, trader]);
  }

  /**
   * Update a trader in the list
   * @param updatedTrader - Updated trader model
   */
  updateTrader(updatedTrader: TraderModel): void {
    this.tradersSignal.update(traders => 
      traders.map(trader => 
        trader.Id === updatedTrader.Id ? updatedTrader : trader
      )
    );
  }

  /**
   * Remove a trader from the list
   * @param traderId - ID of the trader to remove
   */
  removeTrader(traderId: number): void {
    this.tradersSignal.update(traders => 
      traders.filter(trader => trader.Id !== traderId)
    );
  }

  /**
   * Clear all traders
   */
  clearTraders(): void {
    this.tradersSignal.set([]);
  }

  /**
   * Get current traders value (non-reactive)
   */
  getTradersValue(): TraderModel[] {
    return this.tradersSignal();
  }

  /**
   * Set trader details
   * @param details - Trader details model
   */
  setTraderDetails(details: TraderDetailsModel): void {
    this.traderDetailsSignal.set(details);
  }

  /**
   * Clear trader details
   */
  clearTraderDetails(): void {
    this.traderDetailsSignal.set(null);
  }

  /**
   * Get current trader details value (non-reactive)
   */
  getTraderDetailsValue(): TraderDetailsModel | null {
    return this.traderDetailsSignal();
  }
}
