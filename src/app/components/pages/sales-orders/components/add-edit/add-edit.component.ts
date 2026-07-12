import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { Subscription } from 'rxjs';
import { SalesOrdersService } from '../../services/sales-orders.service';
import { CreateSalesOrderDto, CreateSalesOrderItemDto, OrderStatus } from 'src/app/shared/model/freshio/sales-order.model';
import { ItemsService } from '../../../items/services/items.service';
import { ItemsStore } from '../../../items/store/items.store';
import { InventoryService } from '../../../inventory/services/inventory.service';
import { InventoryStore } from '../../../inventory/store/inventory.store';
import { EntitiesService } from '../../../entities/services/entities.service';
import { EntitiesStore } from '../../../entities/store/entities.store';
import { EntityRole } from 'src/app/shared/model/freshio/entity.model';
import { SharedService } from 'src/app/shared/services/shared.service';

@Component({
  selector: 'app-sales-orders-add-edit',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss']
})
export class SalesOrdersAddEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  languageFactor = 'en';
  isEditMode = false;
  orderId: number | null = null;
  languageSubscription: Subscription;
  loading = false;
  
  // Dropdown options
  customerOptions: any[] = [];
  itemOptions: any[] = [];
  
  // Inventory map for quick lookup
  inventoryMap: Map<number, number> = new Map();

  constructor(
    private fb: FormBuilder,
    private language: LanguagesService,
    private messageService: MessageService,
    private salesOrdersService: SalesOrdersService,
    private itemsService: ItemsService,
    private itemsStore: ItemsStore,
    private inventoryService: InventoryService,
    private inventoryStore: InventoryStore,
    private entitiesService: EntitiesService,
    private entitiesStore: EntitiesStore,
    private sharedService: SharedService,
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
      this.customerOptions = entities
        .filter(entity => entity.IsCustomer && entity.IsActive)
        .map(entity => ({
          label: entity.Name,
          value: entity.ID
        }));
    });
    
    effect(() => {
      const inventory = this.inventoryStore.inventory();
      this.inventoryMap.clear();
      inventory.forEach(inv => {
        this.inventoryMap.set(inv.ItemId, inv.AvailableQuantity);
      });
    });
  }

  ngOnInit(): void {
    this.languageSubscription = this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
    });

    // Load dropdown data
    this.loadItems();
    this.loadInventory();
    this.loadCustomers();

    // Check if opened in dialog with data (edit mode)
    if (this.config.data) {
      this.isEditMode = true;
      this.orderId = this.config.data.ID;
      // Only allow editing Pending orders
      if (this.config.data.Status !== OrderStatus.Pending) {
        this.messageService.add({
          severity: 'warn',
          summary: this.languageFactor === 'en' ? 'Warning' : 'تحذير',
          detail: this.languageFactor === 'en' ? 'Only pending orders can be edited' : 'يمكن تعديل الأوردرات المعلقة فقط'
        });
        this.ref.close();
        return;
      }
      this.loadOrderData(this.config.data);
    } else {
      // Add at least one empty item row for new order
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
      CustomerEntityId: [null, [Validators.required]],
      OrderDate: [new Date(), [Validators.required]],
      DeliveryFees: [0, [Validators.min(0)]],
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

  private loadInventory(): void {
    this.inventoryService.getInventory();
  }

  private loadCustomers(): void {
    this.entitiesService.getEntities();
  }

  private loadOrderData(data: any): void {
    this.form.patchValue({
      CustomerEntityId: data.CustomerEntityId,
      OrderDate: new Date(data.OrderDate),
      DeliveryFees: data.DeliveryFees || 0,
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
      AvailableQuantity: [{ value: itemData?.AvailableQuantity || 0, disabled: true }],
      RequestedQuantity: [itemData?.RequestedQuantity || 1, [Validators.required, Validators.min(0.01)]],
      UnitPrice: [itemData?.UnitPrice || 0, [Validators.required, Validators.min(0)]],
      LineTotal: [{ value: itemData?.LineTotal || 0, disabled: true }],
      Notes: [itemData?.Notes || '']
    });

    // Update available quantity when item changes
    itemGroup.get('ItemId')?.valueChanges.subscribe((itemId) => {
      if (itemId) {
        const availableQty = this.inventoryMap.get(itemId) || 0;
        itemGroup.get('AvailableQuantity')?.setValue(availableQty);
      }
    });

    // Calculate line total when quantity or unit price changes
    itemGroup.get('RequestedQuantity')?.valueChanges.subscribe(() => this.calculateLineTotal(itemGroup));
    itemGroup.get('UnitPrice')?.valueChanges.subscribe(() => this.calculateLineTotal(itemGroup));

    // Set initial available quantity if itemData provided
    if (itemData?.ItemId) {
      const availableQty = this.inventoryMap.get(itemData.ItemId) || 0;
      itemGroup.get('AvailableQuantity')?.setValue(availableQty);
    }

    this.items.push(itemGroup);
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  private calculateLineTotal(itemGroup: FormGroup): void {
    const quantity = itemGroup.get('RequestedQuantity')?.value || 0;
    const unitPrice = itemGroup.get('UnitPrice')?.value || 0;
    const lineTotal = quantity * unitPrice;
    itemGroup.get('LineTotal')?.setValue(lineTotal, { emitEvent: false });
  }

  getTotalAmount(): number {
    let total = 0;
    this.items.controls.forEach((control: any) => {
      const quantity = control.get('RequestedQuantity')?.value || 0;
      const unitPrice = control.get('UnitPrice')?.value || 0;
      total += quantity * unitPrice;
    });
    const deliveryFees = this.form.get('DeliveryFees')?.value || 0;
    return total + deliveryFees;
  }

  /**
   * Check if requested quantity exceeds available quantity
   */
  hasStockWarning(itemGroup: FormGroup): boolean {
    const requested = itemGroup.get('RequestedQuantity')?.value || 0;
    const available = itemGroup.get('AvailableQuantity')?.value || 0;
    return requested > available;
  }

  /**
   * Get stock warning message
   */
  getStockWarningMessage(): string {
    return this.languageFactor === 'en' 
      ? 'Requested quantity is greater than current stock. The shortage will appear in the shortage report.'
      : 'الكمية المطلوبة أكبر من المتاح حاليًا. سيظهر العجز في تقرير النواقص.';
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
    
    const orderItems: CreateSalesOrderItemDto[] = this.items.controls.map((control: any) => ({
      ItemId: control.get('ItemId')?.value,
      RequestedQuantity: control.get('RequestedQuantity')?.value,
      UnitPrice: control.get('UnitPrice')?.value,
      Notes: control.get('Notes')?.value || null
    }));

    const orderData: CreateSalesOrderDto = {
      CustomerEntityId: this.form.get('CustomerEntityId')?.value,
      OrderDate: this.sharedService.getDateTime(this.form.get('OrderDate')?.value) ,
      DeliveryFees: this.form.get('DeliveryFees')?.value || 0,
      Notes: this.form.get('Notes')?.value || null,
      SalesOrderItems: orderItems
    };

    const request = this.isEditMode
      ? this.salesOrdersService.updateSalesOrder(this.orderId!, orderData)
      : this.salesOrdersService.createSalesOrder(orderData);

    request.subscribe({
      next: (response) => {
        if (response?.Success) {
          this.messageService.add({
            severity: 'success',
            summary: this.languageFactor === 'en' ? 'Success' : 'نجح',
            detail: this.isEditMode
              ? (this.languageFactor === 'en' ? 'Order updated successfully' : 'تم تحديث الأوردر بنجاح')
              : (this.languageFactor === 'en' ? 'Order created successfully' : 'تم إنشاء الأوردر بنجاح')
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
