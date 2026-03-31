const { withGradleProperties } = require('@expo/config-plugins');

module.exports = function withRepositories(config) {
  return withGradleProperties(config, (config) => {
    // This plugin will add the JitPack repository to both buildscript and allprojects
    // We need to modify the build.gradle file directly
    
    return config;
  });
};

// Alternative approach - directly modify build.gradle
const fs = require('fs');
const path = require('path');

function addJitPackToBuildGradle(projectRoot) {
  const buildGradlePath = path.join(projectRoot, 'android', 'build.gradle');
  
  if (fs.existsSync(buildGradlePath)) {
    let content = fs.readFileSync(buildGradlePath, 'utf8');
    
    // Add JitPack to buildscript.repositories if not already present
    if (!content.includes('maven { url \'https://www.jitpack.io\' }')) {
      content = content.replace(
        /buildscript\s*\{[\s\S]*?repositories\s*\{/,
        (match) => {
          return match + '\n        maven { url \'https://www.jitpack.io\' }';
        }
      );
    }
    
    // Add JitPack to allprojects.repositories if not already present
    if (!content.includes('allprojects')) {
      // Add allprojects section if it doesn't exist
      content = content.replace(
        /}\s*$/,
        `\n\nallprojects {\n    repositories {\n        google()\n        mavenCentral()\n        maven { url 'https://www.jitpack.io' }\n    }\n}`
      );
    } else {
      content = content.replace(
        /allprojects\s*\{[\s\S]*?repositories\s*\{/,
        (match) => {
          if (!match.includes('jitpack')) {
            return match + '\n        maven { url \'https://www.jitpack.io\' }';
          }
          return match;
        }
      );
    }
    
    fs.writeFileSync(buildGradlePath, content);
    console.log('Added JitPack repository to android/build.gradle');
  }
}

module.exports.addJitPackToBuildGradle = addJitPackToBuildGradle;
