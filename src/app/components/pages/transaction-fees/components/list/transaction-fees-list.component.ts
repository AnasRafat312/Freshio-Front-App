import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ActionData } from 'src/app/shared/core/normalTableColumn.model';
import { TransactionFeeModel } from '../../core/models/transaction-fee.model';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { PrivilegeService } from '../../../privilege/privilege.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { Constant } from 'src/app/core/constants/constant';
import { PrivilegeChecked } from '../../../privilege/interfaces/privilege';
import { FilterType } from 'src/app/shared/core/enums/filter-type.enum';
import { NewDeleteModalComponent } from 'src/app/shared/components/new-delete-modal/new-delete-modal.component';
import { TransactionFeesAddEditComponent } from '../add-edit/add-edit.component';
import { TransactionFeesDetailsComponent } from '../details/details.component';
import { TransactionFeesService } from '../../services/transaction-fees.service';
import { TransactionFeesStore } from '../../store/transaction-fees.store';
import { ResponseModel } from 'src/app/shared/model/response';

@Component({
  selector: 'app-transaction-fees-list',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './transaction-fees-list.component.html',
  styleUrls: ['./transaction-fees-list.component.scss']
})
export class TransactionFeesList implements OnInit, OnDestroy {
  mainList: TransactionFeeModel[] = [];
  filteredList: TransactionFeeModel[] = [];
  model: any = {};
  actionsList: ActionData[] = [];
  Edit = true;
  Add = true;
  Delete = true;
  Details = true;
  privilegecheckedList!: PrivilegeChecked[];
  ref: DynamicDialogRef | undefined;
  languageFactor = 'en';

  constructor(
    private privilegeService: PrivilegeService,
    private sharedServices: SharedService,
    private language: LanguagesService,
    public dialogService: DialogService,
    private constant: Constant,
    private transactionFeesService: TransactionFeesService,
    private transactionFeesStore: TransactionFeesStore
  ) {
    this.initializeModel();
    this.privilegeService.checkedPrivilegeList.subscribe((data) => {
      this.Edit = true;
      this.Add = true;
      this.Delete = true;
      this.Details = true;
      this.privilegecheckedList = data;
      this.showActionBaseOnPrivilege(this.privilegecheckedList);
    });
    this.getActionsList(); // Call after privileges are set
    // React to signal changes automatically
    effect(() => {
      this.mainList = this.transactionFeesStore.transactionFees();
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
   * Fetch transaction fees data from API (service automatically stores in signal)
   */
  getAllRows(): void {
    this.transactionFeesService.getTransactionFees().subscribe({
      next: (res: ResponseModel) => {
        // Service already stored in signal via tap operator
        // Now assign to mainList and filteredList
        this.mainList = this.transactionFeesService.getTransactionFeesValue();
        this.filteredList = [...this.mainList];
      },
      error: (error) => {
        console.error('Error loading transaction fees:', error);
      }
    });
  }

  private initializeModel(): void {
    this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
      this.model = {
        Name: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Name' : 'الاسم',
        },
        /* Description: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Description' : 'الوصف',
        }, */
        FeeType: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Fee Type' : 'نوع الرسوم',
        },
        Value: {
          filterType: FilterType.number,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Value' : 'القيمة',
        },
        IsActive: {
          filterType: FilterType.checkbox,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Status' : 'الحالة',
        },
      };
    });
  }
  getActionsList() {
    this.actionsList = []
    if(this.Edit) {
      this.actionsList.push({
        tooltip: 'Edit',
        icon: 'pi pi-pencil',
        styleClass: 'p-button-warning',
        action: (row: any) => this.addEdit(row),
      });
    }
    if(this.Delete) {
      this.actionsList.push({
        tooltip: 'Delete ',
        icon: 'pi pi-trash',
        styleClass: 'p-button-danger',
        action: (row: any) => this.deleteRow(row.Id),
      });
    }
  }
  showActionBaseOnPrivilege(pages: PrivilegeChecked[]) {
    this.actionsList = [];

    pages.forEach((page) => {
      if (page.page === 'TransactionFeesList') {
        page.actions.forEach((action) => {
          if (action === 'Delete') {
            this.Delete = true;
          }
          else if (action === 'Add') {
            this.Add = true;
          }
          else if (action === 'Edit') {
            this.Edit = true;
          }
          else if (action === 'Details') {
            this.Details = true;
            this.actionsList.push({
              tooltip: 'Details',
              icon: 'pi pi-eye',
              styleClass: 'p-button-info',
              action: (row: any) => this.rowDetails(row),
            });
          }
        });
      }
    });
  }

  addEdit(row?: any): void {
    let header = '';
    if (this.languageFactor == 'en') {
      row ? header = 'Edit Transaction Fee' : header = 'Add Transaction Fee';
    } else {
      row ? header = 'تعديل رسوم المعاملة' : header = 'إضافة رسوم معاملة';
    }
    
    this.ref = this.dialogService.open(
      TransactionFeesAddEditComponent,
      {
        header: header,
        contentStyle: { overflow: 'auto' },
        data: row,
        baseZIndex: 10000,
        maximizable: true,
        resizable: true,
        styleClass: 'lg-dialog-width'
      }
    );
    
    this.ref.onClose.subscribe((product) => {
      if (product) {
        row ? this.transactionFeesStore.updateTransactionFee(product):this.transactionFeesStore.addTransactionFee(product)
      }
    });
  }

  deleteRow(ID: number): void {
    let header = '';
    if (this.languageFactor == 'en') {
      header = 'Delete';
    } else {
      header = 'حذف';
    }
    let url = this.constant.API_ENDPOINT + `Fees/Delete`;

    this.ref = this.dialogService.open(NewDeleteModalComponent, {
      header: header,
      contentStyle: { overflow: 'auto' },
      data: { url: url, id: ID },
      baseZIndex: 10000,
      styleClass: 'xs-dialog-width',
    });
    this.ref.onClose.subscribe((product) => {
      if (product) {
        this.transactionFeesStore.removeTransactionFee(product)
      }
    });
  }

  rowDetails(row: any): void {
    let header = '';
    if (this.languageFactor == 'en') {
      header = 'Transaction Fee Details';
    } else {
      header = 'تفاصيل رسوم المعاملة';
    }
    
    this.ref = this.dialogService.open(
      TransactionFeesDetailsComponent,
      {
        header: header,
        contentStyle: { overflow: 'auto' },
        data: row,
        baseZIndex: 10000,
        maximizable: true,
        resizable: true,
        styleClass: 'md-dialog-width'
      }
    );
  }
}
