import { Injectable, signal } from '@angular/core';
import { YellowCardModel } from '../core/models/yellow-card.model';
import { YellowCardDetailsModel } from '../core/models/yellow-card-details.model';

@Injectable({
  providedIn: 'root'
})
export class YellowCardsStore {
  
  // Signal to store the yellow cards list
  private yellowCardsSignal = signal<YellowCardModel[]>([]);
  
  // Read-only accessor for the signal
  readonly yellowCards = this.yellowCardsSignal.asReadonly();

  // Signal to store yellow card details
  private yellowCardDetailsSignal = signal<YellowCardDetailsModel | null>(null);
  
  // Read-only accessor for yellow card details
  readonly yellowCardDetails = this.yellowCardDetailsSignal.asReadonly();

  /**
   * Set the yellow cards list
   * @param yellowCards - Array of yellow card models
   */
  setYellowCards(yellowCards: YellowCardModel[]): void {
    this.yellowCardsSignal.set(yellowCards);
  }

  /**
   * Add a single yellow card to the list
   * @param yellowCard - Yellow card model to add
   */
  addYellowCard(yellowCard: YellowCardModel): void {
    this.yellowCardsSignal.update(cards => [...cards, yellowCard]);
  }

  /**
   * Update a yellow card in the list
   * @param updatedCard - Updated yellow card model
   */
  updateYellowCard(updatedCard: YellowCardModel): void {
    this.yellowCardsSignal.update(cards => 
      cards.map(card => 
        card.Id === updatedCard.Id ? updatedCard : card
      )
    );
  }

  /**
   * Remove a yellow card from the list
   * @param cardId - ID of the yellow card to remove
   */
  removeYellowCard(cardId: number): void {
    this.yellowCardsSignal.update(cards => 
      cards.filter(card => card.Id !== cardId)
    );
  }

  /**
   * Clear all yellow cards
   */
  clearYellowCards(): void {
    this.yellowCardsSignal.set([]);
  }

  /**
   * Get current yellow cards value (non-reactive)
   */
  getYellowCardsValue(): YellowCardModel[] {
    return this.yellowCardsSignal();
  }

  /**
   * Set yellow card details
   * @param details - Yellow card details model
   */
  setYellowCardDetails(details: YellowCardDetailsModel): void {
    this.yellowCardDetailsSignal.set(details);
  }

  /**
   * Clear yellow card details
   */
  clearYellowCardDetails(): void {
    this.yellowCardDetailsSignal.set(null);
  }

  /**
   * Get current yellow card details value (non-reactive)
   */
  getYellowCardDetailsValue(): YellowCardDetailsModel | null {
    return this.yellowCardDetailsSignal();
  }
}
