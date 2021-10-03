import React, { useReducer, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Icon } from 'react-native-elements';
import { colors } from '../styles/theme';

export default function BatteryIndicator({ device, readBattery, ...props }) {
  const batteryReducer = (prevState, action) => {
    switch (action) {
      case 1:
        return { value: 20, color: colors.battery1, icon: 'battery-empty' };
      case 2:
        return { value: 40, color: colors.battery2, icon: 'battery-quarter' };
      case 3:
        return { value: 60, color: colors.battery3, icon: 'battery-half' };
      case 4:
        return { value: 80, color: colors.battery4, icon: 'battery-three-quarters' };
      case 5:
        return { value: 100, color: colors.battery5, icon: 'battery-full' };
      default:
        return prevState;
    }
  };

  const [batteryState, dispatchBattery] = useReducer(batteryReducer, null);
  const readBatteryHandler = () => {
    readBattery(device).then(
      (value) => {
        dispatchBattery(5); // #FIXME
      },
    );
  };

  useEffect(() => {
    if (device) {
      readBatteryHandler();
      const interval = setInterval(() => readBatteryHandler(), 15000); // periodically read battery

      return () => { // tear down function
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
        {`  ${batteryState.value}%`}
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
