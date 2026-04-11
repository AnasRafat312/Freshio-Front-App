import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { Subscription } from 'rxjs';
import { BoxItemsService } from '../../services/box-items.service';
import { CreateBoxItemDto, UpdateBoxItemDto } from '../../core/models/box.model';
import { ResponseModel } from 'src/app/shared/model/response';

@Component({
  selector: 'app-box-item-add-edit',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './box-item-add-edit.component.html',
  styleUrls: ['./box-item-add-edit.component.scss']
})
export class BoxItemAddEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  languageFactor = 'en';
  isEditMode = false;
  itemId: number | null = null;
  boxId: number;
  boxName: string;
  languageSubscription: Subscription;

  constructor(
    private fb: FormBuilder,
    private language: LanguagesService,
    private sharedService: SharedService,
    private messageService: MessageService,
    private boxItemsService: BoxItemsService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.languageSubscription = this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
    });

    if (this.config.data) {
      this.boxId = this.config.data.BoxId;
      this.boxName = this.config.data.BoxName;
      
      if (this.config.data.Id) {
        this.isEditMode = true;
        this.itemId = this.config.data.Id;
        this.loadItemData();
      }
    }
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      Amount: [0, [Validators.required, Validators.min(0)]],
      Date: [new Date(), Validators.required],
      Description: ['']
    });
  }

  private loadItemData(): void {
    this.form.patchValue({
      Amount: this.config.data.Amount,
      Date: new Date(this.config.data.Date),
      Description: this.config.data.Description || ''
    });
  }

  hasRequiredValidator(form: FormGroup, controlName: string): boolean {
    const control = form.get(controlName);
    if (control && control.validator) {
      const validator = control.validator({} as any);
      return validator && validator['required'];
    }
    return false;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: this.languageFactor === 'en' ? 'Please fill all required fields correctly' : 'يرجى ملء جميع الحقول المطلوبة بشكل صحيح'
      });
      return;
    }

    const formValue = this.form.value;

    if (this.isEditMode && this.itemId) {
      const updateDto: UpdateBoxItemDto = {
        Amount: Number(formValue.Amount),
        Date: this.sharedService.getDateTime(new Date(formValue.Date)),
        Description: formValue.Description || ''
      };

      this.boxItemsService.update(this.itemId, updateDto).subscribe({
        next: (response: ResponseModel) => {
          if (response.Success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.Message || (this.languageFactor === 'en' ? 'Item updated successfully' : 'تم تحديث العنصر بنجاح')
            });
            this.ref.close(response?.Data);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: response.Message || (this.languageFactor === 'en' ? 'Operation failed' : 'فشلت العملية')
            });
          }
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: this.languageFactor === 'en' ? 'An error occurred while updating the item' : 'حدث خطأ أثناء تحديث العنصر'
          });
        }
      });
    } else {
      const createDto: CreateBoxItemDto = {
        BoxId: this.boxId,
        Amount: Number(formValue.Amount),
        Date: this.sharedService.getDateTime(new Date(formValue.Date)),
        Description: formValue.Description || ''
      };

      this.boxItemsService.create(createDto).subscribe({
        next: (response: ResponseModel) => {
          if (response.Success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.Message || (this.languageFactor === 'en' ? 'Item created successfully' : 'تم إنشاء العنصر بنجاح')
            });
            this.ref.close(response?.Data);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: response.Message || (this.languageFactor === 'en' ? 'Operation failed' : 'فشلت العملية')
            });
          }
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: this.languageFactor === 'en' ? 'An error occurred while creating the item' : 'حدث خطأ أثناء إنشاء العنصر'
          });
        }
      });
    }
  }

  onCancel(): void {
    this.ref.close(false);
  }
}
