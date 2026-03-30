import { storageService } from './storageService';
import { Platform } from 'react-native';

export class HCEBridge {
  constructor() {
    this.isAndroid = Platform.OS === 'android';
  }

  // Update the active card in storage for HCE service
  async updateActiveCard(card) {
    if (!this.isAndroid) {
      console.log('HCE only available on Android');
      return false;
    }

    try {
      // Save to AsyncStorage
      const success = await storageService.setActiveCard(card);
      
      if (success) {
        // Notify the native HCE service to update
        // This will be read by the NfcHostApduService
        console.log('HCE active card updated:', card.name);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating HCE active card:', error);
      return false;
    }
  }

  // Get current active card
  async getActiveCard() {
    if (!this.isAndroid) {
      return null;
    }

    try {
      return await storageService.getActiveCard();
    } catch (error) {
      console.error('Error getting HCE active card:', error);
      return null;
    }
  }

  // Clear active card
  async clearActiveCard() {
    if (!this.isAndroid) {
      return false;
    }

    try {
      return await storageService.clearActiveCard();
    } catch (error) {
      console.error('Error clearing HCE active card:', error);
      return false;
    }
  }

  // Initialize HCE with cards from database
  async initializeHCE() {
    if (!this.isAndroid) {
      return false;
    }

    try {
      const activeCard = await this.getActiveCard();
      if (activeCard) {
        console.log('HCE initialized with card:', activeCard.name);
        return true;
      } else {
        console.log('No active card found for HCE initialization');
        return false;
      }
    } catch (error) {
      console.error('Error initializing HCE:', error);
      return false;
    }
  }

  // Get all available cards for selection
  async getAvailableCards() {
    try {
      return await storageService.getAllCards();
    } catch (error) {
      console.error('Error getting available cards:', error);
      return [];
    }
  }
}

export const hceBridge = new HCEBridge();
