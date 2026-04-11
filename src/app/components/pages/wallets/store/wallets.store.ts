import { Injectable, signal } from '@angular/core';
import { WalletModel } from '../core/models/wallet.model';
import { WalletDetailsModel } from '../core/models/wallet-details.model';

@Injectable({
  providedIn: 'root'
})
export class WalletsStore {
  
  // Signal to store the wallets list
  private walletsSignal = signal<WalletModel[]>([]);
  
  // Read-only accessor for the signal
  readonly wallets = this.walletsSignal.asReadonly();

  // Signal to store wallet details
  private walletDetailsSignal = signal<WalletDetailsModel | null>(null);
  
  // Read-only accessor for wallet details
  readonly walletDetails = this.walletDetailsSignal.asReadonly();

  /**
   * Set the wallets list
   * @param wallets - Array of wallet models
   */
  setWallets(wallets: WalletModel[]): void {
    this.walletsSignal.set(wallets);
  }

  /**
   * Add a single wallet to the list
   * @param wallet - Wallet model to add
   */
  addWallet(wallet: WalletModel): void {
    this.walletsSignal.update(wallets => [...wallets, wallet]);
  }

  /**
   * Update a wallet in the list
   * @param updatedWallet - Updated wallet model
   */
  updateWallet(updatedWallet: WalletModel): void {
    this.walletsSignal.update(wallets => 
      wallets.map(wallet => 
        wallet.Id === updatedWallet.Id ? updatedWallet : wallet
      )
    );
  }

  /**
   * Remove a wallet from the list
   * @param walletId - ID of the wallet to remove
   */
  removeWallet(walletId: number): void {
    this.walletsSignal.update(wallets => 
      wallets.filter(wallet => wallet.Id !== walletId)
    );
  }

  /**
   * Clear all wallets
   */
  clearWallets(): void {
    this.walletsSignal.set([]);
  }

  /**
   * Get current wallets value (non-reactive)
   */
  getWalletsValue(): WalletModel[] {
    return this.walletsSignal();
  }

  /**
   * Set wallet details
   * @param details - Wallet details model
   */
  setWalletDetails(details: WalletDetailsModel): void {
    this.walletDetailsSignal.set(details);
  }

  /**
   * Clear wallet details
   */
  clearWalletDetails(): void {
    this.walletDetailsSignal.set(null);
  }

  /**
   * Get current wallet details value (non-reactive)
   */
  getWalletDetailsValue(): WalletDetailsModel | null {
    return this.walletDetailsSignal();
  }
}
