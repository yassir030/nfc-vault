const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withNfcHce(config) {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;
    
    // Find or create the application tag
    let application = androidManifest.manifest.application[0];
    if (!application) {
      application = { $: { 'android:name': '.MainApplication' } };
      androidManifest.manifest.application = [application];
    }

    // Add HCE service if it doesn't exist
    if (!application.service) {
      application.service = [];
    }

    const hceService = {
      $: {
        'android:name': '.nfc.HceService',
        'android:exported': 'true',
        'android:permission': 'android.permission.BIND_NFC_SERVICE',
        'android:enabled': 'true'
      },
      'intent-filter': [
        {
          action: [
            {
              $: {
                'android:name': 'android.nfc.cardemulation.action.HOST_APDU_SERVICE'
              }
            }
          ],
          data: [
            {
              $: {
                'android:mimeType': 'application/vnd.android.drm'
              }
            }
          ],
          category: [
            {
              $: {
                'android:name': 'android.intent.category.DEFAULT'
              }
            }
          ]
        }
      ],
      'meta-data': [
        {
          $: {
            'android:name': 'android.nfc.cardemulation.host_apdu_service',
            'android:resource': '@xml/aid_list'
          }
        }
      ]
    };

    // Check if HCE service already exists
    const existingService = application.service.find(
      service => service.$['android:name'] === '.nfc.HceService'
    );

    if (!existingService) {
      application.service.push(hceService);
    }

    return config;
  });
};
