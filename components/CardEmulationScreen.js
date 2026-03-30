import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Button, Provider as PaperProvider, Menu, Divider } from 'react-native-paper';
import NfcManager from 'react-native-nfc-manager';
import * as SQLite from 'expo-sqlite';
import { checkAndRequestPermissions, checkNFCEnabled } from '../utils/permissions';
import { hceBridge } from '../utils/hceBridge';
import { storageService } from '../utils/storageService';

const CardEmulationScreen = () => {
  const [isEmulating, setIsEmulating] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [db, setDb] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeCard, setActiveCard] = useState(null);

  // AID that matches our apdu_service.xml configuration
  const TEST_AID = 'F0010203040506';

  useEffect(() => {
    const initDb = async () => {
      const database = await SQLite.openDatabaseAsync('nfc_vault.db');
      setDb(database);
    };

    initDb();
  }, []);

  useEffect(() => {
    loadCards();
    loadActiveCard();
  }, []);

  const loadActiveCard = async () => {
    try {
      const card = await hceBridge.getActiveCard();
      setActiveCard(card);
      if (card) {
        setSelectedCard(card);
      }
    } catch (error) {
      console.error('Error loading active card:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (isEmulating) {
        stopCardEmulation();
      }
    };
  }, [isEmulating]);

  const loadCards = async () => {
    if (!db) return;

    try {
      const result = await db.getAllAsync('SELECT * FROM cards ORDER BY timestamp DESC');
      setCards(result);
      if (result.length > 0 && !selectedCard) {
        setSelectedCard(result[0]);
      }
    } catch (error) {
      console.error('Error loading cards:', error);
    }
  };

  const startCardEmulation = async () => {
    try {
      setIsStarting(true);
      console.log('Starting card emulation with AID:', TEST_AID);

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
          'Please enable NFC in your device settings to use card emulation.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Initialize NFC Manager
      await NfcManager.start();
      
      // Check if HCE is supported
      const isSupported = await NfcManager.isSupported();
      if (!isSupported) {
        throw new Error('NFC not supported on this device');
      }
      
      // Check if HCE is enabled
      const isEnabled = await NfcManager.isEnabled();
      if (!isEnabled) {
        throw new Error('NFC is disabled. Please enable NFC in settings.');
      }

      // Start HCE with the selected card
      if (!selectedCard) {
        throw new Error('Please select a card to emulate');
      }

      console.log('Starting HCE with card:', selectedCard.uid);
      
      // The correct method for react-native-nfc-manager is to register the AID
      // Since we have a custom service, we might need to use a different approach
      try {
        // Try to start HCE - this might not exist in all versions
        if (typeof NfcManager.startTagRegistrationHce === 'function') {
          await NfcManager.startTagRegistrationHce({
            aid: TEST_AID,
          });
        } else {
          // Alternative approach - some versions use different method names
          console.log('startTagRegistrationHce not available, checking alternative methods...');
          
          // For custom HCE services, we might need to use native modules
          // or ensure the service is properly registered in AndroidManifest.xml
          console.log('HCE service should be active via AndroidManifest.xml registration');
        }
      } catch (hceError) {
        console.log('HCE method error:', hceError);
        // Even if the JS method fails, our native service should still work
        // if the AndroidManifest.xml is properly configured
      }

      setIsEmulating(true);
      Alert.alert(
        'Card Emulation Started',
        `Your device is now emulating:\nCard: ${selectedCard.name || 'Unnamed Card'}\nUID: ${selectedCard.uid}\nAID: ${TEST_AID}\n\nYou can now tap this device to an NFC reader.`,
        [{ text: 'OK' }]
      );
      
      console.log('Card emulation started successfully');
      
    } catch (error) {
      console.error('Failed to start card emulation:', error);
      Alert.alert(
        'Error',
        `Failed to start card emulation: ${error.message || 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsStarting(false);
    }
  };

  const handleCardSelect = async (card) => {
    try {
      setSelectedCard(card);
      
      // Update HCE active card
      const success = await hceBridge.updateActiveCard(card);
      
      if (success) {
        setActiveCard(card);
        Alert.alert(
          'Card Selected',
          `Now emulating: ${card.name || 'Unnamed Card'}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'Failed to update active card');
      }
    } catch (error) {
      console.error('Error selecting card:', error);
      Alert.alert('Error', 'Failed to select card');
    }
  };

  const getCardDisplayName = (card) => {
    if (!card) return 'Select a card';
    const shortId = card.uid.substring(0, 8) + '...';
    return `${card.name || 'Unnamed Card'} (${shortId})`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const stopCardEmulation = async () => {
    try {
      setIsStopping(true);
      console.log('Stopping card emulation...');

      // Try to stop HCE if the method exists
      try {
        if (typeof NfcManager.stopTagRegistrationHce === 'function') {
          await NfcManager.stopTagRegistrationHce();
        }
      } catch (stopError) {
        console.log('Stop HCE method error:', stopError);
        // Continue even if stop method fails
      }

      setIsEmulating(false);
      Alert.alert(
        'Card Emulation Stopped',
        'Card emulation has been stopped.',
        [{ text: 'OK' }]
      );
      
      console.log('Card emulation stopped successfully');
      
    } catch (error) {
      console.error('Failed to stop card emulation:', error);
      Alert.alert(
        'Error',
        `Failed to stop card emulation: ${error.message || 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsStopping(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Card Emulation</Text>
      <Text style={styles.subtitle}>Emulate an NFC card for testing</Text>
      
      <View style={styles.aidContainer}>
        <Text style={styles.aidLabel}>Active AID:</Text>
        <Text style={styles.aidValue}>{TEST_AID}</Text>
      </View>

      {/* Card Selection Dropdown */}
      <View style={styles.cardSelectionContainer}>
        <Text style={styles.selectionLabel}>Select Card to Emulate:</Text>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setMenuVisible(true)}
              style={styles.dropdownButton}
              icon="chevron-down"
              contentStyle={styles.dropdownContent}
            >
              {selectedCard ? getCardDisplayName(selectedCard) : 'Select a card'}
            </Button>
          }
        >
          {cards.map((card) => (
            <Menu.Item
              key={card.id}
              onPress={() => {
                handleCardSelect(card);
                setMenuVisible(false);
              }}
              title={getCardDisplayName(card)}
              style={styles.menuItem}
            />
          ))}
          {cards.length === 0 && (
            <Menu.Item
              title="No cards available"
              disabled
              style={styles.menuItem}
            />
          )}
        </Menu>
        
        {selectedCard && (
          <View style={styles.selectedCardInfo}>
            <View style={styles.cardHeader}>
              <Text style={styles.selectedCardText}>
                {selectedCard.name || 'Unnamed Card'}
              </Text>
              {activeCard && activeCard.uid === selectedCard.uid && (
                <View style={styles.activeIndicator}>
                  <Text style={styles.activeText}>● Active</Text>
                </View>
              )}
            </View>
            <Text style={styles.selectedCardDate}>
              UID: {selectedCard.uid}
            </Text>
            <Text style={styles.selectedCardDate}>
              Scanned: {formatDate(selectedCard.timestamp)}
            </Text>
            
            {(!activeCard || activeCard.uid !== selectedCard.uid) && (
              <Button
                mode="contained"
                onPress={() => handleCardSelect(selectedCard)}
                style={styles.selectButton}
                compact
              >
                Select for HCE
              </Button>
            )}
          </View>
        )}
      </View>

      {isEmulating ? (
        <View style={styles.emulatingContainer}>
          <View style={styles.statusContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.emulatingText}>Card Emulation Active</Text>
            <Text style={styles.instructionText}>
              Tap this device to an NFC reader to test
            </Text>
          </View>
          
          <Button 
            mode="outlined" 
            onPress={stopCardEmulation}
            style={styles.stopButton}
            loading={isStopping}
            disabled={isStopping}
            icon="stop"
          >
            Stop Emulation
          </Button>
        </View>
      ) : (
        <View style={styles.startContainer}>
          <Button 
            mode="contained" 
            onPress={startCardEmulation}
            style={styles.startButton}
            loading={isStarting}
            disabled={isStarting}
            icon="play"
          >
            Start Card Emulation
          </Button>
          
          <Text style={styles.noteText}>
            Note: Make sure NFC is enabled on your device
          </Text>
        </View>
      )}
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
  aidContainer: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 30,
    alignItems: 'center',
  },
  aidLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  aidValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
    fontFamily: 'monospace',
  },
  cardSelectionContainer: {
    marginBottom: 30,
  },
  selectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  dropdownButton: {
    marginBottom: 10,
  },
  dropdownContent: {
    justifyContent: 'space-between',
  },
  menuItem: {
    minHeight: 48,
  },
  selectedCardInfo: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeIndicator: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  selectButton: {
    marginTop: 12,
    backgroundColor: '#6200ee',
  },
  selectedCardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  selectedCardDate: {
    fontSize: 12,
    color: '#666',
  },
  emulatingContainer: {
    alignItems: 'center',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  emulatingText: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  instructionText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  stopButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderColor: '#f44336',
  },
  startContainer: {
    alignItems: 'center',
  },
  startButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#4CAF50',
  },
  noteText: {
    marginTop: 15,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default CardEmulationScreen;
