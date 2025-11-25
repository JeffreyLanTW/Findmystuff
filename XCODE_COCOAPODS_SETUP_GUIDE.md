# iOS Build Setup: CocoaPods & Xcode Guide

## Current Status

**Missing**: Xcode and CocoaPods setup  
**Impact**: T049 (iOS build) cannot execute without these tools  
**Solution**: Follow this guide when Xcode is available

---

## What's Needed

### 1. Install Xcode (Required)

**Option A: From App Store** (Recommended - Easiest)
```bash
# Open App Store and search for "Xcode"
# Click "Get" then "Install"
# This downloads ~12-15 GB
# Takes 30-60 minutes depending on internet
```

**Option B: From Command Line** (Alternative)
```bash
# Install Xcode Command Line Tools only
xcode-select --install

# Then install full Xcode from App Store
```

**Option C: From Apple Developer Website** (Advanced)
```bash
# Download from https://developer.apple.com/download/all/
# Requires Apple Developer account (free)
# Select appropriate Xcode version for your macOS
```

### 2. Install CocoaPods

Once Xcode is installed:

```bash
# Install CocoaPods (Ruby gem)
sudo gem install cocoapods

# Verify installation
pod --version
# Output: Should show version number (e.g., 1.14.0)
```

---

## Step-by-Step iOS Build Process

### Step 1: Install Xcode

```bash
# Verify Xcode is installed
xcode-select -p
# Output: /Applications/Xcode.app/Contents/Developer

# Accept Xcode license
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license accept
```

### Step 2: Install CocoaPods

```bash
# Install CocoaPods
sudo gem install cocoapods

# Verify
pod --version
```

### Step 3: Setup iOS Project Dependencies

```bash
cd /Users/jeffreylan/SWR_AI/FindMyStuff/ios

# Install Pod dependencies
pod install

# This will:
# - Read Podfile (will be auto-generated if missing)
# - Download iOS native dependencies
# - Create Pods.lock file
# - Generate workspace (FindMyStuff.xcworkspace)
```

### Step 4: Build iOS App

```bash
cd /Users/jeffreylan/SWR_AI/FindMyStuff

# Build for iOS simulator
npm run build:ios

# OR with full command:
# react-native run-ios --simulator='iPhone 14'
```

**First Build**: Takes 5-10 minutes for compilation  
**Subsequent Builds**: 2-3 minutes

### Step 5: Verify Build Success

```bash
# If successful, you'll see:
# - Metro bundler starting
# - iOS simulator launching
# - App running on simulator
# - Can interact with app
```

---

## What Happens During iOS Build

### Automatic Steps (React Native CLI)
1. ✅ Pod install (downloads dependencies)
2. ✅ Compiles native iOS code
3. ✅ Bundles JavaScript
4. ✅ Launches simulator
5. ✅ Installs app on simulator
6. ✅ Starts Metro bundler
7. ✅ App runs on simulator

### Generated Files
```
ios/
├── Podfile                 # Pod dependencies (auto-generated)
├── Podfile.lock           # Locked dependency versions
├── Pods/                  # Downloaded dependencies
└── FindMyStuff.xcworkspace/   # Xcode workspace
```

---

## Troubleshooting iOS Builds

### Issue: "Pod install failed"
```bash
# Solution: Clear and reinstall
cd ios/
rm -rf Pods Podfile.lock
pod install
```

### Issue: "Simulator not available"
```bash
# Solution: List available simulators
xcrun simctl list devices

# Run with specific simulator
npm run build:ios --simulator='iPhone 15'
```

### Issue: "Build failed - Swift version mismatch"
```bash
# Solution: Check Swift version
swift --version

# Update Podfile to match Swift version
# Or update Xcode to latest version
```

### Issue: "Permission denied" errors
```bash
# Solution: Ensure proper permissions
sudo chown -R $(whoami) /usr/local/var/homebrew
```

---

## Current Project iOS Configuration

### React Native Version
```json
{
  "react-native": "^0.73.0"
}
```

### iOS Deployment Target
```
iOS 14.0+ (minimum)
iOS 15.0+ (recommended)
```

### Native Dependencies (Will be installed via CocoaPods)
```
- react-native-sqlite-storage
- react-native-image-crop-picker
- react-native-fs
- react-native-image-resizer
- React Native Paper native modules
- Navigation native modules
```

### Build Configuration
```bash
# simulator: iPhone 14
# scheme: FindMyStuff
# configuration: Debug (for development)
```

---

## Next Steps: When Xcode is Available

### 1. Install Xcode
- Download from App Store (~15 GB)
- Takes 30-60 minutes
- Accept licenses: `sudo xcodebuild -license accept`

### 2. Install CocoaPods
```bash
sudo gem install cocoapods
```

### 3. Run iOS Build
```bash
cd /Users/jeffreylan/SWR_AI/FindMyStuff
npm run build:ios
```

### 4. Test on Simulator
- App should launch automatically
- Interact with all features
- Test offline functionality
- Verify image capture works
- Test location assignment

### 5. Build for Device (Optional)
```bash
# After simulator works, you can build for physical device
# Requires:
# - Apple Developer account ($99/year)
# - Provisioning profiles
# - Signing certificates
# - Physical iPhone/iPad
```

---

## What You Can Do NOW (Without Xcode)

### ✅ JavaScript Testing
```bash
npm test                    # Run all tests
npm run test:watch        # Watch mode
npm run type-check        # TypeScript check
npm run lint              # ESLint check
npm run format            # Format code
```

### ✅ Development Build (Without Device)
```bash
npm start                  # Start Metro bundler
# Can use in Expo app for previewing UI
```

### ✅ Code Review & Documentation
- Review source code on GitHub
- Read documentation
- Plan features for v0.2.0

---

## Timeline Estimate

| Task | Duration | Notes |
|------|----------|-------|
| Install Xcode | 30-60 min | Download + installation |
| Install CocoaPods | 5 min | After Xcode |
| pod install | 5-10 min | First time (downloads iOS deps) |
| First iOS build | 10-15 min | Compilation |
| Subsequent builds | 2-5 min | Incremental |
| **Total** | **60-90 min** | One-time setup |

---

## Resources

### Official Documentation
- React Native Docs: https://reactnative.dev/docs/environment-setup
- CocoaPods Guide: https://cocoapods.org/
- Xcode Guide: https://developer.apple.com/documentation/xcode/

### Your Repository
- Source: https://github.com/JeffreyLanTW/Findmystuff
- Release: https://github.com/JeffreyLanTW/Findmystuff/releases/tag/v0.1.0

### Related Build Scripts
```bash
# Android build (requires Android Studio)
npm run build:android

# Run tests (works now)
npm test

# Metro bundler
npm start
```

---

## Summary

**Current State**: iOS build script is ready, but native environment not available  
**What's Needed**: Xcode + CocoaPods (only on this system)  
**Time to Setup**: 60-90 minutes (mostly installation/download time)  
**Once Setup**: Building for iOS will be 2-5 minutes per iteration  

**MVP is complete and released on GitHub** - Native builds are the final step when environment is ready.

---

## Quick Command Reference

```bash
# Install Xcode (from App Store manually, or):
xcode-select --install

# Accept license
sudo xcodebuild -license accept

# Install CocoaPods
sudo gem install cocoapods

# Setup iOS project
cd /Users/jeffreylan/SWR_AI/FindMyStuff
cd ios
pod install
cd ..

# Build for iOS
npm run build:ios

# Build for Android (when Android Studio available)
npm run build:android

# Run tests (works now)
npm test

# Type check (works now)
npm run type-check
```

**Everything else is ready - just waiting for the development environment!**
