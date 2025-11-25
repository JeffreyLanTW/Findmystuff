#!/bin/bash

# FindMyStuff iOS Build - Using React Native CLI (No CocoaPods)
# This approach uses expo/react-native CLI with environment tweaks

set -e

PROJECT_DIR="/Users/jeffreylan/SWR_AI/FindMyStuff"
IOS_DIR="$PROJECT_DIR/ios"
SIMULATOR="iPhone 17 Pro"

echo "🚀 Building FindMyStuff iOS with React Native CLI"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Step 1: Boot simulator
echo ""
echo "🔧 Starting $SIMULATOR simulator..."
UDID=$(xcrun simctl list devices available iOS | grep "$SIMULATOR" | head -1 | sed -E 's/.*\(([A-F0-9-]+)\).*/\1/')

if [ -z "$UDID" ]; then
    echo "❌ Could not find $SIMULATOR simulator"
    echo "📝 Available simulators:"
    xcrun simctl list devices available iOS
    exit 1
fi

echo "✅ Using simulator: $UDID"
xcrun simctl boot "$UDID" || true

# Step 2: Ensure Metro bundler isn't running
echo ""
echo "🔧 Checking for running Metro bundler..."
pkill -f "expo start" 2>/dev/null || true
pkill -f "react-native start" 2>/dev/null || true
sleep 1
echo "✅ Metro bundler cleaned up"

# Step 3: Clear build cache
echo ""
echo "🔧 Clearing build cache..."
rm -rf ~/Library/Developer/Xcode/DerivedData/findmystuff* 2>/dev/null || true
rm -rf "$IOS_DIR/build" 2>/dev/null || true
echo "✅ Build cache cleared"

# Step 4: Try building with npx react-native run-ios
echo ""
echo "🏗️  Building iOS app..."
cd "$PROJECT_DIR"

# Set environment variables to skip CocoaPods
export SKIP_PODS_INSTALLATION=1
export SKIP_POD_INSTALL=1

# Try to build - this will likely fail on pods, but we'll handle it
npm run build:ios -- --simulator="$SIMULATOR" 2>&1 | tee build-output.log || BUILD_FAILED=1

if [ -z "$BUILD_FAILED" ]; then
    echo ""
    echo "✅ iOS build complete!"
    echo "📱 App is now running in $SIMULATOR simulator"
else
    echo ""
    echo "⚠️  Standard build approach hit CocoaPods issues"
    echo ""
    echo "🔧 Recommended solutions:"
    echo ""
    echo "   1. Use EAS cloud builds (no local setup needed):"
    echo "      npm install -g eas-cli"
    echo "      eas login"
    echo "      eas build --platform ios --profile development"
    echo ""
    echo "   2. Fix CocoaPods locally:"
    echo "      cd ios/"
    echo "      rm -rf Pods Podfile.lock"
    echo "      pod install --repo-update"
    echo "      cd .."
    echo "      npm run build:ios"
    echo ""
    echo "   3. Check build log:"
    tail -50 build-output.log
    exit 1
fi

cd "$PROJECT_DIR"
