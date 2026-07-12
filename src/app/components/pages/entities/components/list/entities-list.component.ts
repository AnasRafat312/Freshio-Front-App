import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ActionData } from 'src/app/shared/core/normalTableColumn.model';
import { EntityModel, EntityRole } from 'src/app/shared/model/freshio/entity.model';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { SharedService } from 'src/app/shared/services/shared.service';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { Constant } from 'src/app/core/constants/constant';
import { FilterType } from 'src/app/shared/core/enums/filter-type.enum';
import { NewDeleteModalComponent } from 'src/app/shared/components/new-delete-modal/new-delete-modal.component';
import { EntitiesAddEditComponent } from '../add-edit/add-edit.component';
import { EntitiesDetailsComponent } from '../details/details.component';
import { EntitiesService } from '../../services/entities.service';
import { EntitiesStore } from '../../store/entities.store';

@Component({
  selector: 'app-entities-list',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './entities-list.component.html',
  styleUrls: ['./entities-list.component.scss']
})
export class EntitiesList implements OnInit, OnDestroy {
  mainList: EntityModel[] = [];
  filteredList: EntityModel[] = [];
  model: any = {};
  actionsList: ActionData[] = [];
  Edit = true;
  Add = true;
  Delete = true;
  Details = true;
  ref: DynamicDialogRef | undefined;
  languageFactor = 'en';
  
  // Role filter options
  roleFilterOptions: any[] = [];
  selectedRoleFilter: string = 'All';

  constructor(
    private entitiesService: EntitiesService,
    private sharedServices: SharedService,
    private language: LanguagesService,
    public dialogService: DialogService,
    private constant: Constant,
    private entitiesStore: EntitiesStore
  ) {
    this.initializeModel();

    // React to signal changes automatically
    effect(() => {
      this.mainList = this.entitiesStore.entities();
      this.applyRoleFilter();
    });
  }

  ngOnInit(): void {
    this.initializeRoleFilterOptions();
    this.getAllRows();
    this.getActionsList();
  }

  ngOnDestroy(): void {
    this.mainList = [];
    this.filteredList = [];
  }

  /**
   * Fetch entities data from API
   */
  getAllRows(): void {
    this.entitiesService.getEntities();
  }

  /**
   * Get role label
   */
  getRoleLabel(role: EntityRole): string {
    switch (role) {
      case EntityRole.Customer:
        return this.languageFactor === 'en' ? 'Customer' : 'عميل';
      case EntityRole.Supplier:
        return this.languageFactor === 'en' ? 'Supplier' : 'مورد';
      case EntityRole.Employee:
        return this.languageFactor === 'en' ? 'Employee' : 'موظف';
      case EntityRole.Driver:
        return this.languageFactor === 'en' ? 'Driver' : 'سائق';
      default:
        return '';
    }
  }

  /**
   * Get role badge severity
   */
  getRoleSeverity(role: EntityRole): string {
    switch (role) {
      case EntityRole.Customer:
        return 'success';
      case EntityRole.Supplier:
        return 'info';
      case EntityRole.Employee:
        return 'warning';
      case EntityRole.Driver:
        return 'help';
      default:
        return 'secondary';
    }
  }

  private initializeRoleFilterOptions(): void {
    this.roleFilterOptions = [
      { label: this.languageFactor === 'en' ? 'All' : 'الكل', value: 'All' },
      { label: this.languageFactor === 'en' ? 'Customer' : 'عميل', value: EntityRole.Customer },
      { label: this.languageFactor === 'en' ? 'Supplier' : 'مورد', value: EntityRole.Supplier },
      { label: this.languageFactor === 'en' ? 'Employee' : 'موظف', value: EntityRole.Employee },
      { label: this.languageFactor === 'en' ? 'Driver' : 'سائق', value: EntityRole.Driver }
    ];
  }

  private initializeModel(): void {
    this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
      this.initializeRoleFilterOptions();
      this.model = {
        Name: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Name' : 'الاسم',
        },
        WhatsAppNumber: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'WhatsApp' : 'واتساب',
        },
        AdditionalPhone: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Phone' : 'هاتف',
        },
        Address: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Address' : 'العنوان',
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
      row ? header = 'Edit Entity' : header = 'Add Entity';
    } else {
      row ? header = 'تعديل جهة' : header = 'إضافة جهة';
    }
    
    this.ref = this.dialogService.open(
      EntitiesAddEditComponent,
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
        row ? this.entitiesStore.updateEntity(product):
        this.entitiesStore.addEntity(product)
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
    let url = this.constant.API_ENDPOINT + `Entities/Delete/${ID}`;
    
    this.ref = this.dialogService.open(NewDeleteModalComponent, {
      header: header,
      contentStyle: { overflow: 'auto' },
      data: { url: url, id: ID },
      baseZIndex: 10000,
      styleClass: 'xs-dialog-width',
    });
    this.ref.onClose.subscribe((product) => {
      if (product) {
        this.entitiesStore.removeEntity(ID);
      }
    });
  }

  rowDetails(row: any): void {
    let header = '';
    if (this.languageFactor == 'en') {
      header = 'Entity Details';
    } else {
      header = 'تفاصيل الجهة';
    }
    
    this.ref = this.dialogService.open(
      EntitiesDetailsComponent,
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

  onRoleFilterChange(event: any): void {
    this.selectedRoleFilter = event.value;
    this.applyRoleFilter();
  }

  private applyRoleFilter(): void {
    if (this.selectedRoleFilter === 'All') {
      this.filteredList = [...this.mainList];
    } else {
      const roleValue = Number(this.selectedRoleFilter) as EntityRole;
      this.filteredList = this.mainList.filter(entity => {
        switch (roleValue) {
          case EntityRole.Customer:
            return entity.IsCustomer;
          case EntityRole.Supplier:
            return entity.IsSupplier;
          case EntityRole.Employee:
            return entity.IsEmployee;
          case EntityRole.Driver:
            return entity.IsDriver;
          default:
            return false;
        }
      });
    }
  }

  refresh(): void {
    this.getAllRows();
  }
}
