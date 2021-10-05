import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-elements';
import BatteryIndicator from './BatteryIndicator';

export default function DeviceCard({ device, readBattery, ...props }) {
  return (
    <Card>
      <Card.Title>{device.device.name}</Card.Title>
      <Card.Divider />
      <View>
        <View style={styles.property}>
          <Text style={styles.propertyTitle}>Battery level:</Text>
          <BatteryIndicator device={device} readBattery={readBattery} />
        </View>
      </View>

    </Card>
  );
}

const styles = StyleSheet.create({
  property: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  propertyTitle: {
    fontSize: 16,
  },
});
