import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { EntityService } from '../entities.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SharedService } from 'src/app/shared/services/shared.service';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { EntityAddress, EntityContact, Entity } from '../entity.model';
import { Constant } from 'src/app/core/constants/constant';
import { PageNaming } from 'src/app/shared/components/page-info/core/page-naming';
import { PrivilegeChecked } from '../../privilege/interfaces/privilege';
import { PrivilegeService } from '../../privilege/privilege.service';
import { EntityBankAccountInfo } from '../core/entity-bank-account';

import {
    EntityType,
    Gender,
    MoritalStatus,
} from 'src/app/core/enums/entity.enum';
@Component({
  selector: 'app-entity-details',
  templateUrl: './entity-details.component.html',
  styleUrls: ['./entity-details.component.scss']
})
export class EntityDetailsComponent implements OnInit{
  urlBase = this.constant.ATTACHMENT_FILES_SOURCE
  languageFactor = 'en'
  entity!:Entity
  Code:string;
  EntityType:number;
  EntityTypeName:string;
  Nationality:string;
  ArabicName:string;
  EnglishName:string;
  LegalName:string;
  phones = []
  emails = []
  constactsList = []
  addressList = []
  entityBankAccountsList: EntityBankAccountInfo[] = []
  banksList: any[] = []
  bankBranchsList: any[] = []
  companyData = {}
  dataType = 'warehouse'
  CompanyActivity:any
  lootcomDate:any
  taxCardEndDate:any
  commercialNo:any
  taxCardStartDate:any
  StartDate:any
  taxRegNo:any
  gender:any
  moritalStatus:any
  birthDate:any
  passportNo:any
  nationalId:any
  attatchments:any[] = []
  moritalList = []
  genderList = []
  countryList =[]
  roleClassList=[]
  cityList =[]
  addressIsDropdownOpen: boolean;
  attachmentsDropdownOpen: boolean;
  companyContactsIsDropdownOpen: boolean;
  phoneNumbersIsDropdownOpen: boolean;
  webDataIsDropdownOpen: boolean;
  bankInfoIsDropdownOpen: boolean;
  isDropdownOpen: boolean;
  personContactsList = []
  isCompanyData = true
  isPersonData = true
  isWebData = true
  isPhones = true
  isCompanyContacts = true
  isAddress = true
  isBankingInfo = true
  nationalityList = []
  //privilige
  Attachments: boolean = false
  privilegecheckedList!: PrivilegeChecked[];
  constructor(
        private constant: Constant,
    private entityService: EntityService,
    public dialogRef: MatDialogRef<EntityDetailsComponent>,
    private sharedService: SharedService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private languageService: LanguagesService,
    private privilegeService: PrivilegeService,
  ) {
    this.privilegeService.checkedPrivilegeList.subscribe(
      data => {
          this.Attachments = false
          this.privilegecheckedList = data
          this.showActionBaseOnPrivilege(this.privilegecheckedList)
      })
    sharedService.setPageLocalName(PageNaming.ENTITY_DETAILS);
    this.languageFactor = this.languageService.getCurrentLanguage()
    this.moritalList = this.sharedService.getTypeList(MoritalStatus)
    this.genderList = this.sharedService.getTypeList(Gender)
    this.entityService.getAllcountries().subscribe(
      data => {
        this.countryList = data
      }
    )
    this.entityService.getAllRolesClass().subscribe(
      data => {
        this.roleClassList = data
      }
    )
    this.entityService.getAllPersonsContacts().subscribe(
      data => {
        this.personContactsList = data
      }
    )
    this.entityService.getAllNationality().subscribe(
      res => {
        this.nationalityList = res
      }
    )
    this.entityService.getAllCities().subscribe(data => {
      this.cityList = data
    })
    /* this.sharedService.getAllBanks().subscribe(data => {
      this.banksList = data
    })
    this.sharedService.getAllBankBranches().subscribe(data => {
      this.bankBranchsList = data
    }) */
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
  ngOnInit(): void {
    this.entityService.getEntityById(this.data.rowData?.ID).subscribe(
      data => {
        this.entity = {...data}
        this.setFormValues(this.entity);
      }
      )
  }

  toggleDropdown(element: HTMLElement) {

    switch (element.innerHTML) {
      case 'Address': {
        this.addressIsDropdownOpen = !this.addressIsDropdownOpen;
        break;
      }
      case 'Company Contacts': {
        this.companyContactsIsDropdownOpen = !this.companyContactsIsDropdownOpen;
        break;
      }
      case 'Phone Numbers': {
        this.phoneNumbersIsDropdownOpen = !this.phoneNumbersIsDropdownOpen;
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
      case 'Attachments': {
        this.attachmentsDropdownOpen = !this.attachmentsDropdownOpen;
        break;
      }
      case 'Banking Info': {
        this.bankInfoIsDropdownOpen = !this.bankInfoIsDropdownOpen;
        break;
      }
    }
  }
  setFormValues(data: any) {
    this.setAttatchmentsList(data)
    this.Code = data.Code;
    this.LegalName = data.LegalName;
    this.ArabicName = data.ArabicName;
    this.EnglishName = data.EnglishName;
    this.EntityType = data.EntityType;
    this.EntityTypeName = EntityType[data.EntityType];
    this.nationalityList.forEach( ele => {
      if(ele.ID == data.NationalityID) {
        this.Nationality = ele.Name
      }
    })
    this.phones = JSON.parse(data.phones);
    if(this.phones.length > 0) {
      this.isPhones = true
    }else {
    this.isPhones = false
  }
    this.emails = JSON.parse(data.emails);
    if(this.emails.length > 0) {
      this.isWebData = true
    }else {
    this.isWebData = false
  }
    // start address

    this.entity['EntityAddressList'] = this.convertAdressJsonToList(data['EntityAddressList'])
    this.addressList = this.entity['EntityAddressList']
    this.getValuesFromListInUpdate(this.addressList, this.cityList, 'CityID', 'ID')
    this.getValuesFromListInUpdate(this.addressList, this.countryList, 'LocationID', 'ID')
    if(this.addressList.length > 0) {
      this.isAddress = true
    }else {
    this.isAddress = false
    }
    this.getValuesFromListInUpdate(this.constactsList, this.personContactsList, 'EntityContactUserID', 'ID')
    if(this.constactsList.length > 0) {
      this.isCompanyContacts = true
    }else {
    this.isCompanyContacts = false
    }
    // end address
    this.entity['EntityContactList'] = this.convertContactsJsonToList(data['EntityContactList'])
    this.constactsList = this.entity['EntityContactList']
    this.getValuesFromListInUpdate(this.constactsList, this.roleClassList, 'RoleClassificationID', 'ID')
    // start banking info
    if(data?.EntityBankingInfoList) {
      this.entity['EntityBankingInfoList'] = this.convertBankingInfoJsonToList(data['EntityBankingInfoList'])
      this.entityBankAccountsList = this.entity['EntityBankingInfoList']
      this.getValuesFromListInUpdate(this.entityBankAccountsList, this.banksList, 'BankID', 'ID')
      this.getValuesFromListInUpdate(this.entityBankAccountsList, this.bankBranchsList, 'BranchID', 'ID')
      if(this.entityBankAccountsList.length > 0) {
        this.isBankingInfo = true
      } else {
        this.isBankingInfo = false
      }
    }
    // end banking info
    this.CompanyActivity = data.CompanyActivity;
    this.lootcomDate = data.lootcomDate;
    this.taxCardEndDate = data.taxCardEndDate;
    this.commercialNo = data.commercialNo;
    this.taxCardStartDate = data.taxCardStartDate;
    this.StartDate = data.StartDate;
    this.taxRegNo = data.taxRegNo;
    this.gender = data.gender;
    this.birthDate = data.birthDate;
    this.passportNo = data.passportNo;
    this.nationalId = data.nationalId;
    if(this.lootcomDate || this.taxCardEndDate ||
      this.commercialNo || this.taxCardStartDate ||
      this.StartDate || this.taxRegNo ||
      this.gender || this.birthDate ||
      this.passportNo || this.nationalId
      ) {
        this.isPersonData = true
      }else {
      this.isPersonData = false
    }
    if(this.lootcomDate || this.taxCardEndDate ||
      this.commercialNo || this.taxCardStartDate ||
      this.StartDate || this.taxRegNo
      ) {
        this.isCompanyData = true
      }else {
      this.isCompanyData = false
    }
    this.setEntityType(this.EntityType)
    this.setMoritalStatus(data.moritalStatus)
    this.setGender(data.gender)

  }
  setEntityType(id: number) {
    if (id == 0) {
      this.dataType = 'company'
    } else if (id == 1) {
      this.dataType = 'person'
    } else {
      this.dataType = 'warehouse'
    }
  }

  setMoritalStatus(id) {
    this.moritalList.forEach(ele => {
      if(id === ele.value) {
        this.moritalStatus = ele.label
      }
    })
  }
  setGender(id) {
    this.genderList.forEach(ele => {
      if(id === ele.value) {
        this.gender = ele.label
      }
    })
  }
  setAttatchmentsList(data:any) {

    if(data?.personNationalIDAttatchments &&data?.personNationalIDAttatchments?.length > 0) {
      data?.personNationalIDAttatchments.forEach(ele => {
        ele.AttatchmentTypeName = 'Person-National-ID'
        this.attatchments.push(ele)
      })
    }
    if(data?.companyCommercialNoAttatchments&&data?.companyCommercialNoAttatchments?.length > 0) {
      data?.companyCommercialNoAttatchments.forEach(ele => {
        ele.AttatchmentTypeName = 'Company-Commercial-No'
        this.attatchments.push(ele)
      })
    }
    if(data?.companyTaxRegNoAttatchments&&data?.companyTaxRegNoAttatchments?.length > 0) {
      data?.companyTaxRegNoAttatchments.forEach(ele => {
        ele.AttatchmentTypeName = 'Company-Tax-Reg-No'
        this.attatchments.push(ele)
      })
    }
  }
  formatFileSize(size: number): string {
    if (size === 0) return '0 Bytes';

    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const digitGroups = Math.floor(Math.log(size) / Math.log(1024));

    return `${(size / Math.pow(1024, digitGroups)).toFixed(2)} ${units[digitGroups]
        }`;
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
    return list
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
    return list
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
    return list
  }
  getValuesFromListInUpdate(outerList, innerList, outerId, innerId) {

    outerList.forEach((outEle) => {
      innerList.forEach(innEle => {
        if (outerId === 'CityID' && innerId === 'ID') {
          if (innEle.ID == outEle.CityID) {
            outEle.cityInTable = innEle.name
          }
        }
        else if (outerId === 'LocationID' && innerId === 'ID') {
          if (innEle.ID == outEle.LocationID) {
            outEle.countryInTable = innEle.Name
          }
        }
        else if (outerId === 'RoleClassificationID' && innerId === 'ID') {
          if (innEle.ID == outEle.RoleClassificationID) {
            outEle.roleClassInTable = innEle.classificationName
          }
        }
        else if (outerId === 'BankID' && innerId === 'ID') {
          if (innEle.ID == outEle.BankID) {
            outEle.BankName = innEle.name
          }
        }
        else if (outerId === 'BranchID' && innerId === 'ID') {
          if (innEle.ID == outEle.BranchID) {
            outEle.BranchName = innEle.Name
          }
        }
      })
    })
  }
  downloadOrShowImage(url: string, name: string) {

    // Check if the file is an image
    const isImage = /\.(jpeg|jpg|gif|png)$/i.test(url);

    if (isImage) {
      // Open a new window to display the image
      window.open(url, '_blank');
    } else {
      // Download the file
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
  onCancel(): void {
    this.dialogRef.close();
  }
  ngOnDestroy(): void {
    this.phones = []
    this.emails = []
    this.constactsList = []
    this.addressList = []
    this.entityBankAccountsList = []
    this.attatchments = []
    this.moritalList = []
    this.genderList = []
    this.countryList =[]
    this.roleClassList=[]
    this.cityList =[]
    this.banksList = []
    this.bankBranchsList = []
    this.personContactsList = []
    this.nationalityList = []
    this.privilegecheckedList=[]
  }
}


