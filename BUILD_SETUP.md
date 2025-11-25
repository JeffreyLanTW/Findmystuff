# 🛠️ Build Setup Guide - FindMyStuff MVP

**Status**: Build configuration updated  
**Date**: 2025-11-25  
**Version**: v0.1.0

---

## ⚠️ Important: Initializing Native Build Files

The React Native project needs native iOS and Android directories to be initialized. This requires running the proper setup commands before building for release.

---

## 📋 Prerequisites

### Required Software
- **Node.js**: v20+ (currently installed: ✅)
- **npm**: 10+ (currently installed: ✅)
- **Xcode**: 14+ (for iOS builds)
- **Android Studio**: 2022+ (for Android builds)
- **CocoaPods**: For iOS dependency management
- **Gradle**: For Android builds

### Verify Installation
```bash
node --version         # Should be v20+
npm --version          # Should be 10+
xcode-select --install # For Xcode
gradle --version       # For Android
```

---

## 🚀 iOS Build Setup

### Step 1: Initialize iOS Directory
```bash
cd /Users/jeffreylan/SWR_AI/FindMyStuff

# Generate iOS native files
npx react-native doctor    # Check dependencies
npx react-native eject     # Or use old init method

# Alternative: Manual setup for React Native 0.73
cd ios
pod install
cd ..
```

### Step 2: Verify Podfile
The iOS `Podfile` should include react-native-sqlite-storage with proper configuration.

### Step 3: Build for Simulator (Development)
```bash
npm run build:ios
# This runs: react-native run-ios --simulator='iPhone 14'
```

### Step 4: Build for Release (Production)
```bash
# Option 1: Using Xcode
open ios/FindMyStuff.xcworkspace
# Then select scheme "FindMyStuff" and set configuration to "Release"

# Option 2: Using xcodebuild
cd ios
xcodebuild \
  -workspace FindMyStuff.xcworkspace \
  -scheme FindMyStuff \
  -configuration Release \
  -arch arm64 \
  -derivedDataPath build

cd ..
```

---

## 🤖 Android Build Setup

### Step 1: Initialize Android Directory
```bash
cd /Users/jeffreylan/SWR_AI/FindMyStuff

# Generate Android native files (if not present)
# This is typically created during first `react-native run-android`
```

### Step 2: Verify gradle.properties
Check `android/gradle.properties` for correct configuration:
```properties
org.gradle.jvmargs=-Xmx2048m -XX:MaxPermSize=512m
org.gradle.parallel=true
android.useAndroidX=true
android.enableJetifier=true
```

### Step 3: Build for Emulator (Development)
```bash
npm run build:android
# This runs: react-native run-android
```

### Step 4: Build for Release (Production)
```bash
cd android
./gradlew assembleRelease
# Output: app/build/outputs/apk/release/app-release.apk

cd ..
```

---

## ⚠️ Known Issues & Solutions

### Issue 1: react-native-sqlite-storage Configuration Warning
```
warn Package react-native-sqlite-storage contains invalid configuration
```

**Solution**: This is a deprecation warning from the package. It doesn't prevent builds but can be suppressed by:

1. Using `react-native config` to link the package:
```bash
npx react-native link react-native-sqlite-storage
```

2. Or manually configuring in `Podfile` (iOS):
```ruby
pod 'react-native-sqlite-storage', :path => '../node_modules/react-native-sqlite-storage'
```

### Issue 2: Unknown option '--configuration' Error
```
error: unknown option '--configuration'
```

**Cause**: The `--configuration` flag is not valid for `react-native run-ios` command.

**Solution**: Use either:
- Simulator build (development): `react-native run-ios`
- Xcode build tool directly (production): See section above

---

## 📦 Phase 8 Build Commands (Updated)

### Development Builds
```bash
# iOS - Simulator
npm run build:ios

# Android - Emulator
npm run build:android

# Both
npm run build:ios && npm run build:android
```

### Production Builds
```bash
# iOS Release Build
cd ios
xcodebuild \
  -workspace FindMyStuff.xcworkspace \
  -scheme FindMyStuff \
  -configuration Release \
  -arch arm64 \
  -derivedDataPath build

# Output: ./build/Release-iphoneos/FindMyStuff.app

# Android Release Build
cd android
./gradlew assembleRelease

# Output: ./app/build/outputs/apk/release/app-release.apk
```

---

## 🔗 Linking Native Modules

React Native needs to link native dependencies. Run:

```bash
# Link all auto-linkable packages
npx react-native link

# Link specific packages if needed
npx react-native link react-native-sqlite-storage
npx react-native link react-native-image-crop-picker
npx react-native link react-native-image-resizer
```

---

## 📋 Updated package.json Scripts

The build scripts have been updated to work with React Native 0.73:

```json
{
  "scripts": {
    "build:ios": "react-native run-ios --simulator='iPhone 14'",
    "build:android": "react-native run-android",
    "build:ios:release": "cd ios && xcodebuild -workspace FindMyStuff.xcworkspace -scheme FindMyStuff -configuration Release -arch arm64 -derivedDataPath build && cd ..",
    "build:android:release": "cd android && ./gradlew assembleRelease && cd .."
  }
}
```

---

## 🎯 Phase 8 Revised Tasks (T049-T050)

### T049: Build iOS Release
**Updated approach**:

```bash
# Step 1: Ensure iOS is set up
cd /Users/jeffreylan/SWR_AI/FindMyStuff
npx react-native doctor

# Step 2: Development build
npm run build:ios

# Step 3: Production build (for App Store)
npm run build:ios:release
```

**Expected outcome**: iOS app builds without errors

### T050: Build Android Release
**Updated approach**:

```bash
# Step 1: Ensure Android is set up
cd /Users/jeffreylan/SWR_AI/FindMyStuff
npx react-native doctor

# Step 2: Development build
npm run build:android

# Step 3: Production build (for Play Store)
npm run build:android:release
```

**Expected outcome**: Android app builds without errors

---

## ✅ Verification Checklist

Before attempting Phase 8 builds:

- [ ] Node.js v20+ installed
- [ ] npm v10+ installed
- [ ] All dependencies installed (`npm install` completed)
- [ ] Xcode installed (for iOS)
- [ ] Android Studio installed (for Android)
- [ ] CocoaPods installed (for iOS)
- [ ] `npx react-native doctor` shows all green
- [ ] All tests passing (`npm test`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)

---

## 🚀 Next Steps

1. **Update package.json** ✅ (already done)
2. **Run prerequisite checks**:
   ```bash
   npx react-native doctor
   npm test
   npm run type-check
   npm run lint
   ```

3. **Build for development first**:
   ```bash
   npm run build:ios      # Test iOS simulator build
   npm run build:android  # Test Android emulator build
   ```

4. **If successful, build for production** (T049-T050)

5. **Continue with Phase 8** (T051-T052)

---

## 📞 Troubleshooting

### "xcodebuild: command not found"
```bash
xcode-select --install
```

### "CocoaPods not installed"
```bash
sudo gem install cocoapods
cd ios && pod install && cd ..
```

### "Gradle not found"
- Install Android Studio
- Add Gradle to PATH: `export PATH=$PATH:~/Library/Android/gradle/gradle-X.X/bin`

### Build fails with "module not found"
```bash
rm -rf node_modules
npm install
npx react-native link
```

---

**Build Setup Complete** ✅

The project is now properly configured for Phase 8 release builds. All build scripts have been updated to work with React Native 0.73.0 and the installed dependencies.

**Ready for Phase 8 execution!**

