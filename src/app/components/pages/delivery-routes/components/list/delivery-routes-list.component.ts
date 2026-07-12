import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { Subscription } from 'rxjs';
import { DeliveryRouteModel } from 'src/app/shared/model/freshio/delivery-route.model';
import { DeliveryRoutesService } from '../../services/delivery-routes.service';
import { DeliveryRoutesStore } from '../../store/delivery-routes.store';
import { FilterType } from 'src/app/shared/core/enums/filter-type.enum';
import { DeliveryRoutesAddEditComponent } from '../add-edit/add-edit.component';
import { DeliveryRoutesDetailsComponent } from '../details/details.component';

@Component({
  selector: 'app-delivery-routes-list',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './delivery-routes-list.component.html',
  styleUrls: ['./delivery-routes-list.component.scss']
})
export class DeliveryRoutesList implements OnInit, OnDestroy {
  mainList: DeliveryRouteModel[] = [];
  filteredList: DeliveryRouteModel[] = [];
  model: any = {};
  languageFactor = 'en';
  languageSubscription: Subscription;
  
  ref: DynamicDialogRef | undefined;

  constructor(
    private language: LanguagesService,
    private deliveryRoutesService: DeliveryRoutesService,
    private deliveryRoutesStore: DeliveryRoutesStore,
    private messageService: MessageService,
    public dialogService: DialogService
  ) {
    this.initializeModel();

    // React to signal changes automatically
    effect(() => {
      const routes = this.deliveryRoutesStore.deliveryRoutes();
      this.mainList = routes;
      this.filteredList = [...routes];
    });
  }

  ngOnInit(): void {
    this.languageSubscription = this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
      this.initializeModel();
    });

    // Load delivery routes
    this.deliveryRoutesService.getDeliveryRoutes();
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
    this.mainList = [];
    this.filteredList = [];
  }

  private initializeModel(): void {
    this.model = {
      RouteDate: {
        filterType: FilterType.multi,
        filterList: [],
        header: this.languageFactor === 'en' ? 'Delivery Date' : 'تاريخ التوصيل',
      },
      DriverName: {
        filterType: FilterType.multi,
        filterList: [],
        header: this.languageFactor === 'en' ? 'Driver' : 'السائق',
      },
      OrdersCount: {
        filterType: FilterType.multi,
        filterList: [],
        header: this.languageFactor === 'en' ? 'Orders Count' : 'عدد الأوردرات',
      },
      TotalDistance: {
        filterType: FilterType.multi,
        filterList: [],
        header: this.languageFactor === 'en' ? 'Total Distance' : 'المسافة الكلية',
      },
      TotalDuration: {
        filterType: FilterType.multi,
        filterList: [],
        header: this.languageFactor === 'en' ? 'Total Duration' : 'المدة الكلية',
      },
      CreatedDate: {
        filterType: FilterType.multi,
        filterList: [],
        header: this.languageFactor === 'en' ? 'Created At' : 'تاريخ الإنشاء',
      },
    };
  }

  getOrdersCount(route: DeliveryRouteModel): number {
    return route.Stops?.length || 0;
  }

  formatDistance(meters?: number): string {
    if (!meters) return '-';
    const km = meters / 1000;
    return `${km.toFixed(2)} ${this.languageFactor === 'en' ? 'km' : 'كم'}`;
  }

  formatDuration(seconds?: number): string {
    if (!seconds) return '-';
    const minutes = Math.round(seconds / 60);
    return `${minutes} ${this.languageFactor === 'en' ? 'min' : 'دقيقة'}`;
  }

  onAdd(): void {
    const header = this.languageFactor === 'en' ? 'Add Delivery Route' : 'إضافة مسار توصيل';
    
    this.ref = this.dialogService.open(
      DeliveryRoutesAddEditComponent,
      {
        header: header,
        contentStyle: { overflow: 'auto' },
        baseZIndex: 10000,
        maximizable: true,
        resizable: true,
        styleClass: 'xl-dialog-width'
      }
    );
    
    this.ref.onClose.subscribe((result) => {
      if (result) {
        this.deliveryRoutesService.getDeliveryRoutes();
      }
    });
  }

  onView(route: DeliveryRouteModel): void {
    const header = this.languageFactor === 'en' ? 'Delivery Route Details' : 'تفاصيل مسار التوصيل';
    
    this.ref = this.dialogService.open(
      DeliveryRoutesDetailsComponent,
      {
        header: header,
        contentStyle: { overflow: 'auto' },
        data: route,
        baseZIndex: 10000,
        maximizable: true,
        resizable: true,
        styleClass: 'xl-dialog-width'
      }
    );
  }

  onOpenGoogleMaps(route: DeliveryRouteModel): void {
    const url = this.generateGoogleMapsUrl(route);
    if (url) {
      window.open(url, '_blank');
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: this.languageFactor === 'en' ? 'Warning' : 'تحذير',
        detail: this.languageFactor === 'en' 
          ? 'Cannot generate route link without enough location data'
          : 'لا يمكن إنشاء رابط مسار بدون بيانات مواقع كافية'
      });
    }
  }

  private generateGoogleMapsUrl(route: DeliveryRouteModel): string | null {
    if (!route.Stops || route.Stops.length === 0) return null;

    const stopsWithLocation = route.Stops.filter(s => s.Latitude && s.Longitude);
    if (stopsWithLocation.length === 0) return null;

    const origin = route.StartLocationLat && route.StartLocationLng
      ? `${route.StartLocationLat},${route.StartLocationLng}`
      : `${stopsWithLocation[0].Latitude},${stopsWithLocation[0].Longitude}`;

    const destination = `${stopsWithLocation[stopsWithLocation.length - 1].Latitude},${stopsWithLocation[stopsWithLocation.length - 1].Longitude}`;

    const waypoints = stopsWithLocation
      .slice(0, -1)
      .map(s => `${s.Latitude},${s.Longitude}`)
      .join('|');

    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
    if (waypoints) {
      url += `&waypoints=${waypoints}`;
    }

    return url;
  }
}
