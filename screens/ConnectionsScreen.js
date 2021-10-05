import React, { useEffect } from 'react';
import {
  StyleSheet, View,
} from 'react-native';
import { Text } from 'react-native-elements';
import DeviceList from '../components/DeviceList';

import StatusBar from '../components/StatusBar';
import { colors } from '../styles/theme';

export default function ConnectionsScreen({
  navigation, startScanDevices, stopScanDevices, clearDevices, connectDevice, devices, setSelectedDevice, ...props
}) {
  useEffect(() => {
    startScanDevices();
    // const interval = setInterval(() => scanDevices(), 3000); // periodically fetch devices

    // return () => clearInterval(interval); // tear down function
    return () => stopScanDevices(); // tear down function
  }, []);

  // console.log(devices);

  return (

    <View style={styles.screen}>
      <Text>{devices.length}</Text>
      <StatusBar navigation={navigation} />
      <Text h1 style={styles.text}>Select Device:</Text>
      <DeviceList navigation={navigation} devices={devices}
        startScanDevices={startScanDevices}
        stopScanDevices={stopScanDevices}
        clearDevices={clearDevices}
        connectDevice={connectDevice}
        setSelectedDevice={setSelectedDevice}
      />

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
