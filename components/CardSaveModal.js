import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Alert } from 'react-native';
import { Modal, Button, TextInput, Provider as PaperProvider } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

const CardSaveModal = ({ visible, onDismiss, onSave, cardId }) => {
  const [cardName, setCardName] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const takePhoto = async () => {
    try {
      // Request camera permissions
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Camera permission is needed to take a photo of the card.');
        return;
      }

      // Take photo with compression for Android 6 optimization
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 2], // Card-like aspect ratio
        quality: 0.7, // Compressed for Android 6
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const photoUri = result.assets[0].uri;
        
        // Move photo to permanent storage
        const permanentUri = await savePhotoPermanently(photoUri, cardId);
        setImageUri(permanentUri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const savePhotoPermanently = async (tempUri, cardId) => {
    try {
      // Create card_images directory if it doesn't exist
      const dir = FileSystem.documentDirectory + 'card_images/';
      const dirInfo = await FileSystem.getInfoAsync(dir);
      
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      }

      // Generate unique filename
      const fileName = `card_${cardId}_${Date.now()}.jpg`;
      const permanentUri = dir + fileName;

      // Move file from cache to permanent storage
      await FileSystem.moveAsync({
        from: tempUri,
        to: permanentUri,
      });

      return permanentUri;
    } catch (error) {
      console.error('Error saving photo permanently:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!cardName.trim()) {
      Alert.alert('Error', 'Please enter a name for this card.');
      return;
    }

    setIsSaving(true);
    
    try {
      await onSave({
        uid: cardId,
        name: cardName.trim(),
        image_uri: imageUri,
      });
      
      // Reset form
      setCardName('');
      setImageUri(null);
      setIsSaving(false);
      
      Alert.alert(
        'Card Saved!',
        'Your card has been saved successfully.',
        [{ text: 'OK', onPress: onDismiss }]
      );
    } catch (error) {
      console.error('Error saving card:', error);
      Alert.alert('Error', 'Failed to save card. Please try again.');
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Clean up temporary image if exists
    if (imageUri) {
      FileSystem.deleteAsync(imageUri, { idempotent: true }).catch(() => {});
    }
    
    setCardName('');
    setImageUri(null);
    onDismiss();
  };

  return (
    <PaperProvider>
      <Modal
        visible={visible}
        onDismiss={handleCancel}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <Text style={styles.title}>Save Card</Text>
          <Text style={styles.subtitle}>Card ID: {cardId}</Text>
          
          <TextInput
            label="Card Name"
            value={cardName}
            onChangeText={setCardName}
            style={styles.textInput}
            mode="outlined"
            placeholder="e.g., My Office Card"
          />

          <View style={styles.imageSection}>
            <Text style={styles.imageLabel}>Card Photo (Optional)</Text>
            
            {imageUri ? (
              <View style={styles.imagePreview}>
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
                <Button
                  mode="outlined"
                  onPress={takePhoto}
                  style={styles.retakeButton}
                  compact
                >
                  Retake Photo
                </Button>
              </View>
            ) : (
              <Button
                mode="outlined"
                onPress={takePhoto}
                style={styles.photoButton}
                icon="camera"
              >
                Take Photo
              </Button>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <Button
              mode="text"
              onPress={handleCancel}
              style={styles.cancelButton}
              disabled={isSaving}
            >
              Cancel
            </Button>
            
            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.saveButton}
              loading={isSaving}
              disabled={isSaving || !cardName.trim()}
            >
              Save Card
            </Button>
          </View>
        </View>
      </Modal>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalContent: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  textInput: {
    marginBottom: 20,
  },
  imageSection: {
    marginBottom: 24,
  },
  imageLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  photoButton: {
    marginBottom: 10,
  },
  imagePreview: {
    alignItems: 'center',
  },
  previewImage: {
    width: 200,
    height: 133,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#f5f5f5',
  },
  retakeButton: {
    borderColor: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});

export default CardSaveModal;
