import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, Icon } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Dialog from "react-native-dialog";

import BatteryIndicator from './BatteryIndicator';

import * as utils from '../services/UtilsService';
import * as BLE from '../services/BLEService';

export default function DeviceCard({ device, ...props }) {

  const [batteryCharge, setBatteryCharge] = useState(null);
  const [temperature, setTemperature] = useState(null);

  const [promptVisible, setPromptVisible] = useState(false);
  const [deviceName, setDeviceName] = useState(device.device.name);
  const [dialogInput, setDialogInput] = useState(device.device.name);

  const subscription = useRef(null);
  const pollInterval = useRef(null);

  useEffect(() => {
    const fetchDeviceName = async () => {
      const storedName = await readDeviceName(device.getMAC());
      if (storedName) {
        setDeviceName(storedName)
        setDialogInput(storedName)
      }
    }
    fetchDeviceName()
  }, [device])

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
    await storeDeviceName(device.getMAC(), dialogInput)
    const value = await AsyncStorage.getItem('@storage_Key')
    setDeviceName(dialogInput)
  }

  const storeDeviceName = async (device_mac, nickname) => {
    await AsyncStorage.setItem(`@DEVICE__NAME:${device_mac}`, nickname)
  }

  const readDeviceName = async (device_mac) => {
    return await AsyncStorage.getItem(`@DEVICE__NAME:${device_mac}`)
  }

  const monitorBatteryChargeHandler = () => {
    subscription.current = BLE.monitorCharacteristic(device.getBatteryChargeCharacteristic(), (value) => {
      console.log("Battery charge, value has changed.", utils.base64StrToHexStr(value));
      let batteryCharge = utils.base64StrToUInt8(value);
      setBatteryCharge(batteryCharge);
    });
  }

  const readBatteryChargeHandler = async () => {
    try {
      let batteryCharge = await device.readBatteryChargeCharacteristics();
      setBatteryCharge(batteryCharge);
    }
    catch (error) {
      console.warn("(Settings-screen): Error in reading battery charge", error.message);
      setBatteryCharge(null);
    }
  };

  const readTemperatureHandler = async () => {
    try {
      let temperature = await device.readTempratureCharacteristics();
      setTemperature(temperature);
    }
    catch (error) {
      console.warn("(Settings-screen): Error in reading temperature", error.message);
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
          console.debug("(Settings-screen): Battery Charge subscription removed");
          subscription.current.remove();
        }
      };
    }
  }, [device]);

  return (
    <>
      <Card>
        <Card.Title style={styles.deviceTitle}>{deviceName} {"  "} <Icon name={"pencil"} size={18} onPress={showDialog}/> </Card.Title>
        <Card.Divider />
        <View style={styles.layout}>
          <View style={styles.property}>
            <Text style={styles.propertyTitle}>Battery Level:</Text>
            <BatteryIndicator device={device}/>
          </View>
          <View style={styles.property}>
            <Text style={styles.propertyTitle}>MCU Temperature:</Text>
            <Text style={styles.propertyTitle}> {temperature ?? '?'} °C</Text>
          </View>
          <View style={styles.property}>
            {
              batteryCharge !== null ?
                batteryCharge ?
                  <Text style={styles.batteryCharging}> Charging Device{"\n"} </Text>
                  :
                  <Text style={styles.batteryNotCharging}>Device On Battery{"\n"}</Text>
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
        <Dialog.Button label="Save" onPress={handleDialogSubmit} />
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
  },
});
