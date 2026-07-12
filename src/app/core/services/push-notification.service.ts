import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

/**
 * Push Notification Service
 * Handles Firebase Cloud Messaging push notifications
 * 
 * Note: This service requires Firebase to be configured
 * Install: npm install firebase @angular/fire
 * 
 * Uncomment and configure after Firebase setup
 */
@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private vapidKey = 'YOUR_FIREBASE_VAPID_KEY'; // Replace with your VAPID key
  private messagingToken: string | null = null;

  constructor(private messageService: MessageService) {}

  /**
   * Initialize push notifications
   * Request permission and get FCM token
   */
  public async init(): Promise<void> {
    try {
      // Check if notifications are supported
      if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return;
      }

      // Request permission
      const permission = await this.requestPermission();
      
      if (permission === 'granted') {
        console.log('Notification permission granted');
        // await this.getToken();
        // this.listenForMessages();
      } else {
        console.log('Notification permission denied');
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  }

  /**
   * Request notification permission
   */
  private async requestPermission(): Promise<NotificationPermission> {
    return await Notification.requestPermission();
  }

  /**
   * Get FCM token
   * Uncomment after Firebase configuration
   */
  /*
  private async getToken(): Promise<void> {
    try {
      const messaging = getMessaging();
      const token = await getToken(messaging, { vapidKey: this.vapidKey });
      
      if (token) {
        console.log('FCM Token:', token);
        this.messagingToken = token;
        // Send token to your backend server
        await this.sendTokenToServer(token);
      } else {
        console.log('No registration token available');
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
    }
  }
  */

  /**
   * Listen for foreground messages
   * Uncomment after Firebase configuration
   */
  /*
  private listenForMessages(): void {
    const messaging = getMessaging();
    
    onMessage(messaging, (payload) => {
      console.log('Message received:', payload);
      
      this.messageService.add({
        severity: 'info',
        summary: payload.notification?.title || 'New Notification',
        detail: payload.notification?.body || '',
        life: 5000
      });

      // Show browser notification if app is in background
      if (document.hidden) {
        this.showNotification(
          payload.notification?.title || 'Freshio',
          payload.notification?.body || '',
          payload.notification?.icon
        );
      }
    });
  }
  */

  /**
   * Show browser notification
   */
  private showNotification(title: string, body: string, icon?: string): void {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body: body,
        icon: icon || 'assets/icons/icon-192x192.png',
        badge: 'assets/icons/icon-72x72.png',
        tag: 'freshio-notification',
        requireInteraction: false
      } as NotificationOptions);

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }

  /**
   * Send token to backend server
   */
  private async sendTokenToServer(token: string): Promise<void> {
    try {
      // Implement your API call to save the token
      console.log('Sending token to server:', token);
      
      // Example:
      // await this.http.post('/api/notifications/register', { token }).toPromise();
    } catch (error) {
      console.error('Error sending token to server:', error);
    }
  }

  /**
   * Get current FCM token
   */
  public getMessagingToken(): string | null {
    return this.messagingToken;
  }

  /**
   * Delete FCM token (on logout)
   */
  public async deleteToken(): Promise<void> {
    try {
      // Implement token deletion
      console.log('Deleting FCM token');
      this.messagingToken = null;
    } catch (error) {
      console.error('Error deleting token:', error);
    }
  }
}
