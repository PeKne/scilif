import { StatusBar } from 'expo-status-bar';
import React, { useReducer, useEffect, useState } from 'react';

import { StyleSheet, Text, View, Button } from 'react-native';

import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import IntroScreen from "./screens/IntroScreen";
import ConnectionsScreen from "./screens/ConnectionsScreen";
import SettingsScreen from "./screens/SettingsScreen";
import { SafeAreaView } from 'react-native';


import { BleManager } from 'react-native-ble-plx';
import { Buffer } from 'buffer'

import * as BLE from './ble-constants';
import { SunFibreDevice } from './models/sun-fibre-device';


export default function App() {



  const Stack = createStackNavigator();

  const [manager, setManager] = useState(null);


  const devicesReducer = (devices, action) =>  {
    switch (action.type) {

    /**
     * Either add new device to device list or if existing update its timestamp 
     * @param {*} device 
     */
      case 'SCANNED_DEVICE': {
        let device = action.payload;
        let existingDevice = devices.find((sfd) => sfd.getDevice().id == device.id);

        // if (!existingDevice && device.isConnectable) {
        if (!existingDevice) {
          console.log('BLE: addDevice', device.id, device.name);
          return [...devices, new SunFibreDevice(device, null)];
        }

        else if (existingDevice){
          // refresh timestamp 
          existingDevice.setLastSeenTimestamp(Date.now());
          return devices;
        }
      }

      case 'CONNECTED_DEVICE': {
        let device = action.payload.device;
        let existingDevice = devices.find((sfd) => sfd.getDevice().id == device.id);

        if (!existingDevice) throw new Error("Device is not in devices list!");

        existingDevice.setConnected(true);
        existingDevice.setServicesCharacteristics(action.payload.servicesCharacteristics);
        return devices;
      }

      case 'DISCONNECTED_DEVICE': {
        let device = action.payload;
        let existingDevice = devices.find((sfd) => sfd.getDevice().id == device.id);

        if (!existingDevice) throw new Error("Device is not in devices list!");

        existingDevice.setConnected(false);
        existingDevice.setServicesCharacteristics(null);
        return devices;
      }

      case 'SET':
        return action.payload;
      case 'CLEAR':
        return [];
      default:
        throw new Error("Unsupported devicesReducer action received.")
    }
  }

  // all SunFibre devices that were found
  const [devices, dispatchDevices] = useReducer(devicesReducer, []);


  // selected device (its card is opened)
  const [selectedDevice, setSelectedDevice] = useState(null);

  const modeReducer = (mode, action) => {

    switch (action) {
      case 'SET_ON_STRONG':
        writeDimLEDCharacteristics(selectedDevice, 0x1);
        return 'ON_STRONG';
      case 'SET_ON_MILD':
        writeDimLEDCharacteristics(selectedDevice, 0x2);
        return 'ON_MILD';
      case 'SET_OFF':
        writeDimLEDCharacteristics(selectedDevice, 0x0);
        return 'OFF';
      case 'SET_FLASH':
        writeDimLEDCharacteristics(selectedDevice, 0x3);
        return 'FLASH';
      default:
        throw new Error("Unsupported modeReducer action received.")
    }
  }

  // mode of selected device
  const [mode, dispatchMode] = useReducer(modeReducer, "OFF");




  /**
   * Returns all available BLE devices.
   *
   * @return {SunFibreDevice[]}
   * @public
   */
  const getAvailableSunFibreDevices = () => {
    // return array of devices with all their attribuse you wanna show in UI
    return devices;
  }

  //TODO: diconnect x connect should be probably wrapped by a promise too

  /**
   * Establishes connection with BLE SunFibre device.
   *
   * @param {SunFibreDevice} sunFibreDevice
   */
  const connectToSunFibreDevice = (sunFibreDevice) => {

    connect(sunFibreDevice.getDevice())
      .then((device) => {
        return getServicesAndCharacteristics(device);
      })
      .then ((deviceServicesAndCharacteristics) => {
        console.log("Services and Characteristics obtained.");
        dispatchDevices({
          type: "CONNECTED_DEVICE", 
          payload: {
            device: sunFibreDevice.getDevice(), 
            servicesCharacteristics: deviceServicesAndCharacteristics
          }});
        console.log("Device connected");
      })
  }

  /**
   * Close the connection with BLE SunFibre device.
   *
   * @param {SunFibreDevice} sunFibreDevice
   */
  const disconnectSunFibreDevice = (sunFibreDevice) => {

    disconnect(sunFibreDevice.getDevice())
      .then((device) => {
        dispatchDevices({
          type: "DISCONNECTED_DEVICE", 
          payload: device, 
        });
        console.log("Device disconnected");
      });
  }

  useEffect(() => {
    console.log("New ble manager...");
    let newManager = new BleManager();
    // newManager.setLogLevel(LogLevel.Debug);
    const subscription = newManager.onStateChange((state) => {
      console.log("BLE Manager: monitor state", state);
      if (state === 'PoweredOn') {
        // scanAndConnect();
        subscription.remove();
      }
    }, true);

    setManager(newManager);
    dispatchDevices({type: "CLEAR"});
  }, []);



  useEffect(() =>{
    console.log("useEffect - devices", devices.length);
  },[devices])




  //#region LAYER: sun fibre device
  function writeDimLEDCharacteristics(sunFibreDevice, value){
    let ch = sunFibreDevice.getDimLEDCharacteristic();
    return writeCharacteristics(sunFibreDevice.getDevice(), ch, value);
  }

  function readBatteryLevelCharacteristics(sunFibreDevice){
    let ch = sunFibreDevice.getBatteryLevelCharacteristic();
    return readCharacteristics(sunFibreDevice.getDevice(), ch);
  }
  //#endregion


  //#region BLE TOOLS / HELPERS

  /**
   * Util function to pretty print characteristic value as hex string
   * @param {*} value 
   */
  function base64ToHexStr(value){

    let buffer = Buffer.from(value, 'base64');
    let bufferStr = buffer.toString('hex');

    let valueAsHex = "";
    for (let i = 0; i < bufferStr.length; i+=2){
      valueAsHex += `0x${bufferStr[i]}${bufferStr[i+1]} `
    }
    return valueAsHex;
  }

  function binaryToBase64(value){
    console.log(value);
    let buffer = Buffer.from([value], 'binary');
    return buffer.toString('base64');
  }



  /**
   * Util function to pretty print services and charactristics 
   * @param {*} serChar 
   * @returns 
   */
  function prettyPrintServiceCharacteristics(serChar){
    return Object.keys(serChar).reduce((serCharPretty, sUUID) => {
      serCharPretty[sUUID] = serChar[sUUID].map(ch => ch.uuid);
      return serCharPretty;
    }, {});

  }
  //#endregion




  //#region LAYER: ble-plx
	function connect(device){

		return new Promise(async (resolve, reject) => {
      // let isConnected = await device.isConnected();
      // console.log("device: isConnected: %d", isConnected);
      // if (isConnected) reject();

      try {
        // wait until connected
        await device.connect()
        console.log(`BLE: Device ${device.name} connected...`);

        resolve(device);

      } catch(error){
        console.error("ERROR (BLE) connect:", error)

        //disconnect
        let isConnected = await device.isConnected();
        console.log("BLE: Device isConnected: %d", isConnected);
        if (isConnected)
          disconnect(device);

        reject();
      }
    });
  }
	// 	device.connect()
  //   	.then((device) => {
  //     	return device.discoverAllServicesAndCharacteristics();
  //   	})
  //   	.then((device) => {
	// 			return getServicesAndCharacteristics(device);
  //   	})
	// 		.then((serviceCharacteristics) => {
	// 			console.log(serviceCharacteristics);
	// 		})
  //   	.catch((error) => {
  //       // Handle errors
  //   });
	// }

  
	function disconnect(device){
		return new Promise(async (resolve, reject) => {
      try {
        await device.cancelConnection();
        console.log(`BLE: Device ${device.name} disconnected...`);
        resolve(device);
      }
      catch(error){
        console.error("ERROR (BLE) disconnect:", error)
        reject();
      }
    });
  }

  function scan() {
    console.log("Scanning...");

    manager.startDeviceScan(null, {allowDuplicates: false}, (error, device) => {
      if (error) {
        // Handle error (scanning will be stopped automatically)
        console.error("ERROR (BLE) scan:", error)
      }
      if (!device.name) return;

      if (device.name.startsWith(BLE.DEVICE_NAME))
        dispatchDevices({type: "SCANNED_DEVICE", payload: device});
    });
  }

  function scanAndStop() {
    console.log("Scanning...");
		return new Promise((resolve, reject) => {
        if (!manager) reject();

        manager.startDeviceScan([BLE.SERVICE_LED_CONTROL], null, (error, device) => {
          if (error) {
            // Handle error (scanning will be stopped automatically)
            console.error("ERROR (BLE) scanAndConnect:", error)
            reject();
          }
          if (!device.name) return;
          console.debug("BLE: Device found:", device.name);

          if (device.name.startsWith(BLE.DEVICE_NAME)) {
            console.log("BLE: Target device found!!!");

            // Stop scanning as it's not necessary if you are scanning for one device.
            manager.stopDeviceScan();
            resolve(device);
          }
        });
    });
  }

	function getServicesAndCharacteristics(device) {
    console.log("BLE: Getting services & characteristics...");

		return new Promise(async (resolve, reject) => {
      
      try{
        // discover all services and characteristics
        await device.discoverAllServicesAndCharacteristics();
        //await device ble services and filter
        let services = await device.services();
        services = services.filter(s => BLE.DEVICE_SERVICES.includes(s.uuid));

        //map services and characteristics
        //NOTE: important to use for instead of forEach
        let serviceCharacteristics = {}
        for (const s of services){
          serviceCharacteristics[s.uuid] = [];
          let characteristics = await s.characteristics();
          characteristics.forEach(ch => {
            serviceCharacteristics[s.uuid].push(ch);
          });
        }
        resolve(serviceCharacteristics);
      }

      catch(error){
        console.error("ERROR (BLE) connect:", error)

        //disconnect
        let isConnected = await device.isConnected();
        console.log("BLE: device isConnected: %d", isConnected);
        if (isConnected)
          disconnect(device);
        reject();
      }
		});
  }

  function writeCharacteristics(device, characteristic, value){
		return new Promise(async (resolve, reject) => {
      try {
        await characteristic.writeWithoutResponse(binaryToBase64(value));
        resolve(characteristic);
      }
      catch(error){
        console.error("ERROR (BLE) writeCharacteristics:", error)
        reject();
      }
    });
  }

  function readCharacteristics(device, characteristic){
		return new Promise(async (resolve, reject) => {
      try {
        await characteristic.read();
        let value = base64ToHexStr(characteristic.value);
        console.log("char read: ", characteristic.uuid, value);
        resolve(value);
      }
      catch(error){
        console.error("ERROR (BLE) writeCharacteristics:", error)
        reject();
      }
    });
  }
  //#endregion

  

  function onBtnScanClick(){

    scan();

    setTimeout(() => {
    //!!! MOCKUP !!!
      if (devices.length && !devices[0].isConnected()){
        console.log("connecting to newly added device");

        connectToSunFibreDevice(devices[0]);

        setSelectedDevice(devices[0]);
        setTimeout(() => dispatchMode('SET_FLASH'), 2000);

        setTimeout(() => 
          readBatteryLevelCharacteristics(devices[0]).then((value) => console.log("Battery level:", value))
        , 2000);
        //disconnect after 3 seconds
        setTimeout(() => disconnectSunFibreDevice(devices[0]), 5000);
      //!!! MOCKUP !!!
    }

    }, 2000)

    //   await connect(device);

    //   let serviceCharacteristics = await getServicesAndCharacteristics(device); 
    //   console.log(prettyPrintServiceCharacteristics(serviceCharacteristics));

    //   await writeCharacteristics(device, serviceCharacteristics[BLE.SERVICE_LED_CONTROL][BLE.CHARACTERISTIC_DIM_LED_INDEX], 3);

    //   setTimeout(() => disconnect(device), 3000);
    // }
  }

  function onBtnStopScanClick() {

  }

  /** Connects to first device in list */
  function onBtnConnectClick(){

  }
  async function onBtnDisconnectClick(){}

  return (
    <View style={styles.container}>
      <Text>Openupa Appa.js to start working on your app!!</Text>
      <StatusBar style="auto" />
			<Button
				onPress={onBtnScanClick} 
				title="Scan"
			/>
			<Button
				onPress={onBtnStopScanClick} 
				title="Stop Scan"
			/>
			<Button
				onPress={onBtnConnectClick} 
				title="Connect"
			/>
			<Button
				onPress={onBtnDisconnectClick} 
				title="Disconnect"
			/>
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
