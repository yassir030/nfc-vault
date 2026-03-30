import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  ACTIVE_CARD: '@active_card',
  CARDS: '@cards_data',
};

export const storageService = {
  // Save active card for HCE service
  async setActiveCard(card) {
    try {
      const cardData = {
        uid: card.uid,
        name: card.name,
        data: card.data || card.uid, // Use UID as default data
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_CARD, JSON.stringify(cardData));
      console.log('Active card saved:', card.name);
      return true;
    } catch (error) {
      console.error('Error saving active card:', error);
      return false;
    }
  },

  // Get active card for HCE service
  async getActiveCard() {
    try {
      const cardData = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_CARD);
      return cardData ? JSON.parse(cardData) : null;
    } catch (error) {
      console.error('Error getting active card:', error);
      return null;
    }
  },

  // Clear active card
  async clearActiveCard() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_CARD);
      console.log('Active card cleared');
      return true;
    } catch (error) {
      console.error('Error clearing active card:', error);
      return false;
    }
  },

  // Save all cards to storage
  async saveAllCards(cards) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
      console.log('All cards saved:', cards.length, 'cards');
      return true;
    } catch (error) {
      console.error('Error saving all cards:', error);
      return false;
    }
  },

  // Get all cards from storage
  async getAllCards() {
    try {
      const cardsData = await AsyncStorage.getItem(STORAGE_KEYS.CARDS);
      return cardsData ? JSON.parse(cardsData) : [];
    } catch (error) {
      console.error('Error getting all cards:', error);
      return [];
    }
  },

  // Add new card to storage
  async addCard(card) {
    try {
      const cards = await this.getAllCards();
      const newCard = {
        ...card,
        id: Date.now().toString(),
        createdAt: Date.now(),
      };
      cards.push(newCard);
      await this.saveAllCards(cards);
      console.log('New card added:', newCard.name);
      return newCard;
    } catch (error) {
      console.error('Error adding card:', error);
      return null;
    }
  },

  // Update card in storage
  async updateCard(cardId, updates) {
    try {
      const cards = await this.getAllCards();
      const index = cards.findIndex(card => card.id === cardId);
      if (index !== -1) {
        cards[index] = { ...cards[index], ...updates };
        await this.saveAllCards(cards);
        console.log('Card updated:', cards[index].name);
        return cards[index];
      }
      return null;
    } catch (error) {
      console.error('Error updating card:', error);
      return null;
    }
  },

  // Delete card from storage
  async deleteCard(cardId) {
    try {
      const cards = await this.getAllCards();
      const filteredCards = cards.filter(card => card.id !== cardId);
      await this.saveAllCards(filteredCards);
      console.log('Card deleted:', cardId);
      return true;
    } catch (error) {
      console.error('Error deleting card:', error);
      return false;
    }
  },
};
