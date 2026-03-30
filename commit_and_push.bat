@echo off
echo 🚀 NFC Vault - Commit and Push to GitHub
echo.

REM Check if this is a git repository
if not exist .git (
    echo ❌ This is not a Git repository!
    echo.
    echo Please run: git init
    echo Then run this script again.
    pause
    exit /b 1
)

echo 📦 Adding all changes...
git add .

echo 💾 Committing changes...
git commit -m "Fix GitHub Actions: Update to latest versions + Android 5.0 compatibility"

echo 📤 Pushing to GitHub...
git push origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Successfully pushed to GitHub!
    echo 📱 Build will start automatically in 1-2 minutes.
    echo 📋 Download APK from: GitHub -^> Actions -^> Latest Build -^> Artifacts
    echo.
    echo 🎯 Your NFC Vault app will be ready for Android 5.0+ devices!
) else (
    echo.
    echo ❌ Push failed!
    echo Please check your GitHub credentials and try again.
)

pause
