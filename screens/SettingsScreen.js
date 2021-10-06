import React, { useEffect, useReducer, useRef } from 'react';
import {
  StyleSheet, View, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { Text, Button } from 'react-native-elements';
import StatusBar from '../components/StatusBar';
import { colors } from '../styles/theme';

import DeviceCard from '../components/DeviceCard';

import * as utils from '../utils';

export default function SettingsScreen({
  navigation,
  device, setSelectedDevice,
  disconnectDevice,
  writeDimLED, readDimLED, readBatteryLevel, readBatteryCharge,
  monitorCharacteristic,
   ...props

}) {

  const modeReducer = (mode, action) => {
    switch (action) {
      case 'SET_OFF':
        writeDimLED(device, 0x0);
        return 'OFF';
      case 'SET_ON_STRONG':
        writeDimLED(device, 0x1);
        return 'ON_STRONG';
      case 'SET_ON_MILD':
        writeDimLED(device, 0x2);
        return 'ON_MILD';
      case 'SET_FLASH':
        writeDimLED(device, 0x3);
        return 'FLASH';
      case 'SET_UNKNOWN':
        return 'UNKNOWN';
      default:
        throw new Error('Unsupported modeReducer action received.');
    }
  };

  const modeActionLookup = (mode) => {
    switch(mode){
      case 0x0: return 'SET_OFF';
      case 0x1: return 'SET_ON_STRONG';
      case 0x2: return 'SET_ON_MILD';
      case 0x3: return 'SET_FLASH';
      default:  return 'SET_UNKNOWN';
    }
  }
  // mode of device
  const [mode, dispatchMode] = useReducer(modeReducer, 'SET_UNKNOWN');

  const subscription = useRef(null);


  //#region BLE Handlers
  const readDimLEDHandler = async () => {
    try {
      let dimLEDMode = await readDimLED(device);
      dispatchMode(modeActionLookup(dimLEDMode));
    }
    catch(error){
      console.warn("Error in reading Dim LED mode");
      dispatchBattery('SET_UNKNOWN');
    }
  };

  const monitorDimLEDHandler = () => {
    subscription.current = monitorCharacteristic(device.getDimLEDCharacteristic(), (value) => {
      console.log("Dim LED, value has changed.", utils.base64StrToHexStr(value));
      let dimLEDMode = utils.base64StrToNumber(value);
      dispatchMode(modeActionLookup(dimLEDMode));
    });
  }

  const disconnectHandler = () => {
    disconnectDevice(device);
    navigation.navigate('Intro');
    // TODO: popup message DEVICE DISCONNECTED
  };

  //#endregion


  const OptionButton = (props) => <Button type="outline" disabledStyle={device ? styles.activatedButton : null} disabledTitleStyle={device ? styles.activeButtonTitle : null} {...props} />;


  // unselect device at the end
  useEffect(() => {

    if (device){
      readDimLEDHandler();
      monitorDimLEDHandler();
    }

    return () => {
      if (subscription.current){
        console.debug("Dim LED subscription removed");
        subscription.current.remove();
      }
      setSelectedDevice(null); // tear down function
    }
  }, []);

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar navigation={navigation} />
      <Text h1>Device Control</Text>

      <View style={styles.deviceInfoWrapper}>
        {device ? 
          <DeviceCard 
            device={device}
            readBatteryLevel={readBatteryLevel}
            readBatteryCharge={readBatteryCharge}
            monitorCharacteristic={monitorCharacteristic}
          /> 
          : <ActivityIndicator size="large" />
        }
      </View>

      <View style={styles.buttonWrapper}>
        <OptionButton disabled={!device || mode === 'OFF'} title="OFF" onPress={() => dispatchMode('SET_OFF')} />
        <OptionButton disabled={!device || mode === 'ON_STRONG'} title="ON STRONG" onPress={() => dispatchMode('SET_ON_STRONG')} />
        <OptionButton disabled={!device || mode === 'ON_MILD'} title="ON MILD" onPress={() => dispatchMode('SET_ON_MILD')} />
        <OptionButton disabled={!device || mode === 'FLASH'} title="FLASH MODE" onPress={() => dispatchMode('SET_FLASH')} />
        <Button title="Disconnect" disabled={!device} titleStyle={styles.disconnectButtonTitle} onPress={disconnectHandler} />
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#000',
    flex: 1,
    justifyContent: 'center',
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: '15%',
    marginVertical: '12%',
  },
  text: {
    textAlign: 'center',
  },
  deviceInfoWrapper: {
    marginTop: '15%',
    marginHorizontal: '5%',
    height: '20%',
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
