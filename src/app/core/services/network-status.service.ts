import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent, merge, of } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Network Status Service
 * Monitors online/offline status and provides reactive updates
 */
@Injectable({
  providedIn: 'root'
})
export class NetworkStatusService {
  private onlineStatus$ = new BehaviorSubject<boolean>(navigator.onLine);

  constructor() {
    this.initializeNetworkMonitoring();
  }

  /**
   * Initialize network status monitoring
   */
  private initializeNetworkMonitoring(): void {
    // Listen to online/offline events
    const online$ = fromEvent(window, 'online').pipe(map(() => true));
    const offline$ = fromEvent(window, 'offline').pipe(map(() => false));

    merge(online$, offline$).subscribe(status => {
      console.log(`Network status changed: ${status ? 'Online' : 'Offline'}`);
      this.onlineStatus$.next(status);
    });
  }

  /**
   * Get current online status
   */
  public get isOnline(): boolean {
    return this.onlineStatus$.value;
  }

  /**
   * Get online status as observable
   */
  public get onlineStatus(): Observable<boolean> {
    return this.onlineStatus$.asObservable();
  }

  /**
   * Check if currently offline
   */
  public get isOffline(): boolean {
    return !this.isOnline;
  }
}
