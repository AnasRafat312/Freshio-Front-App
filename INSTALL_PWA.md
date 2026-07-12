# PWA Installation Instructions

## Step-by-Step Installation Guide

Follow these steps in order to convert your Freshio application into a PWA.

---

## Step 1: Install Angular PWA Package

Run this command in your project root directory:

```bash
ng add @angular/pwa --project sakai-ng
```

**What this does:**
- Installs `@angular/service-worker` package
- Creates `manifest.webmanifest`
- Creates `ngsw-config.json`
- Adds default PWA icons
- Updates `angular.json` configuration
- Updates `index.html` with PWA meta tags
- Registers Service Worker in your app

**Expected Output:**
```
✔ Packages installed successfully.
CREATE src/manifest.webmanifest
CREATE src/assets/icons/icon-128x128.png
CREATE src/assets/icons/icon-144x144.png
CREATE src/assets/icons/icon-152x152.png
CREATE src/assets/icons/icon-192x192.png
CREATE src/assets/icons/icon-384x384.png
CREATE src/assets/icons/icon-512x512.png
CREATE src/assets/icons/icon-72x72.png
CREATE src/assets/icons/icon-96x96.png
CREATE ngsw-config.json
UPDATE angular.json
UPDATE package.json
UPDATE src/app/app.config.ts (or app.module.ts)
UPDATE src/index.html
```

---

## Step 2: Install Firebase (Optional - for Push Notifications)

If you want push notifications, install Firebase:

```bash
npm install firebase @angular/fire --save
```

---

## Step 3: Update Package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "build:prod": "ng build --configuration production",
    "test": "ng test",
    "lint": "ng lint",
    "e2e": "ng e2e",
    "serve:pwa": "npm run build:prod && http-server -p 8080 -c-1 ../Publish/Freshio-Frontrnd-Publish"
  }
}
```

---

## Step 4: Install HTTP Server for Testing

Install http-server globally to test your PWA locally:

```bash
npm install -g http-server
```

---

## Step 5: Update manifest.webmanifest

Replace the content of `src/manifest.webmanifest` with the configuration from the guide.

**Key fields to update:**
- `name`: "Freshio - Electronic Transactions Management System"
- `short_name`: "Freshio"
- `theme_color`: "#4F46E5"
- `background_color`: "#ffffff"
- `start_url`: "/"
- `icons`: Ensure all icon paths are correct

---

## Step 6: Generate Custom Icons

You need to create custom icons for your app. Use your existing logo at `src/assets/images/Logo.png`.

### Option 1: Use PWA Asset Generator (Recommended)

1. Go to [PWA Builder Image Generator](https://www.pwabuilder.com/imageGenerator)
2. Upload your logo (`Logo.png`)
3. Download the generated icons
4. Replace the icons in `src/assets/icons/`

### Option 2: Manual Creation

Create these icon sizes:
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

For maskable icons (Android adaptive icons):
- 192x192 (with safe zone padding)
- 512x512 (with safe zone padding)

**Tools:**
- Photoshop / GIMP
- [Figma](https://www.figma.com/)
- [Canva](https://www.canva.com/)

---

## Step 7: Update ngsw-config.json

Replace the content of `ngsw-config.json` with the optimized configuration from the guide.

**Important:** Update the API URLs in `dataGroups` to match your production URLs.

---

## Step 8: Update index.html

Add these meta tags to `src/index.html` if not already present:

```html
<!-- PWA Meta Tags -->
<meta name="theme-color" content="#4F46E5">
<link rel="manifest" href="manifest.webmanifest">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Freshio">
<link rel="apple-touch-icon" href="assets/icons/icon-192x192.png">
<link rel="apple-touch-icon" sizes="152x152" href="assets/icons/icon-152x152.png">
<link rel="apple-touch-icon" sizes="180x180" href="assets/icons/icon-192x192.png">
<link rel="apple-touch-icon" sizes="167x167" href="assets/icons/icon-152x152.png">
```

---

## Step 9: Register PWA Services in App

### For Standalone Components (Angular 17+)

Update `src/app/app.config.ts`:

```typescript
import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
};
```

### Initialize PWA Services

Update `src/main.ts` to initialize PWA services:

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { PwaUpdateService } from './app/core/services/pwa-update.service';
import { PushNotificationService } from './app/core/services/push-notification.service';

bootstrapApplication(AppComponent, appConfig)
  .then((appRef) => {
    // Initialize PWA Update Service
    const pwaUpdateService = appRef.injector.get(PwaUpdateService);
    pwaUpdateService.init();

    // Initialize Push Notifications (optional)
    // const pushNotificationService = appRef.injector.get(PushNotificationService);
    // pushNotificationService.init();
  })
  .catch((err) => console.error(err));
```

---

## Step 10: Add Offline Indicator to App Component

Update your main app component template to include the offline indicator:

```html
<!-- Add at the top of your app.component.html -->
<app-offline-indicator></app-offline-indicator>

<!-- Rest of your app content -->
<router-outlet></router-outlet>
```

Import the component in your app component:

```typescript
import { OfflineIndicatorComponent } from './shared/components/offline-indicator/offline-indicator.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    OfflineIndicatorComponent, // Add this
    // ... other imports
  ],
  templateUrl: './app.component.html'
})
export class AppComponent {
  // ...
}
```

---

## Step 11: Update angular.json

Ensure Service Worker is enabled in production configuration:

```json
{
  "projects": {
    "sakai-ng": {
      "architect": {
        "build": {
          "configurations": {
            "production": {
              "serviceWorker": true,
              "ngswConfigPath": "ngsw-config.json",
              ...
            }
          }
        }
      }
    }
  }
}
```

Also add `firebase-messaging-sw.js` to assets if using Firebase:

```json
"assets": [
  "src/favicon.ico",
  "src/config.json",
  "src/assets",
  "src/manifest.webmanifest",
  "src/firebase-messaging-sw.js",
  {
    "glob": "**/*",
    "input": "node_modules/@fortawesome/fontawesome-free/webfonts",
    "output": "webfonts/"
  }
]
```

---

## Step 12: Build and Test

### Build for Production

```bash
npm run build:prod
```

### Test PWA Locally

```bash
npm run serve:pwa
```

Then open http://localhost:8080 in Chrome.

### Test PWA Features

1. **Install Prompt**: Click the install icon in the address bar
2. **Offline Mode**: 
   - Open DevTools
   - Go to Network tab
   - Check "Offline"
   - Refresh the page - it should still work
3. **Update Detection**: 
   - Make a change and rebuild
   - Deploy new version
   - App should show update notification
4. **Lighthouse Audit**:
   - Open DevTools
   - Go to Lighthouse tab
   - Run PWA audit
   - Aim for score > 90

---

## Step 13: Deploy to Production

### Requirements
- HTTPS enabled (PWA requires HTTPS except on localhost)
- All API endpoints should use HTTPS
- Update `environment.prod.ts` with production URLs

### Deployment Steps

1. Build production bundle:
```bash
ng build --configuration production
```

2. Deploy contents of `../Publish/Freshio-Frontrnd-Publish` to your web server

3. Ensure these files are accessible:
   - `manifest.webmanifest`
   - `ngsw-worker.js`
   - `ngsw.json`
   - All icon files
   - `firebase-messaging-sw.js` (if using Firebase)

4. Configure server headers:
```
# .htaccess or nginx.conf
# Cache Service Worker for 0 seconds
<Files "ngsw-worker.js">
  Header set Cache-Control "max-age=0, no-cache, no-store, must-revalidate"
</Files>

# Cache manifest for 0 seconds
<Files "manifest.webmanifest">
  Header set Cache-Control "max-age=0, no-cache, no-store, must-revalidate"
</Files>
```

---

## Step 14: Configure Firebase (Optional)

If you want push notifications:

1. Create Firebase project at https://console.firebase.google.com/
2. Add web app to your project
3. Copy Firebase configuration
4. Update `src/firebase-messaging-sw.js` with your config
5. Get VAPID key from Firebase Console > Project Settings > Cloud Messaging
6. Update `PushNotificationService` with your VAPID key
7. Uncomment Firebase code in `PushNotificationService`

---

## Verification Checklist

After installation, verify:

- [ ] `@angular/service-worker` is in package.json
- [ ] `manifest.webmanifest` exists and is configured
- [ ] `ngsw-config.json` exists and is configured
- [ ] All icon files exist in `src/assets/icons/`
- [ ] Service Worker is registered in app.config.ts
- [ ] PWA services are initialized in main.ts
- [ ] Offline indicator component is added
- [ ] angular.json has serviceWorker: true
- [ ] Production build includes ngsw-worker.js
- [ ] App installs on desktop and mobile
- [ ] Offline mode works
- [ ] Update notifications work
- [ ] Lighthouse PWA score > 90

---

## Troubleshooting

### Service Worker Not Registering

**Problem**: Service Worker doesn't register in browser

**Solutions**:
1. Ensure you're using HTTPS or localhost
2. Check browser console for errors
3. Verify `serviceWorker: true` in angular.json
4. Clear browser cache and hard reload (Ctrl+Shift+R)
5. Check Application tab in DevTools > Service Workers

### Icons Not Showing

**Problem**: App icons don't appear

**Solutions**:
1. Verify icon paths in manifest.webmanifest
2. Ensure icons exist in src/assets/icons/
3. Check icon file sizes match manifest
4. Clear browser cache
5. Uninstall and reinstall PWA

### Offline Mode Not Working

**Problem**: App doesn't work offline

**Solutions**:
1. Check ngsw-config.json configuration
2. Verify API URLs in dataGroups
3. Check Service Worker status in DevTools
4. Ensure production build was used
5. Check Network tab for cached resources

### Update Not Detected

**Problem**: New version doesn't trigger update

**Solutions**:
1. Verify ngsw.json is updated
2. Check Service Worker update interval
3. Force update check in DevTools
4. Clear Service Worker cache
5. Check PwaUpdateService is initialized

---

## Next Steps

After successful installation:

1. ✅ Test on multiple devices
2. ✅ Test on multiple browsers
3. ✅ Configure Firebase for push notifications
4. ✅ Set up Trusted Web Activity for Google Play
5. ✅ Optimize Lighthouse scores
6. ✅ Deploy to production
7. ✅ Monitor Service Worker errors
8. ✅ Set up analytics for PWA installs

---

## Support

If you encounter issues:

1. Check the [Angular PWA Documentation](https://angular.io/guide/service-worker-intro)
2. Review browser console for errors
3. Check DevTools > Application > Service Workers
4. Verify all files are deployed correctly
5. Test with Lighthouse audit

---

**Installation Complete! Your app is now a PWA! 🎉**
