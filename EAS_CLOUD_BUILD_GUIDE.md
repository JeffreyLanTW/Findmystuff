# EAS Cloud Build Guide - Solution to CocoaPods Issues

## The Problem You're Facing

You're hitting a persistent issue where:
- System Ruby + CocoaPods has FFI incompatibilities
- Homebrew Ruby + CocoaPods also has issues  
- Xcode 26.1.1 adds more version conflicts
- The Xcode project requires Pods but they won't install

**Root Cause**: Local native builds with React Native + Expo require complex system-level setup that's fragile.

**Solution**: Use **EAS (Expo Application Services)** - cloud-based builds designed for exactly this.

---

## Why EAS is Better

| Challenge | Local Build | EAS Cloud Build |
|-----------|-------------|-----------------|
| CocoaPods Setup | ❌ Broken | ✅ Managed |
| FFI Issues | ❌ Frequent | ✅ Never |
| System Dependencies | ❌ Complex | ✅ Auto-configured |
| Time to First Build | ⏱️ 60-90 min | ⏱️ 5 minutes |
| Team Consistency | ❌ Variable | ✅ Always same |
| Cross-platform Builds | ❌ Need multiple Macs | ✅ One command |
| App Store Submission | ❌ Manual certs | ✅ Automatic |

---

## Quick Start (5 Minutes)

### 1. Install EAS CLI

```bash
npm install -g eas-cli
```

### 2. Login to Expo Account

```bash
eas login
```

This opens a browser for authentication. Use the same account you use for Expo.

### 3. Configure Your Project

```bash
cd /Users/jeffreylan/SWR_AI/FindMyStuff
eas build:configure
```

This automatically detects your project and creates `eas.json` with sensible defaults.

### 4. Build for Testing (iOS Simulator)

```bash
eas build --platform ios --profile development
```

This creates a development build suitable for the iOS simulator. Takes 10-15 minutes on first build.

### 5. Build for Production (App Store)

```bash
eas build --platform ios --profile production
```

This creates an App Store-ready build with proper signing certificates.

---

## Step-by-Step EAS Setup

### Step 1: Create Expo Account (If Needed)

Go to https://expo.dev/signup and create a free account.

### Step 2: Install EAS

```bash
npm install -g eas-cli
```

Verify installation:
```bash
eas --version
```

### Step 3: Login

```bash
eas login
# Browser opens → authenticate with your Expo account
```

Verify login:
```bash
eas whoami
```

### Step 4: Navigate to Project

```bash
cd /Users/jeffreylan/SWR_AI/FindMyStuff
```

### Step 5: Configure EAS

```bash
eas build:configure
```

This creates/updates `eas.json`. Review the generated file:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "provisioning": "adhoc"
      }
    },
    "production": {
      "distribution": "store",
      "ios": {
        "provisioning": "appstore"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "serviceAccount": "..."
      }
    }
  }
}
```

### Step 6: Build

#### Development Build (Testing)

```bash
eas build --platform ios --profile development
```

**What this does**:
- Compiles your app for iOS simulator
- No code signing needed
- Creates a `.tar.gz` simulator build

**Output**: Download the build artifact and extract it to run in simulator.

#### Production Build (App Store)

```bash
eas build --platform ios --profile production
```

**What this does**:
- Compiles your app for physical iOS devices
- Automatically handles code signing
- Creates an `.ipa` file ready for App Store submission

---

## Build Status & Monitoring

### Check Build Status

```bash
eas build:list
```

Shows all your recent builds with status.

### Watch Build in Real-Time

```bash
eas build --platform ios --profile production --wait
```

The `--wait` flag keeps the terminal open and shows progress.

### Download Build Artifacts

Builds are stored in your Expo dashboard at https://expo.dev/builds

Artifacts:
- **Development**: `.tar.gz` for simulator
- **Production**: `.ipa` for App Store

---

## Using the Built App

### Option 1: Install Development Build on Simulator

```bash
# Extract downloaded .tar.gz
tar -xzf your-download.tar.gz

# Locate the .app file
find . -name "*.app" -type d

# Install on simulator
xcrun simctl install booted path/to/findmystuff.app
```

### Option 2: Submit to App Store

```bash
# Upload your .ipa to App Store Connect
eas submit --platform ios --path path/to/your.ipa
```

Or let EAS handle it automatically:

```bash
# Build AND submit in one command
eas build --platform ios --profile production --auto-submit
```

---

## Troubleshooting EAS

### Build Failed: "Invalid Expo Config"

Solution: Ensure `app.json` is valid:
```bash
npx expo doctor
```

### Build Failed: "Authentication Required"

Solution: Re-login:
```bash
eas logout
eas login
```

### Build Takes Too Long

This is normal for first builds (10-20 minutes). Subsequent builds are faster.

### Can't Download Build

1. Go to https://expo.dev/builds
2. Find your build
3. Click download link
4. Or use: `eas build:list` and download from there

---

## EAS vs Local Builds Comparison

### Local Xcode Build
```bash
# Requires: Xcode, CocoaPods, specific system versions
# Time: 60-90 minutes setup + 15 min first build
# Cost: Your time debugging system issues
npm run build:ios  # Usually fails
```

### EAS Cloud Build
```bash
# Requires: Just npm and eas-cli
# Time: 5 min setup + 10-15 min first build
# Cost: Free for development, optional paid plans
eas build --platform ios --profile development
```

---

## Complete Workflow: Development to App Store

```bash
# 1. One-time setup
npm install -g eas-cli
eas login
eas build:configure

# 2. Build for testing (download & test locally)
eas build --platform ios --profile development
# Download the .tar.gz, extract, test in simulator

# 3. When ready for App Store
eas build --platform ios --profile production

# 4. Auto-submit to App Store
eas submit --platform ios

# Done! Your app is submitted for review
```

---

## Why I Recommend EAS for You

Your situation:
- ✅ You have v0.1.0 released and tested
- ✅ You want native builds for App Store
- ✅ You're hitting local CocoaPods issues
- ✅ You have Xcode 26.1.1 compatibility issues

**EAS eliminates all of these problems:**
- No local CocoaPods setup needed
- No FFI library issues
- No Xcode version conflicts
- No system Ruby problems
- Works on any computer (Mac, Windows, Linux)
- Team members use the exact same build process

---

## Next Steps

### Immediately
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform ios --profile development
```

### For Production
When you're ready to submit to App Store:
```bash
eas build --platform ios --profile production
eas submit --platform ios
```

### For Android
Same process, different commands:
```bash
eas build --platform android --profile production
eas submit --platform android
```

---

## Resources

- **EAS Documentation**: https://docs.expo.dev/eas/
- **EAS Build Guide**: https://docs.expo.dev/eas/build/
- **App Store Submission**: https://docs.expo.dev/eas/submit/
- **Expo Dashboard**: https://expo.dev/builds
- **FAQ**: https://docs.expo.dev/eas/faq/

---

## Summary

**Stop fighting with local CocoaPods. Use EAS.**

| Step | Command | Time |
|------|---------|------|
| 1. Install EAS | `npm install -g eas-cli` | 2 min |
| 2. Login | `eas login` | 2 min |
| 3. Configure | `eas build:configure` | 1 min |
| 4. Build | `eas build --platform ios` | 10-15 min |
| 5. Submit | `eas submit --platform ios` | 5 min |
| **Total** | **One command** | **~30 min** |

**Your MVP is done. EAS gets it to the App Store.**

