import React, { useEffect, useState } from 'react';
import {
  StyleSheet, View,
} from 'react-native';
import { Text } from 'react-native-elements';
import Dialog from "react-native-dialog";

import DeviceList from '../components/DeviceList';
import StatusBar from '../components/StatusBar';
import theme, { colors } from '../styles/theme';

export default function ConnectionsScreen({
  navigation, startScanDevices, stopScanDevices, clearDevices, connectDevice, devices, setSelectedDevice, ...props
}) {

  const [scanErrorDialogVisible, setScanErrorDialogVisible] = useState(false);

  const showScanErrorDialog = () => setScanErrorDialogVisible(true);

  const closeScanErrorDialog = () => {
    setScanErrorDialogVisible(false);
    navigation.navigate('Intro');
  }

  const onScanErrorHandler = (error) => {
    if (error.message === "BluetoothLE is powered off"){
      showScanErrorDialog();
    }
    else {
      console.error("(BLE): scan unhandled error", error.message);
    }
  }

  useEffect(() => {
      startScanDevices(onScanErrorHandler);
    return () => stopScanDevices(); // tear down function
  }, []);

  return (
    <>
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

      {/* "ENABLE BLE POPUP" */}
      <Dialog.Container visible={scanErrorDialogVisible} onBackdropPress={closeScanErrorDialog}>
        <Dialog.Title style={theme.dialogTitleText}>Device Scan</Dialog.Title>
        <Dialog.Description style={theme.dialogDescText}>
          Devices cannot be scanned. Please, turn on BLE.
        </Dialog.Description>
      </Dialog.Container>

    </>
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
