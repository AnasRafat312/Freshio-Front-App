import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NetworkStatusService } from '../../../core/services/network-status.service';

/**
 * Offline Indicator Component
 * Displays a banner when the application is offline
 */
@Component({
  selector: 'app-offline-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="offline-indicator" *ngIf="isOffline" [@slideDown]>
      <div class="offline-content">
        <i class="pi pi-wifi-slash"></i>
        <span class="offline-message">
          {{ languageFactor === 'en' ? 'You are currently offline' : 'أنت غير متصل بالإنترنت حالياً' }}
        </span>
        <span class="offline-submessage">
          {{ languageFactor === 'en' ? 'Some features may be limited' : 'قد تكون بعض الميزات محدودة' }}
        </span>
      </div>
    </div>
  `,
  styles: [`
    .offline-indicator {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 9999;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      animation: slideDown 0.3s ease-out;
    }

    .offline-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .offline-content i {
      font-size: 1.5rem;
    }

    .offline-message {
      font-weight: 600;
      font-size: 1rem;
    }

    .offline-submessage {
      font-size: 0.875rem;
      opacity: 0.9;
    }

    @keyframes slideDown {
      from {
        transform: translateY(-100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @media (max-width: 768px) {
      .offline-content {
        flex-direction: column;
        gap: 8px;
        text-align: center;
      }

      .offline-submessage {
        display: none;
      }
    }
  `]
})
export class OfflineIndicatorComponent implements OnInit, OnDestroy {
  isOffline = false;
  languageFactor = 'en'; // Default, should be injected from LanguageService
  private subscription?: Subscription;

  constructor(private networkStatusService: NetworkStatusService) {}

  ngOnInit(): void {
    // Subscribe to network status changes
    this.subscription = this.networkStatusService.onlineStatus.subscribe(
      isOnline => {
        this.isOffline = !isOnline;
      }
    );

    // Set initial status
    this.isOffline = this.networkStatusService.isOffline;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
