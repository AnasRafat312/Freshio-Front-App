import { Component, ElementRef, ViewChild } from '@angular/core';
import {
    AbstractControl,
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup,
    ValidationErrors,
    Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import {
    EntityType,
    Gender,
    MoritalStatus,
    WebData,
} from 'src/app/core/enums/entity.enum';
import { GeneralConfig } from 'src/app/core/common/generalConfig';
import { LanguageService } from 'src/app/core/languageLocalization/language.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { EntityService } from '../entities.service';
import {
    EntityAddress,
    EntityContact,
    EntityTelephone,
    EntityWebData,
} from '../entity.model';
import { LoaderService } from 'src/app/shared/components/loading-spinner/services/loader.service';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { MatDialog } from '@angular/material/dialog';
import { SendAttatchmentsInEntityComponent } from '../send-attatchments-in-entity/send-attatchments-in-entity.component';
import { Constant } from 'src/app/core/constants/constant';
import { PageNaming } from 'src/app/shared/components/page-info/core/page-naming';
import { CompanyActivityEnum } from '../core/enums/company-activity.enum';
import { MessageService } from 'primeng/api';
import { IndustryModel } from 'src/app/shared/core/industry.model';
import { CompanyActivityModel } from 'src/app/shared/core/companyActivity.model';
import { AttachmentsService } from 'src/app/shared/services/attachments.service';
import { ResponseModel } from 'src/app/shared/model/response';
import { PrivilegeChecked } from '../../privilege/interfaces/privilege';
import { PrivilegeService } from '../../privilege/privilege.service';
import { RequiredDropDown } from 'src/app/shared/model/RequiredDropDown';
import { EntityBankAccountInfo } from '../core/entity-bank-account';
import { AttachmentInputsModel } from 'src/app/shared/core/attachmentsList.model';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AttatchmentsComponent } from 'src/app/shared/components/attatchments/attatchments.component';
const dateValidator = (control: FormGroup) => {
    const startDate = control.get('taxCardStartDate').value;
    const endDate = control.get('taxCardEndDate').value;

    if (startDate && endDate && startDate > endDate) {
        control.get('taxCardEndDate').setErrors({ dateMismatch: true });
    } else {
        control.get('taxCardEndDate').setErrors(null);
    }
    return null;
};
@Component({
    selector: 'app-Entity',
    templateUrl: './add-entity.component.html',
    styleUrls: ['./add-entity.component.scss'],
})
export class addEntityComponent extends GeneralConfig {
    ref: DynamicDialogRef | undefined;
    panelOpenState = false;
    form: FormGroup;
    entityBankAccountsForm: FormGroup;
    id: any;
    nationalityList: any;
    selectedFile: any;
    entityImageAtt: FormControl = new FormControl();
    file_store: FileList;
    companyId: any;
    userId: any;
    accountId: any;
    formattedDateTime: any;
    entityTypes: any[] = [];
    companyActivityTypes: CompanyActivityModel[] = [];
    filteredCompanyActivityTypes: CompanyActivityModel[] = [];
    entityBankingAttachments: File[] = [];
    genderList = [];
    moritalStatusList = [];
    webDataList = [];
    companyContactsList = [];
    IsDeleteAttatchment = false;
    @ViewChild('newPersonOptionInput') newPersonOptionInput: ElementRef;
    addressList: any[] = [];
    banksList: any[] = [];
    bankBranchsList: any[] = [];
    filteredBankBranchsList: any[] = [];
    entityBankAccountsList: EntityBankAccountInfo[] = [];
    cityInTable!: string;
    roleInTable: any;
    countryInTable!: string;
    personContactsList = [];
    industryList:IndustryModel[] = [];
    roleClassList = [];
    personContactInTable = [];
    countryList = [];
    cityLoading:boolean = false
    cityList = [];
    filteredCities = [];
    dataType = 'warehouse';
    addButtonDisabled = true;
    addAddressButtonDisabled = true;
    isDropdownOpen = false;
    webDataIsDropdownOpen = false;
    addressIsDropdownOpen = false;
    bankInfoIsDropdownOpen = false;
    companyContactsIsDropdownOpen = false;
    phoneNumbersIsDropdownOpen = false;
    EntityAddressListOnSubmit = [];
    EntityContactsListOnSubmit = [];
    phoneValidity = true;
    entityListInUpdate: any;
    phones: FormArray;
    languageFactor = 'ar';
    hasEntity = false;
    disableSubmit = false;
    nationalIdExist = false;
    taxNoExist = false;
    nationalIdInUpdate!: any;
    taxRegNoInUpdate!: any;
    IsSameCompanyID: boolean = true;
    //attatchments
    selectedImageUrl: string;
    dialogRef: any;
    PersonNationalIDAttatchments: any[] = [];
    CompanyTaxRegNoAttatchments: any[] = [];
    CompanyCommercialNoAttatchments: any[] = [];
    DeletedFileList: any[] = [];
    loading:boolean = false
    Attachments: boolean = false
    privilegecheckedList!: PrivilegeChecked[];

    constructor(
        private constant: Constant,
        private entityService: EntityService,
        private toastr: ToastrService,
        private router: Router,
        private sharedService: SharedService,
        private fb: FormBuilder,
        languageService: LanguageService,
        private loaderService: LoaderService,
        private language: LanguagesService,
        public dialog: MatDialog,
        private messageService: MessageService,
        private attachmentServices:AttachmentsService,
        private privilegeService: PrivilegeService,
        public dialogService: DialogService,
    ) {
        super(languageService);
        this.language.currentLanguage.subscribe((data) => {
            this.languageFactor = data;
        });
        this.privilegeService.checkedPrivilegeList.subscribe(
            data => {
              this.Attachments = false
              this.privilegecheckedList = data
              this.showActionBaseOnPrivilege(this.privilegecheckedList)
            }
          )
        this.id = Number(location.href.split('/')[7]);
        if (this.id) {
            sharedService.setPageLocalName(PageNaming.ENTITY_Edit );

            this.entityService.getAllRolesClass().subscribe((data) => {
                this.roleClassList = data;
            });


            //end Address

            this.entityService.getEntityById(this.id).subscribe(
                (res: any) => {

                    if(res?.birthDate) {
                        res.birthDate = new Date(<Date>res.birthDate)
                    }
                    if(res?.lootcomDate) {
                        res.lootcomDate = new Date(<Date>res.lootcomDate)
                    }
                    if(res?.taxCardEndDate) {
                        res.taxCardEndDate = new Date(<Date>res.taxCardEndDate)
                    }
                    if(res?.taxCardStartDate) {
                        res.taxCardStartDate = new Date(<Date>res.taxCardStartDate)
                    }
                    if(res?.StartDate) {
                        res.StartDate = new Date(<Date>res.StartDate)
                    }
                    this.entityListInUpdate = res;
                    this.entityService
                        .getEntityAttatchments()
                        .subscribe((attatchmentsData: any) => {
                             ;
                            if (
                                attatchmentsData &&
                                attatchmentsData?.attatchmentsList
                            ) {
                                if (attatchmentsData?.entityType == 'company') {
                                    if (
                                        attatchmentsData?.attachmentType ==
                                        'commercialNo'
                                    ) {
                                        this.CompanyCommercialNoAttatchments =
                                            attatchmentsData?.attatchmentsList;
                                    }
                                    if (
                                        attatchmentsData?.attachmentType ==
                                        'taxRegNo'
                                    ) {
                                        this.CompanyTaxRegNoAttatchments =
                                            attatchmentsData?.attatchmentsList;
                                    }
                                }
                                if (attatchmentsData?.entityType == 'person') {
                                    this.PersonNationalIDAttatchments =
                                        attatchmentsData?.attatchmentsList;
                                }
                            } else {
                                this.PersonNationalIDAttatchments =
                                    res?.personNationalIDAttatchments;
                                this.CompanyTaxRegNoAttatchments =
                                    res?.companyTaxRegNoAttatchments;
                                this.CompanyCommercialNoAttatchments =
                                    res?.companyCommercialNoAttatchments;
                            }

                            if (
                                attatchmentsData?.deletedAttatchments?.length >
                                    0 &&
                                attatchmentsData?.deletedAttatchments
                            ) {
                                this.DeletedFileList =
                                    attatchmentsData?.deletedAttatchments;
                            }
                        });
                    if (res?.EntityType == 0) {
                        if (
                            res?.CompanyID ==
                            JSON.parse(localStorage.getItem('companyId'))
                        ) {
                            this.IsSameCompanyID = true;
                        } else {
                            this.IsSameCompanyID = false;
                        }
                    } else {
                        this.IsSameCompanyID = true;
                    }
                    if (this.entityListInUpdate?.gender == 0) {
                        this.form.controls['gender'].setValue(0);
                    }
                    this.taxRegNoInUpdate = this.entityListInUpdate?.taxRegNo;
                    this.nationalIdInUpdate = this.entityListInUpdate?.nationalId;
                    if(res?.EntityAddressList){
                        this.entityListInUpdate['EntityAddressList'] = this.convertAdressJsonToList(res['EntityAddressList']);
                    }
                    if(res?.phones){
                        this.entityListInUpdate['phones'] = this.convertPhonesJsonToList(res['phones']);
                    }
                    if(res?.emails){
                        this.entityListInUpdate['emails'] = this.convertEmailsJsonToList(res['emails']);
                    }
                    if(res?.EntityContactList){

                        this.entityListInUpdate['EntityContactList'] = this.convertContactsJsonToList(res['EntityContactList']);
                    }
                    if(res?.EntityBankingInfoList){
                        this.entityListInUpdate['EntityBankingInfoList'] = this.convertBankingInfoJsonToList(res['EntityBankingInfoList']);
                    }
                    if(res?.EntityAddressList){
                        this.addressList =
                            this.entityListInUpdate['EntityAddressList'];
                        this.getValuesFromListInUpdate(
                            this.addressList,
                            this.cityList,
                            'CityID',
                            'ID'
                        );
                        this.getValuesFromListInUpdate(
                            this.addressList,
                            this.countryList,
                            'LocationID',
                            'ID'
                        );
                    }
                    if(res?.EntityContactList){

                        this.companyContactsList =
                            this.entityListInUpdate['EntityContactList'];
                        this.getValuesFromListInUpdate(
                            this.companyContactsList,
                            this.roleClassList,
                            'RoleClassificationID',
                            'ID'
                        );
                        this.getValuesFromListInUpdate(
                            this.companyContactsList,
                            this.personContactsList,
                            'EntityContactUserID',
                            'ID'
                        );
                    }
                    if(res?.EntityBankingInfoList){
                        this.entityBankAccountsList =
                            this.entityListInUpdate['EntityBankingInfoList'];
                        this.getValuesFromListInUpdate(
                            this.entityBankAccountsList,
                            this.banksList,
                            'BankID',
                            'ID'
                        );
                        this.getValuesFromListInUpdate(
                            this.entityBankAccountsList,
                            this.bankBranchsList,
                            'BranchID',
                            'ID'
                        );
                    }

                    // start phones
                    if(this.entityListInUpdate['phones'].length > 0){
                        this.entityListInUpdate['phones'].forEach((phone) => {
                            if (phone.Telephone != '') {
                                this.addPhoneField(phone.Telephone);
                            }
                        });
                        this.phoneFields.controls.shift();
                    }
                    if(this.entityListInUpdate?.ActivityIDs) {
                        this.form.get('ActivityIDs').setValue(JSON.parse(this.entityListInUpdate?.ActivityIDs))
                    }
                    // End phones

                    // start Email
                    if(this.entityListInUpdate['emails'].length > 0){
                        this.entityListInUpdate['emails'].forEach((email) => {
                            if (email.WebAddress != '') {
                                this.addEmailField(
                                    email.WebAddress,
                                    email.Addresstype
                                );
                            }
                        });
                        this.emailFields.controls.shift();
                    }
                    // End Email
                    this.setFormValues(res);

                    if (
                        this.entityListInUpdate['Logo'] !== null &&
                        this.entityListInUpdate['Logo'] !== '' &&
                        this.entityListInUpdate['Logo'] !== 'null'
                    ) {
                        this.selectedImageUrl = this.getImageSRC(
                            this.entityListInUpdate['Logo']
                        );
                    }
                    if (this.entityListInUpdate['EntityType'] == 0) {
                        this.addEmailField();
                        this.addPhoneField();
                        this.form
                            .get('commercialNo')
                            .setValidators([Validators.required]);
                        this.form
                            .get('taxRegNo')
                            .setValidators([Validators.required]);
                    }
                    if (this.entityListInUpdate['EntityType'] == 1) {
                        this.addEmailField();
                        this.addPhoneField();
                        this.form
                            .get('nationalId')
                            .setValidators([Validators.required]);
                    }
                    if (this.entityListInUpdate['EntityType'] == 2) {
                        this.addEmailField();
                        this.addPhoneField();
                    }
                    this.checkTaxNoValidity();
                },
                (err: any) => {
                    this.toastr.error('error while Create Entity');
                }
            );
        } else {
            sharedService.setPageLocalName(PageNaming.ENTITY_ADD );
            this.entityService
                .getEntityAttatchments()
                .subscribe((attatchmentsData: any) => {
                    if (attatchmentsData?.entityType == 'company') {
                        if (
                            attatchmentsData?.attachmentType == 'commercialNo'
                        ) {
                            this.CompanyCommercialNoAttatchments =
                                attatchmentsData?.attatchmentsList;
                        }
                        if (attatchmentsData?.attachmentType == 'taxRegNo') {
                            this.CompanyTaxRegNoAttatchments =
                                attatchmentsData?.attatchmentsList;
                        }
                    }
                    if (attatchmentsData?.entityType == 'person') {
                        this.PersonNationalIDAttatchments =
                            attatchmentsData?.attatchmentsList;
                    }

                    if (
                        attatchmentsData?.deletedAttatchments?.length > 0 &&
                        attatchmentsData?.deletedAttatchments
                    ) {
                        attatchmentsData?.deletedAttatchments.forEach((ele) => {
                            this.DeletedFileList.push(ele);
                        });
                    }
                });
        }
    }

    showActionBaseOnPrivilege(pages: PrivilegeChecked[]) {
        pages.forEach(page => {
          if (page.page == 'EntitiesList') {
            page.actions.forEach(action => {
              if (action == 'Attachments') {
                this.Attachments = true
              }
            })
          }
        })
      }
    getValuesFromListInUpdate(outerList, innerList, outerId, innerId) {

        outerList.forEach((outEle) => {
            innerList.forEach((innEle) => {
                if (outerId === 'CityID' && innerId === 'ID') {
                    if (innEle.ID == outEle.CityID) {
                        outEle.cityInTable = innEle.name;
                    }
                } else if (outerId === 'LocationID' && innerId === 'ID') {
                    if (innEle.ID == outEle.LocationID) {
                        outEle.countryInTable = innEle.Name;
                    }
                } else if (
                    outerId === 'RoleClassificationID' &&
                    innerId === 'ID'
                ) {
                    if (innEle.ID == outEle.RoleClassificationID) {
                        outEle.roleClassInTable = innEle.classificationName;
                    }
                } else if (
                    outerId === 'EntityContactUserID' &&
                    innerId === 'ID'
                ) {
                    if (innEle.ID == outEle.EntityContactUserID) {
                        outEle.personContactInTable = innEle.EnglishName;
                    }
                } else if (outerId === 'BankID' && innerId === 'ID') {
                    if (innEle.ID == outEle.BankID) {
                        outEle.BankName = innEle.name;
                    }
                } else if (outerId === 'BranchID' && innerId === 'ID') {
                    if (innEle.ID == outEle.BranchID) {
                        outEle.BranchName = innEle.Name;
                    }
                }
            });
        });
    }
    ngOnInit() {
        this.entityTypes = this.sharedService.getTypeList(EntityType);
        this.genderList = this.sharedService.getTypeList(Gender);
        this.moritalStatusList = this.sharedService.getTypeList(MoritalStatus);
        this.webDataList = this.sharedService.getTypeList(WebData);
        //this.cityList = [{name:'choose Country', ID:1}]
        this.entityService.getAllcountries().subscribe((data) => {
            this.countryList = data;
        });

        this.entityService.getAllRolesClass().subscribe((data) => {
            this.roleClassList = data;
        });
        this.getLookups();
        this.companyId = localStorage.getItem('companyId');
        this.userId = localStorage.getItem('userId');
        this.accountId=localStorage.getItem('accountId');
    }
    convertAdressJsonToList(json) {
        // Parse the JSON string into an array of objects
        const jsonArray: any[] = JSON.parse(json);

        // Map the array of objects to a list of objects with the specified structure
        const list: EntityAddress[] = jsonArray.map((item: EntityAddress) => {
            return {
                Streetline: item.Streetline,
                EntityUserID: item.EntityUserID,
                CityID: item.CityID,
                LocationID: item.LocationID,
                CityName:item.CityName,
                CountryName:item.CountryName,
            };
        });
        return list;
    }

    taxNoCheckValid(control: AbstractControl): ValidationErrors | null {
        if (this.taxNoExist && control.value) {
            return { taxNoExist: true };
        }
        return null;
    }
    convertPhonesJsonToList(json) {
        // Parse the JSON string into an array of objects
        const jsonArray: any[] = JSON.parse(json);

        // Map the array of objects to a list of objects with the specified structure
        const list: EntityTelephone[] = jsonArray.map(
            (item: EntityTelephone) => {
                return {
                    Telephone: item.Telephone,
                };
            }
        );
        return list;
    }
    convertEmailsJsonToList(json) {
        // Parse the JSON string into an array of objects
        const jsonArray: any[] = JSON.parse(json);

        // Map the array of objects to a list of objects with the specified structure
        const list: EntityWebData[] = jsonArray.map((item: EntityWebData) => {
            return {
                Addresstype: item.Addresstype,
                WebAddress: item.WebAddress,
            };
        });
        return list;
    }
    convertContactsJsonToList(json) {
        // Parse the JSON string into an array of objects
        const jsonArray: any[] = JSON.parse(json);

        // Map the array of objects to a list of objects with the specified structure
        const list: EntityContact[] = jsonArray.map((item: any) => {
            return {
                RoleClassificationID: item.RoleClassificationID,
                RoleInCompany: item.RoleInCompany,
                EntityContactUserID: item.EntityContactUserID,
                personContactInTable: item.personContactInTable,
            };
        });
        return list;
    }
    convertBankingInfoJsonToList(json) {
        // Parse the JSON string into an array of objects
        const jsonArray: any[] = JSON.parse(json);

        // Map the array of objects to a list of objects with the specified structure
        const list: EntityBankAccountInfo[] = jsonArray.map((item: any) => {
            return {
                BankAccountNumber: item.BankAccountNumber,
                IBAN: item.IBAN,
                SwiftCode: item.SwiftCode,
                AttachmentName: item.AttachmentName || '',
                BankID: item.BankId || item.BankID,
                BankName: item.BankName || '',
                BranchID: item.BranchId || item.BranchID,
                BranchName: item.BranchName || '',
                ID: item.ID,
            };
        });
        return list;
    }
    hasRequiredValidator(FormGroup: FormGroup, ControlName) {
        if (FormGroup?.get(ControlName)) {
            return this.sharedService.hasValidator(
                FormGroup,
                ControlName,
                'required'
            );
        }
        return false;
    }
    initForm() {
        this.form = this.fb.group({
            Code: [''],
            ArabicName: ['', [Validators.required]],
            EnglishName: ['', [Validators.required]],
            LegalName: ['', [Validators.required]],
            EntityType: ['', [Validators.required]],
            NationalityID: [''],
            IsVendor: [''],
            IsClient: [''],
            IsSupplier: [''],
            IsEmployee: [''],
            CompanyActivity: [''],
            CompanyID: [Number(localStorage.getItem('companyId'))],
            StartDate: [''],
            ActivityIDs: [''],
            IndustryID: [''],
            taxRegNo: ['', [this.isNumberValidation]],
            taxCardStartDate: [''],
            taxCardEndDate: [''],
            commercialNo: [''],
            lootcomDate: [''],
            birthDate: [''],
            moritalStatus: [''],
            nationalId: ['', [this.isNumberValidation]],
            passportNo: [''],
            gender: [''],
            RoleClassificationID: [''],
            PersonsContacts: [''],
            RoleInCompany: [''],
            country: [''],
            city: [''],
            Streetline: [''],
            emails: this.fb.array([this.createEmailField()]),
            phones: this.fb.array([this.createPhoneField()])
    });
    this.entityBankAccountsForm = this.fb.group({
            Bank:[null, Validators.required],
            BankBranch:[null, Validators.required],
            BankAccountNumber:[null, Validators.required],
            IBAN:[null, Validators.required],
            SwiftCode:[null, Validators.required],
        })
    }
    get f() {
        return this.form.controls;
    }
    addAccount() {
        const model:EntityBankAccountInfo = {
            BankID: this.entityBankAccountsForm.get('Bank')?.value?.ID,
            BankName: this.entityBankAccountsForm.get('Bank')?.value?.name,
            BranchID: this.entityBankAccountsForm.get('BankBranch')?.value?.ID,
            BranchName: this.entityBankAccountsForm.get('BankBranch')?.value?.Name,
            BankAccountNumber: this.entityBankAccountsForm.get('BankAccountNumber')?.value,
            IBAN: this.entityBankAccountsForm.get('IBAN')?.value,
            SwiftCode: this.entityBankAccountsForm.get('SwiftCode')?.value,
            AttachmentName:''
        }
        this.entityBankAccountsList.push(model)
        this.entityBankAccountsForm.reset();
    }
    deleteAccount(index: number) {
        this.entityBankAccountsList.splice(index,1)
        this.entityBankingAttachments.splice(index,1)
    }
    addentityAccountAttatchment(index: number) {
        let header = this.languageFactor == 'en' ?'Attachments' : 'المرفقات'
        const model:AttachmentInputsModel={
            attachmentHostType:'12',
            TargetTable:'AttachmentBasic',
            fileNameAbbreviation:'EntityAcc_',
            ID: null,
            isMulti: false,
            isDetails: false,
            returnFiles: true,
            selectedFileInUpdate: [],
            selectedFiles: [],
            DeletedFileList: []
        }
        this.ref = this.dialogService.open(
            AttatchmentsComponent,
            {
                header: header,
                contentStyle: { overflow: 'auto' },
                data: model,
                baseZIndex: 9999,
                maximizable: true,
                resizable:true,
                styleClass: 'sm-dialog-width'
            }
        );
        this.ref.onClose.subscribe(
            (result:File[]) => {
                
                if(result.length) {
                    this.entityBankingAttachments.splice(index,1)
                    this.entityBankAccountsList[index].AttachmentName = result[0].name
                    this.entityBankingAttachments[index] = result[0];
                }
                else {
                    if(this.entityBankingAttachments[index]) {
                        this.entityBankingAttachments.splice(index,1)
                    }
                }
            }
        )
    }
    createEmailField(addressValue = '', typeValue = ''): FormGroup {
        return this.fb.group({
            WebAddress: [addressValue],
            Addresstype: [typeValue],
        });
    }
    createPhoneField(value = ''): FormGroup {
        return this.fb.group({
            Telephone: [
                value,
                [Validators.maxLength(15), this.isNumberValidation],
            ],
        });
    }
    get emailFields(): FormArray {
        return this.form.get('emails') as FormArray;
    }
    get phoneFields(): FormArray {
        return this.form.get('phones') as FormArray;
    }
    addEmailField(addressValue = '', typeValue = ''): void {
        this.emailFields.push(this.createEmailField(addressValue, typeValue));
    }
    deleteEmailField(index: number): void {
        this.emailFields.removeAt(index);
    }
    addPhoneField(value = ''): void {
        this.phoneFields.push(this.createPhoneField(value));
    }
    deletePhoneField(index: number): void {
        this.phoneFields.removeAt(index);
    }
    saveAttatchment(objectID, typeID, list): Promise<any> {
        for (let i = 0; i < list.length; i++) {
            const formData = new FormData();
            formData.append('AttahcmentFile', list[i], list[i]?.name);
            formData.append('TargeTable', 'AttachmentBasic');
            formData.append('AttachmentHostType', '3');
            formData.append('AttachmentHostFieldID', String(typeID));
            formData.append('CreatedDateTime', this.formattedDateTime);
            formData.append('companyId', this.companyId);
            formData.append('CreatedBy', this.userId);
            formData.append('AttachmentHostID', objectID);
            formData.append(
                'FileNameAbbreviation',
                'AB_' + localStorage.getItem('companyId') + '_' + list[i]?.name
            );
            formData.append('IsEdit', 'false');
            formData.append('CompanyID', localStorage.getItem('companyId'));

            const file: File | null = formData.get('AttahcmentFile') as File;
            this.entityService.addAttachment(formData).subscribe((res: any) => {
                if (res.message == 'File Name Exist') {
                    this.toastr.error(file.name + ' File Name Exist');
                }
            });
        }
        return null
    }
  // get All Lists
  getLookups() {
    this.initForm();
    const model:RequiredDropDown = {
        Country: true,
        City: true,
        Industry: true,
        Activity: true,
        PersonContact: true,
        Banks: true,
        BankBranches: true,
        CompanyID: +localStorage.getItem('companyId') ,
        AccountID: +localStorage.getItem('accountId'),
    }
    this.sharedService.getAllDropdowns(model).subscribe(res=>{
        this.nationalityList = res?.CountryLookUP;
        this.industryList = res?.IndustryLookUP
        this.companyActivityTypes = [...res?.ActivityLookUP]
        this.banksList = [...res?.BankLookUP]
        this.bankBranchsList = [...res?.BankBranchesLookUP]
        this.countryList = [...res?.ActivityLookUP];
        this.cityList = [...res?.CityLookUP];
        this.personContactsList = [...res?.PersonContactLookUP]
        if (this.personContactsList?.length == 0) {
            this.hasEntity = false;
        } else {
            this.hasEntity = true;
        }
        this.loading = false
    })
  }
  filterBranchesListByBankID(bankID: number) {
      this.filteredBankBranchsList = this.bankBranchsList.filter(branch => branch.BankID == bankID);
  }
    setFormValues(data: any) {
        Object.keys(this.form?.controls).forEach((key) => {
            if (key == 'EntityType') {
                if (data[key] == 0) {
                    this.dataType = 'company';
                    this.form.get('EntityType').setValue(0);
                } else if (data[key] == 1) {
                    this.dataType = 'person';
                    this.form.get('EntityType').setValue(1);
                } else {
                    this.dataType = 'warehouse';
                    this.form.get('EntityType').setValue(2);
                }
            }
            if (key == 'emails' || key == 'phones') {
                return;
            }
            this.form.controls[key].setValue(data[key]);
            /* if (data[key]) {
        if (data?.Logo) {
          this.entityImageAtt.patchValue(`${data?.Logo}`);
        }
      } */
        });
        this.form.get('CompanyActivity').setValue(CompanyActivityEnum[this.entityListInUpdate?.CompanyActivity])
    }

    handleFileInputChange(event): void {
        const files: FileList = event.target.files;
        if (files.length) {
            this.selectedFile = files[0];
            const f = files[0];
            this.entityImageAtt.patchValue(`${f.name}`);
        } else {
            this.entityImageAtt.patchValue('');
        }
        const reader = new FileReader();
        reader.readAsDataURL(files[0]);
        reader.onload = () => {
            this.selectedImageUrl = reader.result as string;
        };
    }
    getImageSRC(imageName: string): string {
        return this.constant.ENTITY_IMAGE_SOURCE + imageName;
    }
    onFileDrop(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        const files: FileList = event.dataTransfer!.files;
        if (files.length) {
            const reader = new FileReader();
            reader.readAsDataURL(files[0]);
            reader.onload = () => {
                this.selectedImageUrl = reader.result as string;
            };
            this.selectedFile = files[0];
            const f = files[0];
            this.entityImageAtt.patchValue(`${f.name}`);
        } else {
            this.entityImageAtt.patchValue('');
        }
    }
    filterCompanyActivityByIndustryID(industryID:number) {
        if(industryID) {
            this.sharedService.getCompanyActicityListByIndustryID(industryID).subscribe(
                res => {

                    this.filteredCompanyActivityTypes = res
                }
            )
        }else {
            this.filteredCompanyActivityTypes = []
        }
    }
    onDragOver(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.highlightDropArea(true);
    }

    onDragLeave(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.highlightDropArea(false);
    }

    private highlightDropArea(highlight: boolean): void {
        const container = document.querySelector('.upload-container');
        if (container) {
            if (highlight) {
                container.classList.add('dragover');
            } else {
                container.classList.remove('dragover');
            }
        }
    }
    onCancel(): void {
        this.router.navigate(['pages/entities']);
    }

    getDatetimeNow() {
        // Create a new Date object for the current date and time
        const now = new Date();

        // Extract date and time components
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        // Create the formatted date-time string
        this.formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    addContact() {

        const newContact = {
            RoleInCompany: this.form.get('RoleInCompany').value,
            RoleClassificationID: this.form.get('RoleClassificationID').value,
            EntityContactUserID: this.form.get('PersonsContacts').value,
        };

        this.EntityContactsListOnSubmit.push({
            RoleClassificationID: newContact.RoleClassificationID,
            RoleInCompany: newContact.RoleInCompany,
            PersonsContacts: newContact.EntityContactUserID,
        });
        const roles = this.roleClassList.find(
            (item) => item.ID === newContact.RoleClassificationID
        );
        if (roles) {
            this.roleInTable = roles.classificationName;
        }
        newContact['roleClassInTable'] = this.roleInTable;
        const personContact = this.personContactsList.find(
            (item) => item.ID === newContact.EntityContactUserID
        );
        if (personContact) {
            this.personContactInTable = personContact.LegalName;
        }
        newContact['personContactInTable'] = this.personContactInTable;
        this.companyContactsList.push(newContact);
        // Clear the form fields after adding a contact
        this.form.get('RoleInCompany').setValue('');
        this.form.get('PersonsContacts').setValue('');
        this.form.get('RoleClassificationID').setValue('');
    }
    deleteContact(index: number) {
        this.companyContactsList.splice(index, 1);
    }
    checkFormValidity() {

        const formValues = this.form.value; // Assuming your form's variable is named "form"
        if (
            formValues.RoleInCompany &&
            formValues.PersonsContacts
            // Add more conditions for other required fields
        ) {
            this.addButtonDisabled = false; // Enable the "Add" button
        } else {
            this.addButtonDisabled = true; // Disable the "Add" button
        }
    }
    addAddress() {
        // Assuming your form variable is named "form"
        const newAddress = {
            CityID: this.form.get('city').value,
            LocationID: this.form.get('country').value,
            Streetline: this.form.get('Streetline').value,
            CityName:null,
            CountryName:null,
        };
        const city = this.cityList.find(
            (item) => item.ID === newAddress.CityID
        );
        const country = this.countryList.find(
            (item) => item.ID === newAddress.LocationID
        );
        if (city) {
            newAddress['CityName'] = city.name;
        }
        if (country) {
            newAddress['CountryName'] = country.Name;
        }
        this.addressList.push(newAddress);

        this.EntityAddressListOnSubmit.push({
            Streetline: newAddress.Streetline,
            CityID: newAddress.CityID,
            LocationID: newAddress.LocationID,
            CountryName: newAddress.CountryName,
            CityName: newAddress.CityName,
        });
        // Clear the form for the next entry
        this.form.get('city').setValue('');
        this.form.get('country').setValue('');
        this.form.get('Streetline').setValue('');
        // Optionally, you can reset the form's validity and touched status
        this.form.markAsPristine();
        this.form.markAsUntouched();
        this.form.updateValueAndValidity();
    }
    checkAddressFormValidity() {
        this.cityLoading = true
        const formValues = this.form.value; // Assuming your form's variable is named "form"
        if (
            formValues.country &&
            formValues.city &&
            formValues.Streetline
            // Add more conditions for other required fields in the address form
        ) {
            this.addAddressButtonDisabled = false; // Enable the "Add" button
        } else {
            this.addAddressButtonDisabled = true; // Disable the "Add" button
        }
        if (formValues.country) {
            this.loaderService.hide();
            let model = {
                CountryID: this.form.value.country,
                CompanyID: JSON.parse(localStorage.getItem('companyId')),
            };
            this.entityService.getCityById(this.form.value.country).subscribe((data) => {
                console.log(data);
                this.cityList = data;
                this.filteredCities = data;
                this.cityLoading = false
            });
        }else {
            this.cityList = [];
            this.filteredCities = [];
            this.cityLoading = false
        }
    }
    checkLineAddressFormValidity() {
        const formValues = this.form.value; // Assuming your form's variable is named "form"
        if (
            formValues.country &&
            formValues.city &&
            formValues.Streetline
            // Add more conditions for other required fields in the address form
        ) {
            this.addAddressButtonDisabled = false; // Enable the "Add" button
        } else {
            this.addAddressButtonDisabled = true; // Disable the "Add" button
        }
    }
    deleteAddress(index: number) {
        this.addressList.splice(index, 1);
    }
    toggleDropdown(element: HTMLElement) {
        switch (element.innerHTML) {
            case 'Address': {
                this.addressIsDropdownOpen = !this.addressIsDropdownOpen;
                break;
            }
            case 'Company Contacts': {
                this.companyContactsIsDropdownOpen =
                    !this.companyContactsIsDropdownOpen;
                break;
            }
            case 'Phone Numbers': {
                this.phoneNumbersIsDropdownOpen =
                    !this.phoneNumbersIsDropdownOpen;
                break;
            }
            case 'Web Data': {
                this.webDataIsDropdownOpen = !this.webDataIsDropdownOpen;
                break;
            }
            case 'Company Data': {
                this.isDropdownOpen = !this.isDropdownOpen;
                break;
            }
            case 'Personal Data': {
                this.isDropdownOpen = !this.isDropdownOpen;
                break;
            }
            case 'Banking Info': {
                this.bankInfoIsDropdownOpen = !this.bankInfoIsDropdownOpen;
                break;
            }
        }
    }
    convertDateFormation(date) {
        if (date !== '' && date !== null) {
            const startDate = new Date(date);
            const year = startDate.getFullYear();
            const month = String(startDate.getMonth() + 1).padStart(2, '0'); // Adding 1 to the month because months are zero-based
            const day = String(startDate.getDate()).padStart(2, '0');
            const hours = String(startDate.getHours()).padStart(2, '0');
            const minutes = String(startDate.getMinutes()).padStart(2, '0');
            const seconds = String(startDate.getSeconds()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            return formattedDate;
        } else {
            return '';
        }
    }
    isNumberValidation(control) {
        const phoneNumberPattern = /^\d+$/; // Regular expression for numeric input

        if (!phoneNumberPattern.test(control.value) && control.value) {
            return { invalidNumber: true };
        }
        return null;
    }
    isWebDataButtonDisabled(index: number): boolean {
        const emailFormGroup = this.emailFields.controls[index];
        const addresstypeControl = emailFormGroup.get('Addresstype');
        const webAddressControl = emailFormGroup.get('WebAddress');

        // Check if both controls are empty
        return !addresstypeControl.value && !webAddressControl.value;
    }
    isPhoneButtonDisabled(index: number): boolean {
        const phoneFormGroup = this.phoneFields.controls[index];
        const phonetypeControl = phoneFormGroup.get('Telephone');

        // Check if both controls are empty
        return !phonetypeControl.value;
    }

    addNewOption(value: string) {
        console.log(value);
        let emailsList = [];
        let phonesList = [];
        let contacts = this.personContactsList;
        if (value) {
            let ID = this.personContactsList.length;

            this.getDatetimeNow();
            const formData = new FormData();
            if (this.selectedFile) {
                formData.append(
                    'LogoImage',
                    this.selectedFile,
                    this.selectedFile?.name
                );
            }
            formData.append('IsMainEntity', JSON.stringify(false));
            formData.append('Code', '');
            formData.append('LegalName', value);
            formData.append('EnglishName', value);
            formData.append('ArabicName', value);
            formData.append('PersonsContacts', null);
            formData.append('CompanyActivity', '0');
            formData.append('EntityType', '1');
            formData.append('NationalityID', '0');
            formData.append('CreatedBy', this.userId);
            formData.append('CreatedDateTime', this.formattedDateTime);
            formData.append('companyId', this.companyId);
            formData.append('Logo', this.entityImageAtt.value);
            formData.append('StartDate', this.formattedDateTime);
            formData.append('taxRegNo', this.form.value.taxRegNo);
            formData.append('taxCardStartDate', this.formattedDateTime);
            formData.append('taxCardEndDate', this.formattedDateTime);
            formData.append('commercialNo', null);
            formData.append('lootcomDate', this.formattedDateTime);
            formData.append('birthDate', this.formattedDateTime);
            formData.append('moritalStatus', '1');
            formData.append('nationalId', null);
            formData.append('passportNo', null);
            formData.append('gender', '0');
            formData.append('webDataType', '0');
            formData.append('RoleClassificationID', null);
            formData.append('RoleInCompany', null);
            formData.append('country', null);
            formData.append('city', null);
            formData.append('Streetline', null);
            formData.append('phones', null);
            formData.append('emails', null);
            formData.append('EntityAddressList', null);
            formData.append('EntityContactList', null);
            formData.append('IsEmployee', JSON.stringify(false));
            formData.append('IsVendor', JSON.stringify(false));
            formData.append('IsClient', JSON.stringify(false));
            formData.append('IsSupplier', JSON.stringify(false));
            formData.append('AccountID', localStorage.getItem('accountId'));
            this.entityService.createEntity(formData).subscribe(
                (res: any) => {
                    this.personContactsList.push({
                        ID: ID,
                        EnglishName: value,
                    });
                    this.toastr.success('Entity Created Successfuly');
                    this.newPersonOptionInput.nativeElement.value = '';
                },
                (err: any) => {
                    this.toastr.error('error while Create Entity');
                }
            );
        }
    }
    checkTaxNoValidity(value?) {
        if(!this.form.value.IsVendor) {
            const type = this.form.value.EntityType;
            if (type == 0) {
                const model = {
                    TaxNumber:value
                }
                if(value) {
                    if(value != this.taxRegNoInUpdate) {
                        this.entityService.getTaxNoVlidity(model).subscribe(
                            (res:any) => {

                                if(res.response) {
                                    this.form.get('taxRegNo').setErrors({ taxNoExist: true });
                                }
                                else {
                                    this.form.get('taxRegNo').setErrors(null);
                                }
                            }
                        )
                    }
                }
                this.dataType = 'company';
                this.form.get('nationalId').clearValidators();
                this.form.get('nationalId').updateValueAndValidity();
                this.form.get('taxRegNo').setValidators([Validators.required]);
                this.form.get('taxRegNo').updateValueAndValidity();
                this.form.get('commercialNo').setValidators([Validators.required]);
                this.form.get('commercialNo').updateValueAndValidity();
            } else if (type == 1) {
                const model = {
                    NationalNumber:value
                }
                if(value) {
                    if(value != this.nationalIdInUpdate) {
                        this.entityService.getNationalNoVlidity(model).subscribe(
                            (res:any) => {

                                if(res.response) {
                                    this.form.get('nationalId').setErrors({ nationalIdExist: true });
                                }
                                else {
                                    this.form.get('nationalId').setErrors(null);
                                }
                            }
                        )
                    }
                }
                this.dataType = 'person';
                this.form.get('nationalId').setValidators([Validators.required]);
                this.form.get('nationalId').updateValueAndValidity();
                this.form.get('taxRegNo').clearValidators();
                this.form.get('taxRegNo').updateValueAndValidity();
                this.form.get('commercialNo').clearValidators();
                this.form.get('commercialNo').updateValueAndValidity();
            } else {
                this.dataType = 'warehouse';
                this.form.get('commercialNo').clearValidators();
                this.form.get('commercialNo').updateValueAndValidity();
                this.form.get('taxRegNo').clearValidators();
                this.form.get('taxRegNo').updateValueAndValidity();
                this.form.get('nationalId').clearValidators();
                this.form.get('nationalId').updateValueAndValidity();
            }
        }else {
            this.form.get('commercialNo').clearValidators();
                this.form.get('commercialNo').updateValueAndValidity();
                this.form.get('taxRegNo').clearValidators();
                this.form.get('taxRegNo').updateValueAndValidity();
                this.form.get('nationalId').clearValidators();
                this.form.get('nationalId').updateValueAndValidity();
        }
    }
    addAttachments(entityType: string, attachmentType: string) {
         ;
        var attatchments = [];
        if (entityType == 'company') {
            if (attachmentType == 'commercialNo') {
                attatchments = this.CompanyCommercialNoAttatchments;
            }
            if (attachmentType == 'taxRegNo') {
                attatchments = this.CompanyTaxRegNoAttatchments;
            }
        }
        if (entityType == 'person') {
            attatchments = this.PersonNationalIDAttatchments;
        }
        this.dialogRef = this.dialog.open(SendAttatchmentsInEntityComponent, {
            disableClose: true,
            width: '80%',
            maxHeight: '90%',
            data: {
                entityType: entityType,
                attachmentType: attachmentType,
                attatchmentsList: attatchments,
                deletedAttatchments: this.DeletedFileList,
            },
        });
    }
    removeFilesFromDatabase(model) {
        this.entityService.deleteFile(model).subscribe((res) => {});
    }
    submit() {
        
        let emailsList = [];
        let phonesList = [];
        this.getDatetimeNow();
        const formData = new FormData();
        if (this.selectedFile) {
            formData.append(
                'LogoImage',
                this.selectedFile,
                this.selectedFile?.name
            );
        }
        formData.append('IsMainEntity', JSON.stringify(true));

        formData.append('Code', this.form.value.Code);
        formData.append('LegalName', this.form.value.LegalName);
        formData.append('EnglishName', this.form.value.EnglishName);
        formData.append('ArabicName', this.form.value.ArabicName);
        formData.append('EntityType', this.form.value.EntityType);
        formData.append('NationalityID', this.form.value.NationalityID);
        formData.append('CreatedBy', this.userId);
        formData.append(
            'CreatedDateTime',
            this.convertDateFormation(this.formattedDateTime)
        );
        formData.append('companyId', this.companyId);
        formData.append('AccountID',this.accountId);

        formData.append('Logo', this.entityImageAtt.value);
        formData.append(
            'StartDate',
            this.convertDateFormation(this.form.value.StartDate)
        );
        formData.append('taxRegNo', this.form?.value?.taxRegNo);
        formData.append(
            'taxCardStartDate',
            this.convertDateFormation(this.form?.value?.taxCardStartDate)
        );
        formData.append(
            'taxCardEndDate',
            this.convertDateFormation(this.form?.value?.taxCardEndDate)
        );
        formData.append('commercialNo', this.form?.value?.commercialNo ? this.form?.value?.commercialNo.toString() : '');
        formData.append(
            'lootcomDate',
            this.convertDateFormation(this.form.value.lootcomDate)
        );
        formData.append(
            'birthDate',
            this.convertDateFormation(this.form.value.birthDate)
        );
        formData.append('nationalId', this.form.value.nationalId);
        formData.append('IndustryID', this.form.value.IndustryID || '');
        formData.append('passportNo', this.form.value.passportNo);
        formData.append('moritalStatus', this.form.value.moritalStatus);
        formData.append('gender', this.form.value.gender);
        if (this.form.value.gender == null) {
            formData.set('gender', '');
        }
        if (this.form.value.moritalStatus == null) {
            formData.set('moritalStatus', '');
        }
        formData.append('webDataType', '');
        formData.append(
            'RoleClassificationID',
            this.form.value.RoleClassificationID
        );
        formData.append('RoleInCompany', this.form.value.RoleInCompany);
        formData.append('country', this.form.value.country);
        formData.append('city', this.form.value.city);
        formData.append('Streetline', this.form.value.Streetline);
        this.form.value.emails.forEach((email) => {
            if (email.WebAddress == '') {
                return;
            } else {
                emailsList.unshift(email);
            }
        });
        this.form.value.phones.forEach((phone) => {
            if (phone.Telephone == '') {
                return;
            } else {
                phonesList.unshift(phone);
            }
        });
        formData.append('phones', JSON.stringify(phonesList));
        if(!this.form.value.ActivityIDs) {
            formData.append('ActivityIDs', JSON.stringify([]));
        }else {
            formData.append('ActivityIDs', JSON.stringify(this.form.value.ActivityIDs));
        }
        formData.append('emails', JSON.stringify(emailsList));
        const entityAddressString = JSON.stringify(
            this.EntityAddressListOnSubmit
        );
        const entityContactsString = JSON.stringify(
            this.EntityContactsListOnSubmit
        );
        formData.append('EntityAddressList', entityAddressString);
        formData.append('EntityContactList', entityContactsString);

        if (this.form.value.IsVendor == ''||
            this.form.value.IsVendor == null) {
            formData.append('IsVendor', 'false');
        } else {
            formData.append('IsVendor', this.form.value.IsVendor);
        }
        if (this.form.value.IsEmployee == ''||
            this.form.value.IsEmployee == null) {
            formData.append('IsEmployee', 'false');
        } else {
            formData.append('IsEmployee', this.form.value.IsEmployee);
        }
        if (
            this.form.value.IsClient == '' ||
            this.form.value.IsClient == null
        ) {
            formData.append('IsClient', 'false');
        } else {
            formData.append('IsClient', this.form.value.IsClient);
        }
        if (
            this.form.value.IsSupplier == '' ||
            this.form.value.IsSupplier == null
        ) {
            formData.append('IsSupplier', 'false');
        } else {
            formData.append('IsSupplier', this.form.value.IsSupplier);
        }
        if (this.form.value.CompanyActivity)
        {
            formData.append('CompanyActivity', this.form.value.CompanyActivity);
        }
        if (this.entityBankingAttachments && this.entityBankingAttachments.length > 0) {
            for (let i = 0; i < this.entityBankingAttachments.length; i++) {
              formData.append('EntityBankingAttachments', this.entityBankingAttachments[i]); // Appending actual files under a separate key
            }
        }
        formData.append('EntityBankingInfoList', JSON.stringify(this.entityBankAccountsList));
        this.CompanyTaxRegNoAttatchments =
            this.CompanyTaxRegNoAttatchments?.filter(
                (obj) => !obj.hasOwnProperty('fileDocument')
            );
        this.CompanyCommercialNoAttatchments =
            this.CompanyCommercialNoAttatchments?.filter(
                (obj) => !obj.hasOwnProperty('fileDocument')
            );
        this.PersonNationalIDAttatchments =
            this.PersonNationalIDAttatchments?.filter(
                (obj) => !obj.hasOwnProperty('fileDocument')
            );
        const attatchments = [];
        if (this.CompanyTaxRegNoAttatchments?.length > 0) {
            this.CompanyTaxRegNoAttatchments.forEach((file:File) => {
                const newFile = {
                    file:file,
                    AttachmentHostFieldID:1
                }
                attatchments.push(newFile);
            });
        }
        if (this.CompanyCommercialNoAttatchments?.length > 0) {
            this.CompanyCommercialNoAttatchments.forEach((file) => {
                const newFile = {
                    file:file,
                    AttachmentHostFieldID:2
                }
                attatchments.push(newFile);
            });
        }
        if (this.PersonNationalIDAttatchments?.length > 0) {
            this.PersonNationalIDAttatchments.forEach((file) => {
                const newFile = {
                    file:file,
                    AttachmentHostFieldID:3
                }
                attatchments.push(newFile);
            });
        }
        if (this.id > 0) {
            formData.set('EntityAddressList', JSON.stringify(this.addressList));
            formData.set(
                'EntityContactList',
                JSON.stringify(this.companyContactsList)
            );
            formData.append('ID', this.id);
            formData.set(
                'companyId',
                JSON.stringify(this.entityListInUpdate.CompanyID)
            );
            this.entityService.updateEntity(formData).subscribe(
                (res: any) => {
                    this.loading = true
                    this.attachmentServices.saveAttatchmentWithHostFieldID(this.id, attatchments, "3", "EN_", "AttachmentBasic",this.DeletedFileList).subscribe(
                        (data) => {
                            // All attachment requests are completed
                            this.loading = false
                            this.entityService.setEntityAttatchments({});
                            this.messageService.add({ severity: 'success', summary: 'Success', detail: res?.message });
                            this.router.navigate(['pages/entities']);
                        }, err => {
                            // Handle error
                            this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.message });
                        });
                },
                (err: any) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.message });
                }
            );
        } else {
            this.entityService.createEntity(formData).subscribe(
                (res: ResponseModel) => {
                    //if (res && res.response === true) {
                        this.loading = true
                        this.attachmentServices.saveAttatchmentWithHostFieldID(res?.objectID, attatchments, "3", "EN_", "AttachmentBasic",this.DeletedFileList).subscribe(
                            (data) => {
                                // All attachment requests are completed
                                this.loading = false
                                this.entityService.setEntityAttatchments({});
                                this.messageService.add({ severity: 'success', summary: 'Success', detail: res?.message });
                                this.router.navigate(['pages/entities']);
                            }, err => {
                                // Handle error
                                this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.message });
                            });
                },
                (err: any) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.message });
                }
            );
        }
    }
ngOnDestroy(): void {
    this.entityTypes = [];
    this.companyActivityTypes = [];
    this.filteredCompanyActivityTypes = [];
    this.genderList = [];
    this.moritalStatusList = [];
    this.webDataList = [];
    this.companyContactsList = [];
    this.IsDeleteAttatchment = false;
    this.addressList = [];
    this.personContactsList = [];
    this.industryList = [];
    this.roleClassList = [];
    this.personContactInTable = [];
    this.countryList = [];
    this.cityList = [];
    this.filteredCities = [];
    this.EntityAddressListOnSubmit = [];
    this.EntityContactsListOnSubmit = [];
    this.PersonNationalIDAttatchments = [];
    this.CompanyTaxRegNoAttatchments = [];
    this.CompanyCommercialNoAttatchments = [];
    this.DeletedFileList = [];
    this.privilegecheckedList=[];


}
}
