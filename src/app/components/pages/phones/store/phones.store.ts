import { Injectable, signal } from '@angular/core';
import { PhoneModel } from '../core/models/phone.model';

@Injectable({
  providedIn: 'root'
})
export class PhonesStore {
  
  // Signal to store the phones list
  private phonesSignal = signal<PhoneModel[]>([]);
  
  // Read-only accessor for the signal
  readonly phones = this.phonesSignal.asReadonly();

  /**
   * Set the phones list
   * @param phones - Array of phone models
   */
  setPhones(phones: PhoneModel[]): void {
    this.phonesSignal.set(phones);
  }

  /**
   * Add a single phone to the list
   * @param phone - Phone model to add
   */
  addPhone(phone: PhoneModel): void {
    this.phonesSignal.update(phones => [...phones, phone]);
  }

  /**
   * Update a phone in the list
   * @param updatedPhone - Updated phone model
   */
  updatePhone(updatedPhone: PhoneModel): void {
    this.phonesSignal.update(phones => 
      phones.map(phone => 
        phone.Id === updatedPhone.Id ? updatedPhone : phone
      )
    );
  }

  /**
   * Remove a phone from the list
   * @param phoneId - ID of the phone to remove
   */
  removePhone(phoneId: number): void {
    this.phonesSignal.update(phones => 
      phones.filter(phone => phone.Id !== phoneId)
    );
  }

  /**
   * Clear all phones
   */
  clearPhones(): void {
    this.phonesSignal.set([]);
  }

  /**
   * Get current phones value (non-reactive)
   */
  getPhonesValue(): PhoneModel[] {
    return this.phonesSignal();
  }
}
