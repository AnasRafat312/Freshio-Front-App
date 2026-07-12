import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { Subscription } from 'rxjs';
import { WasteOrderModel } from 'src/app/shared/model/freshio/waste.model';
import { WasteService } from '../../services/waste.service';
import { WasteStore } from '../../store/waste.store';
import { FilterType } from 'src/app/shared/core/enums/filter-type.enum';
import { WasteAddEditComponent } from '../add-edit/add-edit.component';
import { WasteDetailsComponent } from '../details/details.component';
import { ActionData } from 'src/app/shared/core/normalTableColumn.model';

@Component({
  selector: 'app-waste-list',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './waste-list.component.html',
  styleUrls: ['./waste-list.component.scss']
})
export class WasteList implements OnInit, OnDestroy {
  mainList: WasteOrderModel[] = [];
  filteredList: WasteOrderModel[] = [];
  model: any = {};
  actionsList: ActionData[] = [];
  languageFactor = 'en';
  languageSubscription: Subscription;
  Add = true;
  Details = true;
  Delete = true;
  
  ref: DynamicDialogRef | undefined;

  constructor(
    private language: LanguagesService,
    private wasteService: WasteService,
    private wasteStore: WasteStore,
    private messageService: MessageService,
    public dialogService: DialogService,
    private confirmationService: ConfirmationService
  ) {
    // React to signal changes automatically
    effect(() => {
      try {
        const wasteRecords = this.wasteStore.wasteRecords();
        this.mainList = wasteRecords || [];
        this.filteredList = [...(wasteRecords || [])];
      } catch (error) {
        console.error('Error in waste records effect:', error);
        this.mainList = [];
        this.filteredList = [];
      }
    });
  }

  ngOnInit(): void {
    this.languageSubscription = this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
      this.initializeModel();
    });

    // Initialize model with current language
    this.initializeModel();
    
    // Initialize actions list
    this.getActionsList();

    // Load waste records
    this.wasteService.getWasteRecords();
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
      WasteNumber: {
        filterType: FilterType.multi,
        filterList: [],
        header: this.languageFactor === 'en' ? 'Waste Number' : 'رقم الهالك',
      },
      WasteDate: {
        filterType: FilterType.date,
        filterList: [],
        header: this.languageFactor === 'en' ? 'Waste Date' : 'تاريخ الهالك',
      },
      EmployeeName: {
        filterType: FilterType.multi,
        filterList: [],
        header: this.languageFactor === 'en' ? 'Employee' : 'الموظف',
      },
      Reason: {
        filterType: FilterType.multi,
        filterList: [],
        header: this.languageFactor === 'en' ? 'Reason' : 'السبب',
      }
    };
  }

  getActionsList(): void {
    this.actionsList = []; // Clear existing actions
    
    if (this.Details) {
      this.actionsList.push({
        tooltip: this.languageFactor === 'en' ? 'View Details' : 'عرض التفاصيل',
        icon: 'pi pi-eye',
        styleClass: 'p-button-info',
        action: (row: WasteOrderModel) => this.onView(row),
      });
    }
    
    if (this.Delete) {
            /* this.actionsList.push({
        tooltip: this.languageFactor === 'en' ? 'Delete' : 'حذف',
        icon: 'pi pi-trash',
        styleClass: 'p-button-danger',
        action: (row: WasteOrderModel) => this.onDelete(row),
      }); */
    }
  }

  onAdd(): void {
    const header = this.languageFactor === 'en' ? 'Add Waste' : 'إضافة هالك';
    
    this.ref = this.dialogService.open(
      WasteAddEditComponent,
      {
        header: header,
        contentStyle: { overflow: 'auto' },
        baseZIndex: 10000,
        maximizable: true,
        resizable: true,
        styleClass: 'xl-dialog-width',
        focusOnShow:false
      }
    );
    
    this.ref.onClose.subscribe((result) => {
      if (result) {
        this.wasteService.getWasteRecords();
      }
    });
  }

  onView(waste: WasteOrderModel): void {
    const header = this.languageFactor === 'en' ? 'Waste Details' : 'تفاصيل الهالك';
    
    this.ref = this.dialogService.open(
      WasteDetailsComponent,
      {
        header: header,
        contentStyle: { overflow: 'auto' },
        data: waste,
        baseZIndex: 10000,
        maximizable: true,
        resizable: true,
        styleClass: 'lg-dialog-width',
        focusOnShow: false
      }
    );
  }

  onDelete(waste: WasteOrderModel): void {
    this.confirmationService.confirm({
      message: this.languageFactor === 'en' 
        ? `Are you sure you want to delete waste record ${waste.WasteNumber}?`
        : `هل أنت متأكد من حذف سجل الهالك ${waste.WasteNumber}؟`,
      header: this.languageFactor === 'en' ? 'Confirm Delete' : 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.languageFactor === 'en' ? 'Yes' : 'نعم',
      rejectLabel: this.languageFactor === 'en' ? 'No' : 'لا',
      accept: () => {
        this.wasteService.deleteWaste(waste.ID!).subscribe({
          next: (response) => {
            if (response?.Success) {
              this.messageService.add({
                severity: 'success',
                summary: this.languageFactor === 'en' ? 'Success' : 'نجح',
                detail: this.languageFactor === 'en' ? 'Waste record deleted successfully' : 'تم حذف سجل الهالك بنجاح'
              });
              this.wasteService.getWasteRecords();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: this.languageFactor === 'en' ? 'Error' : 'خطأ',
                detail: response?.Message || (this.languageFactor === 'en' ? 'Failed to delete waste record' : 'فشل حذف سجل الهالك')
              });
            }
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: this.languageFactor === 'en' ? 'Error' : 'خطأ',
              detail: this.languageFactor === 'en' ? 'An error occurred' : 'حدث خطأ'
            });
          }
        });
      }
    });
  }
}
