import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ToastAndroid, Alert, Platform, Image } from 'react-native';
import { Button, Card, IconButton } from 'react-native-paper';
import * as SQLite from 'expo-sqlite';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import * as FileSystem from 'expo-file-system';

const CardList = ({ onRefresh }) => {
  const [cards, setCards] = useState([]);
  const [db, setDb] = useState(null);
  const [isEmulating, setIsEmulating] = useState(false);
  const [emulatingCardId, setEmulatingCardId] = useState(null);

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
    loadCards();
  }, [db, onRefresh]);

  const loadCards = async () => {
    if (!db) return;

    try {
      const result = await db.getAllAsync('SELECT * FROM cards ORDER BY timestamp DESC');
      setCards(result);
    } catch (error) {
      console.error('Error loading cards:', error);
    }
  };

  const deleteCard = async (card) => {
    // Show confirmation dialog with card name
    Alert.alert(
      'Delete Card',
      `Are you sure you want to delete ${card.name || 'this card'}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => performDelete(card),
        },
      ]
    );
  };

  const performDelete = async (card) => {
    try {
      // Start deletion process
      console.log('Deleting card:', card.name || 'Unnamed Card', 'ID:', card.id);

      // 1. Delete image file if it exists
      if (card.image_uri) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(card.image_uri);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(card.image_uri, { idempotent: true });
            console.log('Image file deleted:', card.image_uri);
          }
        } catch (imageError) {
          console.warn('Failed to delete image file:', imageError);
          // Continue with database deletion even if image deletion fails
        }
      }

      // 2. Delete from database
      if (db) {
        await db.runAsync('DELETE FROM cards WHERE id = ?', [card.id]);
        console.log('Card deleted from database:', card.id);
      }

      // 3. Update UI immediately
      setCards(prevCards => prevCards.filter(c => c.id !== card.id));

      // 4. Show success feedback
      if (Platform.OS === 'android') {
        ToastAndroid.show('Card deleted successfully', ToastAndroid.SHORT);
      }

      console.log('Card deletion completed successfully');

    } catch (error) {
      console.error('Error deleting card:', error);
      Alert.alert('Error', 'Failed to delete card. Please try again.');
    }
  };

  const clearAllCards = async () => {
    Alert.alert(
      'Clear All Cards',
      'Are you sure you want to delete all cards? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: performClearAll,
        },
      ]
    );
  };

  const performClearAll = async () => {
    try {
      console.log('Starting to clear all cards');

      // 1. Delete all image files first
      const imageDeletionPromises = cards
        .filter(card => card.image_uri)
        .map(async (card) => {
          try {
            const fileInfo = await FileSystem.getInfoAsync(card.image_uri);
            if (fileInfo.exists) {
              await FileSystem.deleteAsync(card.image_uri, { idempotent: true });
              console.log('Image file deleted:', card.image_uri);
            }
          } catch (imageError) {
            console.warn('Failed to delete image file:', card.image_uri, imageError);
          }
        });

      // Wait for all image deletions to complete
      await Promise.all(imageDeletionPromises);

      // 2. Clear database
      if (db) {
        await db.runAsync('DELETE FROM cards');
        console.log('All cards deleted from database');
      }

      // 3. Update UI immediately
      setCards([]);

      // 4. Show success feedback
      if (Platform.OS === 'android') {
        ToastAndroid.show('All cards deleted successfully', ToastAndroid.SHORT);
      }

      console.log('Clear all cards completed successfully');

    } catch (error) {
      console.error('Error clearing all cards:', error);
      Alert.alert('Error', 'Failed to clear cards. Please try again.');
    }
  };

  const startEmulation = async (cardId) => {
    try {
      setIsEmulating(true);
      setEmulatingCardId(cardId);
      
      // Check NFC availability
      const isSupported = await NfcManager.isSupported();
      if (!isSupported) {
        throw new Error('NFC is not supported on this device');
      }
      
      const isEnabled = await NfcManager.isEnabled();
      if (!isEnabled) {
        throw new Error('NFC is not enabled. Please enable NFC in device settings.');
      }
      
      // Clean start - cancel any previous NFC sessions
      await NfcManager.cancelTechnologyRequest().catch(() => {});
      
      // Ensure NfcManager is properly started
      await NfcManager.start();
      
      // Start HCE with the card UID as the APDU response
      await NfcManager.hce(cardId);
      
      // Show feedback
      const message = `Phone is now broadcasting as Card UID: ${cardId}`;
      if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.LONG);
      } else {
        Alert.alert('Emulation Started', message);
      }
    } catch (error) {
      console.error('Error starting emulation - Details:', error);
      const errorMessage = error.message || error.toString();
      console.error('Full error object:', JSON.stringify(error, null, 2));
      Alert.alert('Error', `Failed to start card emulation: ${errorMessage}`);
      setIsEmulating(false);
      setEmulatingCardId(null);
    }
  };

  const stopEmulation = async () => {
    try {
      await NfcManager.cancelTechnologyRequest();
      setIsEmulating(false);
      setEmulatingCardId(null);
      
      const message = 'Card emulation stopped';
      if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.SHORT);
      } else {
        Alert.alert('Emulation Stopped', message);
      }
    } catch (error) {
      console.error('Error stopping emulation:', error);
      // Force reset state even if cancel fails
      setIsEmulating(false);
      setEmulatingCardId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const renderCard = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.cardInfo}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardName}>{item.name || 'Unnamed Card'}</Text>
            <Text style={styles.cardId}>UID: {item.uid}</Text>
          </View>
          
          {item.image_uri && (
            <Image source={{ uri: item.image_uri }} style={styles.cardImage} />
          )}
          
          <Text style={styles.scanDate}>Scanned: {formatDate(item.timestamp)}</Text>
          
          {isEmulating && emulatingCardId === item.uid && (
            <Text style={styles.emulatingText}>📡 Emulating...</Text>
          )}
        </View>
        <View style={styles.cardActions}>
          <Button
            mode={isEmulating && emulatingCardId === item.uid ? "contained" : "outlined"}
            onPress={() => {
              if (isEmulating && emulatingCardId === item.uid) {
                stopEmulation();
              } else {
                startEmulation(item.uid);
              }
            }}
            style={[
              styles.emulateButton,
              isEmulating && emulatingCardId === item.uid && styles.emulatingButton
            ]}
            compact
          >
            {isEmulating && emulatingCardId === item.uid ? "Stop" : "Emulate"}
          </Button>
          <IconButton
            icon="delete"
            size={20}
            onPress={() => deleteCard(item)}
            style={styles.deleteButton}
          />
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved Cards</Text>
        <Text style={styles.count}>{cards.length} card{cards.length !== 1 ? 's' : ''}</Text>
      </View>
      
      {cards.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No cards scanned yet</Text>
          <Text style={styles.emptySubtext}>Start scanning to build your collection</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cards}
            renderItem={renderCard}
            keyExtractor={(item) => item.id.toString()}
            style={styles.list}
            showsVerticalScrollIndicator={false}
          />
          <Button
            mode="outlined"
            onPress={clearAllCards}
            style={styles.clearButton}
            textColor="#d32f2f"
          >
            Clear All Cards
          </Button>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  count: {
    fontSize: 16,
    color: '#666',
  },
  list: {
    flex: 1,
  },
  card: {
    marginBottom: 10,
    backgroundColor: 'white',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardHeader: {
    marginBottom: 8,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cardId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  cardImage: {
    width: 80,
    height: 53,
    borderRadius: 4,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  scanDate: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    margin: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  clearButton: {
    marginTop: 10,
  },
  cardActions: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  emulateButton: {
    marginBottom: 4,
    minWidth: 80,
  },
  emulatingButton: {
    backgroundColor: '#4caf50',
  },
  emulatingText: {
    fontSize: 12,
    color: '#4caf50',
    fontWeight: '600',
    marginTop: 4,
  },
});

export default CardList;
