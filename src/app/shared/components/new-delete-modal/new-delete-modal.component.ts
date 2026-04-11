import { Component } from '@angular/core';
import { DeleteService } from '../delete-modal/delete.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { LanguagesService } from '../../services/languages.service';
import { ResponseModel } from '../../model/response';
@Component({
  selector: 'app-new-delete-modal',
  templateUrl: './new-delete-modal.component.html',
  styleUrls: ['./new-delete-modal.component.scss']
})
export class NewDeleteModalComponent {
    data!: any;
    message: string = 'Would you like to Confirm Delete?';
    languageFactor = 'en'
  constructor(
    private deleteService: DeleteService,
    public dialoge: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private messageService: MessageService,
    private language: LanguagesService,
  ) {
    this.data = config?.data
    this.languageFactor = this.language.getCurrentLanguage()
  }
  delete() {
    if (this.data?.model) {
      this.deleteService.deleteFun(this.data?.url, undefined, this.data?.model).subscribe(
        (res: any) => {
          if (res.response) {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: res?.message });
            this.dialoge.close(true);
          }
          else {
            if (res.massageType === 2) {
                this.messageService.add({ severity: 'warn', summary: 'Warn', detail: res?.message });
            }
            else {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: res?.message });
            }
          }
        },
        (err: any) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.message });
        }
      )
    } else {
      this.deleteService.deleteFun(this.data?.url, this.data?.id).subscribe(
        (res: ResponseModel) => {
          if (res?.Success) {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: res?.Message });
            this.dialoge.close(true);
          }
          else {
            this.messageService.add({ severity: 'warn', summary: 'Warn', detail: res?.Message });
          }
        },
        (err: any) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.Message });
        }
      )
    }
  }
  onCancel(): void {
    this.dialoge.close(false);
  }
}
