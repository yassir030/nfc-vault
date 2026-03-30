import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, ActivityIndicator } from 'react-native';
import { Button, Card, IconButton, TextInput, Provider as PaperProvider, Menu, Divider } from 'react-native-paper';
import CardStorage from '../utils/CardStorage';

const CardManagementScreen = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [newCardName, setNewCardName] = useState('');
  const [newCardAid, setNewCardAid] = useState('F0010203040506');
  const [newCardData, setNewCardData] = useState('');
  const [activeCardId, setActiveCardId] = useState(null);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      setLoading(true);
      const storedCards = await CardStorage.getCards();
      setCards(storedCards);
      
      // Get active card info
      const activeInfo = await CardStorage.getActiveCardData();
      // Find active card by matching data and AID
      const activeCard = storedCards.find(card => 
        card.response_data === activeInfo.data && card.aid === activeInfo.aid
      );
      setActiveCardId(activeCard ? activeCard.id : null);
    } catch (error) {
      console.error('Error loading cards:', error);
      Alert.alert('Error', 'Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  const handleSetActiveCard = async (card) => {
    try {
      const success = await CardStorage.setActiveCard(card);
      if (success) {
        setActiveCardId(card.id);
        Alert.alert(
          'Card Activated',
          `Now emulating: ${card.name}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'Failed to activate card');
      }
    } catch (error) {
      console.error('Error setting active card:', error);
      Alert.alert('Error', 'Failed to activate card');
    }
  };

  const handleDeleteCard = (card) => {
    Alert.alert(
      'Delete Card',
      `Are you sure you want to delete ${card.name}?`,
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
      const success = await CardStorage.deleteCard(card.id);
      if (success) {
        await loadCards(); // Refresh list
        Alert.alert('Success', 'Card deleted successfully');
      } else {
        Alert.alert('Error', 'Failed to delete card');
      }
    } catch (error) {
      console.error('Error deleting card:', error);
      Alert.alert('Error', 'Failed to delete card');
    }
  };

  const handleAddCard = async () => {
    if (!newCardName.trim()) {
      Alert.alert('Error', 'Please enter a card name');
      return;
    }

    if (!newCardData.trim()) {
      Alert.alert('Error', 'Please enter response data');
      return;
    }

    try {
      const newCard = {
        name: newCardName.trim(),
        aid: newCardAid.trim(),
        response_data: newCardData.trim(),
      };

      const addedCard = await CardStorage.addCard(newCard);
      if (addedCard) {
        await loadCards(); // Refresh list
        setNewCardName('');
        setNewCardData('');
        setShowAddMenu(false);
        Alert.alert('Success', 'Card added successfully');
      } else {
        Alert.alert('Error', 'Failed to add card');
      }
    } catch (error) {
      console.error('Error adding card:', error);
      Alert.alert('Error', 'Failed to add card');
    }
  };

  const renderCard = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.cardInfo}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardName}>{item.name}</Text>
            {activeCardId === item.id && (
              <View style={styles.activeIndicator}>
                <Text style={styles.activeText}>● Active</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.cardDetail}>AID: {item.aid}</Text>
          <Text style={styles.cardDetail}>Data: {item.response_data}</Text>
          
          <Text style={styles.cardDate}>
            Created: {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={styles.cardActions}>
          <Button
            mode={activeCardId === item.id ? "contained" : "outlined"}
            onPress={() => handleSetActiveCard(item)}
            style={[
              styles.activeButton,
              activeCardId === item.id && styles.activeButtonSelected
            ]}
            compact
          >
            {activeCardId === item.id ? "Active" : "Set Active"}
          </Button>
          
          <IconButton
            icon="delete"
            size={20}
            onPress={() => handleDeleteCard(item)}
            style={styles.deleteButton}
          />
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading cards...</Text>
      </View>
    );
  }

  return (
    <PaperProvider>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Card Management</Text>
          <Button
            mode="contained"
            onPress={() => setShowAddMenu(true)}
            style={styles.addButton}
            icon="plus"
          >
            Add Card
          </Button>
        </View>

        {cards.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No cards found</Text>
            <Text style={styles.emptySubtext}>Add your first card to get started</Text>
          </View>
        ) : (
          <FlatList
            data={cards}
            renderItem={renderCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}

        <Menu
          visible={showAddMenu}
          onDismiss={() => setShowAddMenu(false)}
          style={styles.addMenu}
        >
          <View style={styles.addMenuContent}>
            <Text style={styles.addMenuTitle}>Add New Card</Text>
            
            <TextInput
              label="Card Name"
              value={newCardName}
              onChangeText={setNewCardName}
              style={styles.input}
              mode="outlined"
              placeholder="e.g., School Locker Card"
            />
            
            <TextInput
              label="AID"
              value={newCardAid}
              onChangeText={setNewCardAid}
              style={styles.input}
              mode="outlined"
              placeholder="F0010203040506"
            />
            
            <TextInput
              label="Response Data"
              value={newCardData}
              onChangeText={setNewCardData}
              style={styles.input}
              mode="outlined"
              placeholder="Card response data"
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.addMenuActions}>
              <Button
                mode="text"
                onPress={() => setShowAddMenu(false)}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
              
              <Button
                mode="contained"
                onPress={handleAddCard}
                style={styles.saveButton}
              >
                Add Card
              </Button>
            </View>
          </View>
        </Menu>
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#6200ee',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 8,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  activeIndicator: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  cardDetail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  cardDate: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  cardActions: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
  },
  activeButton: {
    minWidth: 100,
  },
  activeButtonSelected: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    margin: 0,
  },
  separator: {
    height: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  addMenu: {
    marginTop: 100,
  },
  addMenuContent: {
    padding: 20,
    minWidth: 300,
  },
  addMenuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  addMenuActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#6200ee',
  },
});

export default CardManagementScreen;
