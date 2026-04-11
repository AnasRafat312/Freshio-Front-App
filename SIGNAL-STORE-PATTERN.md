# Angular Signals Store Pattern - Implementation Guide

## 📋 Overview

This document describes the **Signal-based State Management Pattern** used in the E-Transactions System. This pattern provides reactive, type-safe state management using Angular Signals.

---

## 🏗️ Architecture

### **Three-Layer Pattern**

```
┌─────────────────────────────────────────┐
│         Component (List View)           │
│  - Uses effect() to react to changes    │
│  - Calls service methods                │
│  - Displays data from store             │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│            Service Layer                │
│  - Handles HTTP requests                │
│  - Manages subscriptions internally     │
│  - Updates store automatically          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│            Store (Signals)              │
│  - Holds application state              │
│  - Provides reactive signals            │
│  - CRUD operations on state             │
└─────────────────────────────────────────┘
```

---

## 📁 File Structure

```
src/app/components/pages/[feature]/
├── store/
│   └── [feature].store.ts          # Signal-based store
├── services/
│   └── [feature].service.ts        # HTTP service
├── components/
│   ├── list/
│   │   ├── [feature]-list.component.ts
│   │   ├── [feature]-list.component.html
│   │   └── [feature]-list.component.scss
│   └── add-edit/
│       └── [feature]-add-edit.component.ts
└── core/
    └── models/
        └── [feature].model.ts      # TypeScript model
```

---

## 🔧 Implementation Steps

### **Step 1: Create the Model**

```typescript
// src/app/components/pages/wallets/core/models/wallet.model.ts
export interface WalletModel {
  Id: number;
  Name: string;
  PhoneNumber: string;
  MonthlyLimit: number;
  DailyLimit: number;
  MonthlyUsed: number;
  DailyUsed: number;
  // ... other properties
}
```

---

### **Step 2: Create the Store**

```typescript
// src/app/components/pages/wallets/store/wallets.store.ts
import { Injectable, signal } from '@angular/core';
import { WalletModel } from '../core/models/wallet.model';

@Injectable({
  providedIn: 'root'
})
export class WalletsStore {
  
  // Private writable signal
  private walletsSignal = signal<WalletModel[]>([]);
  
  // Public read-only accessor
  readonly wallets = this.walletsSignal.asReadonly();

  /**
   * Set the entire list (used for initial load)
   */
  setWallets(wallets: WalletModel[]): void {
    this.walletsSignal.set(wallets);
  }

  /**
   * Add a single item to the list
   */
  addWallet(wallet: WalletModel): void {
    this.walletsSignal.update(wallets => [...wallets, wallet]);
  }

  /**
   * Update an existing item in the list
   */
  updateWallet(updatedWallet: WalletModel): void {
    this.walletsSignal.update(wallets => 
      wallets.map(wallet => 
        wallet.Id === updatedWallet.Id ? updatedWallet : wallet
      )
    );
  }

  /**
   * Remove an item from the list
   */
  removeWallet(walletId: number): void {
    this.walletsSignal.update(wallets => 
      wallets.filter(wallet => wallet.Id !== walletId)
    );
  }

  /**
   * Clear all items
   */
  clearWallets(): void {
    this.walletsSignal.set([]);
  }

  /**
   * Get current value (non-reactive snapshot)
   */
  getWalletsValue(): WalletModel[] {
    return this.walletsSignal();
  }
}
```

---

### **Step 3: Create the Service**

```typescript
// src/app/components/pages/wallets/services/wallets.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Constant } from 'src/app/core/constants/constant';
import { ResponseModel } from 'src/app/shared/model/response';
import { WalletsStore } from '../store/wallets.store';

@Injectable({
  providedIn: 'root'
})
export class WalletsService {
  constructor(
    private http: HttpClient,
    private constant: Constant,
    private walletsStore: WalletsStore
  ) { }

  /**
   * Get all items from API and update store
   * Subscription is handled internally
   */
  getElectronicWallets(): void {
    const url = `${this.constant.API_ENDPOINT}ElectronicWallets/GetAll`;
    this.http.get<ResponseModel>(url).subscribe({
      next: (res: ResponseModel) => {
        if (res?.Success) {
          this.walletsStore.setWallets(res?.Data);
        }
      },
      error: (error) => {
        console.error('Error loading wallets:', error);
      }
    });
  }

  /**
   * Add new item (if needed as separate method)
   */
  addWallet(wallet: WalletModel): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}ElectronicWallets/Add`;
    return this.http.post<ResponseModel>(url, wallet);
  }

  /**
   * Update existing item (if needed as separate method)
   */
  updateWallet(wallet: WalletModel): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}ElectronicWallets/Update`;
    return this.http.put<ResponseModel>(url, wallet);
  }

  /**
   * Delete item (if needed as separate method)
   */
  deleteWallet(id: number): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}ElectronicWallets/Delete/${id}`;
    return this.http.delete<ResponseModel>(url);
  }
}
```

---

### **Step 4: Create the List Component**

```typescript
// src/app/components/pages/wallets/components/list/wallets-list.component.ts
import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { WalletModel } from '../../core/models/wallet.model';
import { WalletsService } from '../../services/wallets.service';
import { WalletsStore } from '../../store/wallets.store';

@Component({
  selector: 'app-wallets-list',
  standalone: true,
  templateUrl: './wallets-list.component.html',
  styleUrls: ['./wallets-list.component.scss']
})
export class WalletsList implements OnInit, OnDestroy {
  mainList: WalletModel[] = [];
  filteredList: WalletModel[] = [];

  constructor(
    private walletsService: WalletsService,
    private walletsStore: WalletsStore
  ) {
    // React to signal changes automatically
    effect(() => {
      this.mainList = this.walletsStore.wallets();
      this.filteredList = [...this.mainList];
    });
  }

  ngOnInit(): void {
    this.getAllRows();
  }

  ngOnDestroy(): void {
    this.mainList = [];
    this.filteredList = [];
  }

  /**
   * Load data from API
   */
  getAllRows(): void {
    this.walletsService.getElectronicWallets();
  }

  /**
   * Open add/edit dialog
   */
  openDialog(row?: WalletModel): void {
    this.ref = this.dialogService.open(WalletsAddEditComponent, {
      header: row ? 'Edit Wallet' : 'Add Wallet',
      data: { wallet: row }
    });

    this.ref.onClose.subscribe((result) => {
      if (result) {
        if (row) {
          // Update existing
          this.walletsStore.updateWallet(result);
        } else {
          // Add new
          this.walletsStore.addWallet(result);
        }
      }
    });
  }

  /**
   * Delete item
   */
  deleteRow(row: WalletModel): void {
    // Show confirmation dialog
    // On confirm:
    this.walletsStore.removeWallet(row.Id);
  }
}
```

---

### **Step 5: Add/Edit Component**

```typescript
// src/app/components/pages/wallets/components/add-edit/add-edit.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { WalletsService } from '../../services/wallets.service';

@Component({
  selector: 'app-wallets-add-edit',
  templateUrl: './add-edit.component.html'
})
export class WalletsAddEditComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private walletsService: WalletsService,
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private messageService: MessageService
  ) {
    this.form = this.fb.group({
      Name: ['', Validators.required],
      PhoneNumber: ['', Validators.required],
      // ... other fields
    });
  }

  ngOnInit(): void {
    const wallet = this.config.data?.wallet;
    if (wallet) {
      this.isEditMode = true;
      this.form.patchValue(wallet);
    }
  }

  save(): void {
    if (this.form.invalid) return;

    const walletData = this.form.value;

    if (this.isEditMode) {
      // Update
      this.walletsService.updateWallet(walletData).subscribe({
        next: (response) => {
          if (response?.Success) {
            this.messageService.add({ 
              severity: 'success', 
              detail: 'Wallet updated successfully'
            });
            this.ref.close(response?.Data); // Return updated data
          }
        },
        error: (error) => {
          this.messageService.add({ 
            severity: 'error', 
            detail: error?.error?.Message 
          });
        }
      });
    } else {
      // Add
      this.walletsService.addWallet(walletData).subscribe({
        next: (response) => {
          if (response?.Success) {
            this.messageService.add({ 
              severity: 'success', 
              detail: 'Wallet added successfully'
            });
            this.ref.close(response?.Data); // Return new data
          }
        },
        error: (error) => {
          this.messageService.add({ 
            severity: 'error', 
            detail: error?.error?.Message 
          });
        }
      });
    }
  }
}
```

---

## ✅ Key Benefits

### **1. Reactive Updates**
- Changes to the store automatically update all components
- No manual refresh needed

### **2. Type Safety**
- Full TypeScript support
- Compile-time error checking

### **3. Centralized State**
- Single source of truth
- Easy to debug and maintain

### **4. Clean Components**
- Components don't manage subscriptions
- Service handles all HTTP logic

### **5. Performance**
- Fine-grained reactivity
- Only affected components re-render

---

## 🎯 Usage Patterns

### **Pattern 1: Load Data**
```typescript
// Component
ngOnInit(): void {
  this.walletsService.getElectronicWallets();
}

// Effect automatically updates when store changes
effect(() => {
  this.mainList = this.walletsStore.wallets();
});
```

### **Pattern 2: Add Item**
```typescript
// After successful API call
this.ref.onClose.subscribe((newWallet) => {
  if (newWallet) {
    this.walletsStore.addWallet(newWallet);
  }
});
```

### **Pattern 3: Update Item**
```typescript
// After successful API call
this.ref.onClose.subscribe((updatedWallet) => {
  if (updatedWallet) {
    this.walletsStore.updateWallet(updatedWallet);
  }
});
```

### **Pattern 4: Delete Item**
```typescript
// After successful deletion
this.deleteService.deleteFun(url, id).subscribe({
  next: (res) => {
    if (res?.Success) {
      this.walletsStore.removeWallet(id);
    }
  }
});
```

---

## 🚀 Quick Start Checklist

- [ ] Create model interface
- [ ] Create store with signal
- [ ] Create service with HTTP methods
- [ ] Inject store into service
- [ ] Create list component with effect()
- [ ] Create add/edit component
- [ ] Update store after CRUD operations
- [ ] Test reactive updates

---

## 📝 Notes

### **When to Use This Pattern**
✅ List/detail views with CRUD operations  
✅ Shared state across multiple components  
✅ Real-time updates needed  
✅ Complex state management  

### **When NOT to Use**
❌ Simple forms with no shared state  
❌ One-time data fetch  
❌ Static configuration data  

---

## 🔍 Common Issues & Solutions

### **Issue: Component doesn't update**
**Solution:** Make sure you're using `effect()` and accessing the signal with `()`

```typescript
// ❌ Wrong
this.mainList = this.walletsStore.wallets;

// ✅ Correct
effect(() => {
  this.mainList = this.walletsStore.wallets();
});
```

### **Issue: Duplicate data after add**
**Solution:** Make sure API returns the created item with ID

```typescript
// Return from API
this.ref.close(response?.Data); // Must include generated ID
```

### **Issue: Update doesn't reflect**
**Solution:** Ensure ID matching is correct in updateWallet()

```typescript
updateWallet(updatedWallet: WalletModel): void {
  this.walletsSignal.update(wallets => 
    wallets.map(wallet => 
      wallet.Id === updatedWallet.Id ? updatedWallet : wallet
    )
  );
}
```

---

## 📚 References

- [Angular Signals Documentation](https://angular.io/guide/signals)
- [RxJS Best Practices](https://rxjs.dev/guide/overview)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Last Updated:** January 7, 2026  
**Pattern Version:** 1.0  
**Project:** E-Transactions System
