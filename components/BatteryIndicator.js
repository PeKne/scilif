import React, { useReducer, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Icon } from 'react-native-elements';
import { colors } from '../styles/theme';

import * as BLE from '../ble-constants';

export default function BatteryIndicator({ device, readBatteryLevel, ...props }) {

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
  const [batteryState, dispatchBattery] = useReducer(batteryReducer, null);

  const readBatteryLevelHandler = async () => {
    try {
      let batteryLevel = await readBatteryLevel(device);
      dispatchBattery(batteryLevel);
    }
    catch(error){
      console.warn("Error in reading battery level");
      dispatchBattery(-1);
    }
  };

  useEffect(() => {
    if (device) {
      // read characterisitcs on start
      readBatteryLevelHandler();
      const interval = setInterval(() => readBatteryLevelHandler(), BLE.BATTERY_REFRESH_INTERVAL); // periodically read battery

      return () => { 
        dispatchBattery(null);
        clearInterval(interval);
      };
    }
  }, [device]);

  return (
    batteryState && (
    <View style={styles.wrapper}>
      <Icon name={batteryState.icon} color={batteryState.color} size={14} />
      <Text style={{ color: batteryState.color, fontSize: 15 }}>
        {`  ${batteryState.value}`}
      </Text>
    </View>
    ));
}

const styles = StyleSheet.create(
  {
    wrapper: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
  },
);
