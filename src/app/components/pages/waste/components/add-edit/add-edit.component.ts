import { Component, OnInit, OnDestroy, effect, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { Subscription } from 'rxjs';
import { WasteService } from '../../services/waste.service';
import { CreateWasteDto, CreateWasteItemDto, WasteType, WasteDetailType } from 'src/app/shared/model/freshio/waste.model';
import { EntitiesService } from '../../../entities/services/entities.service';
import { EntitiesStore } from '../../../entities/store/entities.store';
import { ItemsService } from '../../../items/services/items.service';
import { ItemsStore } from '../../../items/store/items.store';
import { InventoryService } from '../../../inventory/services/inventory.service';
import { InventoryStore } from '../../../inventory/store/inventory.store';
import { EntityRole } from 'src/app/shared/model/freshio/entity.model';
import { SharedService } from 'src/app/shared/services/shared.service';

interface ReferenceOption {
  label: string;
  value: number;
  unitOfMeasure?: string;
}

@Component({
  selector: 'app-waste-add-edit',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WasteAddEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  languageFactor = 'en';
  languageSubscription: Subscription;
  loading = false;
  
  // Enums for template
  readonly WasteDetailType = WasteDetailType;
  
  // Dropdown options
  employeeOptions: any[] = [];
  itemOptions: ReferenceOption[] = [];
  materialOptions: ReferenceOption[] = [];
  
  detailTypeOptions: any[] = [
    { label: 'Item', value: WasteDetailType.Item },
    { label: 'Material', value: WasteDetailType.Material },
    { label: 'Delivery', value: WasteDetailType.Delivery },
    { label: 'Purchase', value: WasteDetailType.Purchase },
    { label: 'Carry (مشال)', value: WasteDetailType.Carry }
  ];
  
  constructor(
    private fb: FormBuilder,
    private language: LanguagesService,
    private wasteService: WasteService,
    private sharedService: SharedService,
    private entitiesService: EntitiesService,
    private entitiesStore: EntitiesStore,
    private itemsService: ItemsService,
    private itemsStore: ItemsStore,
    private inventoryService: InventoryService,
    private inventoryStore: InventoryStore,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
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
      this.cdr.markForCheck();
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
      
      // For now, materials use the same items list
      // In production, you would fetch from a separate materials endpoint
      this.materialOptions = [...this.itemOptions];
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    this.languageSubscription = this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
      this.cdr.markForCheck();
    });

    // Load dropdown data
    this.loadEmployees();
    this.loadItems();
    this.loadInventory();
    
    // Add at least one empty detail row
    this.addDetailRow();
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

  get detailRows(): FormArray {
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

  /**
   * Factory method to create a new detail row FormGroup
   */
  private createDetailRow(detailType: WasteDetailType = WasteDetailType.Item): FormGroup {
    const group = this.fb.group({
      detailType: [detailType, [Validators.required]],
      referenceId: [null],
      deliveryReference: [''],
      unitOfMeasure: [{ value: '', disabled: true }],
      availableQuantity: [{ value: null, disabled: true }],
      quantity: [null],
      wasteAmount: [null],
      unitCost: [null],
      total: [{ value: 0, disabled: true }]
    });

    // Apply initial validators based on type
    this.applyDynamicValidators(group, detailType);

    // Watch for type changes
    group.get('detailType')?.valueChanges.subscribe((newType: WasteDetailType) => {
      this.onDetailTypeChange(group, newType);
    });

    // Watch for reference changes
    group.get('referenceId')?.valueChanges.subscribe((refId: number | null) => {
      if (refId) {
        this.onReferenceChange(group, refId);
      }
    });

    // Watch for quantity/cost changes to recalculate total
    group.get('quantity')?.valueChanges.subscribe(() => {
      this.calculateTotal(group);
    });

    group.get('unitCost')?.valueChanges.subscribe(() => {
      this.calculateTotal(group);
    });

    group.get('wasteAmount')?.valueChanges.subscribe(() => {
      this.calculateTotal(group);
    });

    return group;
  }

  /**
   * Add a new detail row to the FormArray
   */
  addDetailRow(): void {
    this.detailRows.push(this.createDetailRow());
    this.cdr.markForCheck();
  }

  /**
   * Remove a detail row at the specified index
   */
  removeDetailRow(index: number): void {
    this.detailRows.removeAt(index);
    this.cdr.markForCheck();
  }

  /**
   * Apply dynamic validators based on detail type
   */
  private applyDynamicValidators(group: FormGroup, detailType: WasteDetailType): void {
    const referenceIdControl = group.get('referenceId');
    const quantityControl = group.get('quantity');
    const wasteAmountControl = group.get('wasteAmount');
    const unitCostControl = group.get('unitCost');

    // Clear all validators first
    referenceIdControl?.clearValidators();
    quantityControl?.clearValidators();
    wasteAmountControl?.clearValidators();
    unitCostControl?.clearValidators();

    if (detailType === WasteDetailType.Item || detailType === WasteDetailType.Material) {
      // Item/Material: require reference, quantity, and unit cost
      referenceIdControl?.setValidators([Validators.required]);
      quantityControl?.setValidators([Validators.required, Validators.min(0.01)]);
      unitCostControl?.setValidators([Validators.min(0)]);
      
      // Add custom validator for stock availability (only for Item/Material)
      if (detailType === WasteDetailType.Item || detailType === WasteDetailType.Material) {
        quantityControl?.addValidators(this.stockAvailabilityValidator.bind(this));
      }
    } else if (detailType === WasteDetailType.Delivery || detailType === WasteDetailType.Purchase || detailType === WasteDetailType.Carry) {
      // Delivery/Purchase/Carry: only require waste amount
      wasteAmountControl?.setValidators([Validators.required, Validators.min(0.01)]);
    }

    // Update validity
    referenceIdControl?.updateValueAndValidity({ emitEvent: false });
    quantityControl?.updateValueAndValidity({ emitEvent: false });
    wasteAmountControl?.updateValueAndValidity({ emitEvent: false });
    unitCostControl?.updateValueAndValidity({ emitEvent: false });
  }

  /**
   * Custom validator for stock availability
   */
  private stockAvailabilityValidator(control: AbstractControl): ValidationErrors | null {
    const group = control.parent as FormGroup;
    if (!group) return null;

    const detailType = group.get('detailType')?.value;
    const referenceId = group.get('referenceId')?.value;
    const quantity = control.value;
    const availableQuantity = group.get('availableQuantity')?.value;

    // Only validate for Item/Material with selected reference
    if ((detailType === WasteDetailType.Item || detailType === WasteDetailType.Material) 
        && referenceId && quantity && availableQuantity !== null) {
      if (quantity > availableQuantity) {
        return { exceedsAvailable: true };
      }
    }

    return null;
  }

  /**
   * Handle detail type change
   */
  private onDetailTypeChange(group: FormGroup, newType: WasteDetailType): void {
    // Clear incompatible values
    group.patchValue({
      referenceId: null,
      deliveryReference: '',
      unitOfMeasure: '',
      availableQuantity: null,
      quantity: null,
      wasteAmount: null,
      unitCost: null,
      total: 0
    }, { emitEvent: false });

    // Apply new validators
    this.applyDynamicValidators(group, newType);
    this.cdr.markForCheck();
  }

  /**
   * Handle reference selection change
   */
  private onReferenceChange(group: FormGroup, referenceId: number): void {
    const detailType = group.get('detailType')?.value;
    
    if (detailType === WasteDetailType.Item || detailType === WasteDetailType.Material) {
      // Find the selected item/material
      const options = detailType === WasteDetailType.Item ? this.itemOptions : this.materialOptions;
      const selected = options.find(opt => opt.value === referenceId);
      
      if (selected) {
        // Update unit of measure
        group.patchValue({
          unitOfMeasure: selected.unitOfMeasure || ''
        }, { emitEvent: false });

        // Fetch available quantity from inventory
        const inventory = this.inventoryStore.getInventoryValue();
        const inventoryItem = inventory.find(inv => inv.ItemId === referenceId);
        
        if (inventoryItem) {
          group.patchValue({
            availableQuantity: inventoryItem.AvailableQuantity,
            unitCost: inventoryItem.AveragePurchasePrice || 0
          }, { emitEvent: false });
        } else {
          group.patchValue({
            availableQuantity: 0,
            unitCost: 0
          }, { emitEvent: false });
        }

        // Revalidate quantity after updating available quantity
        group.get('quantity')?.updateValueAndValidity();
      }
    }
    
    this.cdr.markForCheck();
  }

  /**
   * Calculate total for a detail row
   */
  private calculateTotal(group: FormGroup): void {
    const detailType = group.get('detailType')?.value;
    let total = 0;

    if (detailType === WasteDetailType.Item || detailType === WasteDetailType.Material) {
      const quantity = group.get('quantity')?.value || 0;
      const unitCost = group.get('unitCost')?.value || 0;
      total = quantity * unitCost;
    } else if (detailType === WasteDetailType.Delivery || detailType === WasteDetailType.Purchase || detailType === WasteDetailType.Carry) {
      total = group.get('wasteAmount')?.value || 0;
    }

    group.patchValue({ total }, { emitEvent: false });
    this.cdr.markForCheck();
  }

  /**
   * Get reference options based on detail type
   */
  getReferenceOptions(detailType: WasteDetailType): ReferenceOption[] {
    if (detailType === WasteDetailType.Item) {
      return this.itemOptions;
    } else if (detailType === WasteDetailType.Material) {
      return this.materialOptions;
    }
    return [];
  }

  /**
   * Check if row has validation errors
   */
  hasRowErrors(index: number): boolean {
    const row = this.detailRows.at(index);
    return row.invalid && row.touched;
  }

  /**
   * Check if any rows have quantity exceeded errors
   */
  hasInvalidQuantities(): boolean {
    for (let i = 0; i < this.detailRows.length; i++) {
      const row = this.detailRows.at(i);
      const quantityControl = row.get('quantity');
      if (quantityControl?.hasError('exceedsAvailable')) {
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

    // Map detail rows to backend format
    const wasteOrderItems: CreateWasteItemDto[] = this.detailRows.controls.map(control => {
      const rawValue = control.getRawValue();
      const detailType = rawValue.detailType;
      
      // Map detail type to WasteType enum
      let wasteType: WasteType;
      if (detailType === WasteDetailType.Item) {
        wasteType = WasteType.Items;
      } else if (detailType === WasteDetailType.Material) {
        wasteType = WasteType.Materials;
      } else if (detailType === WasteDetailType.Delivery) {
        wasteType = WasteType.Delivery;
      } else if (detailType === WasteDetailType.Purchase) {
        wasteType = WasteType.Purchase;
      } else {
        wasteType = WasteType.Carry;
      }

      // For Delivery/Purchase/Carry, set quantity to 1 if backend requires it, otherwise use actual quantity
      let quantity: number;
      let cost: number;
      
      if (detailType === WasteDetailType.Delivery || detailType === WasteDetailType.Purchase || detailType === WasteDetailType.Carry) {
        quantity = 1; // Backend requirement for delivery-like types
        cost = rawValue.wasteAmount || 0;
      } else {
        quantity = rawValue.quantity || 0;
        cost = rawValue.total || 0;
      }

      return {
        ItemId: rawValue.referenceId,
        Quantity: quantity,
        WasteType: wasteType,
        Cost: cost
      };
    });

    const payload: CreateWasteDto = {
      WasteDate: this.sharedService.getDateTime(this.form.get('WasteDate')?.value),
      EmployeeEntityId: this.form.get('EmployeeEntityId')?.value,
      Reason: this.form.get('Reason')?.value || null,
      Notes: this.form.get('Notes')?.value || null,
      WasteOrderItems: wasteOrderItems
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
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: this.languageFactor === 'en' ? 'Error' : 'خطأ',
          detail: this.languageFactor === 'en' ? 'An error occurred' : 'حدث خطأ'
        });
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onCancel(): void {
    this.ref.close();
  }
}
