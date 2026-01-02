import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CompainesService } from '../compaines.service';
import { ToastrService } from 'ngx-toastr';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LanguageService } from 'src/app/core/languageLocalization/language.service';
import { GeneralConfig } from 'src/app/core/common/generalConfig';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { Constant } from 'src/app/core/constants/constant';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-add-company',
  templateUrl: './add-company.component.html',
  styleUrls: ['./add-company.component.scss']
})
export class AddCompanyComponent extends GeneralConfig {

  ProfileImage: File = null as any;// Variable to store file
  currentInput: any;
  selectedFile: any;
  profileImageAtt: FormControl = new FormControl();
  file_store: FileList;
  languageFactor = 'ar'
  selectedImageUrl!:string
  data!:any;
   constructor(
        private constant: Constant,
      private compainesService:CompainesService, languageService:LanguageService, private toastr:ToastrService,
      private language:LanguagesService,
        private messageService: MessageService,
        public dialoge: DynamicDialogRef,
        public config: DynamicDialogConfig )
    {
      super(languageService);
      this.language.currentLanguage.subscribe(
        data => {
          this.languageFactor = data
        }
      )
      this.data = this.config.data
      if(this.data?.rowData){
        this.setFormValues(this.data?.rowData);
        if(this?.data?.view){
          this.form.disable()
        }
      }
   }
  form:any = new FormGroup({
    Name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    Phone : new FormControl('', [Validators.required]),
    Email: new FormControl('', [Validators.required, Validators.email]),
    Location:new FormControl(),
  });

  get f(){
    return this.form.controls;
  }

  submit(){
      const formData = new FormData();
      if (this.selectedFile) {
        formData.append('ProfileImage', this.selectedFile, this.selectedFile.name);
      }
      formData.append("Name",this.form.value.Name);
      formData.append("Phone",this.form.value.Phone);
      formData.append("Email",this.form.value.Email);
      formData.append("Location",this.form.value.Location);
      formData.append("Logo",this.profileImageAtt.value)
      formData.append("AccountID", localStorage.getItem('accountId'))
      formData.append("CompanyID", localStorage.getItem('companyId'))


      if(this.data?.rowData){
        formData.append("ID",this.data?.rowData?.ID)
        this.compainesService.updateCompany(formData).subscribe(
          res => {
            this.dialoge.close(true);
            this.toastr.success('update Company Successfuly');
            this.compainesService.compantSubject.next(true);
          },
          err => {
            this.toastr.error('error while updating company');
          }
         )
       }else{
        this.compainesService.addCompany(formData).subscribe(
          res => {
            this.dialoge.close();
            this.toastr.success('Add Company Successfuly')
            this.compainesService.compantSubject.next(true);
          },
          err => {
            this.toastr.error('error while creating company')
          }
         )
       }

  }

  setFormValues(data:any){
    Object.keys(this.form?.controls).forEach((key)=>{
     if(data[key]){
       this.form.controls[key].setValue(data[key]);
     }
    })
    if(data?.Logo){
      this.profileImageAtt.patchValue(`${data?.Logo}`);
    }
   }

   onCancel(): void {
     this.dialoge.close();
   }

   hasRequiredValidator(form: FormGroup, controlName: string): boolean {
    const control = form.get(controlName);
    if (control?.validator) {
      const validator = control.validator({} as any);
      if (validator && validator['required']) {
        return true;
      }
    }
    return false;
  }

   handleFileInputChange(event): void {
    const files: FileList = event.target.files;
    if (files.length) {
        this.selectedFile = files[0];
        const f = files[0];
        this.profileImageAtt.patchValue(`${f.name}`);
    } else {
        this.profileImageAtt.patchValue('');
    }
    const reader = new FileReader();
    reader.readAsDataURL(files[0]);
    reader.onload = () => {
        this.selectedImageUrl = reader.result as string;
    };
}
getImageSRC(imageName: string): string {
    return this.constant.RESOURCE_IMAGE_SOURCE + imageName;
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
        this.profileImageAtt.patchValue('');
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
}

