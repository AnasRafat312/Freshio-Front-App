import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { LanguagesService } from '../../services/languages.service';
import { SharedService } from '../../services/shared.service';
import { HelpMeService } from './services/help-me.service';
import { Router } from '@angular/router';
enum Modules {
    PayrollAndHr = 1,
    ActivityManagement = 2,
    Finance = 3,
    Warehouse = 4
}
@Component({
    selector: 'app-help-me',
    templateUrl: './help-me.component.html',
    styleUrls: ['./help-me.component.scss'],
})
export class HelpMeComponent implements OnInit {
    //language Variables
    languageFactor = 'ar';
    //Forms Variables
    form!: FormGroup;
    // lists
    ModuleIDs:any[] = []
    inquiryList: any[] = [
        {Name:'Issue',ID:1},
        {Name:'Suggetion',ID:2},
    ]
    selectedFiles: File[] = [];
    selectedFileInUpdate: any[] = [];
    selectedFile!:File;
    @ViewChild('files') files: any;

    constructor(
        private toastr: ToastrService,
        public dialogRef: MatDialogRef<HelpMeComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private fb: FormBuilder,
        private languageService: LanguagesService,
        private sharedService: SharedService,
        private helpService: HelpMeService,
        private router: Router,


    ) {
        // set language value
        this.languageService.currentLanguage.subscribe((data) => {
            this.languageFactor = data;
        });
        this.ModuleIDs = this.sharedService.getTypeList(Modules);
        // intialization for forms
        this.form = this.fb.group({

            Module: [null, Validators.required],
            InquiryType: [null, Validators.required],
            FileAttachment: [null],
            CreatedDateTime: this.mergeDateAndTime(new Date()),
            Subject: [null, Validators.required],
            Message: [null, Validators.required],
        });
    }
    ngOnInit(): void {}
    removeFile(file: any): void {
            const newFiles = Array.from(this.files.nativeElement.files);

            newFiles.forEach((file: any) => {
                this.selectedFiles.push(file);
            });
            this.selectedFiles = this.selectedFiles.filter(
                (obj) => !obj.hasOwnProperty('fileDocument')
            );
            this.selectedFiles.forEach((ele, i) => {
                if (ele.name == file.fileDocument.name) {
                    this.selectedFiles.splice(i, 1);
                }
            });
            this.selectedFileInUpdate.forEach((ele, i) => {
                if (ele?.name) {
                    this.selectedFileInUpdate.splice(i, 1);
                }
                if (ele?.fileDocument?.name) {
                    if (ele.fileDocument.name == file.fileDocument.name) {
                        this.selectedFileInUpdate.splice(i, 1);
                    }
                }
            });
            if (this.selectedFileInUpdate.length == 0) {
                this.files.nativeElement.value = '';
            }
            console.log(this.selectedFiles);
            this.selectedFileInUpdate = this.selectedFileInUpdate.filter(
                (obj) => !obj.name
            );
    }
    formatFileSize(size: number): string {
        if (size === 0) return '0 Bytes';

        const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const digitGroups = Math.floor(Math.log(size) / Math.log(1024));

        return `${(size / Math.pow(1024, digitGroups)).toFixed(2)} ${units[digitGroups]
            }`;
    }
    onFileSelected(event: any) {
        const files: FileList = event.target.files;
            for (let i = 0; i < files.length; i++) {
                const file: File = files.item(i);
                this.selectedFiles.push(file);
                const newItem = {
                    fileDocument: {
                        name: file.name,
                        fileSize: file.size,
                    },
                };
                this.selectedFileInUpdate.push(newItem);
            }
            this.selectedFile = files[0]
    }
    onFileDrop(event: DragEvent): void {

        event.preventDefault();
        event.stopPropagation();
        const files: FileList = event.dataTransfer!.files;
        this.selectedFile = files[0]
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
    getCurrentDate() {
        const startDate = new Date();
        const year = startDate.getFullYear();
        const month = String(startDate.getMonth() + 1).padStart(2, '0'); // Adding 1 to the month because months are zero-based
        const day = String(startDate.getDate()).padStart(2, '0');
        const hours = String(startDate.getHours()).padStart(2, '0');
        const minutes = String(startDate.getMinutes()).padStart(2, '0');
        const seconds = String(startDate.getSeconds()).padStart(2, '0');

        const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        return formattedDate
      }
      submit() {
        const formData = new FormData();
        formData.append('Module', this.form.value.Module);
        formData.append('InquiryType', this.form.value.InquiryType);
        formData.append('Subject', this.form.value.Subject);
        formData.append('Message', this.form.value.Message);

        for (let i = 0; i < this.selectedFiles.length; i++) {
            formData.append('FileAttachment', this.selectedFiles[i], this.selectedFiles[i].name);
        }
        formData.append('CreatedBy', localStorage.getItem('userId'));
        formData.append('CreatedDateTime', this.getCurrentDate());
        formData.append('CompanyID', localStorage.getItem('companyId'));



        this.helpService.sendHelp(formData).subscribe(
            (res: any) => {
                if (res.response) {
                    this.toastr.success(res.message);
                }
            },
            (error: any) => {
                // Handle error
                console.error('Error:', error);
                this.toastr.error('Failed to send help request');
            }
        );
    }

    mergeDateAndTime(date, time?) {
        if (date !== '' || date !== null || date !== undefined) {
            const startDate = new Date(date);
            const year = startDate.getFullYear();
            const month = String(startDate.getMonth() + 1).padStart(2, '0');
            const day = String(startDate.getDate()).padStart(2, '0');
            if (time) {
                const Time = time;
                const formattedDate = `${year}-${month}-${day} ${Time}`;
                return formattedDate;
            } else {
                const dateTime = new Date(date);
                const hours = String(dateTime.getHours()).padStart(2, '0');
                const minutes = String(dateTime.getMinutes()).padStart(2, '0');
                const seconds = String(dateTime.getSeconds()).padStart(2, '0');
                const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                return formattedDate;
            }
        } else {
            return null;
        }
    }

    goToSupportsList() {
        this.router.navigate(['pages/support/my'])
        this.dialogRef.close()
    }
    onCancel() {
        this.dialogRef.close(false)
    }
}
