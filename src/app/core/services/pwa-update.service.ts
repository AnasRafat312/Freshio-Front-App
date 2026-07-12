import { Injectable, ApplicationRef } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, first, interval, concat } from 'rxjs';
import { MessageService } from 'primeng/api';

/**
 * PWA Update Service
 * Handles service worker updates and prompts users to reload
 */
@Injectable({
  providedIn: 'root'
})
export class PwaUpdateService {
  constructor(
    private swUpdate: SwUpdate,
    private appRef: ApplicationRef,
    private messageService: MessageService
  ) {}

  /**
   * Initialize update checking
   * Checks for updates every 6 hours and when app becomes stable
   */
  public init(): void {
    if (!this.swUpdate.isEnabled) {
      console.log('Service Worker is not enabled');
      return;
    }

    // Check for updates when app stabilizes
    const appIsStable$ = this.appRef.isStable.pipe(
      first(isStable => isStable === true)
    );

    // Check for updates every 6 hours
    const everySixHours$ = interval(6 * 60 * 60 * 1000);

    const everySixHoursOnceAppIsStable$ = concat(appIsStable$, everySixHours$);

    everySixHoursOnceAppIsStable$.subscribe(async () => {
      try {
        const updateFound = await this.swUpdate.checkForUpdate();
        console.log(updateFound ? 'A new version is available.' : 'Already on the latest version.');
      } catch (err) {
        console.error('Failed to check for updates:', err);
      }
    });

    // Listen for version updates
    this.swUpdate.versionUpdates
      .pipe(
        filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
      )
      .subscribe(evt => {
        this.promptUserToUpdate(evt);
      });

    // Handle unrecoverable state
    this.swUpdate.unrecoverable.subscribe(event => {
      console.error('Unrecoverable state:', event.reason);
      this.messageService.add({
        severity: 'error',
        summary: 'Update Required',
        detail: 'An error occurred that requires reloading the application. The page will reload automatically.',
        life: 5000
      });
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    });
  }

  /**
   * Prompt user to update to new version
   */
  private promptUserToUpdate(evt: VersionReadyEvent): void {
    const currentVersion = evt.currentVersion.hash;
    const latestVersion = evt.latestVersion.hash;

    console.log(`Current version: ${currentVersion}`);
    console.log(`New version available: ${latestVersion}`);

    this.messageService.add({
      severity: 'info',
      summary: 'Update Available',
      detail: 'A new version of Freshio is available. Click here to update.',
      sticky: true,
      closable: true,
      data: {
        action: 'update'
      }
    });

    // Auto-reload after 30 seconds if user doesn't respond
    setTimeout(() => {
      this.activateUpdate();
    }, 30000);
  }

  /**
   * Activate the update and reload the page
   */
  public async activateUpdate(): Promise<void> {
    try {
      await this.swUpdate.activateUpdate();
      console.log('Update activated, reloading...');
      window.location.reload();
    } catch (err) {
      console.error('Failed to activate update:', err);
    }
  }

  /**
   * Check for updates manually
   */
  public async checkForUpdate(): Promise<boolean> {
    if (!this.swUpdate.isEnabled) {
      return false;
    }

    try {
      return await this.swUpdate.checkForUpdate();
    } catch (err) {
      console.error('Error checking for updates:', err);
      return false;
    }
  }
}
