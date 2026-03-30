#!/bin/bash

echo "🚀 Pushing to GitHub for Android Build..."

# Check if git is initialized
if [ ! -d .git ]; then
  echo "📦 Initializing Git repository..."
  git init
  git add .
  git commit -m "Initial commit: NFC Vault with Dynamic HCE"
  
  echo "🔗 Please add your GitHub repository as remote:"
  echo "git remote add origin https://github.com/YOUR_USERNAME/nfc-vault.git"
  echo "git push -u origin main"
  echo ""
  echo "Then the build will start automatically!"
else
  # Add all changes
  echo "📦 Adding changes..."
  git add .
  
  # Commit changes
  echo "💾 Committing changes..."
  git commit -m "Add GitHub Actions Android build workflow"
  
  # Push to GitHub
  echo "📤 Pushing to GitHub..."
  git push origin main
  
  echo "✅ Pushed successfully! Check your GitHub repository Actions tab for build progress."
fi

echo ""
echo "📱 After build completes, download the APK from:"
echo "GitHub → Your Repository → Actions → Latest Build → Artifacts"
echo ""
echo "🎯 Build will take 5-15 minutes (first build takes longer)"
