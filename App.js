import React, { useReducer, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { ThemeProvider } from 'react-native-elements';
import { BleManager } from 'react-native-ble-plx';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import IntroScreen from './screens/IntroScreen';
import ConnectionsScreen from './screens/ConnectionsScreen';
import SettingsScreen from './screens/SettingsScreen';

import theme from './styles/theme';

import * as BLE from './ble-constants';
import * as utils from './utils';
import { SunFibreDevice } from './models/sun-fibre-device';

export default function App() {
  const Stack = createStackNavigator();

  const [manager, setManager] = useState(null);

  // selected device (its card is opened)
  const [selectedDevice, setSelectedDevice] = useState(null);

  // scanning (connections card is opened)
  const [scanning, setScanning] = useState(false);

  const devicesReducer = (devices, action) => {
    switch (action.type) {
      /**
       * Either add new device to device list or if existing update its timestamp
       * @param {*} device
       */
      case 'SCANNED_DEVICE': {
        const device = action.payload;
        const existingDevice = devices.find((sfd) => sfd.getDevice().id == device.id);

        // if (!existingDevice && device.isConnectable) {
        if (!existingDevice) {
          console.log('BLE: addDevice', device.id, device.name);
          return [...devices, new SunFibreDevice(device, null)];
        }

        if (existingDevice) {
          // refresh timestamp
          existingDevice.setLastSeenTimestamp(Date.now());
          return devices;
        }
      }

      case 'CONNECTED_DEVICE': {
        const { device } = action.payload;
        const existingDevice = devices.find((sfd) => sfd.getDevice().id == device.id);

        if (!existingDevice) throw new Error('Device is not in devices list!');

        existingDevice.setConnected(true);
        existingDevice.setServicesCharacteristics(action.payload.servicesCharacteristics);
        return devices;
      }

      case 'DISCONNECTED_DEVICE': {
        const device = action.payload;
        const existingDevice = devices.find((sfd) => sfd.getDevice().id == device.id);

        if (!existingDevice) throw new Error('Device is not in devices list!');

        existingDevice.setConnected(false);
        existingDevice.setServicesCharacteristics(null);
        setSelectedDevice(null);
        return devices;
      }

      case 'SET':
        return action.payload;
      case 'CLEAR':
        console.log("Clearing devices...");
        return [];
      default:
        throw new Error('Unsupported devicesReducer action received.');
    }
  };

  // all SunFibre devices that were found
  const [devices, dispatchDevices] = useReducer(devicesReducer, []);

  // TODO: diconnect x connect should be probably wrapped by a promise too

  /**
   * Establishes connection with BLE SunFibre device.
   *
   * @param {SunFibreDevice} sunFibreDevice
   */
  const connectToSunFibreDevice = async (sunFibreDevice) => connect(sunFibreDevice.getDevice())
    .then((device) => getServicesAndCharacteristics(device))
    .then((deviceServicesAndCharacteristics) => {
      console.log('Services and Characteristics obtained.');
      dispatchDevices({
        type: 'CONNECTED_DEVICE',
        payload: {
          device: sunFibreDevice.getDevice(),
          servicesCharacteristics: deviceServicesAndCharacteristics,
        },
      });
      console.log('Device connected');
    });

  /**
   * Close the connection with BLE SunFibre device.
   *
   * @param {SunFibreDevice} sunFibreDevice
   */
  const disconnectSunFibreDevice = (sunFibreDevice) => {
    disconnect(sunFibreDevice.getDevice())
      .then((device) => {
        dispatchDevices({
          type: 'DISCONNECTED_DEVICE',
          payload: device,
        });
        console.log('Device disconnected');
      });
  };

  useEffect(() => {
    console.log('New ble manager...');
    const newManager = new BleManager();
    // newManager.setLogLevel(LogLevel.Debug);
    const subscription = newManager.onStateChange((state) => {
      console.log('BLE Manager: monitor state', state);
      if (state === 'PoweredOn') {
        // scanAndConnect();
        subscription.remove();
      }
    }, true);

    setManager(newManager);
    // dispatchDevices({ type: 'CLEAR' });
  }, []);

  useEffect(() => {
    console.log('useEffect - devices', devices.length);
  }, [devices]);

  // #region LAYER: sun fibre device
  /**
   * Promise to write dim LED char.
   * @param {*} sunFibreDevice: SunFibreDevice
   * @returns writePromise: Promise<Characteristic>
   */
  function writeDimLEDCharacteristics(sunFibreDevice, value) {
    console.log("Writing Dim LED char.: ", value);
    const ch = sunFibreDevice.getDimLEDCharacteristic();
    if (!ch) throw new Error("Device does not possesses requested characteristic!");

    return writeCharacteristics(sunFibreDevice.getDevice(), ch, value);
  }

  /**
   * Promise to read dim LED char. and parse them to integer
   * @param {*} sunFibreDevice: SunFibreDevice
   * @returns readPromise: Promise<number>
   */

  function readDimLEDCharacteristics(sunFibreDevice){
    console.log("Reading Dim LED char.");
    const ch = sunFibreDevice.getDimLEDCharacteristic();
    if (!ch) throw new Error("Device does not possesses requested characteristic!");

    return readCharacteristics(sunFibreDevice.getDevice(), ch).then(
      value => utils.base64StrToNumber(value)
    );
  }

  /**
   * Promise to read battery level char. and parse them to integer
   * @param {*} sunFibreDevice: SunFibreDevice
   * @returns readPromise: Promise<number>
   */
  function readBatteryLevelCharacteristics(sunFibreDevice) {
    console.log("Reading Battery Level char.");
    const ch = sunFibreDevice.getBatteryLevelCharacteristic();
    if (!ch) throw new Error("Device does not possesses requested characteristic!");

    return readCharacteristics(sunFibreDevice.getDevice(), ch).then(
      value => utils.base64StrToNumber(value)
    );
  }

  function readBatteryChargeCharacteristics(sunFibreDevice) {
    console.log("Reading Battery Charge char.");
    const ch = sunFibreDevice.getBatteryChargeCharacteristic();
    if (!ch) throw new Error("Device does not possesses requested characteristic!");

    return readCharacteristics(sunFibreDevice.getDevice(), ch).then(
      value => utils.base64StrToNumber(value)
    );
  }

  // #endregion



  // #region LAYER: ble-plx

  function monitorCharacteristic(characteristic, onCharacteristicValueChange){
    return characteristic.monitor((error, characteristic) => {
      if (error === null){
        console.log(`(BLE): Monitor ${characteristic.uuid}, value has changed: ${utils.base64StrToHexStr(characteristic.value)}`);
        onCharacteristicValueChange(characteristic.value);
      }
      else if (error.message === "Operation was cancelled") return;
      else 
        console.error(error);
    })
  }


  function connect(device) {
    return new Promise(async (resolve, reject) => {
      // let isConnected = await device.isConnected();
      // console.log("device: isConnected: %d", isConnected);
      // if (isConnected) reject();

      try {
        // wait until connected
        await device.connect();
        console.log(`BLE: Device ${device.name} connected...`);

        resolve(device);
      } catch (error) {
        console.error('ERROR (BLE) connect:', error);

        // disconnect
        const isConnected = await device.isConnected();
        console.log('BLE: Device isConnected: %d', isConnected);
        if (isConnected) disconnect(device);

        reject();
      }
    });
  }

  function disconnect(device) {
    return new Promise(async (resolve, reject) => {
      try {
        await device.cancelConnection();
        console.log(`BLE: Device ${device.name} disconnected...`);
        resolve(device);
      } catch (error) {
        console.error('ERROR (BLE) disconnect:', error);
        reject();
      }
    });
  }

  function stopScan(){
    console.log("Stopping scanning...");
    setScanning(false);
    manager.stopDeviceScan();
  }

  function startScan(){
    console.log('Scanning...');

    manager.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
      if (error) {
        // Handle error (scanning will be stopped automatically)
        console.error('ERROR (BLE) scan:', error);
      }
      if (device === null || !device.name) return;

      if (BLE.DEVICE_NAMES.find(dn => device.name.startsWith(dn))){
        // console.log(`${device.name} scanned!`);
        dispatchDevices({ type: 'SCANNED_DEVICE', payload: device });
      }
    });

    setScanning(true);
  }

  function scanAndStop() {
    console.log('Scanning...');
    return new Promise((resolve, reject) => {
      if (!manager) reject();

      manager.startDeviceScan([BLE.SERVICE_LED_CONTROL], null, (error, device) => {
        if (error) {
          // Handle error (scanning will be stopped automatically)
          console.error('ERROR (BLE) scanAndConnect:', error);
          reject();
        }
        if (!device.name) return;
        console.debug('BLE: Device found:', device.name);

        if (device.name.startsWith(BLE.DEVICE_NAME)) {
          console.log('BLE: Target device found!!!');

          // Stop scanning as it's not necessary if you are scanning for one device.
          manager.stopDeviceScan();
          resolve(device);
        }
      });
    });
  }

  function getServicesAndCharacteristics(device) {
    console.log('BLE: Getting services & characteristics...');

    return new Promise(async (resolve, reject) => {
      try {
        // discover all services and characteristics
        await device.discoverAllServicesAndCharacteristics();
        // await device ble services and filter
        let services = await device.services();
        services = services.filter((s) => BLE.DEVICE_SERVICES.includes(s.uuid));

        // map services and characteristics
        // NOTE: important to use for instead of forEach
        const serviceCharacteristics = {};
        for (const s of services) {
          serviceCharacteristics[s.uuid] = [];
          const characteristics = await s.characteristics();
          characteristics.forEach((ch) => {
            serviceCharacteristics[s.uuid].push(ch);
          });
        }
        resolve(serviceCharacteristics);
      } catch (error) {
        console.error('ERROR (BLE) connect:', error);

        // disconnect
        const isConnected = await device.isConnected();
        console.log('BLE: device isConnected: %d', isConnected);
        if (isConnected) disconnect(device);
        reject();
      }
    });
  }

  function writeCharacteristics(device, characteristic, value) {
    return new Promise(async (resolve, reject) => {
      try {
        await characteristic.writeWithoutResponse(utils.binaryArrayToBase64Str([value]));
        resolve(characteristic);
      } catch (error) {
        console.error("ERROR (BLE) writeCharacteristics:", error);
        console.error("value to write: ", value);
        reject();
      }
    });
  }

  function readCharacteristics(device, characteristic) {
    return new Promise(async (resolve, reject) => {

      try {
        //NOTE: this must be assigned to a new variable 
        let readCharacteristics = await characteristic.read();
        console.log('(BLE) readCharacteristics: ', characteristic.uuid, utils.base64StrToHexStr(readCharacteristics.value));
        resolve(utils.base64StrToBinaryArray(readCharacteristics.value));
      } catch (error) {
        console.error('ERROR (BLE) readCharacteristics:', error);
        reject();
      }
    });
  }

  //TODO: make this work
  function listenDisconnection(device){
    console.log('Scanning...');
    manager.onDeviceDisconnected(device.id, (error, device) => {
      console.log(`(BLE): Device ${device.name} has been disconnected`);
      console.log("Error: ", error);
    });
  }

  // #endregion

  return (
    <ThemeProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>

          <Stack.Screen name="Intro">{(props) =>
            <IntroScreen {...props}
              deviceConnected={!!selectedDevice}
            />}
          </Stack.Screen>

          <Stack.Screen name="Connections">{(props) => 
            <ConnectionsScreen {...props}
              startScanDevices={startScan}
              stopScanDevices={stopScan}
              clearDevices={() => dispatchDevices({type: 'CLEAR'})}
              connectDevice={connectToSunFibreDevice}
              onDeviceDisconnected={listenDisconnection}
              devices={devices}
              setSelectedDevice={setSelectedDevice}

            />}
          </Stack.Screen>

          <Stack.Screen name="Settings">{(props) => 
            <SettingsScreen {...props}
              device={selectedDevice}
              setSelectedDevice={setSelectedDevice}
              disconnectDevice={disconnectSunFibreDevice}
              writeDimLED={writeDimLEDCharacteristics}
              readDimLED={readDimLEDCharacteristics}
              readBatteryLevel={readBatteryLevelCharacteristics}
              readBatteryCharge={readBatteryChargeCharacteristics}
              monitorCharacteristic={monitorCharacteristic}
            />}
          </Stack.Screen>

        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
