import { Injectable, signal } from '@angular/core';
import { CreditCardModel } from '../core/models/credit-card.model';
import { CreditCardDetailsModel } from '../core/models/credit-card-details.model';

@Injectable({
  providedIn: 'root'
})
export class CreditCardsStore {
  
  // Signal to store the credit cards list
  private creditCardsSignal = signal<CreditCardModel[]>([]);
  
  // Read-only accessor for the signal
  readonly creditCards = this.creditCardsSignal.asReadonly();

  // Signal to store credit card details
  private creditCardDetailsSignal = signal<CreditCardDetailsModel | null>(null);
  
  // Read-only accessor for credit card details
  readonly creditCardDetails = this.creditCardDetailsSignal.asReadonly();

  /**
   * Set the credit cards list
   * @param creditCards - Array of credit card models
   */
  setCreditCards(creditCards: CreditCardModel[]): void {
    this.creditCardsSignal.set(creditCards);
  }

  /**
   * Add a single credit card to the list
   * @param creditCard - Credit card model to add
   */
  addCreditCard(creditCard: CreditCardModel): void {
    this.creditCardsSignal.update(cards => [...cards, creditCard]);
  }

  /**
   * Update a credit card in the list
   * @param updatedCard - Updated credit card model
   */
  updateCreditCard(updatedCard: CreditCardModel): void {
    this.creditCardsSignal.update(cards => 
      cards.map(card => 
        card.Id === updatedCard.Id ? updatedCard : card
      )
    );
  }

  /**
   * Remove a credit card from the list
   * @param cardId - ID of the credit card to remove
   */
  removeCreditCard(cardId: number): void {
    this.creditCardsSignal.update(cards => 
      cards.filter(card => card.Id !== cardId)
    );
  }

  /**
   * Clear all credit cards
   */
  clearCreditCards(): void {
    this.creditCardsSignal.set([]);
  }

  /**
   * Get current credit cards value (non-reactive)
   */
  getCreditCardsValue(): CreditCardModel[] {
    return this.creditCardsSignal();
  }

  /**
   * Set credit card details
   * @param details - Credit card details model
   */
  setCreditCardDetails(details: CreditCardDetailsModel): void {
    this.creditCardDetailsSignal.set(details);
  }

  /**
   * Clear credit card details
   */
  clearCreditCardDetails(): void {
    this.creditCardDetailsSignal.set(null);
  }

  /**
   * Get current credit card details value (non-reactive)
   */
  getCreditCardDetailsValue(): CreditCardDetailsModel | null {
    return this.creditCardDetailsSignal();
  }
}
