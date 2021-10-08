import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { ListItem, Icon, Text } from 'react-native-elements';
import Dialog from "react-native-dialog";

import {colors} from '../styles/theme';

export default function DeviceItem({
  deviceListItem, navigation, connectDevice, monitorDisconnection, setSelectedDevice, ...props
}) {

  const [connectionErrorDialogVisible, setConnectionErrorDialogVisible] = useState(false);

  const onDisconnectedSubscription = useRef(null);

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
    console.log("Setting selected device...", sfd.getName(), sfd.getMAC(), sfd.getRSSI());

    // connect to device if it is not connected
    if (!sfd.isConnected()){
      try {
        await connectDevice(sfd);
        onDisconnectedSubscription.current = monitorDisconnection(sfd.getBLEDevice());
      }
      catch(error){
        console.error("(UI): Device cannot be connected");
        showConnectionErrorDialog();
        return;
      }
    }

    setSelectedDevice(sfd);
    // navigate
    navigation.navigate('Settings');
  };

  useEffect(() => {
    return () => {
      if (onDisconnectedSubscription.current)
        onDisconnectedSubscription.current.remove();
    } 
  }, []);


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
          <ListItem.Title>{deviceListItem.item.getName()}</ListItem.Title>
          <Text>MAC: {deviceListItem.item.getMAC()}</Text>
          <Text>RSSI: {deviceListItem.item.getRSSI()} dBm</Text>
        </ListItem.Content>
        <Icon name="arrow-circle-right" size={25}  color={deviceListItem.item.isConnected() ? colors.battery5 : colors.primary } />
      </ListItem>

      <Dialog.Container visible={connectionErrorDialogVisible} onBackdropPress={closeConnectionErrorDialog}>
        <Dialog.Title>Device Connection</Dialog.Title>
        <Dialog.Description>
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
