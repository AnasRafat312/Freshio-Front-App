import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ActionData } from 'src/app/shared/core/normalTableColumn.model';
import { WalletModel } from '../../core/models/wallet.model';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { PrivilegeService } from '../../../privilege/privilege.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { WalletsService } from '../../services/wallets.service';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { Constant } from 'src/app/core/constants/constant';
import { PrivilegeChecked } from '../../../privilege/interfaces/privilege';
import { FilterType } from 'src/app/shared/core/enums/filter-type.enum';
import { NewDeleteModalComponent } from 'src/app/shared/components/new-delete-modal/new-delete-modal.component';
import { WalletsAddEditComponent } from '../add-edit/add-edit.component';
import { WalletsDetailsComponent } from '../details/details.component';
import { WalletsStore } from '../../store/wallets.store';
import { ResponseModel } from 'src/app/shared/model/response';

@Component({
  selector: 'app-wallets-list',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './wallets-list.component.html',
  styleUrls: ['./wallets-list.component.scss']
})
export class WalletsList implements OnInit, OnDestroy {
  mainList: WalletModel[] = [];
  filteredList: WalletModel[] = [];
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
    private walletsService: WalletsService,
    private walletsStore: WalletsStore,
  ) {
    this.initializeModel();
    this.privilegeService.checkedPrivilegeList.subscribe((data) => {
      this.Edit = true;
      this.Add = true;
      this.Delete = true;
      this.Details = true;
      this.privilegecheckedList = data;
      this.showActionBaseOnPrivilege(this.privilegecheckedList);
      this.getActionsList(); // Call after privileges are set
    });

    // React to signal changes automatically
    effect(() => {
      debugger
      this.mainList = this.walletsStore.wallets();
      this.filteredList = [...this.mainList];
    });
  }

  ngOnInit(): void {
    this.getAllRows();
  }

  ngOnDestroy(): void {
    this.mainList = []
    this.filteredList = []
  }

  /**
   * Fetch wallets data from API (service automatically stores in signal)
   */
  getAllRows(): void {
    this.walletsService.getElectronicWallets();
  }

  private initializeModel(): void {
    this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
      this.model = {
        PhoneNumber: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Phone Number' : 'رقم التيليفون',
        },
        Name: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Name' : 'الأسم',
        },
        /* NationalId: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'National ID' : 'الرقم القومي',
        }, */
        MonthlyLimit: {
          filterType: FilterType.number,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Monthly Limit' : 'الحد الشهري',
        },
        MonthlyUsed: {
          filterType: FilterType.number,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Monthly Used' : 'الإستخدام الشهري',
        },
        DailyLimit: {
          filterType: FilterType.number,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Daily Limit' : 'الحد اليومي',
        },
        DailyUsed: {
          filterType: FilterType.number,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Daily Used' : 'الإستخدام اليومي',
        },
        Balance: {
          filterType: FilterType.number,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Balance' : 'الرصيد',
        },
        Status: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Status' : 'الحالة',
        },
        Provider: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Provider' : 'المقدم',
        },
      };
    });
  }

  showActionBaseOnPrivilege(pages: PrivilegeChecked[]) {
    this.actionsList = [];

    pages.forEach((page) => {
      if (page.page === 'WalletsList') {
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
    debugger
    let header = '';
    if (this.languageFactor == 'en') {
      row ? header = 'Edit Wallet' : header = 'Add Wallet';
    } else {
      row ? header = 'تعديل المحفظة' : header = 'إضافة محفظة';
    }
    
    this.ref = this.dialogService.open(
      WalletsAddEditComponent,
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
        if(row) {
          this.walletsStore.updateWallet(product)
        }
        else {
          this.walletsStore.addWallet(product)
        }
      }
    });
  }

  deleteRow(id: any): void {
    let header = '';
    if (this.languageFactor == 'en') {
      header = 'Delete';
    } else {
      header = 'حذف';
    }
    let url = this.constant.API_ENDPOINT + `ElectronicWallets/Delete`;
    this.ref = this.dialogService.open(NewDeleteModalComponent, {
      header: header,
      contentStyle: { overflow: 'auto' },
      data: { url: url, id: id },
      baseZIndex: 10000,
      styleClass: 'xs-dialog-width',
    });
    this.ref.onClose.subscribe((product) => {
      if (product) {
        this.walletsStore.removeWallet(id)
      }
    });
  }

  rowDetails(row: any): void {
    let header = '';
    if (this.languageFactor == 'en') {
      header = 'Wallet Details';
    } else {
      header = 'تفاصيل المحفظة';
    }
    
    this.ref = this.dialogService.open(
      WalletsDetailsComponent,
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
