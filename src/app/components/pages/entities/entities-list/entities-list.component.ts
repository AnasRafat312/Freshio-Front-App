import { Component, OnDestroy,OnInit, ViewChild } from '@angular/core';
import { Constant } from 'src/app/core/constants/constant';

import { DeleteModalComponent } from 'src/app/shared/components/delete-modal/delete-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EntityService } from '../entities.service';
import { GeneralConfig } from 'src/app/core/common/generalConfig';
import { LanguageService } from 'src/app/core/languageLocalization/language.service';
import { ToastrService } from 'ngx-toastr';
import { PrivilegeService } from '../../privilege/privilege.service';
import { PrivilegeChecked } from '../../privilege/interfaces/privilege';
import { DeleteEntity } from '../entity.model';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { Table } from 'primeng/table';
import { SharedService } from 'src/app/shared/services/shared.service';
import { EntityType } from 'src/app/core/enums/entity.enum';
import { EntityDetailsComponent } from '../entity-details/entity-details.component';
import { PageNaming } from 'src/app/shared/components/page-info/core/page-naming';

@Component({
    selector: 'app-entities',
    templateUrl: './entities-list.component.html',
    styleUrls: ['./entities-list.component.scss'],
})
export class EntitiesListComponent extends GeneralConfig implements OnInit {
    entities: any[] = [];
    FilteredEntities: any[] = [];
    lastFilteredEntities: any[] = [];
    entityType: number;
    dialogRef: any;
    loading: boolean = true;
    EditEntity: boolean = false;
    AddEntity: boolean = false;
    DeleteEntity: boolean = false;
    privilegecheckedList!: PrivilegeChecked[];
    languageFactor = 'en';
    searchKeyword = '';
    combinedFilter: string = '';
    globalFilter: string = '';
    @ViewChild('dt') dt: Table;
    entityTypeSelection: any;
    currentCompanyID = localStorage.getItem('companyId')
    IsGlobal = false
    entityTypes = [];
    cols!: any;
    filter: any = {
        Code: null,
        LegalName: null,
        EnglishName: null,
        ArabicName: null,
        EntityType: null,
    };
    //filter in table
    codeListInTable: any[] = [];
    legelListInTable: any[] = [];
    englishNameListInTable: any[] = [];
    arabicNameListInTable: any[] = [];
    entityTypeListInTable: any[] = [];
    typeListInTable: any[] = [];
    IsClient: boolean = null;
    IsSupplier: boolean = null;
    columnContainer = {
        EntityTypeName: { list: null, field: 'EntityTypeName' },
        EnglishName: { list: null, field: 'EnglishName' },
        LegalName: { list: null, field: 'LegalName' },
        Code: { list: null, field: 'Code' },
        ArabicName: { list: null, field: 'ArabicName' },
    };
    constructor(
        private constant: Constant,
        public dialog: MatDialog,
        private router: Router,
        private entityService: EntityService,
        private toastr: ToastrService,
        private privilegeService: PrivilegeService,
        languageService: LanguageService,
        private language: LanguagesService,
        private sharedService: SharedService
    ) {
        super(languageService);
        sharedService.setPageLocalName(PageNaming.ENTITY_PAGE);
        this.cols = [
            { field: 'Code', header: 'Code' },
            { field: 'transactionNumber', header: 'transactionNumber' },
            { field: 'transactionType', header: 'transactionType' },
            { field: 'currency', header: 'currency' },
            { field: 'entryType', header: 'entryType' },
            { field: 'description', header: 'description' },
            { field: 'journal.Name', header: 'journal' },
            { field: 'costCenter', header: 'costCenter' },
        ];
        this.language.currentLanguage.subscribe((data) => {
            this.languageFactor = data;
        });
        this.getEntities();
        //this.entityTypes = this.sharedService.getTypeList(EntityType);
    }
    ngOnInit() {
        this.privilegeService.checkedPrivilegeList.subscribe((data) => {
            this.EditEntity = false;
            this.AddEntity = false;
            this.DeleteEntity = false;
            this.privilegecheckedList = this.removeDuplicates(data, 'page');
            this.showActionBaseOnPrivilege(this.privilegecheckedList);
        });
    }
    removeDuplicates(arr, prop) {
        return arr.filter(
            (obj, index, self) =>
                index === self.findIndex((el) => el[prop] === obj[prop])
        );
    }
    getEntities() {
        this.entityService.getAllEntities().subscribe((res) => {
            this.entities = res;
            this.FilteredEntities = res;
            this.setFilteredListInMultiSelected(this.FilteredEntities);
            this.loading = false
        });
    }
    // start filtering in table
    setFilteredListInMultiSelected(list: any[]) {
        const uniqueTypeSet = new Set<string>();
        const uniqueCodeSet = new Set<string>();
        const uniqueLegelNameSet = new Set<string>();
        const uniqueEnglishNameSet = new Set<string>();
        const uniqueArabicNameSet = new Set<string>();
        list.forEach((entity) => {
            entity.EntityTypeName = EntityType[entity.EntityType]
            this.sharedService.getListOfMultiSelectInTableFilter(
                uniqueCodeSet,
                entity,
                this.codeListInTable,
                'Code'
            );
            this.sharedService.getListOfMultiSelectInTableFilter(
                uniqueLegelNameSet,
                entity,
                this.legelListInTable,
                'LegalName'
            );
            this.sharedService.getListOfMultiSelectInTableFilter(
                uniqueEnglishNameSet,
                entity,
                this.englishNameListInTable,
                'EnglishName'
            );
            this.sharedService.getListOfMultiSelectInTableFilter(
                uniqueArabicNameSet,
                entity,
                this.arabicNameListInTable,
                'ArabicName'
            );
            this.sharedService.getListOfMultiSelectInTableFilter(
                uniqueTypeSet,
                entity,
                this.entityTypeListInTable,
                'EntityTypeName'
            );
        });
    }
    onTableFilter(event) {

        /* if(event?.filteredValue.length > 0) {
            this.FilteredEntities = event?.filteredValue;
        } */
    }
    filterGlobal(value,table:Table) {
        if(value) {
            this.IsGlobal = true
        }else {
            this.IsGlobal = false
        }
        table.filterGlobal(value,'contains');

    }
    filterColumn(event, colName) {
         ;
        this.FilteredEntities = this.sharedService.multiFilterListInTable(
            event,
            colName,
            this.entities,
            this.columnContainer
        );
    }
    // table filteration
    clear(table: Table) {
        table.clear();
        this.FilteredEntities = this.entities;
    }
    showActionBaseOnPrivilege(pages: PrivilegeChecked[]) {
        pages.forEach((page) => {
            if (page.page == 'EntitiesList') {
                page.actions.forEach((action) => {
                    if (action == 'DeleteEntity') {
                        this.DeleteEntity = true;
                    } else if (action == 'AddEntity') {
                        this.AddEntity = true;
                    } else if (action == 'EditEntity') {
                        this.EditEntity = true;
                    }
                });
            }
        });
    }
    openForm(entity?) {
        if (entity) {
            console.log('first open form in if');
            console.log(entity);
            this.router.navigate([`./pages/entities/edit/${entity?.ID}`]);
        } else {
            console.log('first open form in else');
            this.router.navigate([`./pages/entities/add`]);
        }
    }

    delete(entityId: number, entityType: number) {
        let url =
            this.constant.BASIC_DATA_API_ENDPOINT +
            'UserEntity/DeleteBuisnessEntity';
        let model: DeleteEntity = {
            DeletedBy: JSON.parse(localStorage.getItem('userId')),
            DeletedDateTime: this.getCurrentDate(),
            ID: entityId,
            companyId: JSON.parse(localStorage.getItem('companyId')),
            EntityType: EntityType[entityType] ,
        };
        this.dialogRef = this.dialog.open(DeleteModalComponent, {
            width: '25%',
            data: { url: url, model },
        });

        this.dialogRef.afterClosed().subscribe((result) => {
            //this.toastr.success('Entity Deleted Successfuly')
            this.getEntities();
            this.entityService.setEntityAttatchments({});
        });
    }
    getCurrentDate() {
        const startDate = new Date();
        const year = startDate.getFullYear();
        const month = String(startDate.getMonth() + 1).padStart(2, '0'); // Adding 1 to the month because months are zero-based
        const day = String(startDate.getDate()).padStart(2, '0');
        const hours = String(startDate.getHours()).padStart(2, '0');
        const minutes = String(startDate.getMinutes()).padStart(2, '0');
        const seconds = String(startDate.getSeconds()).padStart(2, '0');

        const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        return formattedDate;
    }
    getImageSRC(imageName: string): string {
        return this.constant.ENTITY_IMAGE_SOURCE + imageName;
    }
    openDetailsForm(entity?: any) {
        this.dialogRef = this.dialog.open(EntityDetailsComponent, {
            width: '80%',
            maxHeight: '90%',
            disableClose: true,
            data: { rowData: entity },
        });

        console.log(entity);
    }

    ngOnDestroy(): void {
        this.entities = [];
        this.FilteredEntities = [];
        this.lastFilteredEntities = [];
        this.privilegecheckedList = [];
        this.entityTypes = [];
        this.codeListInTable = [];
        this.legelListInTable = [];
        this.englishNameListInTable = [];
        this.arabicNameListInTable = [];
        this.entityTypeListInTable = [];
        this.typeListInTable = [];
    }
}
