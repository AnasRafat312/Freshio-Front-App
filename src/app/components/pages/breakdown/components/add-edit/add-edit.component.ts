import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { Constant } from 'src/app/core/constants/constant';
import { SharedModule } from 'src/app/shared/shared.module';
import { Subscription } from 'rxjs';
import { BoxesService } from '../../services/boxes.service';
import { CreateBoxDto, UpdateBoxDto, BoxDetailsDto, BoxItemDto } from '../../core/models/box.model';
import { ResponseModel } from 'src/app/shared/model/response';

@Component({
  selector: 'app-breakdown-add-edit',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss']
})
export class BreakdownAddEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  languageFactor = 'en';
  isEditMode = false;
  boxId: number | null = null;
  languageSubscription: Subscription;
  
  // Box type options
  boxTypeOptions = [
    { label: 'In', value: 'In' },
    { label: 'Out', value: 'Out' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private language: LanguagesService,
    private sharedService: SharedService,
    private messageService: MessageService,
    private constant: Constant,
    private boxesService: BoxesService,
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
      // If Type is provided without Id, it's a new box with pre-set type
      if (this.config.data.Type && !this.config.data.Id) {
        this.form.patchValue({ Type: this.config.data.Type });
      }
      // If Id is provided, it's edit mode
      else if (this.config.data.Id) {
        this.isEditMode = true;
        this.boxId = this.config.data.Id;
        this.loadBoxData(this.boxId);
      }
    } else {
      // Check route params (for standalone page mode)
      this.route.params.subscribe(params => {
        if (params['id']) {
          this.isEditMode = true;
          this.boxId = +params['id'];
          this.loadBoxData(this.boxId);
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      Name: ['', [Validators.required, Validators.minLength(3)]],
      Type: ['In', Validators.required],
      BoxItemsList: this.fb.array([])
    });
    
    // Add one empty item by default
    this.addBoxItem();
  }

  get boxItemsList(): FormArray {
    return this.form.get('BoxItemsList') as FormArray;
  }

  createBoxItemFormGroup(item?: BoxItemDto): FormGroup {
    return this.fb.group({
      Id: [item?.Id || 0],
      Amount: [item?.Amount || 0, [Validators.required, Validators.min(0)]],
      Date: [item?.Date ? new Date(item.Date) : new Date(), Validators.required],
      Description: [item?.Description || ''],
      IsDeleted: [item?.IsDeleted || false]
    });
  }

  addBoxItem(): void {
    this.boxItemsList.push(this.createBoxItemFormGroup());
  }

  removeBoxItem(index: number): void {
    if (this.boxItemsList.length > 1) {
      const item = this.boxItemsList.at(index).value;
      
      // If editing and item has an Id, mark as deleted instead of removing
      if (this.isEditMode && item.Id > 0) {
        this.boxItemsList.at(index).patchValue({ IsDeleted: true });
      } else {
        this.boxItemsList.removeAt(index);
      }
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: this.languageFactor === 'en' ? 'At least one item is required' : 'عنصر واحد على الأقل مطلوب'
      });
    }
  }

  getActiveItems(): FormGroup[] {
    return this.boxItemsList.controls.filter(
      (control) => !control.get('IsDeleted')?.value
    ) as FormGroup[];
  }

  getTotalAmount(): number {
    let total = 0;
    this.boxItemsList.controls.forEach((control) => {
      if (!control.get('IsDeleted')?.value) {
        total += Number(control.get('Amount')?.value || 0);
      }
    });
    return total;
  }

  private loadBoxData(id: number): void {
    this.boxesService.getById(id).subscribe({
      next: (response: ResponseModel) => {
        if (response?.Success && response?.Data) {
          const boxData: BoxDetailsDto = response.Data;
          
          // Patch header fields
          this.form.patchValue({
            Name: boxData.Name,
            Type: boxData.Type
          });
          
          // Clear existing items and add loaded items
          this.boxItemsList.clear();
          if (boxData.Items && boxData.Items.length > 0) {
            boxData.Items.forEach(item => {
              const boxItem: BoxItemDto = {
                Id: item.Id,
                Amount: item.Amount,
                Date: item.Date,
                Description: item.Description,
                IsDeleted: false
              };
              this.boxItemsList.push(this.createBoxItemFormGroup(boxItem));
            });
          } else {
            this.addBoxItem();
          }
        }
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: this.languageFactor === 'en' ? 'Failed to load box data' : 'فشل تحميل بيانات الصندوق'
        });
      }
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

    // Check if at least one active item exists
    const activeItems = this.getActiveItems();
    if (activeItems.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: this.languageFactor === 'en' ? 'At least one item is required' : 'عنصر واحد على الأقل مطلوب'
      });
      return;
    }

    const formValue = this.form.value;
    
    // Prepare box items list
    const boxItemsList: BoxItemDto[] = formValue.BoxItemsList.map((item: any) => ({
      Id: item.Id || 0,
      Amount: Number(item.Amount),
      Date: this.sharedService.getDateTime(new Date(item.Date)),
      Description: item.Description || '',
      IsDeleted: item.IsDeleted || false
    }));

    if (this.isEditMode && this.boxId) {
      const updateDto: UpdateBoxDto = {
        Name: formValue.Name,
        Type: formValue.Type,
        BoxItemsList: boxItemsList
      };

      this.boxesService.update(this.boxId, updateDto).subscribe({
        next: (response: ResponseModel) => {
          if (response.Success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.Message || (this.languageFactor === 'en' ? 'Box updated successfully' : 'تم تحديث الصندوق بنجاح')
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
            detail: this.languageFactor === 'en' ? 'An error occurred while updating the box' : 'حدث خطأ أثناء تحديث الصندوق'
          });
        }
      });
    } else {
      const createDto: CreateBoxDto = {
        Name: formValue.Name,
        Type: formValue.Type,
        BoxItemsList: boxItemsList
      };

      this.boxesService.create(createDto).subscribe({
        next: (response: ResponseModel) => {
          if (response.Success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.Message || (this.languageFactor === 'en' ? 'Box created successfully' : 'تم إنشاء الصندوق بنجاح')
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
            detail: this.languageFactor === 'en' ? 'An error occurred while creating the box' : 'حدث خطأ أثناء إنشاء الصندوق'
          });
        }
      });
    }
  }

  onCancel(): void {
    if (this.ref) {
      this.ref.close(false);
    } else {
      this.router.navigate(['/pages/breakdown']);
    }
  }
}
