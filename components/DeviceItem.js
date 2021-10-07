import React, { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { ListItem, Icon } from 'react-native-elements';

import {colors} from '../styles/theme';

export default function DeviceItem({
  deviceListItem, navigation, connectDevice, monitorDisconnection, setSelectedDevice, ...props
}) {

  const onDisconnectedSubscription = useRef(null);

  const connectHandler = async () => {

    // extract SunFibreDevice object from list item
    let sfd = deviceListItem.item;

    // set device as selected
    console.log("Setting selected device...", sfd.getDevice().name);
    // connect to device if it is not connected
    if (!sfd.isConnected()){
      await connectDevice(sfd);
      onDisconnectedSubscription.current = monitorDisconnection(sfd.getDevice());
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
    <ListItem
      key={deviceListItem.index}
      chevron
      rightIcon={{ name: 'av-timer' }}
      onPress={connectHandler}
      style={styles.listItem}
      containerStyle={styles.listItemContainer}
    >
      <ListItem.Content style={styles}>
        <ListItem.Title>{deviceListItem.item.device.name}</ListItem.Title>
        <ListItem.Subtitle>MAC: {deviceListItem.item.device.id}</ListItem.Subtitle>
        <ListItem.Subtitle>RSSI: {deviceListItem.item.device.rssi}</ListItem.Subtitle>
      </ListItem.Content>
      <Icon name="arrow-circle-right" size={25}  color={deviceListItem.item.isConnected() ? colors.battery5 : colors.primary } />
    </ListItem>
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
