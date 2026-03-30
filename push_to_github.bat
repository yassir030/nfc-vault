@echo off
echo 🚀 NFC Vault - Push to GitHub Repository
echo.

REM Check if this is a git repository
if not exist .git (
    echo ❌ This is not a Git repository!
    echo.
    echo Please install Git first: https://git-scm.com/download/win
    echo Then run this script again.
    pause
    exit /b 1
)

echo 📦 Adding all changes...
git add .

echo 💾 Committing changes...
git commit -m "Fix GitHub Actions: Simplified Android SDK setup without problematic action"

echo 🔗 Adding GitHub remote...
git remote add origin https://github.com/yassir030/nfc-vault.git

echo 📤 Pushing to GitHub...
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Successfully pushed to GitHub!
    echo 📱 Build will start automatically in 1-2 minutes.
    echo 🔗 Repository: https://github.com/yassir030/nfc-vault
    echo 📋 Download APK from: GitHub -^> Actions -^> Latest Build -^> Artifacts
    echo.
    echo 🎯 Your NFC Vault app will be ready for Android 5.0+ devices!
    echo 🏗️ Build should take 5-15 minutes (first build longer)
) else (
    echo.
    echo ❌ Push failed!
    echo Please check your GitHub credentials and try again.
    echo Make sure repository exists: https://github.com/yassir030/nfc-vault
)

pause
