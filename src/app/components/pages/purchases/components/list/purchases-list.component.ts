import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ActionData } from 'src/app/shared/core/normalTableColumn.model';
import { PurchaseOrderModel } from 'src/app/shared/model/freshio/purchase.model';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { SharedService } from 'src/app/shared/services/shared.service';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { Constant } from 'src/app/core/constants/constant';
import { FilterType } from 'src/app/shared/core/enums/filter-type.enum';
import { NewDeleteModalComponent } from 'src/app/shared/components/new-delete-modal/new-delete-modal.component';
import { PurchasesAddEditComponent } from '../add-edit/add-edit.component';
import { PurchasesDetailsComponent } from '../details/details.component';
import { PurchasesService } from '../../services/purchases.service';
import { PurchasesStore } from '../../store/purchases.store';

@Component({
  selector: 'app-purchases-list',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './purchases-list.component.html',
  styleUrls: ['./purchases-list.component.scss']
})
export class PurchasesList implements OnInit, OnDestroy {
  mainList: PurchaseOrderModel[] = [];
  filteredList: PurchaseOrderModel[] = [];
  model: any = {};
  actionsList: ActionData[] = [];
  Add = true;
  Details = true;
  // Edit and Delete may not be supported - check service capabilities
  Edit = true;
  Delete = true;
  ref: DynamicDialogRef | undefined;
  languageFactor = 'en';

  constructor(
    private purchasesService: PurchasesService,
    private sharedServices: SharedService,
    private language: LanguagesService,
    public dialogService: DialogService,
    private constant: Constant,
    private purchasesStore: PurchasesStore
  ) {
    this.initializeModel();

    // React to signal changes automatically
    effect(() => {
      this.mainList = this.purchasesStore.purchases();
      this.filteredList = [...this.mainList];
    });
  }

  ngOnInit(): void {
    this.getAllRows();
    this.getActionsList();
  }

  ngOnDestroy(): void {
    this.mainList = [];
    this.filteredList = [];
  }

  /**
   * Fetch purchases data from API
   */
  getAllRows(): void {
    this.purchasesService.getPurchases();
  }

  private initializeModel(): void {
    this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
      this.model = {
        PurchaseNumber: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Purchase #' : 'رقم الشراء',
        },
        PurchaseDate: {
          filterType: FilterType.date,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Date' : 'التاريخ',
        },
        SupplierName: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Supplier' : 'المورد',
        },
        EmployeeName: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Employee' : 'الموظف',
        },
        TotalAmount: {
          filterType: FilterType.number,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Total' : 'الإجمالي',
        }
      };
    });
  }

  getActionsList() {
    if(this.Details) {
      this.actionsList.push({
        tooltip: this.languageFactor === 'en' ? 'Details' : 'تفاصيل',
        icon: 'pi pi-eye',
        styleClass: 'p-button-info',
        action: (row: any) => this.rowDetails(row),
      });
    }
    if(this.Edit) {
      this.actionsList.push({
        tooltip: this.languageFactor === 'en' ? 'Edit' : 'تعديل',
        icon: 'pi pi-pencil',
        styleClass: 'p-button-warning',
        action: (row: any) => this.addEdit(row),
      });
    }
    if(this.Delete) {
      this.actionsList.push({
        tooltip: this.languageFactor === 'en' ? 'Delete' : 'حذف',
        icon: 'pi pi-trash',
        styleClass: 'p-button-danger',
        action: (row: any) => this.deleteRow(row.ID),
      });
    }
  }

  addEdit(row?: any): void {
    let header = '';
    if (this.languageFactor == 'en') {
      row ? header = 'Edit Purchase' : header = 'Add Purchase';
    } else {
      row ? header = 'تعديل عملية شراء' : header = 'إضافة عملية شراء';
    }
    
    this.ref = this.dialogService.open(
      PurchasesAddEditComponent,
      {
        header: header,
        contentStyle: { overflow: 'auto' },
        data: row,
        baseZIndex: 10000,
        maximizable: true,
        resizable: true,
        styleClass: 'xl-dialog-width',
        focusOnShow: false
      }
    );
    
    this.ref.onClose.subscribe((product) => {
      if (product) {
        row ? this.purchasesStore.updatePurchase(product):
        this.purchasesStore.addPurchase(product)
      }
    });
  }

  deleteRow(ID: number): void {
    debugger
    let header = '';
    if (this.languageFactor == 'en') {
      header = 'Delete';
    } else {
      header = 'حذف';
    }
    let url = this.constant.API_ENDPOINT + `PurchaseOrder/DeletePurchaseOrder`;
    
    this.ref = this.dialogService.open(NewDeleteModalComponent, {
      header: header,
      contentStyle: { overflow: 'auto' },
      data: { url: url, id: ID },
      baseZIndex: 10000,
      styleClass: 'xs-dialog-width',
      focusOnShow: false
    });
    this.ref.onClose.subscribe((product) => {
      if (product) {
        this.purchasesStore.removePurchase(ID);
      }
    });
  }

  rowDetails(row: any): void {
    let header = '';
    if (this.languageFactor == 'en') {
      header = 'Purchase Details';
    } else {
      header = 'تفاصيل عملية الشراء';
    }
    
    this.ref = this.dialogService.open(
      PurchasesDetailsComponent,
      {
        header: header,
        contentStyle: { overflow: 'auto' },
        data: row,
        baseZIndex: 10000,
        maximizable: true,
        resizable: true,
        styleClass: 'xl-dialog-width',
        focusOnShow: false
      }
    );
  }

  refresh(): void {
    this.getAllRows();
  }
}
