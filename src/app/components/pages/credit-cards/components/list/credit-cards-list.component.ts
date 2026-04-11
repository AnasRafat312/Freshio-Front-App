import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ActionData } from 'src/app/shared/core/normalTableColumn.model';
import { CreditCardModel } from '../../core/models/credit-card.model';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { PrivilegeService } from '../../../privilege/privilege.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { Constant } from 'src/app/core/constants/constant';
import { PrivilegeChecked } from '../../../privilege/interfaces/privilege';
import { FilterType } from 'src/app/shared/core/enums/filter-type.enum';
import { NewDeleteModalComponent } from 'src/app/shared/components/new-delete-modal/new-delete-modal.component';
import { CreditCardsAddEditComponent } from '../add-edit/add-edit.component';
import { CreditCardsDetailsComponent } from '../details/details.component';
import { CreditCardsService } from '../../services/credit-cards.service';
import { CreditCardsStore } from '../../store/credit-cards.store';
import { ResponseModel } from 'src/app/shared/model/response';
import { UsersService } from '../../../users/services/users.service';

@Component({
  selector: 'app-credit-cards-list',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './credit-cards-list.component.html',
  styleUrls: ['./credit-cards-list.component.scss']
})
export class CreditCardsList implements OnInit, OnDestroy {
  mainList: CreditCardModel[] = [];
  filteredList: CreditCardModel[] = [];
  model: any = {};
  actionsList: ActionData[] = [];
  Edit = false;
  Add = false;
  Delete = false;
  Details = false;
  privilegecheckedList!: PrivilegeChecked[];
  ref: DynamicDialogRef | undefined;
  languageFactor = 'en';

  constructor(
    private usersService: UsersService,
    private privilegeService: PrivilegeService,
    private sharedServices: SharedService,
    private language: LanguagesService,
    public dialogService: DialogService,
    private constant: Constant,
    private creditCardsService: CreditCardsService,
    private creditCardsStore: CreditCardsStore
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
      this.mainList = this.creditCardsStore.creditCards();
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
   * Fetch credit cards data from API (service automatically stores in signal)
   */
  getAllRows(): void {
    this.creditCardsService.getCreditCards();
  }

  private initializeModel(): void {
    this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
      this.model = {
        CardHolderName: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Card Holder Name' : 'اسم حامل البطاقة',
        },
        CardNumber: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Card Number' : 'رقم البطاقة',
        },
        CreditLimit: {
          filterType: FilterType.number,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Limit' : 'الحد',
        },
        Balance: {
          filterType: FilterType.number,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Balance' : 'الرصيد',
        },
        Indebtedness: {
          filterType: FilterType.number,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Indebtedness' : 'المديونية',
        },
        PaymentDueDayOfMonth: {
          filterType: FilterType.number,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Payment Due Day' : 'يوم الاستحقاق',
        },
        Status: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Status' : 'الحالة',
        },
        ExpiryDate: {
          filterType: FilterType.date,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Expiry Date' : 'تاريخ الانتهاء',
        },
        /* NationalId: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'National ID' : 'الرقم القومي',
        }, */
        /* Notes: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Notes' : 'ملاحظات',
        }, */
      };
    });
  }

  showActionBaseOnPrivilege(pages: PrivilegeChecked[]) {
    this.actionsList = [];

    pages.forEach((page) => {
      if (page.page === 'CreditCardsList') {
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
  getActionsList() {
    this.actionsList = []
    if(this.Details) {
      this.actionsList.push({
        tooltip: 'Details',
        icon: 'pi pi-eye',
        styleClass: 'p-button-info',
        action: (row: any) => this.rowDetails(row),
      });
    }
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
  addEdit(row?: any): void {
    let header = '';
    if (this.languageFactor == 'en') {
      row ? header = 'Edit Credit Card' : header = 'Add Credit Card';
    } else {
      row ? header = 'تعديل البطاقة الائتمانية' : header = 'إضافة بطاقة ائتمانية';
    }
    
    this.ref = this.dialogService.open(
      CreditCardsAddEditComponent,
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
    
    this.ref.onClose.subscribe((result) => {
      if (result) {
        if (row) {
          // Update existing
          this.creditCardsStore.updateCreditCard(result);
        } else {
          // Add new
          this.creditCardsStore.addCreditCard(result);
        }
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
    const url = `${this.constant.API_ENDPOINT}CreditCards/Delete`;
    this.ref = this.dialogService.open(NewDeleteModalComponent, {
      header: header,
      contentStyle: { overflow: 'auto' },
      data: { url: url, id: ID },
      baseZIndex: 10000,
      styleClass: 'xs-dialog-width',
    });
    this.ref.onClose.subscribe((result) => {
      if (result) {
        this.creditCardsStore.removeCreditCard(ID);
      }
    });
  }

  rowDetails(row: any): void {
    let header = '';
    if (this.languageFactor == 'en') {
      header = 'Credit Card Details';
    } else {
      header = 'تفاصيل البطاقة الائتمانية';
    }
    
    this.ref = this.dialogService.open(
      CreditCardsDetailsComponent,
      {
        header: header,
        contentStyle: { overflow: 'auto' },
        data: row,
        baseZIndex: 10000,
        maximizable: true,
        resizable: true,
        styleClass: 'xl-dialog-width'
      }
    );
  }
}
