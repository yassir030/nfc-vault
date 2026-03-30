import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Button } from 'react-native-paper';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import * as SQLite from 'expo-sqlite';
import { checkAndRequestPermissions, checkNFCEnabled } from '../utils/permissions';
import { CardStorage } from '../utils/CardStorage';
import CardSaveModal from './CardSaveModal';

const NFCScreen = ({ onCardScanned, onNavigateToEmulation }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [db, setDb] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [lastScannedCard, setLastScannedCard] = useState(null);

  useEffect(() => {
    const initDb = async () => {
      const database = await SQLite.openDatabaseAsync('nfc_vault.db');
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS cards (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          uid TEXT NOT NULL,
          name TEXT,
          image_uri TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
      setDb(database);
    };

    initDb();
  }, []);

  useEffect(() => {
    return () => {
      if (isScanning) {
        stopScanning();
      }
    };
  }, [isScanning]);

  const startScanning = async () => {
    try {
      // Request runtime permissions for Android 6+
      const hasPermissions = await checkAndRequestPermissions();
      if (!hasPermissions) {
        return;
      }

      // Check if NFC is enabled
      const nfcEnabled = await checkNFCEnabled();
      if (!nfcEnabled) {
        Alert.alert(
          'NFC Disabled',
          'Please enable NFC in your device settings to scan cards.',
          [{ text: 'OK' }]
        );
        return;
      }

      setIsScanning(true);
      
      await NfcManager.start();
      
      await NfcManager.requestTechnology(NfcTech.Ndef, {
        alertMessage: 'Please tap your NFC card to the device',
      });

      const tag = await NfcManager.getTag();
      
      if (tag && tag.id) {
        const cardId = Array.isArray(tag.id) ? tag.id.join('') : tag.id;
        setLastScannedCard(cardId);
        
        // Show save modal instead of directly saving
        setShowSaveModal(true);
      }
    } catch (error) {
      console.error('NFC Error:', error);
      Alert.alert('Error', 'Failed to scan NFC card. Please try again.');
    } finally {
      stopScanning();
    }
  };

  const stopScanning = async () => {
    try {
      await NfcManager.cancelTechnologyRequest();
      setIsScanning(false);
    } catch (error) {
      console.error('Stop scanning error:', error);
    }
  };

  const saveCardToDatabase = async (cardData) => {
    if (!db) {
      throw new Error('Database not available');
    }

    try {
      // Save to SQLite (for UI display)
      await db.runAsync(
        'INSERT INTO cards (uid, name, image_uri) VALUES (?, ?, ?)',
        [cardData.uid, cardData.name, cardData.image_uri]
      );
      
      // Save to MMKV (for HCE service)
      const mmkvCard = {
        name: cardData.name,
        uid: cardData.uid,
        aid: 'F0010203040506', // Default AID
        response_data: cardData.uid, // Use UID as default response data
        image_uri: cardData.image_uri,
      };
      
      CardStorage.addCard(mmkvCard).then(() => {
        // Notify parent component and navigate to emulation
        if (onCardScanned) {
          onCardScanned();
        }
        
        if (onNavigateToEmulation) {
          onNavigateToEmulation();
        }
      }).catch((error) => {
        console.error('Error adding card to storage:', error);
        throw error;
      });
    } catch (error) {
      console.error('Error saving card:', error);
      throw error;
    }
  };

  const handleSaveModalDismiss = () => {
    setShowSaveModal(false);
    setLastScannedCard(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NFC Vault</Text>
      <Text style={styles.subtitle}>Scan NFC cards to save them</Text>
      
      {isScanning ? (
        <View style={styles.scanningContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.scanningText}>Scanning... Tap your NFC card</Text>
          <Button 
            mode="outlined" 
            onPress={stopScanning}
            style={styles.cancelButton}
          >
            Cancel
          </Button>
        </View>
      ) : (
        <Button 
          mode="contained" 
          onPress={startScanning}
          style={styles.scanButton}
          icon="nfc"
        >
          Start NFC Scan
        </Button>
      )}
      
      <CardSaveModal
        visible={showSaveModal}
        onDismiss={handleSaveModalDismiss}
        onSave={saveCardToDatabase}
        cardId={lastScannedCard || ''}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    color: '#666',
    textAlign: 'center',
  },
  scanButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  scanningContainer: {
    alignItems: 'center',
  },
  scanningText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 20,
  },
});

export default NFCScreen;
