import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LanguagesService } from '../../services/languages.service';

@Component({
  selector: 'app-export-options-modal',
  templateUrl: './export-options-modal.component.html',
  styleUrls: ['./export-options-modal.component.scss']
})
export class ExportOptionsModalComponent {
  languageFactor = 'en';
  selectedFormat: 'pdf' | 'excel' | null = null;
  selectedLanguage: 'ar' | 'en' | null = null;

  constructor(
    public dialogRef: MatDialogRef<ExportOptionsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private language: LanguagesService
  ) {
    this.languageFactor = this.language.getCurrentLanguage();
  }

  selectFormat(format: 'pdf' | 'excel') {
    this.selectedFormat = format;
  }

  selectLanguage(language: 'ar' | 'en') {
    this.selectedLanguage = language;
  }

  export() {
    if (this.selectedFormat && this.selectedLanguage) {
      this.dialogRef.close({
        format: this.selectedFormat,
        language: this.selectedLanguage
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
