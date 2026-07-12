import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { Subscription } from 'rxjs';
import { DeliveryRoutesService } from '../../services/delivery-routes.service';
import { CreateDeliveryRouteDto } from 'src/app/shared/model/freshio/delivery-route.model';
import { EntitiesService } from '../../../entities/services/entities.service';
import { EntitiesStore } from '../../../entities/store/entities.store';
import { SalesOrdersService } from '../../../sales-orders/services/sales-orders.service';
import { SalesOrdersStore } from '../../../sales-orders/store/sales-orders.store';
import { EntityRole } from 'src/app/shared/model/freshio/entity.model';
import { OrderStatus } from 'src/app/shared/model/freshio/sales-order.model';

@Component({
  selector: 'app-delivery-routes-add-edit',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss']
})
export class DeliveryRoutesAddEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  languageFactor = 'en';
  languageSubscription: Subscription;
  loading = false;
  
  driverOptions: any[] = [];
  availableOrders: any[] = [];
  selectedOrders: any[] = [];
  
  constructor(
    private fb: FormBuilder,
    private language: LanguagesService,
    private deliveryRoutesService: DeliveryRoutesService,
    private entitiesService: EntitiesService,
    private entitiesStore: EntitiesStore,
    private salesOrdersService: SalesOrdersService,
    private salesOrdersStore: SalesOrdersStore,
    private messageService: MessageService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.languageSubscription = this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
    });

    this.loadDrivers();
    this.loadEligibleOrders();
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      RouteDate: [new Date(), [Validators.required]],
      DriverEntityId: [null, [Validators.required]],
      StartLocationLat: [null],
      StartLocationLng: [null],
      StartLocationAddress: ['']
    });
  }

  private loadDrivers(): void {
    this.entitiesService.getEntities();
    const entities = this.entitiesStore.getEntitiesValue();
    
    this.driverOptions = entities
      .filter(entity => entity.IsDriver && entity.IsActive)
      .map(entity => ({
        label: entity.Name,
        value: entity.ID
      }));
  }

  private loadEligibleOrders(): void {
    this.salesOrdersService.getSalesOrders();
    const orders = this.salesOrdersStore.getSalesOrdersValue();
    
    this.availableOrders = orders.filter(order => 
      order.Status === OrderStatus.Approved || order.Status === OrderStatus.PartiallyApproved
    );
  }

  onOrderSelectionChange(event: any): void {
    this.selectedOrders = event.value;
  }

  moveUp(index: number): void {
    if (index > 0) {
      const temp = this.selectedOrders[index];
      this.selectedOrders[index] = this.selectedOrders[index - 1];
      this.selectedOrders[index - 1] = temp;
      this.selectedOrders = [...this.selectedOrders];
    }
  }

  moveDown(index: number): void {
    if (index < this.selectedOrders.length - 1) {
      const temp = this.selectedOrders[index];
      this.selectedOrders[index] = this.selectedOrders[index + 1];
      this.selectedOrders[index + 1] = temp;
      this.selectedOrders = [...this.selectedOrders];
    }
  }

  removeOrder(index: number): void {
    this.selectedOrders.splice(index, 1);
    this.selectedOrders = [...this.selectedOrders];
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

    if (this.selectedOrders.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: this.languageFactor === 'en' ? 'Validation Error' : 'خطأ في التحقق',
        detail: this.languageFactor === 'en' ? 'Please select at least one order' : 'يرجى اختيار أوردر واحد على الأقل'
      });
      return;
    }

    this.loading = true;

    const payload: CreateDeliveryRouteDto = {
      RouteDate: this.form.get('RouteDate')?.value,
      DriverEntityId: this.form.get('DriverEntityId')?.value,
      StartLocationLat: this.form.get('StartLocationLat')?.value,
      StartLocationLng: this.form.get('StartLocationLng')?.value,
      StartLocationAddress: this.form.get('StartLocationAddress')?.value,
      OrderIds: this.selectedOrders.map(order => order.ID)
    };

    this.deliveryRoutesService.createDeliveryRoute(payload).subscribe({
      next: (response) => {
        if (response?.Success) {
          this.messageService.add({
            severity: 'success',
            summary: this.languageFactor === 'en' ? 'Success' : 'نجح',
            detail: this.languageFactor === 'en' ? 'Delivery route created successfully' : 'تم إنشاء مسار التوصيل بنجاح'
          });
          this.ref.close(true);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: this.languageFactor === 'en' ? 'Error' : 'خطأ',
            detail: response?.Message || (this.languageFactor === 'en' ? 'Failed to create delivery route' : 'فشل إنشاء مسار التوصيل')
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
