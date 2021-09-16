import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { BleManager, LogLevel } from 'react-native-ble-plx';
import { StyleSheet, Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import IntroScreen from "./screens/IntroScreen";


export default function App() {
  const Stack = createNativeStackNavigator();
  const [manager, setManager] = useState(null);


  const BLE_DEVICE_NAME = "BlueIoToy";

  useEffect(() => {
    console.log("New ble manager...");
    const newManager = new BleManager();
    newManager.setLogLevel(LogLevel.Debug);
    const subscription = newManager.onStateChange((state) => {
      console.log("BLE Manager: monitor state", state);
      if (state === 'PoweredOn') {
        scanAndConnect();
        subscription.remove();
      }
    }, true);

    setManager(newManager);
  }, []);

  function scanAndConnect() {
    console.log("scanning...");
    if (manager) {
      manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          // Handle error (scanning will be stopped automatically)
          console.log("ERROR LOG:")
          console.log(error)
          return
        }
        console.log("Device found:", device.name);

        // Check if it is a device you are looking for based on advertisement data
        // or othe.log("ERROR LOG:r criteria.
        if (device.name === BLE_DEVICE_NAME) {
          console.log("BlueIoToy FOUND!!!");
          // Stop scanning as it's not necessary if you are scanning for one device.
          manager.stopDeviceScan();

          // Proceed with connection.
        }
      });
    }
  }

  return (
    // <View style={styles.container}>
    //   <Text>Openupa Appa.js to start working on your app!!</Text>
    //   <StatusBar style="auto" />
    // </View>
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Intro" component={IntroScreen} />
        {/* <Stack.Screen name="Connections" component={C} />
      <Stack.Screen name="Settings" component={SettingsScreen} /> */}
      </Stack.Navigator>
    </NavigationContainer>
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
