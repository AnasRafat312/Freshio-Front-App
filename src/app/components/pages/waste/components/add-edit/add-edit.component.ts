import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { Subscription } from 'rxjs';
import { WasteService } from '../../services/waste.service';
import { CreateWasteDto, CreateWasteItemDto } from 'src/app/shared/model/freshio/waste.model';
import { EntitiesService } from '../../../entities/services/entities.service';
import { EntitiesStore } from '../../../entities/store/entities.store';
import { ItemsService } from '../../../items/services/items.service';
import { ItemsStore } from '../../../items/store/items.store';
import { InventoryService } from '../../../inventory/services/inventory.service';
import { InventoryStore } from '../../../inventory/store/inventory.store';
import { EntityRole } from 'src/app/shared/model/freshio/entity.model';

@Component({
  selector: 'app-waste-add-edit',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss']
})
export class WasteAddEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  languageFactor = 'en';
  languageSubscription: Subscription;
  loading = false;
  
  // Dropdown options
  employeeOptions: any[] = [];
  itemOptions: any[] = [];
  
  constructor(
    private fb: FormBuilder,
    private language: LanguagesService,
    private wasteService: WasteService,
    private entitiesService: EntitiesService,
    private entitiesStore: EntitiesStore,
    private itemsService: ItemsService,
    private itemsStore: ItemsStore,
    private inventoryService: InventoryService,
    private inventoryStore: InventoryStore,
    private messageService: MessageService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.initializeForm();
    
    // React to store changes
    effect(() => {
      const entities = this.entitiesStore.entities();
      this.employeeOptions = entities
        .filter(entity => entity.IsEmployee && entity.IsActive)
        .map(entity => ({
          label: entity.Name,
          value: entity.ID
        }));
    });
    
    effect(() => {
      const items = this.itemsStore.items();
      this.itemOptions = items
        .filter(item => item.IsActive)
        .map(item => ({
          label: `${item.Name} (${item.UnitOfMeasure})`,
          value: item.ID,
          unitOfMeasure: item.UnitOfMeasure
        }));
    });
  }

  ngOnInit(): void {
    this.languageSubscription = this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
    });

    // Load dropdown data
    this.loadEmployees();
    this.loadItems();
    this.loadInventory();
    
    // Add at least one empty item row
    this.addItem();
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      WasteDate: [new Date(), [Validators.required]],
      EmployeeEntityId: [null],
      Reason: [''],
      Notes: [''],
      Items: this.fb.array([], [Validators.required, Validators.minLength(1)])
    });
  }

  get items(): FormArray {
    return this.form.get('Items') as FormArray;
  }

  private loadEmployees(): void {
    this.entitiesService.getEntities();
  }

  private loadItems(): void {
    this.itemsService.getItems();
  }

  private loadInventory(): void {
    this.inventoryService.getInventory();
  }

  addItem(itemData?: any): void {
    const itemGroup = this.fb.group({
      ItemId: [itemData?.ItemId || null, [Validators.required]],
      AvailableQuantity: [{ value: itemData?.AvailableQuantity || 0, disabled: true }],
      Quantity: [itemData?.Quantity || 1, [Validators.required, Validators.min(0.01)]],
      UnitOfMeasure: [{ value: '', disabled: true }]
    });

    // Watch for ItemId changes to update available quantity
    itemGroup.get('ItemId')?.valueChanges.subscribe((itemId) => {
      if (itemId) {
        this.updateAvailableQuantity(itemGroup, itemId);
      }
    });

    this.items.push(itemGroup);
  }

  private updateAvailableQuantity(itemGroup: FormGroup, itemId: number): void {
    const inventory = this.inventoryStore.getInventoryValue();
    const inventoryItem = inventory.find(inv => inv.ItemId === itemId);
    
    if (inventoryItem) {
      itemGroup.get('AvailableQuantity')?.setValue(inventoryItem.AvailableQuantity);
      itemGroup.get('UnitOfMeasure')?.setValue(inventoryItem.UnitOfMeasure);
    } else {
      itemGroup.get('AvailableQuantity')?.setValue(0);
      itemGroup.get('UnitOfMeasure')?.setValue('');
    }
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  getAvailableQuantity(index: number): number {
    return this.items.at(index).get('AvailableQuantity')?.value || 0;
  }

  getWasteQuantity(index: number): number {
    return this.items.at(index).get('Quantity')?.value || 0;
  }

  isQuantityExceeded(index: number): boolean {
    const wasteQty = this.getWasteQuantity(index);
    const availableQty = this.getAvailableQuantity(index);
    return wasteQty > availableQty;
  }

  hasInvalidQuantities(): boolean {
    for (let i = 0; i < this.items.length; i++) {
      if (this.isQuantityExceeded(i)) {
        return true;
      }
    }
    return false;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: this.languageFactor === 'en' ? 'Validation Error' : 'خطأ في التحقق',
        detail: this.languageFactor === 'en' ? 'Please fill all required fields' : 'يرجى ملء جميع الحقول المطلوبة'
      });
      return;
    }

    // Check for quantity validation
    if (this.hasInvalidQuantities()) {
      this.messageService.add({
        severity: 'error',
        summary: this.languageFactor === 'en' ? 'Validation Error' : 'خطأ في التحقق',
        detail: this.languageFactor === 'en' 
          ? 'Waste quantity cannot be greater than available quantity'
          : 'كمية الهالك لا يمكن أن تكون أكبر من الكمية المتاحة'
      });
      return;
    }

    this.loading = true;

    const payload: CreateWasteDto = {
      WasteDate: this.form.get('WasteDate')?.value,
      EmployeeEntityId: this.form.get('EmployeeEntityId')?.value,
      Reason: this.form.get('Reason')?.value || null,
      Notes: this.form.get('Notes')?.value || null,
      WasteOrderItems: this.items.controls.map(control => ({
        ItemId: control.get('ItemId')?.value,
        Quantity: control.get('Quantity')?.value
      }))
    };

    this.wasteService.createWaste(payload).subscribe({
      next: (response) => {
        if (response?.Success) {
          this.messageService.add({
            severity: 'success',
            summary: this.languageFactor === 'en' ? 'Success' : 'نجح',
            detail: this.languageFactor === 'en' ? 'Waste record created successfully' : 'تم إنشاء سجل الهالك بنجاح'
          });
          this.ref.close(true);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: this.languageFactor === 'en' ? 'Error' : 'خطأ',
            detail: response?.Message || (this.languageFactor === 'en' ? 'Failed to create waste record' : 'فشل إنشاء سجل الهالك')
          });
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: this.languageFactor === 'en' ? 'Error' : 'خطأ',
          detail: this.languageFactor === 'en' ? 'An error occurred' : 'حدث خطأ'
        });
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.ref.close();
  }
}
