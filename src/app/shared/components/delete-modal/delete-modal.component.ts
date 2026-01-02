import { Component, Inject } from '@angular/core';
import { DeleteService } from './delete.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { LanguagesService } from '../../services/languages.service';
import { ResponseModel } from '../../model/response';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-delete-modal',
  templateUrl: './delete-modal.component.html',
  styleUrls: ['./delete-modal.component.scss']
})
export class DeleteModalComponent {
    languageFactor = 'en'
    message:string = 'Would you like to Confirm Delete?'
  constructor(private deleteService : DeleteService,
    public dialogRef: MatDialogRef<DeleteModalComponent>,
    private messageService: MessageService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private language: LanguagesService,
    ){
        this.languageFactor = this.language.getCurrentLanguage()

  }
  delete(){
    if(this.data?.model) {
      this.deleteService.deleteFun(this.data?.url,undefined,this.data?.model).subscribe(
        (res: ResponseModel) => {
            if(res && res?.response) {
                this.messageService.add({ severity: 'success', summary: 'The Record deleted successfuly', detail: res?.message });
            }else {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Warn',
                    detail: res?.message,
                });
            }
          this.dialogRef.close(true);

        },
        (err: any) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.message });

        }
       )
      }else {
      this.deleteService.deleteFun(this.data?.url,this.data?.id).subscribe(
        (res: ResponseModel) => {
            if(res && res?.response) {
                this.messageService.add({ severity: 'success', summary: 'The Record deleted successfuly', detail: res?.message });
            }else {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Warn',
                    detail: res?.message,
                });
            }
          this.dialogRef.close(true);

        },
        (err: any) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.message });

        }
       )

    }
  }
  onCancel(): void {
    this.dialogRef.close(false);
  }

}
