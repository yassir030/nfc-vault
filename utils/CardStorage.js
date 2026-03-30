import AsyncStorage from '@react-native-async-storage/async-storage';

// Try to use MMKV, fallback to AsyncStorage for EAS build compatibility
let storage = null;

try {
  // Try to import MMKV
  const { MMKV } = require('react-native-mmkv');
  storage = new MMKV({
    id: 'nfc-vault-storage',
    encryptionKey: 'nfc-vault-encryption-key',
  });
  console.log('MMKV initialized successfully');
} catch (error) {
  console.log('MMKV not available, using AsyncStorage fallback:', error.message);
  // Use AsyncStorage as fallback that matches SharedPreferences keys
  storage = {
    getString: async (key, defaultValue = null) => {
      try {
        const value = await AsyncStorage.getItem(key);
        return value !== null ? value : defaultValue;
      } catch (e) {
        return defaultValue;
      }
    },
    set: async (key, value) => {
      try {
        await AsyncStorage.setItem(key, value);
        return true;
      } catch (e) {
        return false;
      }
    },
    delete: async (key) => {
      try {
        await AsyncStorage.removeItem(key);
        return true;
      } catch (e) {
        return false;
      }
    }
  };
}

const KEYS = {
  CARDS_ARRAY: 'cards_array',
  ACTIVE_CARD_DATA: 'active_card_data',
  ACTIVE_CARD_AID: 'active_card_aid',
};

export class CardStorage {
  // Get all stored cards
  static async getCards() {
    try {
      const cardsJson = await storage.getString(KEYS.CARDS_ARRAY);
      return cardsJson ? JSON.parse(cardsJson) : [];
    } catch (error) {
      console.error('Error getting cards:', error);
      return [];
    }
  }

  // Save cards array
  static async saveCards(cards) {
    try {
      const success = await storage.set(KEYS.CARDS_ARRAY, JSON.stringify(cards));
      if (success) {
        console.log('Cards saved:', cards.length, 'cards');
      }
      return success;
    } catch (error) {
      console.error('Error saving cards:', error);
      return false;
    }
  }

  // Add new card
  static async addCard(card) {
    try {
      const cards = await this.getCards();
      const newCard = {
        id: Date.now().toString(),
        name: card.name || 'Unnamed Card',
        aid: card.aid || 'F0010203040506', // Default AID
        response_data: card.response_data || card.uid || 'DEFAULT_DATA',
        uid: card.uid || '',
        image_uri: card.image_uri || '',
        created_at: new Date().toISOString(),
        ...card,
      };
      
      cards.push(newCard);
      const success = await this.saveCards(cards);
      if (success) {
        console.log('Card added:', newCard.name);
        return newCard;
      }
      return null;
    } catch (error) {
      console.error('Error adding card:', error);
      return null;
    }
  }

  // Update existing card
  static async updateCard(cardId, updates) {
    try {
      const cards = await this.getCards();
      const index = cards.findIndex(card => card.id === cardId);
      
      if (index !== -1) {
        cards[index] = { ...cards[index], ...updates };
        const success = await this.saveCards(cards);
        if (success) {
          console.log('Card updated:', cards[index].name);
          return cards[index];
        }
      }
      return null;
    } catch (error) {
      console.error('Error updating card:', error);
      return null;
    }
  }

  // Delete card
  static async deleteCard(cardId) {
    try {
      const cards = await this.getCards();
      const filteredCards = cards.filter(card => card.id !== cardId);
      const success = await this.saveCards(filteredCards);
      if (success) {
        console.log('Card deleted:', cardId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting card:', error);
      return false;
    }
  }

  // Set active card data for HCE
  static async setActiveCard(card) {
    try {
      // Store card data and AID separately for native access
      const dataSuccess = await storage.set(KEYS.ACTIVE_CARD_DATA, card.response_data || card.uid || 'DEFAULT_DATA');
      const aidSuccess = await storage.set(KEYS.ACTIVE_CARD_AID, card.aid || 'F0010203040506');
      
      if (dataSuccess && aidSuccess) {
        console.log('Active card set:', card.name);
        console.log('Active AID:', card.aid || 'F0010203040506');
        console.log('Active data:', card.response_data || card.uid || 'DEFAULT_DATA');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error setting active card:', error);
      return false;
    }
  }

  // Get active card data
  static async getActiveCardData() {
    try {
      const data = await storage.getString(KEYS.ACTIVE_CARD_DATA, 'DEFAULT_DATA');
      const aid = await storage.getString(KEYS.ACTIVE_CARD_AID, 'F0010203040506');
      
      return {
        data: data || 'DEFAULT_DATA',
        aid: aid || 'F0010203040506',
      };
    } catch (error) {
      console.error('Error getting active card data:', error);
      return {
        data: 'DEFAULT_DATA',
        aid: 'F0010203040506',
      };
    }
  }

  // Clear active card
  static async clearActiveCard() {
    try {
      const dataSuccess = await storage.delete(KEYS.ACTIVE_CARD_DATA);
      const aidSuccess = await storage.delete(KEYS.ACTIVE_CARD_AID);
      
      if (dataSuccess && aidSuccess) {
        console.log('Active card cleared');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error clearing active card:', error);
      return false;
    }
  }

  // Find card by ID
  static async findCardById(cardId) {
    try {
      const cards = await this.getCards();
      return cards.find(card => card.id === cardId) || null;
    } catch (error) {
      console.error('Error finding card:', error);
      return null;
    }
  }

  // Get card count
  static async getCardCount() {
    try {
      const cards = await this.getCards();
      return cards.length;
    } catch (error) {
      console.error('Error getting card count:', error);
      return 0;
    }
  }

  // Export all data (for backup)
  static async exportData() {
    try {
      return {
        cards: await this.getCards(),
        activeCard: await this.getActiveCardData(),
        exportDate: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }

  // Import data (for restore)
  static async importData(data) {
    try {
      if (data.cards) {
        await this.saveCards(data.cards);
      }
      if (data.activeCard) {
        await storage.set(KEYS.ACTIVE_CARD_DATA, data.activeCard.data);
        await storage.set(KEYS.ACTIVE_CARD_AID, data.activeCard.aid);
      }
      console.log('Data imported successfully');
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

export default CardStorage;
