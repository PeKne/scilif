import React from 'react';
import { StyleSheet } from 'react-native';
import { ListItem, Icon } from 'react-native-elements';

export default function DeviceItem({
  deviceListItem, navigation, connectDevice, onDeviceDisconnected, setSelectedDevice, ...props
}) {
  const connectHandler = async () => {

    // extract SunFibreDevice object from list item
    let sfd = deviceListItem.item;

    // set device as selected
    console.log("Setting selected device...", sfd.getDevice().name);
    // connect to device if it is not connected
    if (!sfd.isConnected()){
      await connectDevice(sfd);
      // onDeviceDisconnected(sfd.getDevice());
    }

    setSelectedDevice(sfd);


    // navigate
    navigation.navigate('Settings');
  };

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
      </ListItem.Content>
      <Icon name="arrow-circle-right" size={25} />
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
    width: '80%',
  },
});
