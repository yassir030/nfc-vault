const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withBuildGradle(config) {
  return withAppBuildGradle(config, (config) => {
    const buildGradle = config.modResults;
    
    // Add JitPack repository to buildscript.repositories
    if (!buildGradle.includes('maven { url \'https://www.jitpack.io\' }')) {
      buildGradle = buildGradle.replace(
        /buildscript\s*\{[\s\S]*?repositories\s*\{/,
        (match) => {
          return match + '\n        maven { url \'https://www.jitpack.io\' }';
        }
      );
    }
    
    // Add JitPack repository to allprojects.repositories
    if (!buildGradle.includes('allprojects')) {
      // Add allprojects section if it doesn't exist
      buildGradle = buildGradle.replace(
        /}\s*$/,
        `\n\nallprojects {\n    repositories {\n        google()\n        mavenCentral()\n        maven { url 'https://www.jitpack.io\' }\n    }\n}`
      );
    } else {
      buildGradle = buildGradle.replace(
        /allprojects\s*\{[\s\S]*?repositories\s*\{/,
        (match) => {
          if (!match.includes('jitpack')) {
            return match + '\n        maven { url \'https://www.jitpack.io\' }';
          }
          return match;
        }
      );
    }
    
    config.modResults = buildGradle;
    return config;
  });
};
