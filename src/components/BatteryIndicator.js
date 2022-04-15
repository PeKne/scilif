import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Icon } from 'react-native-elements';

export default function BatteryIndicator({ batteryLevel, ...props }) {
  return (
    batteryLevel && (
    <View style={styles.wrapper}>
      <Icon name={batteryLevel.icon} color={batteryLevel.color} size={14} />
      <Text style={{ color: batteryLevel.color, fontSize: 15 }}>
        {`  ${batteryLevel.value}`}
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
