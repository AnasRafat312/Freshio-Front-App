import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { UsersService } from '../users.service';
import { UserEmailExistsValidator } from '../user-email-exists.validator';
import { PrivilegeService } from 'src/app/components/pages/privilege/privilege.service';
import { PrivilegeRoles } from '../../privilege/interfaces/privilege';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { Constant } from 'src/app/core/constants/constant';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SharedService } from 'src/app/shared/services/shared.service';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss'],
})

export class AddUserComponent implements OnInit {
  hide = true;
  hideConfirmPass = true;
  selectedFile: any;
  roles:PrivilegeRoles[];
  profileImageAtt: FormControl = new FormControl();
  file_store: FileList;
  showRoleAdd:boolean = JSON.parse(localStorage.getItem('showRoleAdd'))
  form!: FormGroup;
  oldRoleID!:number;
  selectedImageUrl:string;
  languageFactor = 'ar'
  data:any;
  styleClass:any;
  fromCompny:boolean = false;
  constructor(
        private constant: Constant,
    private usersService: UsersService,
    private messageService: MessageService,
    public dialoge: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private emailExistsValidator: UserEmailExistsValidator,
    private privilege: PrivilegeService,
    private language:LanguagesService,
    private sharedServic:SharedService

  )
  {

    this.data = this.config.data;
    this.styleClass = this.config.data?.styleClass || '';
    this.fromCompny = this.config.data?.fromCompny || false;
    if(this.data?.rowData) {
      if(this.fromCompny) {
        this.showRoleAdd = true
      }else {
        this.showRoleAdd = false
      }
    }
    else {
      this.showRoleAdd = true
    }
    this.language.currentLanguage.subscribe(
      data => {
        this.languageFactor = data
      }
    )
    this.form = new FormGroup({
      UserName: new FormControl('', [Validators.required, Validators.minLength(3)]),
      PhoneNumber: new FormControl('', [Validators.required]),
      Email: new FormControl('', [Validators.required, Validators.email]),
      Password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      PasswordConfirmation: new FormControl('', [Validators.required, Validators.minLength(3)]),
      RoleID: new FormControl(null),
    }, {
      validators: this.matchingPasswordsValidator
    });

    this.privilege.getRoles().subscribe(data=> {
      this.roles = data
    })

    if (this.data?.rowData) {
        if(this.data?.rowData['ProfilePicture'] !== null && this.data?.rowData['ProfilePicture'] !== '' && this.data?.rowData['ProfilePicture'] !== 'null') {
            this.selectedImageUrl = this.getImageSRC(this.data?.rowData['ProfilePicture'])
        }
      this.oldRoleID = this.data?.rowData.RoleID
      this.setFormValues(this.data?.rowData);
      this.form.get('Email').clearValidators()
      this.form.get('Password').clearValidators()
      this.form.get('PasswordConfirmation').clearValidators()
      this.form.updateValueAndValidity()
    }
  }

  ngOnInit(): void {

  }

  matchingPasswordsValidator(formGroup: FormGroup) {
    const password = formGroup.get('Password').value;
    const confirmPassword = formGroup.get('PasswordConfirmation').value;
    return password === confirmPassword ? null : { passwordsNotMatch: true };
  }

  get f() {
    return this.form.controls;
  }
  getClass(data: any): string {

    if (!data?.rowData && !data?.fromCompny) {
      return 'mb-3 col-md-4 col-sm-6 col-xs-12';
    } else if (data?.rowData && !data?.fromCompny) {
      return 'col-md-6 col-sm-12 col-xs-12';
    } else if (data?.rowData && data?.fromCompny) {
      return 'col-md-4 col-sm-6 col-xs-12';
    }
    else if(!data?.rowData &&data?.fromCompny)
    {
      return 'mb-3 col-md-4 col-sm-6 col-xs-12'
    }
    return '';
  }

  submit() {
    const formData = new FormData();
    let url='';
    formData.append("UserName", this.form.value.UserName);
    formData.append("PhoneNumber", this.form.value.PhoneNumber)
    formData.append("AccountID", localStorage.getItem('accountId'))
    formData.append("CreatedBy", localStorage.getItem('userId'))
    formData.append("CompanyID", localStorage.getItem('companyId'))
    formData.append("CreatedDateTime", this.mergeDateAndTime(new Date()))
    formData.append("ProfilePicture", this.profileImageAtt.value)
    formData.append("RoleID", this.form.value.RoleID||"null")
    if (this.selectedFile) {
      formData.append('ProfileImage', this.selectedFile, this.selectedFile.name);
    }
    if (this.data?.rowData) {
      formData.append("Id", this.data?.rowData?.Id);
      formData.append("Email", this.data?.rowData?.Email)
      if (this.oldRoleID !== null && this.oldRoleID !== undefined) {
        formData.append("OldRoleID", JSON.stringify(this.oldRoleID));
    }
     url = this.constant.GETWAY_API_ENDPOINT +  'AssembleUser/UpdateAssembleUser';
    this.sharedServic.Update(url,formData).subscribe(
        res => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: res?.message });
          this.dialoge.close(true);
        },
        err => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.message });
        }
      )
    } else {
      formData.append("Password", this.form.value.Password);
      formData.append("Email", this.form.value.Email);
      url = this.constant.GETWAY_API_ENDPOINT + 'AssembleUser/CreateAssembleUser';
      this.sharedServic.Create(url,formData).subscribe(
          res => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: res?.message });
            this.dialoge.close(true);
          },
          err => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.message });
          }
        )
    }

  }

  setFormValues(data: any) {
    Object.keys(this.form?.controls).forEach((key) => {
      if (data[key]) {
        const value = data[key]
        this.form.controls[key].setValue(value);
      }
      if (data?.ProfilePicture) {
        this.profileImageAtt.patchValue(`${data?.ProfilePicture}`);
      }
      this.removePasswordValidationonEditMode();
    })
  }
  mergeDateAndTime(date,time?) {
    if (date !== '' || date !== null || date !== undefined) {
      const startDate = new Date(date);
      const year = startDate.getFullYear();
      const month = String(startDate.getMonth() + 1).padStart(2, '0'); // Adding 1 to the month because months are zero-based
      const day = String(startDate.getDate()).padStart(2, '0');
      if(time) {
        const Time = time
        const formattedDate = `${year}-${month}-${day} ${Time}`;
        return formattedDate
      } else {
        const dateTime = new Date(date);
        const hours = String(dateTime.getHours()).padStart(2, '0');
        const minutes = String(dateTime.getMinutes()).padStart(2, '0');
        const seconds = String(dateTime.getSeconds()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        return formattedDate
      }
    } else{
      return null
    }
  }
  onCancel(): void {
    this.dialoge.close();
  }

  handleFileInputChange(event): void {
    const files: FileList = event.target.files;
    if (files.length) {
        this.selectedFile = files[0];
        const f = files[0];
        this.profileImageAtt.patchValue(`${f.name}`);
    } else {
        this.profileImageAtt.patchValue("");
    }
    const reader = new FileReader();
    reader.readAsDataURL(files[0]);
    reader.onload = () => {
    this.selectedImageUrl = reader.result as string;
    };
  }
  getImageSRC(imageName: string): string {
    return this.constant.USER_PROFILE_IMAGE_SOURCE + imageName;
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
      this.profileImageAtt.patchValue(`${f.name}`);
    } else {
      this.profileImageAtt.patchValue("");
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
  removePasswordValidationonEditMode() {
    this.form.get('Password').clearValidators();
    this.form.get('Password').updateValueAndValidity();
    this.form.get('PasswordConfirmation').clearValidators();
    this.form.get('PasswordConfirmation').updateValueAndValidity();
  }
  hasRequiredValidator(controlName: string): boolean {
    const control = this.form.get(controlName);
    if (control?.validator) {
      const validator = control.validator({} as AbstractControl);
      if (validator && validator['required']) {
        return true;
      }
    }
    return false;
  }

  ngOnDestroy(): void {
    this.roles=[];
  }
}

