import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { Subscription } from 'rxjs';
import { EntitiesService } from '../../services/entities.service';
import { CreateEntityDto, EntityRole } from 'src/app/shared/model/freshio/entity.model';
import { GoogleMapsModule, MapInfoWindow, MapMarker, GoogleMap } from '@angular/google-maps';

@Component({
  selector: 'app-entities-add-edit',
  standalone: true,
  imports: [CommonModule, SharedModule, GoogleMapsModule],
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss']
})
export class EntitiesAddEditComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild(GoogleMap) map!: GoogleMap;

  form: FormGroup;
  languageFactor = 'en';
  isEditMode = false;
  entityId: number | null = null;
  languageSubscription: Subscription;
  loading = false;
  
  // Role options for multi-select
  roleOptions: any[] = [];

  // Map properties
  mapCenter: google.maps.LatLngLiteral = { lat: 30.0444, lng: 31.2357 }; // Cairo, Egypt default
  mapZoom = 12;
  mapOptions: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: false,
    maxZoom: 20,
    minZoom: 4,
  };
  markerPosition: google.maps.LatLngLiteral | null = null;
  markerOptions: google.maps.MarkerOptions = {
    draggable: true,
  };

  // Search properties
  searchQuery: string = '';
  private autocomplete: google.maps.places.Autocomplete | null = null;
  private googleMapUrlSubscription: Subscription | null = null;

  constructor(
    private fb: FormBuilder,
    private language: LanguagesService,
    private messageService: MessageService,
    private entitiesService: EntitiesService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.initializeForm();
    this.initializeRoleOptions();
  }
  ngAfterViewInit(): void {
    // Initialize autocomplete after view is ready
    setTimeout(() => {
      this.initializeAutocomplete();
    }, 500);
  }

  ngOnInit(): void {
    this.languageSubscription = this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
      this.initializeRoleOptions();
    });

    // Check if opened in dialog with data
    if (this.config.data) {
      this.isEditMode = true;
      this.entityId = this.config.data.ID;
      this.loadEntityData(this.config.data);
    }


    // Watch for changes in GoogleMapUrl field
    this.watchGoogleMapUrlChanges();
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
    if (this.googleMapUrlSubscription) {
      this.googleMapUrlSubscription.unsubscribe();
    }
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      Name: ['', [Validators.required, Validators.minLength(2)]],
      WhatsAppNumber: [''],
      AdditionalPhone: [''],
      Address: [''],
      GoogleMapUrl: [''],
      Latitude: [null],
      Longitude: [null],
      Notes: [''],
      IsActive: [true],
      IsCustomer: [false],
      IsSupplier: [false],
      IsEmployee: [false],
      IsDriver: [false]
    });
  }

  private initializeRoleOptions(): void {
    this.roleOptions = [
      { label: this.languageFactor === 'en' ? 'Customer' : 'عميل', value: EntityRole.Customer },
      { label: this.languageFactor === 'en' ? 'Supplier' : 'مورد', value: EntityRole.Supplier },
      { label: this.languageFactor === 'en' ? 'Employee' : 'موظف', value: EntityRole.Employee },
      { label: this.languageFactor === 'en' ? 'Driver' : 'سائق', value: EntityRole.Driver }
    ];
  }

  private loadEntityData(data: any): void {
    this.form.patchValue({
      Name: data.Name,
      WhatsAppNumber: data.WhatsAppNumber,
      AdditionalPhone: data.AdditionalPhone,
      Address: data.Address,
      GoogleMapUrl: data.GoogleMapUrl,
      Latitude: data.Latitude,
      Longitude: data.Longitude,
      Notes: data.Notes,
      IsActive: data.IsActive,
      IsCustomer: data.IsCustomer || false,
      IsSupplier: data.IsSupplier || false,
      IsEmployee: data.IsEmployee || false,
      IsDriver: data.IsDriver || false
    });

    // Set map marker if coordinates exist
    if (data.Latitude && data.Longitude) {
      this.markerPosition = { lat: data.Latitude, lng: data.Longitude };
      this.mapCenter = { lat: data.Latitude, lng: data.Longitude };
    }
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

    // Validate at least one role is selected
    const formValue = this.form.value;
    if (!formValue.IsCustomer && !formValue.IsSupplier && !formValue.IsEmployee && !formValue.IsDriver) {
      this.messageService.add({
        severity: 'warn',
        summary: this.languageFactor === 'en' ? 'Validation Error' : 'خطأ في التحقق',
        detail: this.languageFactor === 'en' ? 'Please select at least one role' : 'يرجى اختيار دور واحد على الأقل'
      });
      return;
    }

    this.loading = true;
    const entityData: CreateEntityDto = {
      ...this.form.value,
      IsCustomer: formValue.IsCustomer || false,
      IsSupplier: formValue.IsSupplier || false,
      IsEmployee: formValue.IsEmployee || false,
      IsDriver: formValue.IsDriver || false
    };

    const request = this.isEditMode
      ? this.entitiesService.updateEntity(this.entityId!, entityData)
      : this.entitiesService.createEntity(entityData);

    request.subscribe({
      next: (response) => {
        if (response?.Success) {
          this.messageService.add({
            severity: 'success',
            summary: this.languageFactor === 'en' ? 'Success' : 'نجح',
            detail: this.isEditMode
              ? (this.languageFactor === 'en' ? 'Entity updated successfully' : 'تم تحديث الجهة بنجاح')
              : (this.languageFactor === 'en' ? 'Entity created successfully' : 'تم إنشاء الجهة بنجاح')
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

  openGoogleMap(): void {
    const url = this.form.get('GoogleMapUrl')?.value;
    if (url) {
      window.open(url, '_blank');
    }
  }

  // Map interaction methods
  onMapClick(event: google.maps.MapMouseEvent): void {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      this.markerPosition = { lat, lng };
      this.updateLocationFields(lat, lng);
    }
  }

  onMarkerDragEnd(event: google.maps.MapMouseEvent): void {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      this.updateLocationFields(lat, lng);
    }
  }

  private updateLocationFields(lat: number, lng: number): void {
    this.form.patchValue({
      Latitude: lat,
      Longitude: lng,
      GoogleMapUrl: `https://www.google.com/maps?q=${lat},${lng}`
    }, { emitEvent: false }); // Don't trigger valueChanges to avoid loop

    // Reverse geocode to get address
    this.reverseGeocode(lat, lng);
  }

  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          this.mapCenter = { lat, lng };
          this.markerPosition = { lat, lng };
          this.updateLocationFields(lat, lng);
          
          this.messageService.add({
            severity: 'success',
            summary: this.languageFactor === 'en' ? 'Success' : 'نجح',
            detail: this.languageFactor === 'en' ? 'Current location detected' : 'تم تحديد الموقع الحالي'
          });
        },
        (error) => {
          this.messageService.add({
            severity: 'warn',
            summary: this.languageFactor === 'en' ? 'Warning' : 'تحذير',
            detail: this.languageFactor === 'en' ? 'Unable to get current location' : 'تعذر الحصول على الموقع الحالي'
          });
        }
      );
    } else {
      this.messageService.add({
        severity: 'error',
        summary: this.languageFactor === 'en' ? 'Error' : 'خطأ',
        detail: this.languageFactor === 'en' ? 'Geolocation is not supported' : 'الموقع الجغرافي غير مدعوم'
      });
    }
  }

  // Initialize Google Places Autocomplete
  private initializeAutocomplete(): void {
    if (!this.searchInput) {
      return;
    }

    const input = this.searchInput.nativeElement;
    
    this.autocomplete = new google.maps.places.Autocomplete(input, {
      fields: ['formatted_address', 'geometry', 'name'],
      types: ['geocode', 'establishment']
    });

    this.autocomplete.addListener('place_changed', () => {
      const place = this.autocomplete?.getPlace();
      
      if (!place || !place.geometry || !place.geometry.location) {
        this.messageService.add({
          severity: 'warn',
          summary: this.languageFactor === 'en' ? 'Warning' : 'تحذير',
          detail: this.languageFactor === 'en' ? 'No details available for this place' : 'لا توجد تفاصيل متاحة لهذا المكان'
        });
        return;
      }

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      
      this.mapCenter = { lat, lng };
      this.markerPosition = { lat, lng };
      this.mapZoom = 15;
      
      this.updateLocationFields(lat, lng);
      
      if (place.formatted_address) {
        this.form.patchValue({
          Address: place.formatted_address
        });
      }
    });
  }

  // Reverse geocode to get address from coordinates
  private reverseGeocode(lat: number, lng: number): void {
    const geocoder = new google.maps.Geocoder();
    const latlng = { lat, lng };

    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        this.form.patchValue({
          Address: results[0].formatted_address
        });
      }
    });
  }

  // Watch for changes in GoogleMapUrl field and parse coordinates
  private watchGoogleMapUrlChanges(): void {
    this.googleMapUrlSubscription = this.form.get('GoogleMapUrl')?.valueChanges.subscribe((url: string) => {
      if (url && url.trim()) {
        const coords = this.parseGoogleMapsUrl(url);
        if (coords) {
          this.mapCenter = coords;
          this.markerPosition = coords;
          this.mapZoom = 15;
          
          // Update Latitude and Longitude fields if they're empty or different
          const currentLat = this.form.get('Latitude')?.value;
          const currentLng = this.form.get('Longitude')?.value;
          
          if (currentLat !== coords.lat || currentLng !== coords.lng) {
            this.form.patchValue({
              Latitude: coords.lat,
              Longitude: coords.lng
            }, { emitEvent: false });
            
            // Get address for these coordinates
            this.reverseGeocode(coords.lat, coords.lng);
          }
        }
      }
    });
  }

  // Parse Google Maps URL to extract coordinates
  private parseGoogleMapsUrl(url: string): google.maps.LatLngLiteral | null {
    try {
      // Pattern 1: https://www.google.com/maps?q=30.0444,31.2357
      const qPattern = /[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/;
      const qMatch = url.match(qPattern);
      if (qMatch) {
        return {
          lat: parseFloat(qMatch[1]),
          lng: parseFloat(qMatch[2])
        };
      }

      // Pattern 2: https://www.google.com/maps/@30.0444,31.2357,15z
      const atPattern = /@(-?\d+\.?\d*),(-?\d+\.?\d*)/;
      const atMatch = url.match(atPattern);
      if (atMatch) {
        return {
          lat: parseFloat(atMatch[1]),
          lng: parseFloat(atMatch[2])
        };
      }

      // Pattern 3: https://maps.google.com/?ll=30.0444,31.2357
      const llPattern = /[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/;
      const llMatch = url.match(llPattern);
      if (llMatch) {
        return {
          lat: parseFloat(llMatch[1]),
          lng: parseFloat(llMatch[2])
        };
      }

      // Pattern 4: https://www.google.com/maps/place/.../@30.0444,31.2357
      const placePattern = /place\/[^/]+\/@(-?\d+\.?\d*),(-?\d+\.?\d*)/;
      const placeMatch = url.match(placePattern);
      if (placeMatch) {
        return {
          lat: parseFloat(placeMatch[1]),
          lng: parseFloat(placeMatch[2])
        };
      }

      return null;
    } catch (error) {
      console.error('Error parsing Google Maps URL:', error);
      return null;
    }
  }
}
