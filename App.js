import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { Button, Provider as PaperProvider } from 'react-native-paper';
import NFCScreen from './components/NFCScreen';
import CardList from './components/CardList';
import CardEmulationScreen from './components/CardEmulationScreen';
import CardManagementScreen from './components/CardManagementScreen';

export default function App() {
  const [currentView, setCurrentView] = useState('scan');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCardScanned = () => {
    setRefreshKey(prev => prev + 1);
    setCurrentView('list');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'scan':
        return <NFCScreen onCardScanned={handleCardScanned} onNavigateToEmulation={() => setCurrentView('emulate')} />;
      case 'list':
        return <CardList onRefresh={refreshKey} />;
      case 'emulate':
        return <CardEmulationScreen />;
      case 'manage':
        return <CardManagementScreen />;
      default:
        return <NFCScreen onCardScanned={handleCardScanned} onNavigateToEmulation={() => setCurrentView('emulate')} />;
    }
  };

  return (
    <PaperProvider>
      <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {renderCurrentView()}
      </View>
      
      <View style={styles.navigation}>
        <Button
          mode={currentView === 'scan' ? 'contained' : 'outlined'}
          onPress={() => setCurrentView('scan')}
          style={styles.navButton}
          icon="nfc"
        >
          Scan
        </Button>
        <Button
          mode={currentView === 'list' ? 'contained' : 'outlined'}
          onPress={() => setCurrentView('list')}
          style={styles.navButton}
          icon="format-list-bulleted"
        >
          Cards
        </Button>
        <Button
          mode={currentView === 'emulate' ? 'contained' : 'outlined'}
          onPress={() => setCurrentView('emulate')}
          style={styles.navButton}
          icon="credit-card"
        >
          Emulate
        </Button>
        <Button
          mode={currentView === 'manage' ? 'contained' : 'outlined'}
          onPress={() => setCurrentView('manage')}
          style={styles.navButton}
          icon="cog"
        >
          Manage
        </Button>
      </View>
      
      <StatusBar style="auto" />
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  navigation: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  navButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});
