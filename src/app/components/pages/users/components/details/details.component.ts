import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SharedModule } from 'src/app/shared/shared.module';
import { UsersService } from '../../services/users.service';
import { UsersStore } from '../../store/users.store';
import { UserDetailsModel } from '../../core/models/user-details.model';
import { LanguagesService } from 'src/app/shared/services/languages.service';

@Component({
  selector: 'app-users-details',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class UsersDetailsComponent implements OnInit, OnDestroy {
  userDetails!: UserDetailsModel;
  loading: boolean = true;
  error: boolean = false;
  languageFactor: string = 'en';
  private userId!: number;

  constructor(
    private usersService: UsersService,
    private usersStore: UsersStore,
    private config: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private language: LanguagesService
  ) {
    this.language.currentLanguage.subscribe((lang) => {
      this.languageFactor = lang;
    });

    // React to signal changes automatically
    effect(() => {
      const details = this.usersStore.userDetails();
      console.log('User Details from store:', details);
      
      // Update component state based on signal value
      if (details !== null) {
        this.userDetails = details;
        console.log('User Details assigned:', this.userDetails);
        this.loading = false;
        this.error = false;
      } else if (!this.loading) {
        // If details are null and we're not loading, it might be an error
        console.log('Details are null, setting error state');
        this.error = true;
      }
    });
  }

  ngOnInit(): void {
    // Clear any previous details first
    this.usersStore.clearUserDetails();
    
    this.userId = this.config.data?.ID;
    if (this.userId) {
      this.loadUserDetails(this.userId);
    } else {
      this.loading = false;
      this.error = true;
    }
  }

  ngOnDestroy(): void {
    // Clear details when component is destroyed
    this.usersStore.clearUserDetails();
  }

  loadUserDetails(id: number): void {
    this.loading = true;
    this.error = false;
    this.usersService.getUserDetails(id);
    
    // Set a timeout to handle cases where the API doesn't respond
    setTimeout(() => {
      if (this.loading && this.userDetails === null) {
        this.loading = false;
        this.error = true;
      }
    }, 10000); // 10 second timeout
  }

  retry(): void {
    if (this.userId) {
      this.loadUserDetails(this.userId);
    }
  }

  getLabel(enLabel: string, arLabel: string): string {
    return this.languageFactor === 'en' ? enLabel : arLabel;
  }

  closeDialog(): void {
    this.ref.close();
  }
}
