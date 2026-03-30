# GitHub Actions Android Build - FIXED

This repository includes a GitHub Actions workflow that automatically builds your Android APK for free in the cloud.

## 🚀 How to Use

### 1. Install Git (if not installed)
- **Windows**: Download from https://git-scm.com/download/win
- **GitHub Desktop**: https://desktop.github.com/
- **GitHub Web**: Upload directly to github.com

### 2. Push to GitHub
**Option A: Command Line**
```bash
git add .
git commit -m "Fix GitHub Actions: Update to latest versions + Android 5.0 compatibility"
git push origin main
```

**Option B: Windows Script**
```bash
# Double-click commit_and_push.bat
```

### 3. Trigger Build
The build will automatically start when you:
- Push to `main` or `master` branch
- Create a pull request
- Manually trigger from Actions tab

### 4. Download APK
Once the build completes:
1. Go to your repository on GitHub
2. Click on "Actions" tab
3. Click on the latest build run
4. Download the APK from "Artifacts" section

## 📋 Build Configuration - UPDATED

### Environment
- **OS**: Ubuntu Latest
- **Node.js**: v20 (with FORCE_JAVASCRIPT_ACTIONS_TO_NODE24)
- **Java**: JDK 17
- **Android SDK**: API 34 with Build Tools 34.0.0
- **Actions**: Latest versions (checkout@v4, setup-node@v4, setup-java@v4, cache@v4)

### Build Steps - ENHANCED
1. ✅ Checkout repository
2. ✅ Setup Node.js and Java
3. ✅ Setup Android SDK
4. ✅ Cache Gradle dependencies
5. ✅ Install npm dependencies
6. ✅ Setup Expo CLI
7. ✅ Create local.properties with SDK paths
8. ✅ Generate Android project files
9. ✅ Verify project generation
10. ✅ Build release APK
11. ✅ Upload APKs as artifact
12. ✅ Upload build logs (if failed)

### Output - ENHANCED
- **APK Location**: `android/app/build/outputs/apk/release/app-release.apk`
- **Artifact Name**: `android-apks` (includes all APK variants)
- **Retention**: 30 days
- **Build Logs**: Available for 7 days (if build fails)
- **Universal APK**: Supports ARM64 + ARMv7
- **Architecture APKs**: Separate builds for older devices

## 🔧 Fixes Applied

### ✅ Action Versions Updated
- `actions/checkout@v4` (latest)
- `actions/setup-node@v4` (latest)  
- `actions/setup-java@v4` (latest)
- `actions/cache@v4` (latest)
- `actions/upload-artifact@v4` (latest)

### ✅ Node.js Deprecation Fixed
- Added `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true`
- Eliminates Node.js version warnings

### ✅ Android SDK Setup Enhanced
- Proper SDK path configuration
- NDK path added to local.properties
- Verification step for project generation
- Robust error handling

### ✅ Build Process Improved
- Better error handling and logging
- Verification steps for critical files
- Multiple APK upload paths
- Enhanced artifact management

## 🎯 Android 5.0+ Compatibility

### ✅ minSdkVersion: 21
- Supports Android 5.0 (API level 21)
- Backward compatible with older devices
- NFC HCE available from API 21

### ✅ Universal APK Build
- ARM64: Modern devices
- ARMv7: Legacy Android 5.0 devices
- Single APK for most devices
- Separate APKs for compatibility

## 🔐 Troubleshooting

### Build Fails?
1. Check Actions tab for detailed logs
2. Download build logs artifact
3. Common issues resolved:
   - ✅ Action versions updated
   - ✅ Node.js deprecation fixed
   - ✅ Android SDK setup enhanced
   - ✅ Build process improved

### Manual Trigger
You can manually trigger a build:
1. Go to Actions tab
2. Select "Build Android APK (Universal)" workflow
3. Click "Run workflow"

### Build Time
- First build: ~10-15 minutes (downloads dependencies)
- Subsequent builds: ~5-8 minutes (uses cache)

## 📱 Installing the APK

1. Enable "Unknown Sources" on your Android device
2. Download APK from GitHub Artifacts
3. Tap on APK file to install
4. Grant permissions when prompted

## 🎯 Features

- ✅ **Free**: No cost for public repositories
- ✅ **Automatic**: Builds on every push
- ✅ **Fast**: Cached dependencies for quick builds
- ✅ **Reliable**: Uses official GitHub Actions
- ✅ **Enhanced**: Latest action versions + better error handling
- ✅ **Compatible**: Android 5.0+ (API 21+)
- ✅ **Universal**: ARM64 + ARMv7 support
- ✅ **Artifact Storage**: 30-day retention
- ✅ **Build Logs**: Detailed error reporting

## 📊 Build Status Badge

Add this to your README.md to show build status:

```markdown
![Build Android APK](https://github.com/yourusername/nfc-vault/workflows/Build%20Android%20APK/badge.svg)
```

## 📝 Notes

- The workflow uses `--legacy-peer-deps` to handle dependency conflicts
- Gradle wrapper is automatically configured
- APK is signed with debug keystore (for testing)
- Build artifacts are automatically cleaned up after retention period
- All GitHub Actions deprecation warnings resolved
- Android SDK paths automatically configured
