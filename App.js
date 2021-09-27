import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import React, { useReducer, useEffect, useState } from 'react';
import { BleManager, LogLevel } from 'react-native-ble-plx';
import { StyleSheet, Text, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import IntroScreen from "./screens/IntroScreen";
import ConnectionsScreen from "./screens/ConnectionsScreen";
import SettingsScreen from "./screens/SettingsScreen";
import { SafeAreaView } from 'react-native';


export default function App() {
  const Stack = createStackNavigator();
  const [manager, setManager] = useState(null);

  const [device, setDevice] = useState(null);


  const modeReducer = (mode, action) => {
    switch (action) {
      case 'SET_ON':
        // TODO: YOUR CODE TO SET LIGH ON
        return 'ON'
      case 'SET_OFF':
        // TODO: CODE TO SET LIGH OFF
        return 'OFF'
      case 'set_FLASH':
        // TODO: CODE TO SET LIGH FLASHING
        return 'FLASH'
      default:
        throw new Error("Unsupported modeReducer action received.")
    }
  }

  const [mode, dispatchMode] = useReducer(modeReducer, "OFF");

  /**
   * Returns all available BLE devices.
   *
   * @return {array}
   * @public
   */
  const getAvailableDevices = () => {
    //TODO

    // return array of devices with all their attribuse you wanna show in UI
  }

  /**
   * Establishes connection with BLE device.
   *
   * @param {string} device
   */
  const connectToDevice = (device) => {

    //TODO
    //use setDevice(DEVICE) here - DEVICE is dict with all necessary attributes
  }

  /**
   * Close the BLE device connection.
   *
   * @param {string} device
   */
  const disconnectDevice = () => {

    //TODO
    //use setDevice(null) here
  }

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
    <View style={styles.container}>
      <Text>Openupa Appa.js to start working on your app!!</Text>
      <StatusBar style="auto" />
    </View>
    // <>
    //   <NavigationContainer>
    //     <Stack.Navigator screenOptions={{ headerShown: false }}>
    //       <Stack.Screen name="Intro" component={IntroScreen} />
    //       <Stack.Screen name="Connections" component={ConnectionsScreen} />
    //       <Stack.Screen name="Settings" component={SettingsScreen} mode={mode} dispatchMode={dispatchMode} />
    //     </Stack.Navigator>
    //   </NavigationContainer>
    //   <StatusBar style="auto" />
    // </>
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
