# Xcode Build Workaround for CocoaPods FFI Issues

## Problem
You're encountering a CocoaPods FFI compatibility issue with Xcode 26.1.1:
```
LoadError - cannot load such file -- ffi_c
```

This is caused by:
- System Ruby 2.6 has outdated FFI bindings
- Homebrew Ruby 3.4.7 also hits FFI issues with CocoaPods 1.16.2
- Xcode 26.1.1 has strict compatibility requirements

## Solution: Direct Xcode Build (No CocoaPods)

Instead of using `pod install`, we can build directly with `xcodebuild`, which uses Xcode's native build system.

### Quick Start

```bash
# Method 1: Using the provided script
bash scripts/build-ios-xcode.sh

# Method 2: Manual xcodebuild command
cd ios/
xcodebuild -scheme findmystuff \
    -configuration Debug \
    -destination "generic/platform=iOS Simulator" \
    -derivedDataPath "build" \
    build-for-testing
```

### How It Works

1. **No CocoaPods**: Bypasses the problematic `pod install` command
2. **Direct Xcode Build**: Uses Xcode's native compilation
3. **Simulator Build**: Generates simulator-compatible binary
4. **Manual Dependency Management**: Xcode builds native modules directly

### Step-by-Step

#### Step 1: Ensure iOS Project Exists
```bash
ls -la ios/findmystuff.xcodeproj
```

If missing, run:
```bash
npx expo prebuild --platform ios --clean
```

#### Step 2: Boot Simulator
```bash
# List available simulators
xcrun simctl list devices available iOS

# Boot specific simulator
xcrun simctl boot "iPhone 14 (UUID)"
```

#### Step 3: Build with xcodebuild
```bash
cd ios/
xcodebuild -scheme findmystuff \
    -configuration Debug \
    -destination "generic/platform=iOS Simulator" \
    -derivedDataPath "build" \
    build-for-testing
```

#### Step 4: Install on Simulator
```bash
# Find the built app
APP_PATH=$(find build -name "*.app" -type d | head -1)

# Install on simulator
xcrun simctl install booted "$APP_PATH"

# Launch the app
xcrun simctl launch booted com.findmystuff.app
```

### Automated Script

A helper script is provided at `scripts/build-ios-xcode.sh`:

```bash
bash scripts/build-ios-xcode.sh
```

This script:
- ✅ Validates Xcode project exists
- ✅ Lists available simulators
- ✅ Boots the simulator
- ✅ Builds with xcodebuild
- ✅ Shows build artifacts
- ✅ Provides installation instructions

### Troubleshooting

#### Build fails with "scheme not found"
```bash
# List available schemes
xcodebuild -list -project ios/findmystuff.xcodeproj

# Use the correct scheme name
xcodebuild -scheme "correct-scheme-name" ...
```

#### Simulator won't boot
```bash
# Erase and boot fresh
xcrun simctl erase "iPhone 14"
xcrun simctl boot "iPhone 14"
```

#### "Developer Mode" error on Xcode 26.1.1
```bash
# May need to enable developer mode
sudo security authorizationdb write system.install.apple.software allow
```

#### Still getting FFI errors
```bash
# Completely remove Pods and cache
cd ios/
rm -rf Pods Podfile.lock
rm -rf ~/Library/Developer/Xcode/DerivedData/findmystuff*

# Try building again
cd ..
bash scripts/build-ios-xcode.sh
```

### Alternative: Use EAS (Recommended)

If you continue hitting issues, the recommended approach is **EAS cloud builds**:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure project
eas build:configure

# Build for simulator
eas build --platform ios --profile development

# Build for production
eas build --platform ios --profile production
```

EAS avoids all local setup issues - no Xcode, no CocoaPods, no compatibility issues.

### When to Use Direct Xcode Build vs EAS

| Scenario | Use Xcode Direct | Use EAS |
|----------|------------------|---------|
| Local development & testing | ✅ | ❌ |
| Team CI/CD | ❌ | ✅ |
| App Store submission | ❌ | ✅ |
| One-off builds | ✅ | ✅ |
| Mac-only development | ✅ | ❌ |
| Cross-platform builds | ❌ | ✅ |

### Full Build Pipeline

For a complete development workflow:

```bash
# 1. Start Metro bundler (in one terminal)
npm start

# 2. In another terminal, build and run
bash scripts/build-ios-xcode.sh

# 3. After first build succeeds, updates are fast
# Just rebuild with:
bash scripts/build-ios-xcode.sh
```

### Build System Comparison

| Tool | Speed | Setup | Compatibility |
|------|-------|-------|-----------------|
| `npm run ios` (expo) | ⚠️ Slow (pods) | ⚠️ Complex | ❌ FFI issues |
| `npm run build:ios` (RN) | ⚠️ Slow (pods) | ⚠️ Complex | ❌ FFI issues |
| `xcodebuild` (direct) | ✅ Fast | ✅ Simple | ✅ Works |
| `eas build` (cloud) | ⚠️ Network | ✅ Minimal | ✅ Works |

### Next Steps

1. **First Build**: `bash scripts/build-ios-xcode.sh`
2. **Test on Simulator**: Verify app launches
3. **Iterate**: Make code changes and rebuild
4. **When Ready for App Store**: Switch to EAS with `eas build --platform ios --profile production`

### Reference

- **Xcode Build System**: https://developer.apple.com/documentation/xcode
- **Simulator Management**: https://developer.apple.com/documentation/xcode/running-your-app-in-simulator-or-on-a-device
- **EAS Documentation**: https://docs.expo.dev/eas/

---

**Summary**: Use `bash scripts/build-ios-xcode.sh` to build iOS locally without CocoaPods friction. When ready for production, use `eas build` for official app store releases.
