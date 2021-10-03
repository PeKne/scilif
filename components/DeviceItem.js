import React from 'react';
import { StyleSheet } from 'react-native';
import { ListItem, Icon } from 'react-native-elements';

export default function DeviceItem({
  device, navigation, connectDevice, ...props
}) {
  const connectHandler = () => {
    connectDevice(device.item);
    navigation.navigate('Settings');
  };

  return (
    <ListItem
      key={device.index}
      chevron
      rightIcon={{ name: 'av-timer' }}
      onPress={connectHandler}
      style={styles.listItem}
      containerStyle={styles.listItemContainer}
    >
      <ListItem.Content style={styles}>
        <ListItem.Title>{device.item.device.name}</ListItem.Title>
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
