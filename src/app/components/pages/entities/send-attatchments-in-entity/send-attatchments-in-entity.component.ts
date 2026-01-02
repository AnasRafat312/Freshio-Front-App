import { EntityService } from './../entities.service';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Constant } from 'src/app/core/constants/constant';
import { LoaderService } from 'src/app/shared/components/loading-spinner/services/loader.service';
import { LanguagesService } from 'src/app/shared/services/languages.service';

@Component({
  selector: 'app-send-attatchments-in-entity',
  templateUrl: './send-attatchments-in-entity.component.html',
  styleUrls: ['./send-attatchments-in-entity.component.scss']
})
export class SendAttatchmentsInEntityComponent implements OnInit{
    languageFactor = 'en';
    dialogTemp!:any;
    selectedFiles: File[] = []
    selectedFileInUpdate:any[] = []
    DeletedFileList:any[] = []
    @ViewChild('files') files: any;
    urlBase = this.constant.ATTACHMENT_FILES_SOURCE;

    constructor(
        private constant: Constant,
        private entityService: EntityService,
        public dialogRef: MatDialogRef<SendAttatchmentsInEntityComponent>,
        private loadingSpinnerService: LoaderService,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private languageService: LanguagesService,
        private fb: FormBuilder,
        private dialog: MatDialog,
        private toastr: ToastrService

    ) {
        this.languageFactor = this.languageService.getCurrentLanguage();
    }
    ngOnInit(): void {
        //this.selectedFileInUpdate = this.data?.attatchmentsList

        if(this.data?.deletedAttatchments?.length > 0 && this.data?.deletedAttatchments) {
            this.data?.deletedAttatchments.forEach(ele => {
                this.DeletedFileList.push(ele)
            })
        }
        const attatchments = this.data?.attatchmentsList
        attatchments?.forEach(
            (ele:any) => {

                if(ele?.fileDocument) {

                    const fileInupdate = ele;
                    const newItem = {
                        fileDocument: {
                            name: fileInupdate.fileDocument.name,
                            fileSize: fileInupdate.fileDocument.fileSize,
                            ID: fileInupdate?.fileDocument.ID,
                            url:fileInupdate?.fileDocument.url
                        },
                        attachHostID: fileInupdate?.attachHostID,
                    };
                    this.selectedFileInUpdate.push(newItem);
                    this.selectedFiles.push(ele)
                }
                if(ele?.name) {

                    const fileInupdate = ele;
                    const file: File = ele;
                    const newItem = {
                        fileDocument: {
                            name: fileInupdate.name,
                            fileSize: fileInupdate.size,
                        },
                    };
                    this.selectedFileInUpdate.push(newItem);
                    this.selectedFiles.push(ele)
                }
        })
    }

    mergeDateAndTime(date, time?) {
        console.log(time);
        if (date !== '' || date !== null || date !== undefined) {
            const startDate = new Date(date);
            const year = startDate.getFullYear();
            const month = String(startDate.getMonth() + 1).padStart(2, '0'); // Adding 1 to the month because months are zero-based
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
    formatFileSize(size: number): string {
        if (size === 0) return '0 Bytes';

        const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const digitGroups = Math.floor(Math.log(size) / Math.log(1024));

        return `${(size / Math.pow(1024, digitGroups)).toFixed(2)} ${units[digitGroups]
            }`;
    }
    onFileSelected(event: any) {

        const files: FileList = event.target.files;
        console.log(files)
        if (this.data?.rowData?.ID) {
            for (let i = 0; i < files.length; i++) {
                const file: File = files.item(i);
                const newItem = {
                    fileDocument: {
                        name: file.name,
                        fileSize: file.size,
                    },
                };
                this.selectedFileInUpdate.push(newItem);
                this.selectedFiles.push(file);
                const deletedListTemp = this.DeletedFileList
                this.DeletedFileList.forEach((ele,index) => {
                    if(file?.name == ele?.name) {
                        deletedListTemp.splice(index,1)
                    }
                })
                this.DeletedFileList = deletedListTemp
            }
            this.selectedFiles = this.selectedFiles.filter(
                (obj) => !obj.hasOwnProperty('fileDocument')
            );
            this.selectedFileInUpdate = this.selectedFileInUpdate.filter(
                (obj) => !obj.name
            );
        } else {
            for (let i = 0; i < files.length; i++) {

/*                 const reader = new FileReader();
                reader.onload = () => {
                  this.imagePath = reader.result as string;
                };
                reader.readAsDataURL(this.selectedFile); */
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
        }
    }
    removeFile(file: any): void {

        if (file?.fileDocument?.ID) {
            // old
            console.log(this.selectedFileInUpdate);
            console.log(this.selectedFileInUpdate);
            const model = {
                id: file.fileDocument.ID,
                TargeTable: 'AttachmentBasic',
                name:file.fileDocument.name
            };
            this.DeletedFileList.push(model)
            this.selectedFileInUpdate.forEach((ele, i) => {

                if (ele.fileDocument.name == file.fileDocument.name) {
                    this.selectedFileInUpdate.splice(i, 1);
                    this.selectedFiles.splice(i, 1);
                }
            });
        } else {
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
            console.log(this.selectedFileInUpdate);
        }
    }
    removeDuplicates(arr, prop) {
        const seen = new Set();
        return arr.filter(item => {
            const value = item[prop];
            return seen.has(value) ? false : seen.add(value);
        });
    }
    submit() {

        console.log(this.selectedFiles)
        //this.selectedFiles = this.removeDuplicates(this.selectedFiles, 'name')
        console.log(this.selectedFileInUpdate)
        const model = {
            entityType: this.data.entityType,
            attachmentType: this.data.attachmentType,
            attatchmentsList:this.selectedFiles,
            deletedAttatchments:this.DeletedFileList
           }
        this.entityService.setEntityAttatchments(model)
        this.dialogRef.close();
    }
    @ViewChild('files') filesInput!: ElementRef;

    onFileDrop(event: DragEvent): void {

      event.preventDefault();
      event.stopPropagation();
      const files: FileList = event.dataTransfer!.files;
        if (this.data?.rowData?.ID) {
            for (let i = 0; i < files.length; i++) {
                const file: File = files.item(i);
                const newItem = {
                    fileDocument: {
                        name: file.name,
                        fileSize: file.size,
                    },
                };
                this.selectedFileInUpdate.push(newItem);
                this.selectedFiles.push(file);
                const deletedListTemp = this.DeletedFileList
                this.DeletedFileList.forEach((ele,index) => {
                    if(file?.name == ele?.name) {
                        deletedListTemp.splice(index,1)
                    }
                })
                this.DeletedFileList = deletedListTemp
            }
            this.selectedFiles = this.selectedFiles.filter(
                (obj) => !obj.hasOwnProperty('fileDocument')
            );
            this.selectedFileInUpdate = this.selectedFileInUpdate.filter(
                (obj) => !obj.name
            );
        } else {
            for (let i = 0; i < files.length; i++) {

/*                 const reader = new FileReader();
                reader.onload = () => {
                  this.imagePath = reader.result as string;
                };
                reader.readAsDataURL(this.selectedFile); */
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
        this.dialogRef.close();
    }
    ngOnDestroy(): void {
        this.selectedFiles = []
        this.selectedFileInUpdate = []
        this.DeletedFileList = []
    }
}
