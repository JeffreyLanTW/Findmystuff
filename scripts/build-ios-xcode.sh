#!/bin/bash

# Direct Xcode build without CocoaPods
# This bypasses the CocoaPods FFI compatibility issues

set -e

PROJECT_DIR="/Users/jeffreylan/SWR_AI/FindMyStuff"
IOS_DIR="$PROJECT_DIR/ios"
SCHEME="findmystuff"
SIMULATOR="iPhone 17 Pro"

echo "🚀 Building FindMyStuff iOS with Xcode (No CocoaPods)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Step 1: Check if .xcodeproj exists
if [ ! -d "$IOS_DIR/$SCHEME.xcodeproj" ]; then
    echo "❌ Xcode project not found at $IOS_DIR/$SCHEME.xcodeproj"
    echo "📝 Please ensure ios/ folder has been generated with:"
    echo "   npx expo prebuild --platform ios --clean"
    exit 1
fi

echo "✅ Found Xcode project"

# Step 2: Get list of available simulators
echo ""
echo "📱 Available iOS Simulators:"
xcrun simctl list devices available iOS | grep "($SIMULATOR\|iPhone 14)" || true

# Step 3: Boot simulator
echo ""
echo "🔧 Booting $SIMULATOR simulator..."
UDID=$(xcrun simctl list devices available iOS | grep "$SIMULATOR" | head -1 | sed -E 's/.*\(([A-F0-9-]+)\).*/\1/')

if [ -z "$UDID" ]; then
    echo "❌ Could not find $SIMULATOR simulator"
    echo "📝 Available simulators:"
    xcrun simctl list devices available iOS
    exit 1
fi

echo "✅ Using simulator: $UDID"
xcrun simctl boot "$UDID" || true  # Ignore if already booted

# Step 4: Ensure Podfile.lock exists to bypass CocoaPods check
echo ""
echo "🔧 Setting up CocoaPods bypass..."
if [ ! -f "$IOS_DIR/Podfile.lock" ]; then
    cat > "$IOS_DIR/Podfile.lock" << 'PODEOF'
PODS: []

DEPENDENCIES:

SPEC REPOS:
  trunk: []

EXTERNAL SOURCES:

CHECKOUT OPTIONS:

PODFILE CHECKSUM: 0000000000000000000000000000000000000000

COCOAPODS: 1.16.2
PODEOF
    echo "✅ Created minimal Podfile.lock"
fi

# Step 5: Build the app without CocoaPods
echo ""
echo "🏗️  Building with xcodebuild (bypassing CocoaPods)..."
cd "$IOS_DIR"

# Use xcodebuild to build directly
# Skip the CocoaPods check script by using scheme-based build
xcodebuild -scheme "$SCHEME" \
    -configuration Debug \
    -destination "generic/platform=iOS Simulator" \
    -derivedDataPath "build" \
    -skipPackagePluginValidation \
    build \
    2>&1 | tee build.log

# Check if build succeeded
BUILD_STATUS=${PIPESTATUS[0]}

if [ $BUILD_STATUS -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "📦 Build artifacts:"
    APP_PATH=$(find "$IOS_DIR/build" -name "*.app" -type d | head -1)
    if [ -n "$APP_PATH" ]; then
        echo "$APP_PATH"
        
        echo ""
        echo "📱 To install on simulator:"
        echo "   xcrun simctl install booted \"$APP_PATH\""
        
        echo ""
        echo "📱 To launch the app:"
        echo "   xcrun simctl launch booted com.anonymous.findmystuff"
    fi
    
    echo ""
    echo "✅ iOS build complete!"
else
    echo ""
    echo "❌ Build failed with status $BUILD_STATUS"
    echo ""
    echo "🔧 Troubleshooting: The [CP] Check Pods Manifest.lock error is expected."
    echo "   This occurs because Xcode is configured to use CocoaPods, but we're"
    echo "   bypassing it. Try one of these solutions:"
    echo ""
    echo "   1. Use EAS cloud builds (recommended):"
    echo "      npm install -g eas-cli && eas login && eas build --platform ios"
    echo ""
    echo "   2. Remove CocoaPods build phase from Xcode project"
    echo ""
    echo "   3. Run pod install with system Ruby workaround"
    echo ""
    tail -50 build.log
    exit 1
fi

cd "$PROJECT_DIR"
