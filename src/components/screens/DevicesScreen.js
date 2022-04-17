import React, { useEffect, useState, useContext } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from 'react-native-elements';
import Dialog from "react-native-dialog";

import DeviceList from '../DeviceList';
import StatusBar from '../StatusBar';

import { DevicesContext } from '../../redux/DevicesContext';

import theme, { colors } from '../../styles/theme';


export default function DevicesScreen({navigation, ...props}) {

  const { devices, startScanningSunFibreDevices, stopScanningSunFibreDevices } = useContext(DevicesContext);

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
    startScanningSunFibreDevices(onScanErrorHandler);
    return () => stopScanningSunFibreDevices(); 
  }, []);

  return (
    <>
      <View style={styles.screen}>
        <Text>{devices.length}</Text>
        <StatusBar navigation={navigation} />
        <Text h1 style={styles.text}>Select Device:</Text>
        <DeviceList navigation={navigation}/>
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
