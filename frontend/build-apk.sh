#!/bin/bash

# College Timetable Android APK Build Script
# This script builds the Android APK from the React app

set -e

echo "🚀 Building College Timetable Android APK..."

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "❌ Java is not installed. Please install Java JDK 11+:"
    echo "   sudo apt install openjdk-11-jdk"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the frontend directory"
    exit 1
fi

# Step 1: Install dependencies (if needed)
echo "📦 Installing dependencies..."
if [ ! -d "node_modules" ]; then
    yarn install
fi

# Step 2: Build React app
echo "⚛️ Building React app..."
yarn build

# Step 3: Sync Capacitor
echo "🔄 Syncing Capacitor..."
npx cap sync android

# Step 4: Build Android APK
echo "🤖 Building Android APK..."
cd android

# Check if gradlew exists and is executable
if [ ! -f "./gradlew" ]; then
    echo "❌ Gradle wrapper not found. Please ensure Capacitor Android platform is properly set up."
    exit 1
fi

chmod +x ./gradlew

# Build debug APK
echo "🔨 Compiling APK..."
./gradlew assembleDebug

# Check if APK was created
APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
    echo "✅ APK built successfully!"
    echo "📱 Location: android/$APK_PATH"
    
    # Get APK size
    APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
    echo "📏 Size: $APK_SIZE"
    
    # Move APK to easier location
    cp "$APK_PATH" "../college-planner.apk"
    echo "📋 Copied to: college-planner.apk"
    
    echo ""
    echo "🎉 Build Complete!"
    echo "📱 Install: adb install college-planner.apk"
    echo "📱 Or transfer to your Android device and install manually"
    
else
    echo "❌ APK build failed. Check logs above for errors."
    exit 1
fi