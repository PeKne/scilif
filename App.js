import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { BleManager } from 'react-native-ble-plx';
import { StyleSheet, Text, View } from 'react-native';


export default function App() {
  const manager = new BleManager();

  return (
    <View style={styles.container}>
      <Text>Openup Appa.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
