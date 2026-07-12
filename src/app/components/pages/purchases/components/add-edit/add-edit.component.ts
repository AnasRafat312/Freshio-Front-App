import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { Subscription } from 'rxjs';
import { PurchasesService } from '../../services/purchases.service';
import { CreatePurchaseDto, CreatePurchaseItemDto } from 'src/app/shared/model/freshio/purchase.model';
import { ItemsService } from '../../../items/services/items.service';
import { ItemsStore } from '../../../items/store/items.store';
import { EntitiesService } from '../../../entities/services/entities.service';
import { EntitiesStore } from '../../../entities/store/entities.store';
import { EntityRole } from 'src/app/shared/model/freshio/entity.model';

@Component({
  selector: 'app-purchases-add-edit',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss']
})
export class PurchasesAddEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  languageFactor = 'en';
  isEditMode = false;
  purchaseId: number | null = null;
  languageSubscription: Subscription;
  loading = false;
  
  // Dropdown options
  supplierOptions: any[] = [];
  employeeOptions: any[] = [];
  itemOptions: any[] = [];

  constructor(
    private fb: FormBuilder,
    private language: LanguagesService,
    private messageService: MessageService,
    private purchasesService: PurchasesService,
    private itemsService: ItemsService,
    private itemsStore: ItemsStore,
    private entitiesService: EntitiesService,
    private entitiesStore: EntitiesStore,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.initializeForm();
    
    // React to store changes
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
    
    effect(() => {
      const entities = this.entitiesStore.entities();
      // Filter suppliers
      this.supplierOptions = entities
        .filter(entity => entity.IsSupplier && entity.IsActive)
        .map(entity => ({
          label: entity.Name,
          value: entity.ID
        }));
      
      // Filter employees
      this.employeeOptions = entities
        .filter(entity => entity.IsEmployee && entity.IsActive)
        .map(entity => ({
          label: entity.Name,
          value: entity.ID
        }));
    });
  }

  ngOnInit(): void {
    this.languageSubscription = this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
    });

    // Load dropdown data
    this.loadItems();
    this.loadEntities();

    // Check if opened in dialog with data (edit mode or prefill)
    if (this.config.data) {
      if (this.config.data.ID) {
        // Edit mode
        this.isEditMode = true;
        this.purchaseId = this.config.data.ID;
        this.loadPurchaseData(this.config.data);
      } else if (this.config.data.prefillItems) {
        // Prefill mode (from shortages report)
        this.config.data.prefillItems.forEach((item: any) => {
          this.addItem(item);
        });
      } else {
        // Add at least one empty item row
        this.addItem();
      }
    } else {
      // Add at least one empty item row for new purchase
      this.addItem();
    }
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      PurchaseDate: [new Date(), [Validators.required]],
      SupplierEntityId: [null],
      ExternalSupplierName: [''],
      EmployeeEntityId: [null],
      Notes: [''],
      Items: this.fb.array([], [Validators.required, Validators.minLength(1)])
    });
  }

  get items(): FormArray {
    return this.form.get('Items') as FormArray;
  }

  private loadItems(): void {
    this.itemsService.getItems();
  }

  private loadEntities(): void {
    this.entitiesService.getEntities();
  }

  private loadPurchaseData(data: any): void {
    this.form.patchValue({
      PurchaseDate: new Date(data.PurchaseDate),
      SupplierEntityId: data.SupplierEntityId,
      ExternalSupplierName: data.ExternalSupplierName,
      EmployeeEntityId: data.EmployeeEntityId,
      Notes: data.Notes
    });

    // Load items
    if (data.Items && data.Items.length > 0) {
      data.Items.forEach((item: any) => {
        this.addItem(item);
      });
    }
  }

  addItem(itemData?: any): void {
    const itemGroup = this.fb.group({
      ItemId: [itemData?.ItemId || null, [Validators.required]],
      Quantity: [itemData?.Quantity || 1, [Validators.required, Validators.min(0.01)]],
      UnitPrice: [itemData?.UnitPrice || 0, [Validators.required, Validators.min(0)]],
      LineTotal: [{ value: itemData?.TotalPrice || 0, disabled: true }]
    });

    // Calculate line total when quantity or unit price changes
    itemGroup.get('Quantity')?.valueChanges.subscribe(() => this.calculateLineTotal(itemGroup));
    itemGroup.get('UnitPrice')?.valueChanges.subscribe(() => this.calculateLineTotal(itemGroup));

    this.items.push(itemGroup);
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  private calculateLineTotal(itemGroup: FormGroup): void {
    const quantity = itemGroup.get('Quantity')?.value || 0;
    const unitPrice = itemGroup.get('UnitPrice')?.value || 0;
    const lineTotal = quantity * unitPrice;
    itemGroup.get('LineTotal')?.setValue(lineTotal, { emitEvent: false });
  }

  getTotalAmount(): number {
    let total = 0;
    this.items.controls.forEach((control: any) => {
      const quantity = control.get('Quantity')?.value || 0;
      const unitPrice = control.get('UnitPrice')?.value || 0;
      total += quantity * unitPrice;
    });
    return total;
  }

  hasRequiredValidator(form: FormGroup, controlName: string): boolean {
    const control = form.get(controlName);
    if (control && control.validator) {
      const validator = control.validator({} as any);
      return validator && validator['required'];
    }
    return false;
  }

  onSubmit(): void {
    // Validate supplier
    const supplierEntityId = this.form.get('SupplierEntityId')?.value;
    const externalSupplierName = this.form.get('ExternalSupplierName')?.value;
    
    if (!supplierEntityId && !externalSupplierName) {
      this.messageService.add({
        severity: 'warn',
        summary: this.languageFactor === 'en' ? 'Validation Error' : 'خطأ في التحقق',
        detail: this.languageFactor === 'en' ? 'Please select a supplier or enter external supplier name' : 'يرجى اختيار مورد أو إدخال اسم مورد خارجي'
      });
      return;
    }

    if (this.form.invalid || this.items.length === 0) {
      this.form.markAllAsTouched();
      this.items.controls.forEach(control => control.markAllAsTouched());
      this.messageService.add({
        severity: 'warn',
        summary: this.languageFactor === 'en' ? 'Validation Error' : 'خطأ في التحقق',
        detail: this.languageFactor === 'en' ? 'Please fill all required fields and add at least one item' : 'يرجى ملء جميع الحقول المطلوبة وإضافة صنف واحد على الأقل'
      });
      return;
    }

    this.loading = true;
    
    const purchaseItems: CreatePurchaseItemDto[] = this.items.controls.map((control: any) => ({
      ItemId: control.get('ItemId')?.value,
      Quantity: control.get('Quantity')?.value,
      UnitPrice: control.get('UnitPrice')?.value
    }));

    const purchaseData: CreatePurchaseDto = {
      PurchaseDate: this.form.get('PurchaseDate')?.value,
      SupplierEntityId: supplierEntityId || null,
      ExternalSupplierName: externalSupplierName || null,
      EmployeeEntityId: this.form.get('EmployeeEntityId')?.value || null,
      Notes: this.form.get('Notes')?.value || null,
      PurchaseOrderItems: purchaseItems
    };

    const request = this.isEditMode
      ? this.purchasesService.updatePurchase(this.purchaseId!, purchaseData)
      : this.purchasesService.createPurchase(purchaseData);

    request.subscribe({
      next: (response) => {
        if (response?.Success) {
          this.messageService.add({
            severity: 'success',
            summary: this.languageFactor === 'en' ? 'Success' : 'نجح',
            detail: this.isEditMode
              ? (this.languageFactor === 'en' ? 'Purchase updated successfully' : 'تم تحديث عملية الشراء بنجاح')
              : (this.languageFactor === 'en' ? 'Purchase created successfully' : 'تم إنشاء عملية الشراء بنجاح')
          });
          this.ref.close(response.Data);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: this.languageFactor === 'en' ? 'Error' : 'خطأ',
            detail: response?.Message || (this.languageFactor === 'en' ? 'Operation failed' : 'فشلت العملية')
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
