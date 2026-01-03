import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ActionData } from 'src/app/shared/core/normalTableColumn.model';
import { BankAccountModel } from '../../core/models/bank-account.model';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { UsersService } from '../../../users/users.service';
import { PrivilegeService } from '../../../privilege/privilege.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { Constant } from 'src/app/core/constants/constant';
import { PrivilegeChecked } from '../../../privilege/interfaces/privilege';
import { FilterType } from 'src/app/shared/core/enums/filter-type.enum';
import { NewDeleteModalComponent } from 'src/app/shared/components/new-delete-modal/new-delete-modal.component';
import { BankAccountsAddEditComponent } from '../add-edit/add-edit.component';

@Component({
  selector: 'app-bank-accounts-list',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './bank-accounts-list.component.html',
  styleUrls: ['./bank-accounts-list.component.scss']
})
export class BankAccountsList implements OnInit, OnDestroy {
  mainList: BankAccountModel[] = [];
  filteredList: BankAccountModel[] = [];
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
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {

  }

  private initializeModel(): void {
    this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
      this.model = {
        AccountHolderName: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Account Holder Name' : 'اسم صاحب الحساب',
        },
        PhoneNumber: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Phone Number' : 'رقم التيليفون',
        },
        BankName: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Bank Name' : 'اسم البنك',
        },
        AccountNumber: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Account Number' : 'رقم الحساب',
        },
        IBAN: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'IBAN' : 'الآيبان',
        },
        Balance: {
          filterType: FilterType.number,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Balance' : 'الرصيد',
        },
      };
    });
  }

  showActionBaseOnPrivilege(pages: PrivilegeChecked[]) {
    this.actionsList = [];

    pages.forEach((page) => {
      if (page.page === 'BankAccountsList') {
        page.actions.forEach((action) => {
          if (action === 'Delete') {
            this.Delete = true;
            this.actionsList.push({
              tooltip: 'Delete ',
              icon: 'pi pi-trash',
              styleClass: 'p-button-danger',
              action: (row: any) => this.deleteRow(row.ID),
            });
          }
          else if (action === 'Add') {
            this.Add = true;
          }
          else if (action === 'Edit') {
            this.Edit = true;
            this.actionsList.push({
              tooltip: 'Edit',
              icon: 'pi pi-pencil',
              styleClass: 'p-button-warning',
              action: (row: any) => this.addEdit(row),
            });
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
      row ? header = 'Edit Bank Account' : header = 'Add Bank Account';
    } else {
      row ? header = 'تعديل الحساب البنكي' : header = 'إضافة حساب بنكي';
    }
    
    this.ref = this.dialogService.open(
      BankAccountsAddEditComponent,
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
        //this.getAllRows();
      }
    });
  }

  deleteRow(row: any): void {
    let header = '';
    if (this.languageFactor == 'en') {
      header = 'Delete';
    } else {
      header = 'حذف';
    }
    let url = this.constant.SRM_API_ENDPOINT + `BankAccounts/Delete`;
    let model = {
      DeletedBy: JSON.parse(localStorage.getItem('userId')),
      DeletedDateTime: this.sharedServices.getDateTime(new Date()),
      ItemID: row.ID,
    };
    this.ref = this.dialogService.open(NewDeleteModalComponent, {
      header: header,
      contentStyle: { overflow: 'auto' },
      data: { url: url, id: model.ItemID },
      baseZIndex: 10000,
      styleClass: 'xs-dialog-width',
    });
    this.ref.onClose.subscribe((product) => {
      if (product) {
        //this.getAllRows();
      }
    });
  }

  rowDetails(row: any): void {

  }
}
