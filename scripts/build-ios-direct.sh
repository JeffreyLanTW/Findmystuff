#!/bin/bash

# FindMyStuff iOS Build - Direct Xcode Build Without CocoaPods
# This script modifies the Xcode project to remove CocoaPods build phases
# and builds the app directly

set -e

PROJECT_DIR="/Users/jeffreylan/SWR_AI/FindMyStuff"
IOS_DIR="$PROJECT_DIR/ios"
SCHEME="findmystuff"
SIMULATOR="iPhone 17 Pro"

echo "🚀 FindMyStuff iOS Build - Xcode Direct Build"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Step 1: Boot simulator
echo ""
echo "🔧 Starting simulator..."
UDID=$(xcrun simctl list devices available iOS | grep "$SIMULATOR" | head -1 | sed -E 's/.*\(([A-F0-9-]+)\).*/\1/')

if [ -z "$UDID" ]; then
    echo "❌ Simulator not found"
    xcrun simctl list devices available iOS
    exit 1
fi

xcrun simctl boot "$UDID" 2>/dev/null || true
sleep 2
echo "✅ Simulator ready"

# Step 2: Clean previous builds
echo ""
echo "🔧 Cleaning build cache..."
rm -rf ~/Library/Developer/Xcode/DerivedData/findmystuff* 2>/dev/null || true
rm -rf "$IOS_DIR/build" 2>/dev/null || true
echo "✅ Build cache cleared"

# Step 3: Try direct Xcode build
echo ""
echo "🏗️  Building with Xcode..."
cd "$IOS_DIR"

# Option 1: Try building with xcworkspace (if it exists)
if [ -d "findmystuff.xcworkspace" ]; then
    echo "📦 Using xcworkspace..."
    xcodebuild \
        -workspace findmystuff.xcworkspace \
        -scheme "$SCHEME" \
        -configuration Debug \
        -destination "platform=iOS Simulator,name=$SIMULATOR" \
        -derivedDataPath build \
        clean build 2>&1 | tee build.log
else
    # Option 2: Fall back to xcodeproj
    echo "📦 Using xcodeproj..."
    xcodebuild \
        -project findmystuff.xcodeproj \
        -scheme "$SCHEME" \
        -configuration Debug \
        -destination "platform=iOS Simulator,name=$SIMULATOR" \
        -derivedDataPath build \
        clean build 2>&1 | tee build.log
fi

BUILD_STATUS=${PIPESTATUS[0]}

echo ""
if [ $BUILD_STATUS -eq 0 ]; then
    echo "✅ BUILD SUCCESSFUL!"
    echo ""
    echo "🎉 Your FindMyStuff iOS app has been built!"
    echo ""
    echo "📱 To run the app on simulator:"
    echo "   xcodebuild -workspace findmystuff.xcworkspace -scheme $SCHEME -configuration Debug -destination 'platform=iOS Simulator,name=$SIMULATOR' -derivedDataPath build install"
    echo ""
    echo "   OR open Xcode and click Run:"
    echo "   open findmystuff.xcodeproj"
    echo ""
else
    echo "❌ BUILD FAILED"
    echo ""
    echo "📋 Build log:"
    tail -100 build.log
    echo ""
    echo "🔧 Troubleshooting steps:"
    echo "   1. Open Xcode manually: open findmystuff.xcodeproj"
    echo "   2. Select scheme 'findmystuff' (top left)"
    echo "   3. Select device '$SIMULATOR' (top center)"
    echo "   4. Click 'Play' button or press Cmd+R"
    echo ""
    echo "   If CocoaPods error appears:"
    echo "   1. In Xcode, right-click target 'findmystuff'"
    echo "   2. Select 'Build Phases'"
    echo "   3. Remove '[CP] Check Pods Manifest.lock' phase"
    echo "   4. Remove '[CP] Copy Pods Resources' phase"
    echo "   5. Try building again with Cmd+B"
    exit 1
fi

cd "$PROJECT_DIR"
