const { withProjectBuildGradle } = require('expo/config-plugins');

module.exports = function withRootBuildGradle(config) {
  return withProjectBuildGradle(config, (config) => {
    const buildGradle = config.modResults;
    let contents = buildGradle.contents || buildGradle;
    
    // Add JitPack repository to buildscript.repositories
    if (!contents.includes('maven { url \'https://www.jitpack.io\' }')) {
      contents = contents.replace(
        /buildscript\s*\{[\s\S]*?repositories\s*\{/,
        (match) => {
          return match + '\n        maven { url \'https://www.jitpack.io\' }';
        }
      );
    }
    
    // Add JitPack repository to allprojects.repositories
    if (!contents.includes('allprojects')) {
      // Add allprojects section if it doesn't exist
      contents = contents.replace(
        /}\s*$/,
        `\n\nallprojects {\n    repositories {\n        google()\n        mavenCentral()\n        maven { url 'https://www.jitpack.io\' }\n    }\n}`
      );
    } else {
      contents = contents.replace(
        /allprojects\s*\{[\s\S]*?repositories\s*\{/,
        (match) => {
          if (!match.includes('jitpack')) {
            return match + '\n        maven { url \'https://www.jitpack.io\' }';
          }
          return match;
        }
      );
    }
    
    buildGradle.contents = contents;
    return config;
  });
};
