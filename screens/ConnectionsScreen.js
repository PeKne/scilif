import React, { useEffect } from 'react';
import {
  StyleSheet, View,
} from 'react-native';
import { Text } from 'react-native-elements';
import DeviceList from '../components/DeviceList';

import StatusBar from '../components/StatusBar';
import { colors } from '../styles/theme';

export default function ConnectionsScreen({
  navigation, scanDevices, connectDevice, devices, ...props
}) {
  useEffect(() => {
    scanDevices();
    const interval = setInterval(() => scanDevices(), 3000); // periodically fetch devices

    return () => clearInterval(interval); // tear down function
  }, []);

  console.log(devices);

  return (

    <View style={styles.screen}>
      <Text>{devices.length}</Text>
      <StatusBar navigation={navigation} />
      <Text h1 style={styles.text}>Select Device:</Text>
      <DeviceList navigation={navigation} devices={devices} scanDevices={scanDevices} connectDevice={connectDevice} />

    </View>

  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  text: {
    color: colors.primary,
    textAlign: 'center',
  },
});
