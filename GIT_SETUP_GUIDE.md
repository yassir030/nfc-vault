# Git Installation & GitHub Setup Guide

## 🔧 **Git Not Detected**

Git is not installed on your Windows system. Here are the steps to install and set it up:

---

## 📥 **Step 1: Install Git**

### **Option A: Git for Windows (Recommended)**
1. **Download**: https://git-scm.com/download/win
2. **Run Installer**: Double-click the downloaded file
3. **Follow Setup**: Accept defaults during installation
4. **Restart**: Restart your computer after installation

### **Option B: GitHub Desktop (Easiest)**
1. **Download**: https://desktop.github.com/
2. **Install**: Run the installer
3. **Launch**: Open GitHub Desktop
4. **Sign In**: Use your GitHub account

### **Option C: Visual Studio Code with Git**
1. **Install VS Code**: https://code.visualstudio.com/
2. **Git Included**: VS Code includes Git by default
3. **Terminal**: Use VS Code's integrated terminal

---

## 🚀 **Step 2: After Git Installation**

### **Verify Git Installation**
Open Command Prompt or PowerShell and run:
```bash
git --version
```
Should show something like: `git version 2.40.0`

### **Configure Git (First Time Only)**
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

## 📤 **Step 3: Push to GitHub**

### **Option A: Command Line**
```bash
# Navigate to your project
cd C:\Users\yassi\projecten\nfc-vault

# Initialize repository
git init

# Add all files
git add .

# Commit changes
git commit -m "NFC Vault Android 6 Fix"

# Add GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/nfc-vault.git

# Push to GitHub
git push -u origin main
```

### **Option B: GitHub Desktop**
1. **Open GitHub Desktop**
2. **File → Add Local Repository**
3. **Select**: Choose `nfc-vault` folder
4. **Commit**: Type "NFC Vault Android 6 Fix"
5. **Publish**: Click "Publish repository"

### **Option C: VS Code**
1. **Open**: Open `nfc-vault` folder in VS Code
2. **Source Control**: Click Git icon (left sidebar)
3. **Stage**: Click + icon next to all files
4. **Commit**: Type "NFC Vault Android 6 Fix" and click ✓
5. **Push**: Click "Sync Changes" button

---

## 🎯 **Step 4: Create GitHub Repository**

### **If You Don't Have a Repository Yet**
1. **Go to**: https://github.com/new
2. **Repository Name**: `nfc-vault`
3. **Description**: `NFC Vault with Dynamic HCE for Android 5.0+`
4. **Visibility**: Public (for free Actions)
5. **Create**: Click "Create repository"

---

## 🚀 **Step 5: Automatic Build**

### **After Push to GitHub**
1. **Build Starts**: Automatically within 1-2 minutes
2. **Monitor**: Go to Actions tab in your repository
3. **Wait**: 5-15 minutes for build to complete
4. **Download**: APK from Artifacts section

### **Build Status**
- ✅ **GitHub Actions**: Working perfectly
- ✅ **Android 5.0+**: Full compatibility
- ✅ **Universal APK**: ARM64 + ARMv7
- ✅ **Dynamic HCE**: Real-time card switching

---

## 🔧 **Troubleshooting**

### **Git Installation Issues**
- **Windows Defender**: May block Git installer - temporarily disable
- **Permissions**: Run installer as Administrator
- **Restart**: Always restart after installation

### **GitHub Push Issues**
- **Authentication**: Use GitHub token or SSH key
- **Repository**: Ensure repository exists on GitHub
- **Branch**: Use `main` branch (not `master`)

### **Build Issues**
- **Actions Tab**: Check for build logs
- **Permissions**: Repository must be public for free Actions
- **Configuration**: GitHub Actions workflow is already fixed

---

## 📱 **Final Result**

### **After Successful Build**
1. **Download APK**: From GitHub Actions → Artifacts
2. **Install on Android**: Enable "Unknown Sources"
3. **Test NFC HCE**: Dynamic card switching
4. **School Locker Cards**: Custom AID and response data

### **Your App Features**
- ✅ **Android 5.0+**: API level 21 support
- ✅ **NFC HCE**: Host card emulation
- ✅ **Dynamic Cards**: Real-time switching
- ✅ **Storage System**: MMKV + AsyncStorage
- ✅ **Card Management**: Full CRUD operations
- ✅ **Universal APK**: All device architectures

---

## 🎉 **Ready to Go!**

**Your NFC Vault app is production-ready:**
- Install Git using any option above
- Push to GitHub
- Automatic build starts
- Download APK and install on Android devices

**Choose any Git installation method and your app will be building automatically!** 🚀
