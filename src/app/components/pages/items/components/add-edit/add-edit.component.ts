import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { Subscription } from 'rxjs';
import { ItemsService } from '../../services/items.service';
import { ItemDto } from 'src/app/shared/model/freshio/item.model';

@Component({
  selector: 'app-items-add-edit',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss']
})
export class ItemsAddEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  languageFactor = 'en';
  isEditMode = false;
  itemId: number | null = null;
  languageSubscription: Subscription;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private language: LanguagesService,
    private messageService: MessageService,
    private itemsService: ItemsService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.languageSubscription = this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
    });

    // Check if opened in dialog with data
    if (this.config.data) {
      this.isEditMode = true;
      this.itemId = this.config.data.ID;
      this.loadItemData(this.config.data);
    }
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      Name: ['', [Validators.required, Validators.minLength(2)]],
      UnitOfMeasure: ['Kg', [Validators.required]],
      DefaultSellPrice: [0, [Validators.required, Validators.min(0)]],
      MinimumStockQuantity: [0, [Validators.required, Validators.min(0)]],
      IsActive: [true]
    });
  }

  private loadItemData(data: any): void {
    this.form.patchValue({
      Name: data.Name,
      UnitOfMeasure: data.UnitOfMeasure,
      DefaultSellPrice: data.DefaultSellPrice,
      MinimumStockQuantity: data.MinimumStockQuantity,
      IsActive: data.IsActive
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

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: this.languageFactor === 'en' ? 'Validation Error' : 'خطأ في التحقق',
        detail: this.languageFactor === 'en' ? 'Please fill all required fields' : 'يرجى ملء جميع الحقول المطلوبة'
      });
      return;
    }

    this.loading = true;
    const itemData: ItemDto = {
      ...this.form.value,
      ID: this.itemId
    };

    const request = this.isEditMode
      ? this.itemsService.updateItem(this.itemId!, itemData)
      : this.itemsService.createItem(itemData);

    request.subscribe({
      next: (response) => {
        if (response?.Success) {
          this.messageService.add({
            severity: 'success',
            summary: this.languageFactor === 'en' ? 'Success' : 'نجح',
            detail: this.isEditMode
              ? (this.languageFactor === 'en' ? 'Item updated successfully' : 'تم تحديث الصنف بنجاح')
              : (this.languageFactor === 'en' ? 'Item created successfully' : 'تم إنشاء الصنف بنجاح')
          });
          this.ref.close(response.Data);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: this.languageFactor === 'en' ? 'Error' : 'خطأ',
            detail: response?.Message || (this.languageFactor === 'en' ? 'Operation failed' : 'فشلت العملية')
          });
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: this.languageFactor === 'en' ? 'Error' : 'خطأ',
          detail: this.languageFactor === 'en' ? 'An error occurred' : 'حدث خطأ'
        });
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.ref.close();
  }
}
