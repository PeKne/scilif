import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-elements';
import BatteryIndicator from './BatteryIndicator';

import * as utils from '../utils';

export default function DeviceCard({ device, readBatteryLevel, readBatteryCharge, monitorCharacteristic, ...props }) {

  const [batteryCharge, setBatteryCharge] = useState(null);

  const subscription = useRef(null);


  const monitorBatteryChargeHandler = () => {
    subscription.current = monitorCharacteristic(device.getBatteryChargeCharacteristic(), (value) => {
      console.log("Battery charge, value has changed.", utils.base64StrToHexStr(value));
      let batteryCharge = utils.base64StrToNumber(value);
      setBatteryCharge(batteryCharge);
    });
  }

  const readBatteryChargeHandler = async () => {
    try {
      let batteryCharge = await readBatteryCharge(device);
      setBatteryCharge(batteryCharge);
    }
    catch(error){
      console.warn("Error in reading battery charge");
      setBatteryCharge(null);
    }
  };


  useEffect(() => {
    if (device) {
      // read characterisitcs on start
      readBatteryChargeHandler();

      // monitor characteristics 
      monitorBatteryChargeHandler();

      return () => { // tear down function
        if (subscription.current){
          console.debug("Battery Charge subscription removed");
          subscription.current.remove();
        }
      };
    }
  }, [device]);

  return (
    <Card>
      <Card.Title style={styles.deviceTitle}>{device.device.name}</Card.Title>
      <Card.Divider />
      <View style={styles.layout}>
        <View style={styles.property}>
          <Text style={styles.propertyTitle}>BATTERY LEVEL:</Text>
          <BatteryIndicator device={device} readBatteryLevel={readBatteryLevel}/>
        </View>
        <View style={styles.property}>
          <Text style={styles.propertyTitle}>MCU TEMPERATURE:</Text>
          <Text style={styles.propertyTitle}> 25 °C</Text>
        </View>
        <View style={styles.property}>
          {
            batteryCharge !== null? 
              batteryCharge? 
                <Text style={styles.batteryCharging}> CHARGING DEVICE {"\n"} </Text>
              :
                <Text style={styles.batteryNotCharging}>DEVICE ON BATTERY {"\n"}</Text>
            : null
          } 
        </View>
      </View>

    </Card>
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
