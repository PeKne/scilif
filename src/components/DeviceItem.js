import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { ListItem, Icon, Text } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Dialog from "react-native-dialog";

import theme, {colors} from '../styles/theme';

export default function DeviceItem({
  deviceListItem, navigation, connectDevice, setSelectedDevice, ...props
}) {

  const [connectionErrorDialogVisible, setConnectionErrorDialogVisible] = useState(false);
  const [deviceName, setDeviceName] = useState(deviceListItem.item.getName());

  const showConnectionErrorDialog = () => {
    setConnectionErrorDialogVisible(true);
  }
  const closeConnectionErrorDialog = () => {
    setConnectionErrorDialogVisible(false);
  }

  const connectHandler = async () => {

    // extract SunFibreDevice object from list item
    let sfd = deviceListItem.item;
    // set device as selected
    console.log("(Connections-screen): Setting selected device...", sfd.getName(), sfd.getMAC());

    // select device at first
    setSelectedDevice(sfd);

    // connect to device if it is not connected
    if (!sfd.isConnected()){
      try {
        await connectDevice(sfd);
      }
      catch(error){
        console.error("(Connections-screen): Device cannot be connected");
        showConnectionErrorDialog();
        return;
      }
    }
    // navigate
    navigation.navigate('Settings');
  };

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

  return (
    <>
      <ListItem
        key={deviceListItem.index}
        chevron
        rightIcon={{ name: 'av-timer' }}
        onPress={connectHandler}
        style={styles.listItem}
        containerStyle={styles.listItemContainer}
      >
        <ListItem.Content style={styles}>
          <ListItem.Title>{deviceName}</ListItem.Title>
          <Text>MAC: {deviceListItem.item.getMAC()}</Text>
          <Text>RSSI: {deviceListItem.item.getRSSI()} dBm</Text>
        </ListItem.Content>
        <Icon name="arrow-circle-right" size={25}  color={deviceListItem.item.isConnected() ? colors.battery5 : colors.primary } />
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
