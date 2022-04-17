import React, { useReducer, useState } from 'react';
import { ScanMode } from 'react-native-ble-plx';


import { devicesReducer as DevicesReducer } from './DevicesReducer';
import { DevicesContext } from './DevicesContext';

import * as BLE from '../services/BLEService';
import * as BLE_C from '../constants/BLEConstants';



const DevicesContextProvider = ({children, manager}) => {

  // all SunFibre devices that were found
	const [devices, dispatchDevices] = useReducer(DevicesReducer, []);

  // selected device (its card is opened)
  const [controlledDevice, setControlledDevice] = useState(null);

  // const scanAndStop = () => {
  //   console.log('Scanning...');
  //   return new Promise((resolve, reject) => {
  //     if (!manager) reject();

  //     manager.startDeviceScan([BLE_C.SERVICE_LED_CONTROL], null, (error, device) => {
  //       if (error) {
  //         // Handle error (scanning will be stopped automatically)
  //         console.error('ERROR (BLE) scanAndConnect:', error);
  //         reject();
  //       }
  //       if (!device.name) return;
  //       console.debug('BLE: Device found:', device.name);

  //       if (device.name.startsWith(BLE_C.DEVICE_NAME)) {
  //         console.log('BLE: Target device found!!!');

  //         // Stop scanning as it's not necessary if you are scanning for one device.
  //         manager.stopDeviceScan();
  //         resolve(device);
  //       }
  //     });
  //   });
  // }

  const addAlreadyConnectedDevices = () => {
    manager.connectedDevices([BLE_C.SERVICE_LED_CONTROL, BLE_C.SERVICE_MONITOR]).then((alreadyConnected) => {
      console.log("(TEST): Already connected:", alreadyConnected.map(d => d.name));
    })
  }

	const onDisconnectedSunFibreDevice = (sunFibreDevice) => {
    const subscription = BLE.monitorDisconnection(sunFibreDevice.getBLEDevice(), () => {
      console.log(`(SFD): onDisconnectedSunFibreDevice ${sunFibreDevice.getName()}`);

      dispatchDevices({
        type: 'DISCONNECTED_DEVICE',
        payload: sunFibreDevice.getBLEDevice(),
      });

      subscription.remove();
    });
  }

	const connectSunFibreDevice = (sunFibreDevice) => {
    return BLE.connect(sunFibreDevice.getBLEDevice())
      .then((device) => BLE.getServicesAndCharacteristics(device))
      .then((sch) => {
        dispatchDevices({
          type: 'CONNECTED_DEVICE',
          payload: { device: sunFibreDevice.getBLEDevice(), servicesCharacteristics: sch },
        });

        onDisconnectedSunFibreDevice(sunFibreDevice);

        console.log(`(SFD): Device ${sunFibreDevice.getName()} connected`);
      })
      .catch((error) => { throw new Error(error) });
	};

	const disconnectSunFibreDevice = (sunFibreDevice) => {

    BLE.disconnect(sunFibreDevice.getBLEDevice())
      .then(_ => {
        console.log(`(SFD): Device ${sunFibreDevice.getName()} disconnected`);

        dispatchDevices({
          type: 'DISCONNECTED_DEVICE',
          payload: sunFibreDevice.getBLEDevice(),
        });

      })
      .catch(error => console.warn(error));
	};

  const startScanningSunFibreDevices = (onScanError) => {
    console.log('(BLE): Scanning...');

    addAlreadyConnectedDevices();

    manager.startDeviceScan([BLE_C.SERVICE_LED_CONTROL], { allowDuplicates: false, scanMode: ScanMode.LowLatency}, (error, device) => {
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

    // setScanning(true);
  }

  const stopScanningSunFibreDevices = () => {
    console.log("(BLE): Stopping scanning...");
    // setScanning(false);

    manager.stopDeviceScan();
  }

  const clearSunFibreDevices = () => {
    dispatchDevices({ type: 'CLEAR' });
  }

  const setSunFibreDeviceToControl = (sunFibreDevice) => {
    setControlledDevice(sunFibreDevice);
  }

	return (
		<DevicesContext.Provider value=
    {{
      controlledDevice,
      devices,
      connectSunFibreDevice,
      disconnectSunFibreDevice,
      startScanningSunFibreDevices,
      stopScanningSunFibreDevices,
      clearSunFibreDevices,
      setSunFibreDeviceToControl,
    }}>
			{children}
		</DevicesContext.Provider>
	)
}


export default DevicesContextProvider;