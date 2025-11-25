# How to Remove CocoaPods from Xcode and Build Directly

## Problem
Xcode is configured to run CocoaPods build phases, but CocoaPods has Ruby 2.6 compatibility issues.

## Solution: Remove CocoaPods Build Phases from Xcode

### Step-by-Step Instructions

#### 1. Open Xcode Project
```bash
open /Users/jeffreylan/SWR_AI/FindMyStuff/ios/findmystuff.xcodeproj
```

#### 2. In Xcode, Select the Project
- Left sidebar: Click "findmystuff" (the blue project icon at top)
- Center panel: Select "findmystuff" target

#### 3. Go to Build Phases Tab
- Top menu: Click "Build Phases" tab
- You should see build phases listed

#### 4. Remove CocoaPods Phases
Delete these phases (right-click → Delete):
- `[CP] Check Pods Manifest.lock`
- `[CP] Copy Pods Resources` 
- `[CP] Embed Pods Frameworks`
- Any other `[CP]` prefixed phases

**Keep these:**
- `Compile Sources`
- `Link Binary With Libraries`
- `Copy Bundle Resources`

#### 5. Remove Pods Dependency
- Go to "Build Settings" tab
- Search for "Framework Search Paths"
- Delete any paths containing `Pods`
- Search for "Header Search Paths"
- Delete any paths containing `Pods`

#### 6. Remove Xcode Workspace Reference
- Go to "Build Settings" tab
- Search for "pods"
- Delete any references to pods

#### 7. Build Settings Cleanup
- Search for "Link Binary"
- Remove any `-framework Pods` references

#### 8. Remove Pods from Link Binary Phase
- Build Phases tab
- Expand "Link Binary With Libraries"
- Look for any items named `Pods` or similar
- Delete them (click → select → press Delete key)

### Alternative: Edit project.pbxproj Directly

If you prefer command line, you can edit the project file directly:

```bash
cd /Users/jeffreylan/SWR_AI/FindMyStuff/ios

# Backup the file first
cp findmystuff.xcodeproj/project.pbxproj findmystuff.xcodeproj/project.pbxproj.backup

# Remove CocoaPods references
sed -i '' '/(CP)/d' findmystuff.xcodeproj/project.pbxproj
sed -i '' '/Pods/d' findmystuff.xcodeproj/project.pbxproj
```

### After Cleanup: Build Directly

```bash
cd /Users/jeffreylan/SWR_AI/FindMyStuff/ios

# List available simulators
xcrun simctl list devices available iOS

# Boot simulator
xcrun simctl boot "iPhone 17 Pro"

# Build and run on simulator
xcodebuild \
    -project findmystuff.xcodeproj \
    -scheme findmystuff \
    -configuration Debug \
    -destination "platform=iOS Simulator,name=iPhone 17 Pro" \
    clean build
```

### If Build Still Fails

The project might still reference Pods. In that case:

1. **Option A**: Remove ios/ and regenerate
```bash
cd /Users/jeffreylan/SWR_AI/FindMyStuff
rm -rf ios/
npx expo prebuild --platform ios --clean
# This regenerates without Pods
```

2. **Option B**: Edit Podfile to be minimal
```bash
cd ios/

# Replace Podfile with minimal version
cat > Podfile << 'EOF'
platform :ios, '15.1'

target 'findmystuff' do
  # No pods - build with Xcode only
end
EOF

# Delete Pods
rm -rf Pods Podfile.lock
```

3. **Option C**: Use xcworkspace instead
```bash
# If xcworkspace exists
xcodebuild \
    -workspace findmystuff.xcworkspace \
    -scheme findmystuff \
    -configuration Debug \
    -destination "platform=iOS Simulator,name=iPhone 17 Pro" \
    clean build
```

## Quick Steps to Get Running

1. Open Xcode
2. Remove CocoaPods build phases (see Step 4 above)
3. Delete Pods from Link Binary
4. In Terminal:
```bash
cd /Users/jeffreylan/SWR_AI/FindMyStuff/ios
xcrun simctl boot "iPhone 17 Pro" 2>/dev/null || true
xcodebuild -project findmystuff.xcodeproj -scheme findmystuff -configuration Debug -destination "platform=iOS Simulator,name=iPhone 17 Pro" clean build
```

## If This Still Doesn't Work

The Xcode project is fundamentally tied to CocoaPods. In that case, regenerate it without CocoaPods:

```bash
cd /Users/jeffreylan/SWR_AI/FindMyStuff

# Remove the problematic ios folder
rm -rf ios/

# Regenerate cleanly
npx expo prebuild --platform ios --clean

# Build directly (no CocoaPods in the new project)
cd ios/
xcrun simctl boot "iPhone 17 Pro" 2>/dev/null || true
xcodebuild -project findmystuff.xcodeproj -scheme findmystuff -configuration Debug -destination "platform=iOS Simulator,name=iPhone 17 Pro" clean build
```

## Summary

The issue is CocoaPods trying to use Ruby 2.6 incompatibilities. You have three options:

1. **Manually remove CocoaPods from Xcode** (see Step 4 above) - Takes 5 minutes
2. **Regenerate the iOS project** - Takes 3 minutes  
3. **Use EAS cloud builds** - Takes 5 minutes and avoids all local issues

Choose based on your preference!
