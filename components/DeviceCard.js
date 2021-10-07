import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, Icon } from 'react-native-elements';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import Dialog from "react-native-dialog";

import BatteryIndicator from './BatteryIndicator';

import * as utils from '../utils';
import * as BLE from '../ble-constants';

export default function DeviceCard({ device, readBatteryLevel, readBatteryCharge, readTemperature, monitorCharacteristic, ...props }) {

  const [batteryCharge, setBatteryCharge] = useState(null);
  const [temperature, setTemperature] = useState(null);
  const [promptVisible, setPromptVisible] = useState(false);
  const [deviceName, setDeviceName] = useState(device.device.name);
  const [dialogInput, setDialogInput] = useState(device.device.name);

  const subscription = useRef(null);
  const pollInterval = useRef(null);

  const pollTemperatureHandler = () => {
    pollInterval.current = setInterval(() => readTemperatureHandler(), BLE.TEMPERATURE_REFRESH_INTERVAL); // periodically read battery
  }

  const hideDialog = () => {
    setPromptVisible(false)
  }

  const showDialog = () => {
    setPromptVisible(true)
  }

  const handleDialogSubmit = async () => {
    hideDialog();
    // await AsyncStorage.setItem(f`@DEVICE:${device.device.id}`, value)
    setDeviceName(dialogInput)
  }

  const storeData = async (value) => {
    try {
      await AsyncStorage.setItem('@storage_Key', value)
    } catch (e) {
      // saving error  
    }
  }

  const monitorBatteryChargeHandler = () => {
    subscription.current = monitorCharacteristic(device.getBatteryChargeCharacteristic(), (value) => {
      console.log("Battery charge, value has changed.", utils.base64StrToHexStr(value));
      let batteryCharge = utils.base64StrToUInt8(value);
      setBatteryCharge(batteryCharge);
    });
  }

  const readBatteryChargeHandler = async () => {
    try {
      let batteryCharge = await readBatteryCharge(device);
      setBatteryCharge(batteryCharge);
    }
    catch (error) {
      console.warn("Error in reading battery charge");
      setBatteryCharge(null);
    }
  };

  const readTemperatureHandler = async () => {
    try {
      let temperature = await readTemperature(device);
      setTemperature(temperature);
    }
    catch(error){
      console.warn("Error in reading temperature");
      setTemperature(null);
    }
  };


  useEffect(() => {
    if (device) {
      // read characterisitcs on start
      readBatteryChargeHandler();
      readTemperatureHandler();
      // monitor characteristics 
      monitorBatteryChargeHandler();
      // periodically read temperature
      pollTemperatureHandler();


      return () => { // tear down function
        if (pollInterval.current)
          clearInterval(pollInterval.current);
        if (subscription.current) {
          console.debug("Battery Charge subscription removed");
          subscription.current.remove();
        }
      };
    }
  }, [device]);

  return (
    <>
      <Card>
        <Card.Title style={styles.deviceTitle}>{deviceName} {"  "} <Icon name={"pencil"} size={18} onPress={showDialog} /> </Card.Title>
        <Card.Divider />
        <View style={styles.layout}>
          <View style={styles.property}>
            <Text style={styles.propertyTitle}>BATTERY LEVEL:</Text>
            <BatteryIndicator device={device} readBatteryLevel={readBatteryLevel} />
          </View>
          <View style={styles.property}>
            <Text style={styles.propertyTitle}>MCU TEMPERATURE:</Text>
            <Text style={styles.propertyTitle}> {temperature ?? '?'} °C</Text>
          </View>
          <View style={styles.property}>
            {
              batteryCharge !== null ?
                batteryCharge ?
                  <Text style={styles.batteryCharging}> CHARGING DEVICE {"\n"} </Text>
                  :
                  <Text style={styles.batteryNotCharging}>DEVICE ON BATTERY {"\n"}</Text>
                : null
            }
          </View>
        </View>

      </Card>
      <Dialog.Container onBackdropPress={hideDialog} visible={promptVisible}> 
        <Dialog.Title>Rename device</Dialog.Title>
        <Dialog.Description>
          Please enter new name of the device
        </Dialog.Description>
        <Dialog.Input onChangeText={setDialogInput} value={dialogInput} />
        <Dialog.Button label="Save" onPress={handleDialogSubmit}/>
        <Dialog.Button label="Cancel" onPress={hideDialog} />
      </Dialog.Container>
    </>
  );
}

const styles = StyleSheet.create({

  layout: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },

  property: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 5
  },
  propertyTitle: {
    fontSize: 16,
  },
  deviceTitle: {
    fontSize: 22
  },

  batteryCharging: {
    fontSize: 16,
    color: "#00ff00",
  },

  batteryNotCharging: {
    fontSize: 16,
    color: "#ff0000",
  }
});
