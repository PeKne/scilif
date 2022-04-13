import React, { useReducer, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { ThemeProvider } from 'react-native-elements';
import { BleManager } from 'react-native-ble-plx';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import AppLoading from 'expo-app-loading';
import * as Font from 'expo-font';
import { FontAwesome } from '@expo/vector-icons';
import { Asset } from 'expo-asset';

import IntroScreen from './screens/IntroScreen';
import ConnectionsScreen from './screens/ConnectionsScreen';
import SettingsScreen from './screens/SettingsScreen';

import theme from './styles/theme';

import { SunFibreDevice } from './models/SunFibreDevice';

import { requestLocationPermission } from './services/PermissionsService';
import * as BLE from './services/BLEService';
import * as BLE_C from './constants/BLEConstants';


  const devicesReducer = (devices, action) => {
    switch (action.type) {
      /**
       * Either add new device to device list or if existing update its timestamp
       * @param {*} device
       */
      case 'SCANNED_DEVICE': {
        const device = action.payload;
        const existingDevice = devices.find((sfd) => sfd.getMAC() == device.id);

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
        const device = action.payload.device;
        const existingDevice = devices.find((sfd) => sfd.getMAC() == device.id);

        if (!existingDevice) throw new Error('Device is not in devices list!');

        existingDevice.setConnected(true);
        existingDevice.setServicesCharacteristics(action.payload.servicesCharacteristics);
        return devices;
      }

      case 'DISCONNECTED_DEVICE': {
        const device = action.payload;
        const existingDevice = devices.find((sfd) => sfd.getMAC() == device.id);

        if (!existingDevice) 
          return devices;
        // throw new Error('Device is not in devices list!');

        //NOTE: this might be redundant - object will be deleted anyway
        existingDevice.setConnected(false);
        existingDevice.setServicesCharacteristics(null);

        // filter devices
        return devices.filter(d => d.getMAC() !== device.id);
      }

      case 'SET':
        return action.payload;
      case 'CLEAR':
        console.log("Clearing devices...");
        return devices.filter((dev) => dev.isConnected());
      default:
        throw new Error('Unsupported devicesReducer action received.');
    }
  };

export default function App() {

  const Stack = createStackNavigator();
  const [resourcesLoaded, setResourcesLoaded] = useState(false);

  const [manager, setManager] = useState(null);

  // selected device (its card is opened)
  const [selectedDevice, setSelectedDevice] = useState(null);

  // scanning (connections card is opened)
  const [scanning, setScanning] = useState(false);
  // permissions granted
  const [permissionsGranted, setPermissionsGranted] = useState(false);



  // all SunFibre devices that were found
  const [devices, dispatchDevices] = useReducer(devicesReducer, []);

  // TODO: diconnect x connect should be probably wrapped by a promise too

  useEffect(() => {
    // create BLE manager
    console.log('(BLE): New ble manager...');
    const newManager = new BleManager();
    setManager(newManager);

    const subscription = newManager.onStateChange((state) => {
      if (state === 'PoweredOn') subscription.remove();
    }, true);

    // check permissions
    console.log("(BLE): Requesting permissions...");
    requestLocationPermission().then((permissionsGranted) => {
      setPermissionsGranted(permissionsGranted);
      if (!permissionsGranted)
        console.warn("(BLE): Permissions not granted!!!");
    });
  }, []);

  // useEffect(() => {
  //   // check already connected
  //   console.log("(BLE): Checking already connected devices...");
  //   addAlreadyConnectedDevices();
  // }, [manager]);

  useEffect(() => {
    console.log('(APP): useEffect - devices num.:', devices.length);
  }, [devices]);

  /**
   * Establishes connection with BLE SunFibre device.
   *
   * @param {SunFibreDevice} sunFibreDevice
   */
  const connectToSunFibreDevice = async (sunFibreDevice) => {

    try{
      await BLE.connect(sunFibreDevice.getBLEDevice());
      let servicesCharacteristics = await BLE.getServicesAndCharacteristics(sunFibreDevice.getBLEDevice());
      console.log('(SFD): Services and Characteristics obtained.');

      // test read
      await BLE.readCharacteristics(sunFibreDevice.getBLEDevice(), servicesCharacteristics[BLE_C.SERVICE_LED_CONTROL][BLE_C.CHARACTERISTIC_DIM_LED_IDX]);

      // dispatch
      dispatchDevices({
        type: 'CONNECTED_DEVICE',
        payload: {
          device: sunFibreDevice.getBLEDevice(),
          servicesCharacteristics: servicesCharacteristics,
        },
      });
      console.log(`(SFD): Device ${sunFibreDevice.getName()} connected`);

      onDisconnectedSunFibreDevice(sunFibreDevice);
    }
    catch(error){
      if (error.message === "Read failed"){
        console.warn("BONDING - MISS KEY");
      }
      else {
        console.error("ERROR (connectSFD): ", error.message);
      }
      throw error;
    }
    // var sch;
    // return BLE.connect(sunFibreDevice.getBLEDevice())
    //   .then((device) => BLE.getServicesAndCharacteristics(device))
    //   .then((deviceServicesAndCharacteristics) => {
    //     console.log('(SD): Services and Characteristics obtained.');
    //     sch = deviceServicesAndCharacteristics;
    //     // let temp = new SunFibreDevice(sunFibreDevice.getBLEDevice(), sch);
    //     // return temp.readBatteryChargeCharacteristics();
    //   })
    //   .then (() => {
    //     dispatchDevices({
    //       type: 'CONNECTED_DEVICE',
    //       payload: {
    //         device: sunFibreDevice.getBLEDevice(),
    //         // servicesCharacteristics: deviceServicesAndCharacteristics,
    //         servicesCharacteristics: sch,
    //       },
    //     });
    //     // monitorDisconnection(sunFibreDevice.getBLEDevice());
    //     console.log(`(SFD): Device ${sunFibreDevice.getName()} connected`);

    //     onDisconnectedSunFibreDevice(sunFibreDevice);

    //   })
    //   .catch((error) => { throw new Error(error) });
  }

  /**
   * Close the connection with BLE SunFibre device.
   *
   * @param {SunFibreDevice} sunFibreDevice
   */
  const disconnectSunFibreDevice = (sunFibreDevice) => {
    // change state
    dispatchDevices({
      type: 'DISCONNECTED_DEVICE',
      payload: sunFibreDevice.getBLEDevice(),
    });

    BLE.disconnect(sunFibreDevice.getBLEDevice())
      .then(_ => {
        console.log(`(SFD): Device ${sunFibreDevice.getName()} disconnected`);
      })
      .catch(error => {
        //TODO: popup
        console.warn(error);
      })
      ;
  };


  const onDisconnectedSunFibreDevice = (sunFibreDevice) => {
    const subscription = BLE.monitorDisconnection(sunFibreDevice.getBLEDevice(), () => {
      console.log(`(SFD): onDisconnectedSunFibreDevice ${sunFibreDevice.getName()}`);

      subscription.remove();
      dispatchDevices({
        type: 'DISCONNECTED_DEVICE',
        payload: sunFibreDevice.getBLEDevice(),
      });
    });
  }


  // #region LAYER: ble-plx
  function startScan(onScanError){
    console.log('(BLE): Scanning...');

    addAlreadyConnectedDevices();

    manager.startDeviceScan([BLE_C.SERVICE_LED_CONTROL], { allowDuplicates: false }, (error, device) => {
      if (error) {
        // Handle error (scanning will be stopped automatically)
        if (onScanError) onScanError(error);
        else
          console.error('ERROR (BLE) scan:', error);
      }
      if (device === null || !device.name) return;

      if (BLE_C.DEVICE_NAMES.find(dn => device.name.startsWith(dn))) {
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

      manager.startDeviceScan([BLE_C.SERVICE_LED_CONTROL], null, (error, device) => {
        if (error) {
          // Handle error (scanning will be stopped automatically)
          console.error('ERROR (BLE) scanAndConnect:', error);
          reject();
        }
        if (!device.name) return;
        console.debug('BLE: Device found:', device.name);

        if (device.name.startsWith(BLE_C.DEVICE_NAME)) {
          console.log('BLE: Target device found!!!');

          // Stop scanning as it's not necessary if you are scanning for one device.
          manager.stopDeviceScan();
          resolve(device);
        }
      });
    });
  }

  function stopScan() {
    console.log("(BLE): Stopping scanning...");
    setScanning(false);
    manager.stopDeviceScan();
  }

  function addAlreadyConnectedDevices(){
    manager.connectedDevices([BLE_C.SERVICE_LED_CONTROL, BLE_C.SERVICE_MAINTENANCE]).then((alreadyConnected) => {
      console.log("(TEST): Already connected:", alreadyConnected.map(d => d.name));
    })
  }

  // #endregion

  return (
    !resourcesLoaded ?
      <AppLoading
        startAsync={_fetchResources}
        onFinish={() => setResourcesLoaded(true)}
        onError={console.warn}
      />
      : <ThemeProvider theme={theme}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false}}>

            <Stack.Screen name="Intro">{(props) =>
              <IntroScreen {...props}
                deviceConnected={!!selectedDevice}
                permissionsGranted={permissionsGranted}
              />}
            </Stack.Screen>

            <Stack.Screen name="Connections">{(props) =>
              <ConnectionsScreen {...props}
                startScanDevices={startScan}
                stopScanDevices={stopScan}
                clearDevices={() => dispatchDevices({ type: 'CLEAR' })}
                connectDevice={connectToSunFibreDevice}
                devices={devices}
                setSelectedDevice={setSelectedDevice}

              />}
            </Stack.Screen>

            <Stack.Screen name="Settings">{(props) =>
              <SettingsScreen {...props}
                device={selectedDevice}
                setSelectedDevice={setSelectedDevice}
                disconnectDevice={disconnectSunFibreDevice}
              />}
            </Stack.Screen>

          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
  // #endregion
  );
}

  // Preloads static resources before displaying incomplete APP
  const _fetchResources =async () => {
    const images = [require('../resources/images/logo.jpg')];
    const fonts = [FontAwesome.font];

    const fontAssets = fonts.map(font => Font.loadAsync(font));

    const imageAssets = images.map(image => {
      return Asset.fromModule(image).downloadAsync();
    }); 
    return Promise.all([...imageAssets, ...fontAssets]);
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
