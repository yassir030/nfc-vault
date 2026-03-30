@echo off
echo 🔍 Finding Git installation...

REM Check common Git installation paths
if exist "C:\Program Files\Git\bin\git.exe" (
    set GIT_PATH="C:\Program Files\Git\bin\git.exe"
    echo ✅ Found Git at: C:\Program Files\Git\bin\git.exe
) else if exist "C:\Program Files (x86)\Git\bin\git.exe" (
    set GIT_PATH="C:\Program Files (x86)\Git\bin\git.exe"
    echo ✅ Found Git at: C:\Program Files (x86)\Git\bin\git.exe
) else if exist "%LOCALAPPDATA%\Programs\Git\git.exe" (
    set GIT_PATH="%LOCALAPPDATA%\Programs\Git\git.exe"
    echo ✅ Found Git at: %GIT_PATH%
) else (
    echo ❌ Git not found in common locations
    echo.
    echo Please install Git from: https://git-scm.com/download/win
    echo Or use GitHub Desktop: https://desktop.github.com/
    pause
    exit /b 1
)

echo.
echo 📦 Initializing Git repository...
"%GIT_PATH%" init

echo 📋 Adding all files...
"%GIT_PATH%" add .

echo 💾 Committing changes...
"%GIT_PATH%" commit -m "Fix GitHub Actions: Simplified Android SDK setup without problematic action"

echo 🔗 Adding GitHub remote...
"%GIT_PATH%" remote add origin https://github.com/yassir030/nfc-vault.git

echo 📤 Pushing to GitHub...
"%GIT_PATH%" push -u origin main --force

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
