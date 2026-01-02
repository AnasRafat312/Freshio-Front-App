import { Component, Inject } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { LanguagesService } from '../../services/languages.service';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent {
    languageFactor = 'en'
    constructor(
        private sharedService: SharedService,
        private languageService: LanguagesService,
        public dialogRef: MatDialogRef<ConfirmComponent>,
        private toastr: ToastrService,
        @Inject(MAT_DIALOG_DATA) public data: any
      ) {
            this.languageFactor = this.languageService.getCurrentLanguage()
      }
      submit() {
          this.sharedService.confirm(this.data?.url, this.data?.model,this.data?.methodType).subscribe(
            (res: any) => {
              if (res.response) {
                this.toastr.success(res.message);
                this.dialogRef.close(res);
              }
              else {
                if (res.massageType === 2) {
                  this.toastr.warning(res.message);
                }
                else {
                  this.toastr.error(res.message);
                }
              }
            },
            (err: any) => {
              this.toastr.error(err.message);
            }
          )
      }
      onCancel(): void {
        this.dialogRef.close(false);
      }

}
