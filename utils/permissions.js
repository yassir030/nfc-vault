import { Platform, Alert } from 'react-native';
import { PermissionsAndroid } from 'react-native';

export const requestNFCPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.NFC,
        {
          title: 'NFC Permission',
          message: 'This app needs NFC access to scan and emulate cards.',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('NFC permission error:', err);
      return false;
    }
  }
  return true; // iOS doesn't need NFC permission
};

export const requestVibratePermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.VIBRATE,
        {
          title: 'Vibration Permission',
          message: 'This app needs vibration permission for haptic feedback.',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Vibration permission error:', err);
      return false;
    }
  }
  return true; // iOS doesn't need this permission
};

export const checkAndRequestPermissions = async () => {
  const nfcGranted = await requestNFCPermission();
  const vibrateGranted = await requestVibratePermission();

  if (!nfcGranted) {
    Alert.alert(
      'Permission Required',
      'NFC permission is required for this app to function. Please enable it in settings.',
      [{ text: 'OK' }]
    );
    return false;
  }

  if (!vibrateGranted) {
    Alert.alert(
      'Permission Required',
      'Vibration permission is required for haptic feedback. Please enable it in settings.',
      [{ text: 'OK' }]
    );
    return false;
  }

  return true;
};

export const checkNFCEnabled = async () => {
  try {
    // This would need to be implemented with react-native-nfc-manager
    // For now, we'll assume it's enabled
    return true;
  } catch (error) {
    console.warn('NFC check error:', error);
    return false;
  }
};
