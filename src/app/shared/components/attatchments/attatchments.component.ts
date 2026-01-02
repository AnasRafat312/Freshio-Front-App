import {
    Component,
    EventEmitter,
    Input,
    Optional,
    Output,
    Self,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { Constant } from 'src/app/core/constants/constant';
import { LanguagesService } from '../../services/languages.service';
import { AttachmentsService } from '../../services/attachments.service';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AttachmentInputsModel } from '../../core/attachmentsList.model';

@Component({
    selector: 'app-attatchments',
    templateUrl: './attatchments.component.html',
    styleUrls: ['./attatchments.component.scss'],
})
export class AttatchmentsComponent {
    languageFactor: string = 'en';
    @ViewChild('files') files: any;
    urlBase = this.constant.ATTACHMENT_FILES_SOURCE;
    companyName = localStorage.getItem('companyName');
    CreatedBy = localStorage.getItem('userId');
    isPopUp = false;
    fileNameAbbreviation: string;
    attachmentHostType: string;
    loading: boolean = false;
    //
    // inputs
    @Input() selectedFileInUpdate: any[] = [];
    @Input() selectedFiles: any[] = [];
    @Input() DeletedFileList: any[] = [];
    @Input() ID: number;
    @Input() isMulti: boolean = true;
    @Input() isDetails: boolean = false;
    @Input() TargetTable: string = 'AttachmentBasic';
    //outputs
    @Output() filesUpdated = new EventEmitter<{
        selectedFiles: File[];
        deletedFiles: any[];
        updatedFiles: any[];
    }>();
    constructor(
        private constant: Constant,
        private language: LanguagesService,
        private attatchmentsService: AttachmentsService,
        private messageService: MessageService,
        @Optional() @Self() private dialoge: DynamicDialogRef,
        @Optional() @Self() private config: DynamicDialogConfig
    ) {

        this.languageFactor = this.language.getCurrentLanguage();
        if (config?.data) {
            this.isPopUp = true;
            const inputs: AttachmentInputsModel = { ...config.data };
            this.ID = inputs.ID;
            this.isMulti = inputs.isMulti || true;
            this.isDetails = inputs.isDetails || false;
            this.TargetTable = inputs.TargetTable || 'AttachmentHr';
            this.selectedFileInUpdate = inputs.selectedFileInUpdate || [];
            this.selectedFiles = inputs.selectedFiles || [];
            this.DeletedFileList = inputs.DeletedFileList || [];
            this.attachmentHostType = inputs.attachmentHostType;
            this.fileNameAbbreviation = inputs.fileNameAbbreviation;
            this.getAttchments();
        }
    }
    ngOnChanges(changes: SimpleChanges): void {

    }

    onFileSelected(event: any) {
        const files: FileList = event.target.files;

        for (let i = 0; i < files.length; i++) {
            const file: File = files.item(i);
            const newItem = {
                fileDocument: {
                    name: file.name,
                    fileSize: file.size,
                    type: file.type,
                    dataUrl: null, // Placeholder for data URL
                },
            };

            // Check if this.id exists (update operation)
            if (this.ID) {
                this.selectedFileInUpdate.push(newItem);
                this.selectedFiles.push(file);

                // Remove the file from the DeletedFileList if it exists there
                this.DeletedFileList = this.DeletedFileList.filter(
                    (ele) => ele.name !== file.name
                );
            } else {
                // If this.id doesn't exist (new operation), simply push the file to selectedFiles and selectedFileInUpdate
                this.selectedFiles.push(file);
                this.selectedFileInUpdate.push(newItem);
            }
            if (this.isImage(newItem.fileDocument.type)) {
                // Read the selected image file as a data URL
                const reader = new FileReader();
                reader.onload = (event: any) => {
                    newItem.fileDocument.dataUrl = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        }
        if (!this.isPopUp) {
            this.passUpdatedFiles();
        }
        // If this.id exists, remove files from selectedFiles and selectedFileInUpdate that don't have fileDocument property
        /* if (this.id) {
          this.selectedFiles = this.selectedFiles.filter(obj => obj.hasOwnProperty('fileDocument'));
          this.selectedFileInUpdate = this.selectedFileInUpdate.filter(obj => obj.name);
      } */
    }
    formatFileSize(size: number): string {
        if (size === 0) return '0 Bytes';

        const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const digitGroups = Math.floor(Math.log(size) / Math.log(1024));

        return `${(size / Math.pow(1024, digitGroups)).toFixed(2)} ${
            units[digitGroups]
        }`;
    }
    removeFilesFromDatabase(model) {
        this.attatchmentsService.deleteFile(model).subscribe((res) => {});
    }
    removeFile(file: any): void {
        if (file.attachHostID) {
            // old
            console.log(this.selectedFileInUpdate);
            const model = {
                id: file.fileDocument.ID,
                TargeTable: this.TargetTable,
            };
            this.DeletedFileList.push(model);
            this.selectedFileInUpdate.forEach((ele, i) => {
                if (ele.fileDocument.name == file.fileDocument.name) {
                    this.selectedFileInUpdate.splice(i, 1);
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
        }
        if (!this.isPopUp) {
            this.passUpdatedFiles();
        }
    }
    onFileDrop(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        const files: FileList = event.dataTransfer!.files;
        if (this.ID) {
            for (let i = 0; i < files.length; i++) {
                const file: File = files.item(i);
                const newItem = {
                    fileDocument: {
                        name: file.name,
                        fileSize: file.size,
                        type: file.type,
                    },
                };
                this.selectedFileInUpdate.push(newItem);
                this.selectedFiles.push(file);
                const deletedListTemp = this.DeletedFileList;
                this.DeletedFileList.forEach((ele, index) => {
                    if (file?.name == ele?.name) {
                        deletedListTemp.splice(index, 1);
                    }
                });
                this.DeletedFileList = deletedListTemp;
            }
            this.selectedFiles = this.selectedFiles.filter(
                (obj) => !obj.hasOwnProperty('fileDocument')
            );
            this.selectedFileInUpdate = this.selectedFileInUpdate.filter(
                (obj) => !obj.name
            );
        } else {
            for (let i = 0; i < files.length; i++) {
                const file: File = files.item(i);
                this.selectedFiles.push(file);
                const newItem = {
                    fileDocument: {
                        name: file.name,
                        fileSize: file.size,
                        type: file.type,
                    },
                };
                this.selectedFileInUpdate.push(newItem);
            }
        }
        if (!this.isPopUp) {
            this.passUpdatedFiles();
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
    removeFromListByKey(list: any[], key: string) {
        if (list.length > 0) {
            list = list.filter((obj) => !obj.hasOwnProperty(key));
        }
        return list;
    }
    passUpdatedFiles(): void {
        this.selectedFiles = this.removeFromListByKey(
            this.selectedFiles,
            'fileDocument'
        );
        this.selectedFileInUpdate = this.selectedFileInUpdate.filter(
            (obj) => !obj.name
        );
        // Emit updated data to the parent
        this.filesUpdated.emit({
            selectedFiles: this.selectedFiles,
            deletedFiles: this.DeletedFileList,
            updatedFiles: this.selectedFileInUpdate,
        });
    }
    // Method to check if the file type is an image
    isImage(type: string): boolean {
        return type && type.startsWith('image');
    }

    // Method to determine the appropriate icon or image
    getIcon(filename: string | undefined): string {
        if (filename.includes('pdf')) {
            return 'fa-solid fa-file-pdf';
        } else if (filename.includes('word')) {
            return 'fa-solid fa-file-word';
        } else if (
            filename.includes('excel') ||
            filename.includes('sheet') ||
            filename.includes('xlsx')
        ) {
            return 'fa-solid fa-file-excel';
        } else if (filename.includes('zip')) {
            return 'fa-solid fa-file-zip';
        } else {
            return 'fa-solid fa-file-lines';
        }
    }
    getAttchments() {
        this.loading = true;
        const model = {
            AttachHostID: this.ID,
            AttachHostType: this.attachmentHostType,
            CompanyID: localStorage.getItem('companyId'),
        };
        this.attatchmentsService
            .getAllAttatchmentsByHostIDAndHostTypeID(model,this.TargetTable)
            .subscribe((res: any[]) => {
                if (res?.length) {
                    res.forEach((ele, i) => {
                        this.selectedFiles.push({
                            attachHostID: ele.ID,
                            fileDocument: ele,
                        });
                        this.selectedFileInUpdate.push({
                            attachHostID: ele.ID,
                            fileDocument: ele,
                        });
                        if (i === res.length - 1) {
                            this.loading = false;
                        }
                    });
                } else {
                    this.loading = false;
                }
            });
    }
    submit() {
        this.loading = true;

        this.attatchmentsService
            .saveAttatchment(
                this.ID,
                this.selectedFiles,
                this.attachmentHostType,
                this.fileNameAbbreviation,
                this.TargetTable,
                this.DeletedFileList
            )
            .subscribe(
                (data) => {
                    // All attachment requests are completed
                    this.loading = false;
                    this.dialoge.close(true);

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Attachments Uploaded',
                    });
                },
                (err) => {
                    this.loading = false;
                    // Handle error
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: err?.message,
                    });
                }
            );
    }
    onCancel() {
        this.dialoge.close(false);
    }
}
