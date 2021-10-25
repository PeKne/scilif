import React, { useState, useEffect, useReducer, useRef } from 'react';
import {
  StyleSheet, View, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { Text, Button } from 'react-native-elements';
import Dialog from "react-native-dialog";


import StatusBar from '../components/StatusBar';
import DeviceCard from '../components/DeviceCard';

import * as utils from '../services/UtilsService';
import * as BLE from '../services/BLEService';

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

export default function SettingsScreen({
  navigation,
  device, setSelectedDevice,
  disconnectDevice,
   ...props
}) {

  const dimLEDSubscription = useRef(null);
  const disconnectSubscription = useRef(null);

  const [mode, setMode] = useState(DimLEDModes.UNKNOWN);

  const changeMode = async (newMode) => {
    try {
      await device.writeDimLEDCharacteristics(newMode);
      setMode(newMode)
    } 
    catch(error){
      console.error("(Settings-screen): Unhandled error", error.message);
    }
  };



  //#region BLE Handlers
  const readDimLEDHandler = async () => {
    try {
      let dimLEDMode = await device.readDimLEDCharacteristics();
      setMode(dimLEDMode);
    }
    catch (error) {
      console.warn("(Settings-screen): Error in reading Dim LED mode", error.message);
      setMode(DimLEDModes.UNKNOWN)
    }
  };

  const monitorDimLEDHandler = () => {
    dimLEDSubscription.current = BLE.monitorCharacteristic(device.getDimLEDCharacteristic(), 
    (value) => {
      console.log("(Settings-screen): Dim LED, value has changed.", utils.base64StrToHexStr(value));
      let dimLEDMode = utils.base64StrToUInt8(value);
      setMode(dimLEDMode);
    });
  }

  const disconnectHandler = () => {
    disconnectDevice(device);
  };

  const clearHandler = () => {
    if (dimLEDSubscription.current){
      console.debug("(Settings-screen): Dim LED subscription removed");
      dimLEDSubscription.current.remove();
      dimLEDSubscription.current = null;
    }

    if (disconnectSubscription.current){
      console.debug("(Settings-screen): Disconnect subscription removed");
      disconnectSubscription.current.remove();
      disconnectSubscription.current = null;
    }
    setSelectedDevice(null); // tear down function
  }

  //#endregion


  const OptionButton = (props) => <Button type="outline" disabledStyle={device ? styles.activatedButton : null} disabledTitleStyle={device ? styles.activeButtonTitle : null} {...props} />;


  const [disconnectDialogVisible, setDisconnectDialogVisible] = useState(false);

  const showDisconnectDialog = () => setDisconnectDialogVisible(true);

  const closeDisconnectDialog = () => {
    setDisconnectDialogVisible(false);
    navigation.navigate('Connections');
  }


  // unselect device at the end
  useEffect(() => {
    if (device){
      readDimLEDHandler();
      monitorDimLEDHandler();
    }
    return () => {
      clearHandler();
    }
  }, []);

  // unselect device at the end
  useEffect(() => {
    if (device){
      disconnectSubscription.current = BLE.monitorDisconnection(device.getBLEDevice(), () => {
        console.log(`(Settings-screen): onDisconnectedSunFibreDevice ${device.getName()}`);
        clearHandler();

        showDisconnectDialog();
        setTimeout(() => closeDisconnectDialog(), ON_DISCONNECT_DELAY);
      })
    }
  }, [device]);

  return (
    <>
      <SafeAreaView style={styles.screen}>
        <StatusBar navigation={navigation} />
        <Text h1>Device Control</Text>

        <View style={styles.deviceInfoWrapper}>
          {device ? 
            <DeviceCard device={device}/>  : <ActivityIndicator size="large" />
          }
        </View>

        <View style={styles.buttonWrapper}>
          <OptionButton disabled={!device || mode === DimLEDModes.OFF} title="OFF" onPress={() => changeMode(DimLEDModes.OFF)} />
          <OptionButton disabled={!device || mode === DimLEDModes.ON_STRONG} title="ON STRONG" onPress={() => changeMode(DimLEDModes.ON_STRONG)} />
          <OptionButton disabled={!device || mode === DimLEDModes.ON_MILD} title="ON MILD" onPress={() => changeMode(DimLEDModes.ON_MILD)} />
          <OptionButton disabled={!device || mode === DimLEDModes.FLASH_SLOW} title="FLASH SLOW" onPress={() => changeMode(DimLEDModes.FLASH_SLOW)} />
          <OptionButton disabled={!device || mode === DimLEDModes.FLASH_FAST} title="FLASH FAST" onPress={() => changeMode(DimLEDModes.FLASH_FAST)} />
          <Button title="Disconnect" disabled={!device} titleStyle={styles.disconnectButtonTitle} onPress={disconnectHandler} />
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
