import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { Constant } from 'src/app/core/constants/constant';
import { ResponseModel } from 'src/app/shared/model/response';
import { SharedModule } from 'src/app/shared/shared.module';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-users-add-edit',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss']
})
export class UsersAddEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  languageFactor = 'en';
  isEditMode = false;
  userId: number | null = null;
  languageSubscription: Subscription;
  roles: any[] = [];
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private language: LanguagesService,
    private sharedService: SharedService,
    private messageService: MessageService,
    private constant: Constant,
    private http: HttpClient,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.languageSubscription = this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
    });

    this.loadRoles();

    // Check if opened in dialog with data
    if (this.config.data) {
      this.isEditMode = true;
      this.userId = this.config.data.Id;
      if(this.userId) {
        this.loadUserData(this.userId);
      }
    } else {
      // Check route params (for standalone page mode)
      this.route.params.subscribe(params => {
        if (params['id']) {
          this.isEditMode = true;
          this.userId = +params['id'];
          this.loadUserData(this.userId);
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
      Username: ['', [Validators.required, Validators.minLength(3)]],
      Email: ['', [Validators.required, Validators.email]],
      FullName: [''],
      PhoneNumber: ['', [Validators.pattern(/^[0-9]{11}$/)]],
      RoleId: [null, [Validators.required]],
      IsActive: [true],
      Password: [''],
      PasswordConfirmation: ['']
    });

    // Add password validators for create mode
    if (!this.isEditMode) {
      this.form.get('Password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.form.get('PasswordConfirmation')?.setValidators([Validators.required]);
    }
  }

  private loadRoles(): void {
    const url = `${this.constant.API_ENDPOINT}Roles/GetAll`;
    this.http.get<ResponseModel>(url).subscribe({
      next: (response: ResponseModel) => {
        if (response?.Success && response?.Data) {
          this.roles = response.Data;
        }
      },
      error: (error) => {
        console.error('Error loading roles:', error);
      }
    });
  }

  private loadUserData(id: number): void {
    const url = this.constant.API_ENDPOINT + `Users/GetById/${id}`;
    this.sharedService.confirm(url, '', 'Get').subscribe({
      next: (response: ResponseModel) => {
        if (response?.Data) {
          this.form.patchValue({
            Username: response.Data.Username,
            Email: response.Data.Email,
            FullName: response.Data.FullName,
            PhoneNumber: response.Data.PhoneNumber,
            RoleId: response.Data.RoleId,
            IsActive: response.Data.IsActive
          });
          
          if (response.Data.ImagePath) {
            this.imagePreview = response.Data.ImagePath;
          }
        }
      },
      error: (error) => {
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to load user data' 
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

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Invalid file type. Only JPG, JPEG, PNG, and GIF are allowed' 
        });
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'File size exceeds 5MB limit' 
        });
        return;
      }

      this.selectedFile = file;

      // Preview image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadImage(userId: number): void {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('image', this.selectedFile);

    const url = `${this.constant.API_ENDPOINT}Users/UploadImage/${userId}`;
    this.http.post<ResponseModel>(url, formData).subscribe({
      next: (response: ResponseModel) => {
        if (response.Success) {
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Success', 
            detail: 'Image uploaded successfully' 
          });
        }
      },
      error: (error) => {
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to upload image' 
        });
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({ 
        severity: 'warn', 
        summary: 'Warning', 
        detail: 'Please fill all required fields correctly' 
      });
      return;
    }

    // Validate password confirmation
    if (!this.isEditMode) {
      const password = this.form.get('Password')?.value;
      const confirmation = this.form.get('PasswordConfirmation')?.value;
      
      if (password !== confirmation) {
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Password and confirmation do not match' 
        });
        return;
      }
    }

    if (this.isEditMode) {
      const updateData: any = {
        Username: this.form.get('Username')?.value,
        Email: this.form.get('Email')?.value,
        FullName: this.form.get('FullName')?.value,
        PhoneNumber: this.form.get('PhoneNumber')?.value,
        RoleId: this.form.get('RoleId')?.value,
        IsActive: this.form.get('IsActive')?.value
      };

      const url = this.constant.API_ENDPOINT + `Users/Update/${this.userId}`;
      this.sharedService.Update(url, updateData).subscribe({
        next: (response: ResponseModel) => {
          if (response.Success) {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Success', 
              detail: response.Message || 'User updated successfully'
            });

            // Upload image if selected
            if (this.selectedFile && this.userId) {
              this.uploadImage(this.userId);
            }

            this.ref.close(response?.Data);
          } else {
            this.messageService.add({ 
              severity: 'error', 
              summary: 'Error', 
              detail: response.Message || 'Operation failed' 
            });
          }
        },
        error: (error) => {
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'An error occurred while updating the user' 
          });
        }
      });
    } else {
      const createData: any = {
        Username: this.form.get('Username')?.value,
        Password: this.form.get('Password')?.value,
        PasswordConfirmation: this.form.get('PasswordConfirmation')?.value,
        Email: this.form.get('Email')?.value,
        FullName: this.form.get('FullName')?.value,
        PhoneNumber: this.form.get('PhoneNumber')?.value,
        RoleId: this.form.get('RoleId')?.value
      };

      const url = this.constant.API_ENDPOINT + 'Users/Create';
      this.sharedService.Create(url, createData).subscribe({
        next: (response: ResponseModel) => {
          if (response.Success) {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Success', 
              detail: response.Message || 'User added successfully'
            });

            // Upload image if selected
            if (this.selectedFile && response.Data?.Id) {
              this.uploadImage(response.Data.Id);
            }

            this.ref.close(response?.Data);
          } else {
            this.messageService.add({ 
              severity: 'error', 
              summary: 'Error', 
              detail: response.Message || 'Operation failed' 
            });
          }
        },
        error: (error) => {
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'An error occurred while adding the user' 
          });
        }
      });
    }
  }

  onCancel(): void {
    if (this.ref) {
      this.ref.close(false);
    } else {
      this.router.navigate(['/pages/users']);
    }
  }
}
