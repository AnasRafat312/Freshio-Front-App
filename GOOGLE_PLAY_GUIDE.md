# Google Play Store Publishing Guide
## Trusted Web Activity (TWA) Configuration

This guide explains how to publish your Freshio PWA to Google Play Store using Trusted Web Activity.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Install Bubblewrap](#install-bubblewrap)
3. [Initialize TWA Project](#initialize-twa-project)
4. [Configure Digital Asset Links](#configure-digital-asset-links)
5. [Build Android App](#build-android-app)
6. [Test on Android Device](#test-on-android-device)
7. [Generate Signing Key](#generate-signing-key)
8. [Build Signed AAB](#build-signed-aab)
9. [Prepare for Google Play](#prepare-for-google-play)
10. [Upload to Google Play Console](#upload-to-google-play-console)
11. [Post-Submission](#post-submission)

---

## Prerequisites

### Required Tools
- Node.js 18+ installed
- Java JDK 11+ installed
- Android SDK installed (via Android Studio)
- Google Play Console account ($25 one-time fee)
- Your PWA deployed on HTTPS domain

### Verify Installations

```bash
# Check Node.js
node --version  # Should be 18+

# Check Java
java -version   # Should be 11+

# Check Android SDK
echo %ANDROID_HOME%  # Should point to Android SDK
```

### Set Environment Variables (Windows)

```powershell
# Set ANDROID_HOME
setx ANDROID_HOME "C:\Users\YourUsername\AppData\Local\Android\Sdk"

# Set JAVA_HOME
setx JAVA_HOME "C:\Program Files\Java\jdk-11"

# Add to PATH
setx PATH "%PATH%;%ANDROID_HOME%\tools;%ANDROID_HOME%\platform-tools"
```

---

## Install Bubblewrap

Bubblewrap is Google's tool for creating TWA apps.

```bash
npm install -g @bubblewrap/cli
```

Verify installation:

```bash
bubblewrap --version
```

---

## Initialize TWA Project

### Step 1: Create TWA Directory

```bash
cd d:\Work\Freshio
mkdir Freshio-Android
cd Freshio-Android
```

### Step 2: Initialize Bubblewrap

```bash
bubblewrap init --manifest=https://yourdomain.com/manifest.webmanifest
```

**Replace `https://yourdomain.com` with your actual production domain.**

### Step 3: Answer Configuration Questions

Bubblewrap will ask several questions:

```
? Domain being opened in the TWA: yourdomain.com
? Name of the application: Freshio
? Short name for the application: Freshio
? Application ID: com.freshio.app
? Display mode: standalone
? Orientation: portrait
? Theme color: #4F46E5
? Background color: #ffffff
? Icon URL: https://yourdomain.com/assets/icons/icon-512x512.png
? Maskable icon URL: https://yourdomain.com/assets/icons/icon-maskable-512x512.png
? Splash screen color: #ffffff
? Status bar color: #4F46E5
? Include app shortcuts: Yes
? Enable site settings shortcut: Yes
? Enable notifications: Yes
? Signing key information: (leave empty for now)
```

This creates a `twa-manifest.json` file with your configuration.

---

## Configure Digital Asset Links

Digital Asset Links verify that your website and Android app are linked.

### Step 1: Generate SHA256 Fingerprint

After generating your signing key (see Step 7), get the SHA256 fingerprint:

```bash
keytool -list -v -keystore freshio-release-key.keystore -alias freshio
```

Copy the SHA256 fingerprint (format: `AA:BB:CC:DD:...`).

### Step 2: Create assetlinks.json

Create `.well-known/assetlinks.json` on your web server:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.freshio.app",
    "sha256_cert_fingerprints": [
      "AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99"
    ]
  }
}]
```

**Replace:**
- `package_name` with your Application ID
- `sha256_cert_fingerprints` with your actual SHA256 fingerprint (remove colons)

### Step 3: Deploy assetlinks.json

Upload to: `https://yourdomain.com/.well-known/assetlinks.json`

Verify it's accessible:
```bash
curl https://yourdomain.com/.well-known/assetlinks.json
```

### Step 4: Configure Server

Ensure your server serves the file with correct headers:

**Nginx:**
```nginx
location /.well-known/assetlinks.json {
    default_type application/json;
    add_header Access-Control-Allow-Origin *;
}
```

**Apache (.htaccess):**
```apache
<Files "assetlinks.json">
    Header set Content-Type "application/json"
    Header set Access-Control-Allow-Origin "*"
</Files>
```

---

## Build Android App

### Step 1: Build Debug APK (for testing)

```bash
bubblewrap build
```

This creates:
- `app-release-unsigned.apk` (unsigned)
- Android project in `./android/`

### Step 2: Verify Build

Check that these files were created:
- `./android/app/build/outputs/apk/release/app-release-unsigned.apk`

---

## Test on Android Device

### Step 1: Enable Developer Mode

On your Android device:
1. Go to Settings > About Phone
2. Tap "Build Number" 7 times
3. Go back to Settings > Developer Options
4. Enable "USB Debugging"

### Step 2: Connect Device

```bash
# List connected devices
adb devices
```

### Step 3: Install APK

```bash
adb install ./android/app/build/outputs/apk/release/app-release-unsigned.apk
```

### Step 4: Test the App

1. Open the app on your device
2. Verify it opens your website
3. Check that navigation works
4. Test offline functionality
5. Verify notifications work

---

## Generate Signing Key

For production release, you need a signing key.

### Step 1: Generate Keystore

```bash
keytool -genkey -v -keystore freshio-release-key.keystore -alias freshio -keyalg RSA -keysize 2048 -validity 10000
```

**Answer the prompts:**
```
Enter keystore password: [Create a strong password]
Re-enter new password: [Repeat password]
What is your first and last name? [Your name or company name]
What is the name of your organizational unit? [Your department]
What is the name of your organization? [Your company]
What is the name of your City or Locality? [Your city]
What is the name of your State or Province? [Your state]
What is the two-letter country code? [Your country code, e.g., US]
Is CN=..., OU=..., O=..., L=..., ST=..., C=... correct? yes
```

### Step 2: Store Keystore Safely

**IMPORTANT**: Keep this keystore file and password safe!
- Store in a secure location
- Backup to multiple locations
- Never commit to version control
- You cannot recover it if lost

### Step 3: Get SHA256 Fingerprint

```bash
keytool -list -v -keystore freshio-release-key.keystore -alias freshio
```

Copy the SHA256 fingerprint and update your `assetlinks.json`.

---

## Build Signed AAB

Android App Bundle (AAB) is required for Google Play.

### Step 1: Update twa-manifest.json

Edit `twa-manifest.json` and add signing information:

```json
{
  "signingKey": {
    "path": "./freshio-release-key.keystore",
    "alias": "freshio"
  }
}
```

### Step 2: Build Signed AAB

```bash
bubblewrap build --signingKeyPath=./freshio-release-key.keystore --signingKeyAlias=freshio
```

Enter your keystore password when prompted.

This creates:
- `./android/app/build/outputs/bundle/release/app-release.aab`

### Step 3: Verify AAB

```bash
# Check file size (should be < 150MB)
ls -lh ./android/app/build/outputs/bundle/release/app-release.aab
```

---

## Prepare for Google Play

### Step 1: Create App Icons

You need high-resolution icons for Google Play:

**Required:**
- App icon: 512x512 PNG (32-bit, no transparency)
- Feature graphic: 1024x500 PNG or JPG
- Screenshots: At least 2 (phone and tablet)
  - Phone: 16:9 or 9:16 ratio
  - Tablet: 16:9 or 9:16 ratio (optional)

**Optional:**
- Promo video: YouTube link
- TV banner: 1280x720 PNG or JPG

### Step 2: Prepare Store Listing

Write your app description:

**Short Description (80 characters max):**
```
Comprehensive electronic transactions management system for business
```

**Full Description (4000 characters max):**
```
Freshio - Electronic Transactions Management System

Freshio is a comprehensive business management solution designed for efficient financial operations, accounting, and business management.

KEY FEATURES:
• Sales Orders Management
• Purchase Management
• Inventory Tracking
• Waste Management
• Financial Reporting
• Multi-language Support (English/Arabic)
• Offline Capability
• Real-time Synchronization
• Secure Authentication
• Cloud-based Storage

BENEFITS:
✓ Streamline your business operations
✓ Track inventory in real-time
✓ Generate detailed reports
✓ Manage sales and purchases efficiently
✓ Access your data anywhere, anytime
✓ Work offline when needed
✓ Secure and reliable

Perfect for:
- Small to medium businesses
- Retail stores
- Wholesale distributors
- Restaurant management
- Inventory management

Download Freshio today and transform your business management!

SUPPORT:
Email: support@freshio.com
Website: https://www.freshio.com
```

### Step 3: Prepare Privacy Policy

Create a privacy policy page on your website:
`https://yourdomain.com/privacy-policy`

Include:
- Data collection practices
- How data is used
- Third-party services
- User rights
- Contact information

---

## Upload to Google Play Console

### Step 1: Create Google Play Developer Account

1. Go to [Google Play Console](https://play.google.com/console)
2. Sign in with Google account
3. Pay $25 one-time registration fee
4. Complete account setup

### Step 2: Create New App

1. Click "Create app"
2. Fill in app details:
   - App name: Freshio
   - Default language: English (United States)
   - App or game: App
   - Free or paid: Free
3. Accept declarations
4. Click "Create app"

### Step 3: Complete Store Listing

Navigate to "Store presence" > "Main store listing":

1. **App name**: Freshio
2. **Short description**: [Your short description]
3. **Full description**: [Your full description]
4. **App icon**: Upload 512x512 icon
5. **Feature graphic**: Upload 1024x500 graphic
6. **Phone screenshots**: Upload at least 2
7. **Tablet screenshots**: Upload (optional)
8. **App category**: Business
9. **Contact details**: Your email
10. **Privacy policy**: Your privacy policy URL

Click "Save".

### Step 4: Set Up App Content

Navigate to "Policy" > "App content":

1. **Privacy policy**: Add URL
2. **App access**: Describe if login required
3. **Ads**: Select if app contains ads
4. **Content rating**: Complete questionnaire
5. **Target audience**: Select age groups
6. **News app**: No (unless applicable)
7. **COVID-19 contact tracing**: No
8. **Data safety**: Complete data safety form

### Step 5: Select Countries

Navigate to "Production" > "Countries/regions":

1. Select countries where you want to distribute
2. Or select "All countries"

### Step 6: Upload AAB

Navigate to "Production" > "Releases":

1. Click "Create new release"
2. Upload your AAB file: `app-release.aab`
3. Add release name: "1.0.0"
4. Add release notes:
```
Initial release of Freshio

Features:
- Sales orders management
- Purchase management
- Inventory tracking
- Waste management
- Offline support
- Multi-language support
```
5. Click "Save"

### Step 7: Review and Publish

1. Navigate to "Publishing overview"
2. Complete all required sections (marked with !)
3. Review all information
4. Click "Send for review"

---

## Post-Submission

### Review Process

- **Timeline**: 1-7 days (usually 1-3 days)
- **Status**: Check "Publishing overview" for status
- **Notifications**: You'll receive email updates

### If Rejected

Common rejection reasons:
1. **Broken functionality**: Test thoroughly before submission
2. **Privacy policy issues**: Ensure policy is complete and accessible
3. **Content rating**: Complete questionnaire accurately
4. **Digital Asset Links**: Verify assetlinks.json is accessible
5. **Metadata issues**: Ensure all images and text meet requirements

### After Approval

1. **App goes live**: Usually within a few hours
2. **Monitor reviews**: Respond to user feedback
3. **Track analytics**: Use Google Play Console analytics
4. **Plan updates**: Regular updates improve ranking

---

## Updating Your App

### Step 1: Update Your PWA

1. Make changes to your web app
2. Build and deploy new version
3. Test thoroughly

### Step 2: Update Android App

```bash
# Update TWA configuration
bubblewrap update

# Build new AAB
bubblewrap build --signingKeyPath=./freshio-release-key.keystore --signingKeyAlias=freshio
```

### Step 3: Upload New Version

1. Go to Google Play Console
2. Navigate to "Production" > "Releases"
3. Click "Create new release"
4. Upload new AAB
5. Increment version code automatically
6. Add release notes
7. Submit for review

---

## Best Practices

### Version Management

- **Version Code**: Auto-incremented integer (1, 2, 3, ...)
- **Version Name**: Semantic versioning (1.0.0, 1.0.1, 1.1.0, ...)

### Release Schedule

- **Major updates**: Every 2-3 months
- **Minor updates**: Monthly
- **Bug fixes**: As needed

### Testing

- Test on multiple Android versions
- Test on different screen sizes
- Test offline functionality
- Test Digital Asset Links
- Test deep linking

### Monitoring

- Monitor crash reports
- Track user reviews
- Analyze user behavior
- Monitor performance metrics

---

## Troubleshooting

### App Doesn't Open Website

**Problem**: App opens but doesn't load website

**Solutions**:
1. Verify Digital Asset Links are correct
2. Check assetlinks.json is accessible
3. Verify SHA256 fingerprint matches
4. Ensure package name matches
5. Clear app data and retry

### Digital Asset Links Verification Failed

**Problem**: TWA doesn't verify ownership

**Solutions**:
1. Check assetlinks.json format
2. Verify file is at `/.well-known/assetlinks.json`
3. Ensure HTTPS is used
4. Check SHA256 fingerprint (remove colons)
5. Wait 24 hours for propagation

### App Rejected by Google Play

**Problem**: App rejected during review

**Solutions**:
1. Read rejection reason carefully
2. Fix issues mentioned
3. Test thoroughly
4. Resubmit with explanation

### Signing Key Lost

**Problem**: Lost keystore file

**Solutions**:
- **If you have backup**: Restore from backup
- **If no backup**: Cannot recover
  - Must create new app with new package name
  - Cannot update existing app
  - **Prevention**: Always backup keystore!

---

## Checklist

Before submitting to Google Play:

- [ ] PWA deployed on HTTPS
- [ ] manifest.webmanifest accessible
- [ ] All PWA features working
- [ ] Digital Asset Links configured
- [ ] assetlinks.json accessible
- [ ] Signing key generated and backed up
- [ ] AAB file built and tested
- [ ] App tested on Android device
- [ ] Store listing completed
- [ ] Screenshots prepared
- [ ] Privacy policy published
- [ ] Content rating completed
- [ ] Data safety form completed
- [ ] All required sections completed

---

## Resources

- [Google Play Console](https://play.google.com/console)
- [Bubblewrap Documentation](https://github.com/GoogleChromeLabs/bubblewrap)
- [TWA Documentation](https://developer.chrome.com/docs/android/trusted-web-activity/)
- [Digital Asset Links](https://developers.google.com/digital-asset-links)
- [Android App Bundle](https://developer.android.com/guide/app-bundle)

---

## Support

If you need help:
1. Check [Bubblewrap Issues](https://github.com/GoogleChromeLabs/bubblewrap/issues)
2. Review [Google Play Help Center](https://support.google.com/googleplay/android-developer)
3. Join [Android Developers Community](https://developer.android.com/community)

---

**Your app is ready for Google Play! 🚀**
