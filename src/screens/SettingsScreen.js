import React, { useState, useEffect, useReducer, useRef, useContext } from 'react';
import {
  StyleSheet, View, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { Text, Button } from 'react-native-elements';
import Dialog from "react-native-dialog";


import StatusBar from '../components/StatusBar';
import DeviceCard from '../components/DeviceCard';

import { DevicesContext } from '../redux/DevicesContext';

import * as utils from '../services/UtilsService';
import * as BLE from '../services/BLEService';
import * as BLE_C from '../constants/BLEConstants';

import theme, { colors } from '../styles/theme';


const ON_DISCONNECT_DELAY = 3000;

const DimLEDModes = {
  OFF:        0x0,
  ON_STRONG:  0x1,
  ON_MILD:    0x2,
  FLASH_SLOW: 0x3,
  FLASH_FAST: 0x4,
  UNKNOWN:    0x5,
}

export default function SettingsScreen({navigation, ...props }) {

  const { controlledDevice, disconnectSunFibreDevice, setSunFibreDeviceToControl } = useContext(DevicesContext);

  const isMounted = useRef(null);
  const pollInterval = useRef(null);

  const dimLEDSubscription = useRef(null);
  const batteryChargeSubscription = useRef(null);
  const disconnectSubscription = useRef(null);


  const batteryReducer = (prevState, action) => {
    switch (action) {
      case 0x00:
        return { value: 'Drained', color: colors.battery0, icon: 'battery-empty' };
      case 0x01:
        return { value: 'Very Low', color: colors.battery1, icon: 'battery-empty' };
      case 0x02:
        return { value: 'Low', color: colors.battery2, icon: 'battery-quarter' };
      case 0x03:
        return { value: 'Medium', color: colors.battery4, icon: 'battery-half' };
      case 0x04:
        return { value: 'High', color: colors.battery5, icon: 'battery-full' };
      case 0xFF:
        return { value: '?', color: colors.batteryUnknown, icon: 'battery-empty' };
      default:
        return prevState;
    }
  };


  const [lightMode, setLightMode] = useState(DimLEDModes.UNKNOWN);
  const [flashModeActive, setFlashModeActive] = useState(false);
  const [batteryLevel, dispatchBattery] = useReducer(batteryReducer, null);
  const [batteryVoltage, setBatteryVoltage] = useState(null);
  const [batteryCharge, setBatteryCharge] = useState(null);




  const [rfidEnabled, setRfidEnabled] = useState(false);


  const logError = (funcName, error) => console.warn(`(Settings-screen): Error in ${funcName}`, error.message)

  const setState = (setter, state) => isMounted.current? setter(state) : null;

  //#region BLE Handlers
  const disconnectHandler = () => {
    disconnectSunFibreDevice(controlledDevice);
  };

  const monitorDisconnection = () => {
    disconnectSubscription.current = BLE.monitorDisconnection(controlledDevice.getBLEDevice(), () => {
      console.log(`(Settings-screen): onDisconnectedSunFibreDevice ${controlledDevice.getName()}`);
      onDestroy();

      showDisconnectDialog();
      setTimeout(() => closeDisconnectDialog(), ON_DISCONNECT_DELAY);
    });
  }

  const writeDimLEDHandler = (newMode) => {
    // preserve current mode
    let currentMode = lightMode;
    // set new mode immediately
    setState(setLightMode, newMode);
    controlledDevice.writeDimLEDCharacteristics(newMode).then(
      () => {},
      (error) => {
        // restore old mode
        setState(setLightMode, currentMode);
        //TODO: output notification
        logError(writeDimLEDHandler.name, error)
      }
    )
  };

  const readDimLEDHandler = () => {
    controlledDevice.readDimLEDCharacteristics().then(
      (lightMode) => setState(setLightMode, lightMode),
      (error) => { logError(readDimLEDHandler.name, error); setState(setLightMode, DimLEDModes.UNKNOWN) }
    );
  };

  const monitorDimLEDHandler = () => {
    try {
      dimLEDSubscription.current = BLE.monitorCharacteristic(
        controlledDevice.getBLEDevice(), BLE_C.SERVICE_LED_CONTROL,
        controlledDevice.getServiceCharacteristic(BLE_C.SERVICE_LED_CONTROL, BLE_C.CHARACTERISTIC_DIM_LED_IDX).uuid, 
      (value) => {
        console.log("(Settings-screen): Dim LED, value has changed.", utils.base64StrToHexStr(value));
        let dimLEDMode = utils.base64StrToUInt8(value);
        setState(setLightMode, dimLEDMode);
      });
    }
    catch(error){ logError(monitorDimLEDHandler.name, error) }
  }

  const readBatteryLevelHandler = () => {
    controlledDevice.readBatteryLevelCharacteristics().then(
      ([batteryLevel, batteryVoltage]) => { setState(dispatchBattery, batteryLevel); setState(setBatteryVoltage, batteryVoltage) },
      (error) => { logError(readBatteryLevelHandler.name, error); setState(dispatchBattery, -1) }
    );
  };

  const readBatteryChargeHandler = () => {
    controlledDevice.readBatteryChargeCharacteristics().then(
      (batteryCharge) => setState(setBatteryCharge, batteryCharge),
      (error) => { logError(readBatteryChargeHandler.name, error); setState(setBatteryCharge, null) }
    );
  };

  const monitorBatteryChargeHandler = () => {
    try {
      batteryChargeSubscription.current = BLE.monitorCharacteristic(
        controlledDevice.getBLEDevice(), BLE_C.SERVICE_MONITOR,
        controlledDevice.getServiceCharacteristic(BLE_C.SERVICE_MONITOR, BLE_C.CHARACTERISTIC_BATTERY_CHARGING_IDX).uuid, 
      (value) => {
        console.log("(Settings-screen): Battery charge, value has changed.", utils.base64StrToHexStr(value));
        let batteryCharge = utils.base64StrToUInt8(value);
        setState(setBatteryCharge, batteryCharge);
      });
    }
    catch(error){ logError(monitorBatteryChargeHandler.name, error) }
  }


  const pollBatteryLevel = () => {
    pollInterval.current = setInterval(() => {
      readBatteryLevelHandler();
    }, BLE_C.SETTINGS_REFRESH_INTERVAL); // periodically read battery
  }
  //#endregion


  const OptionButton = (props) => <Button type="outline" disabledStyle={controlledDevice ? styles.activatedButton : null} disabledTitleStyle={controlledDevice ? styles.activeButtonTitle : null} {...props} />;


  const [disconnectDialogVisible, setDisconnectDialogVisible] = useState(false);

  const showDisconnectDialog = () => setDisconnectDialogVisible(true);

  const closeDisconnectDialog = () => {
    setDisconnectDialogVisible(false);
    navigation.navigate('Connections');
  }

  const onDestroy = () => {

    isMounted.current = false;
    // clear interval
    clearInterval(pollInterval.current);

    // cancel all subscriptions
    if (dimLEDSubscription.current){
      console.debug("(Settings-screen): Dim LED subscription removed");
      dimLEDSubscription.current.remove();
      dimLEDSubscription.current = null;
    }

    if (batteryChargeSubscription.current){
      console.debug("(Settings-screen): Battery Charge subscription removed");
      batteryChargeSubscription.current.remove();
      batteryChargeSubscription.current = null;
    }

    if (disconnectSubscription.current){
      console.debug("(Settings-screen): Disconnect subscription removed");
      disconnectSubscription.current.remove();
      disconnectSubscription.current = null;
    }

    setSunFibreDeviceToControl(null); // tear down function
  }

  const onStart = () => {

    isMounted.current = true;

    // read characterisitcs on start
    readDimLEDHandler();
    readBatteryLevelHandler();
    readBatteryChargeHandler();

    // monitor characteristics 
    monitorDimLEDHandler();
    monitorBatteryChargeHandler();
    // periodically read temperature
    pollBatteryLevel();
  }


  // unselect controlledDevice at the end
  useEffect(() => {
    if (controlledDevice) onStart();
    return () => onDestroy();
  }, []);

  // unselect controlledDevice at the end
  useEffect(() => {
    // console.log("Settings screen",  controlledDevice?.name, controlledDevice?.servicesCharacteristics?.[BLE_C.SERVICE_LED_CONTROL]?.[BLE_C.CHARACTERISTIC_DIM_LED_IDX])
    if (controlledDevice){
      // monitor disconnection
      monitorDisconnection();

      // check RFID presence
      setRfidEnabled(controlledDevice.getService(BLE_C.SERVICE_RFID) !== undefined);
    }
  }, [controlledDevice]);

  useEffect(() => {
    setFlashModeActive(lightMode === DimLEDModes.FLASH_FAST || lightMode === DimLEDModes.FLASH_SLOW);
  }, [lightMode]);

  return (
    <>
      <SafeAreaView style={styles.screen}>
        <StatusBar navigation={navigation} />
        <Text h1>Device Control</Text>

        <View style={styles.deviceInfoWrapper}>
          {controlledDevice ? 
            <DeviceCard batteryCharge={batteryCharge} batteryLevel={batteryLevel} batteryVoltage={batteryVoltage} rfidEnabled={rfidEnabled} flashModeActive={flashModeActive}/>:
            <ActivityIndicator size="large" />
          }
        </View>

        <View style={styles.buttonWrapper}>
          <OptionButton disabled={!controlledDevice || lightMode === DimLEDModes.OFF} title="OFF" onPress={() => writeDimLEDHandler(DimLEDModes.OFF)} />
          <OptionButton disabled={!controlledDevice || lightMode === DimLEDModes.ON_STRONG} title="ON STRONG" onPress={() => writeDimLEDHandler(DimLEDModes.ON_STRONG)} />
          <OptionButton disabled={!controlledDevice || lightMode === DimLEDModes.ON_MILD} title="ON MILD" onPress={() => writeDimLEDHandler(DimLEDModes.ON_MILD)} />
          <OptionButton disabled={!controlledDevice || lightMode === DimLEDModes.FLASH_SLOW} title="FLASH SLOW" onPress={() => writeDimLEDHandler(DimLEDModes.FLASH_SLOW)} />
          <OptionButton disabled={!controlledDevice || lightMode === DimLEDModes.FLASH_FAST} title="FLASH FAST" onPress={() => writeDimLEDHandler(DimLEDModes.FLASH_FAST)} />
          <Button title="Disconnect" disabled={!controlledDevice} titleStyle={styles.disconnectButtonTitle} onPress={disconnectHandler} />
        </View>
      </SafeAreaView>

      {/* "ENABLE DISCONNECT POPUP" */}
      <Dialog.Container visible={disconnectDialogVisible} onBackdropPress={closeDisconnectDialog}>
        <Dialog.Title style={theme.dialogTitleText}>Device Disconnection</Dialog.Title>
        <Dialog.Description style={theme.dialogDescText}>
          Device was successfully disconnected.
        </Dialog.Description>
      </Dialog.Container>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#000',
    flex: 1,
    justifyContent: 'space-around'
  },
  buttonWrapper: {
    marginHorizontal: '10%',
  },
  text: {
    textAlign: 'center',
  },
  deviceInfoWrapper: {
    marginHorizontal: '10%',
    textAlign: 'center',
    justifyContent: 'center',
  },
  disconnectButtonTitle: {
    textTransform: 'uppercase',
    fontSize: 20,
    color: colors.red,
  },
  activatedButton: {
    borderWidth: 2,
    borderColor: colors.yellow,

  },
  activeButtonTitle: {
    color: colors.yellow,
  },
});
