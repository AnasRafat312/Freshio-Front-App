import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddCompanyComponent } from './add-company/add-company.component';
import { CompainesService } from './compaines.service';
import { Constant } from 'src/app/core/constants/constant';
import { DeleteModalComponent } from 'src/app/shared/components/delete-modal/delete-modal.component';
import { GeneralConfig } from 'src/app/core/common/generalConfig';
import { LanguageService } from 'src/app/core/languageLocalization/language.service';
import { PrivilegeChecked } from '../privilege/interfaces/privilege';
import { PrivilegeService } from '../privilege/privilege.service';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { PageNaming } from 'src/app/shared/components/page-info/core/page-naming';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FilterType } from 'src/app/shared/core/enums/filter-type.enum';

@Component({
  templateUrl: './compaines.component.html',
  styleUrls: ['./compaines.component.scss'],
})
export class CompainesComponent extends GeneralConfig implements OnInit, OnDestroy {
  compaines: any[] = [];
  filteredCompaines: any[] = [];
  cols: any[] = [];
  model: any = {};
  actionsList: {
    icon: string;
    tooltip: string;
    styleClass: string;
    action: (row: any, index?: number) => void;
    condition?: (row: any) => boolean;
  }[] = [];
  rowsPerPageOptions = [5, 10, 20];
  EditCompany = false;
  AddCompany = false;
  DeleteCompany = false;
  privilegecheckedList!: PrivilegeChecked[];
  languageFactor = 'ar';
  ref: DynamicDialogRef | undefined;

  constructor(
    private constant: Constant,
    private compainesService: CompainesService,
    languageService: LanguageService,
    private language: LanguagesService,
    public dialog: MatDialog,
    private privilegeService: PrivilegeService,
    private sharedService: SharedService,
    public dialogService: DialogService
  ) {
    super(languageService);
    sharedService.setPageLocalName(PageNaming.COMPANIES);

    this.initializeModel();

    this.privilegeService.checkedPrivilegeList.subscribe((data) => {
      this.EditCompany = false;
      this.AddCompany = false;
      this.DeleteCompany = false;
      this.privilegecheckedList = data;
      this.showActionBaseOnPrivilege(this.privilegecheckedList);
    });
  }

  ngOnInit() {
    this.getCompaines();
    this.compainesService.compantSubject.subscribe(() => this.getCompaines());
  }

  private initializeModel(): void {
    this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;

      this.model = {
        ProfilePicture: { hideSorting: false, filterType: 10, header: this.languageFactor === 'en' ? 'Logo' : 'الشعار' },
        Name: { filterType: FilterType.multi, filterList: [], header: this.languageFactor === 'en' ? 'Name' : 'الأسم' },
        Phone: { filterType: FilterType.multi, filterList: [], header: this.languageFactor === 'en' ? 'Phone' : 'رقم الهاتف' },
        Email: { filterType: FilterType.multi, filterList: [], header: this.languageFactor === 'en' ? 'Email' : 'البريد الالكتروني' },
        Location: { filterType: FilterType.multi, filterList: [], header: this.languageFactor === 'en' ? 'Location' : 'الموقع' }
      };
    });
  }

showActionBaseOnPrivilege(pages: PrivilegeChecked[]) {
    this.actionsList = [];

    pages.forEach(page => {
        if (page.page === 'CompaniesList') {
            page.actions.forEach(action => {
                if (action === 'DeleteCompany') {
                    this.DeleteCompany = true;
                    this.actionsList.push({
                        tooltip: 'Delete Company',
                        icon: 'pi pi-trash',
                        styleClass: 'p-button-danger',
                        action: (row: any, index: number) => this.delete(row.ID)
                    });
                }
                else if (action === 'AddCompany') {
                    this.AddCompany = true;
                }
                else if (action === 'EditCompany') {
                    this.EditCompany = true;
                    this.actionsList.push({
                        tooltip: 'Edit Company',
                        icon: 'pi pi-pencil',
                        styleClass: 'p-button-warning',
                        action: (row: any, index: number) => this.openForm(row)
                    });
                }
            });
        }
    });
}

  getCompaines() {
    this.compainesService.getAllCompaines().subscribe((res) => {
      this.compaines = res;
      this.filteredCompaines = [...res];
    });
  }

  openForm(company?: any) {
    const header = this.languageFactor === 'en'
      ? (company ? 'Edit Company' : 'Add Company')
      : (company ? 'تعديل الشركة' : 'إضافة الشركة');

    this.ref = this.dialogService.open(AddCompanyComponent, {
      header,
      contentStyle: { overflow: 'auto' },
      data: { rowData: company },
      baseZIndex: 10000,
      maximizable: true,
      resizable: true,
      styleClass: 'md-dialog-width',
    });

    this.ref.onClose.subscribe((result) => {
      if (result) this.getCompaines();
    });
  }

    delete(companyId: number) {
        const url = this.constant.GETWAY_API_ENDPOINT + 'Company/DeleteCompanyByID';
        const dialogRef = this.dialog.open(DeleteModalComponent, {
            width: '25%',
            data: { url, id: companyId }
        });

        dialogRef.afterClosed().subscribe(() => this.getCompaines());
    }


  getImageSRC(imageName: string): string {
    return this.constant.COMPANY_PROFILE_IMAGE_SOURCE + imageName;
  }


  ngOnDestroy(): void {
    this.compaines = [];
    this.filteredCompaines = [];
    this.cols = [];
    this.privilegecheckedList = [];
  }
}
