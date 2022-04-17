import React, { useEffect, useContext, useState } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { ListItem, Icon, Text } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Dialog from "react-native-dialog";


import { DevicesContext } from '../redux/DevicesContext';

import theme, {colors} from '../styles/theme';

export default function DeviceItem({deviceListItem, navigation, ...props}) {

  const { setSunFibreDeviceToControl, connectSunFibreDevice } = useContext(DevicesContext);

  const [deviceLoading, setDeviceLoading] = useState(false);
  const [connectionErrorDialogVisible, setConnectionErrorDialogVisible] = useState(false);
  const [deviceName, setDeviceName] = useState(deviceListItem.item.getName());

  const showConnectionErrorDialog = () => {
    setConnectionErrorDialogVisible(true);
  }
  const closeConnectionErrorDialog = () => {
    setConnectionErrorDialogVisible(false);
  }

  const onDeviceConnected = (sunFibreDevice) => {

    // select device at first
    setSunFibreDeviceToControl(sunFibreDevice);
    // navigate
    navigation.navigate('Control');
    // mark device as selected
    setDeviceLoading(false);
  }

  const connectHandler = () => {
    
    // extract SunFibreDevice object from list item
    let sfd = deviceListItem.item;
    // set device as selected
    console.log("(Connections-screen): Setting selected device...", sfd.getName(), sfd.getMAC());

    // connect to device if it is not connected
    if (!sfd.isConnected()){
      connectSunFibreDevice(sfd).then(
        () => onDeviceConnected(sfd),
        (error) => {
          console.error("(Connections-screen): Device cannot be connected", error);
          showConnectionErrorDialog();
        }
      );
    }

    else
      onDeviceConnected(sfd);
  };

  useEffect(() => {
    setDeviceLoading(false);
  }, [])

  useEffect(() => {
    const fetchDeviceName = async () => {
      const storedName = await readDeviceName(deviceListItem.item.getMAC());
      if (storedName) {
        setDeviceName(storedName)
      }
    }
    fetchDeviceName()

  }, [deviceListItem])

  const readDeviceName = async (device_mac) => {
    return await AsyncStorage.getItem(`@DEVICE__NAME:${device_mac}`)
  }

  const onDeviceSelected = () => {
    if (!deviceLoading){
      setDeviceLoading(true);
      connectHandler()
    }
  }

  return (
    <>
      <ListItem
        key={deviceListItem.index}
        chevron
        rightIcon={{ name: 'av-timer' }}
        onPress={onDeviceSelected}
        style={styles.listItem}
        containerStyle={styles.listItemContainer}
        disabled={deviceLoading}
      >
        <ListItem.Content style={styles}>
          <ListItem.Title>{deviceName}</ListItem.Title>
          <Text>MAC: {deviceListItem.item.getMAC()}</Text>
          <Text>RSSI: {deviceListItem.item.getRSSI()} dBm</Text>
        </ListItem.Content>
        {
          deviceLoading? 
          <ActivityIndicator size="small" color={colors.yellow} />
          :
          <Icon name="arrow-circle-right" size={25}  color={deviceListItem.item.isConnected() ? colors.battery5 : colors.primary } />
        }
      </ListItem>

      <Dialog.Container visible={connectionErrorDialogVisible} onBackdropPress={closeConnectionErrorDialog}>
        <Dialog.Title style={theme.dialogTitleText}>Device Connection</Dialog.Title>
        <Dialog.Description style={theme.dialogDescText}>
          Device cannot be connected. Please, try to refresh the list of devices.
        </Dialog.Description>
      </Dialog.Container>
    </>
  );
}

const styles = StyleSheet.create({
  listItem: {
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
    textAlign: 'center',
  },
  listItemContainer: {
    backgroundColor: '#000',
    width: '100%',
  },
});
