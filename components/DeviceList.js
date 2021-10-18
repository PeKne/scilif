import React from 'react';
import {
  RefreshControl, ActivityIndicator, FlatList, SafeAreaView, View, StyleSheet,
} from 'react-native';
import { Divider } from 'react-native-elements';
import { colors } from '../styles/theme';
import DeviceItem from './DeviceItem';

const wait = (timeout) => new Promise((resolve) => setTimeout(resolve, timeout));

const REFRESH_INTERVAL = 1000;

export default function DeviceList({
  navigation, devices, startScanDevices, stopScanDevices, clearDevices, connectDevice, setSelectedDevice, ...props
}) {
  const [refreshing, setRefreshing] = React.useState(false);

  //TODO: more UI stuff - might be redundant
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    clearDevices();
    wait(REFRESH_INTERVAL).then(() => {
      setRefreshing(false);
    });
  }, []);

  const EmptyList = <View><ActivityIndicator size="large" /></View>;

  return (
    <SafeAreaView style={styles.wrapper}>
      <FlatList
        contentContainerStyle={devices.length === 0 ? styles.emptyList : styles.contentContainer}
        containerStyle={styles.wrapper}
        data={devices}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={(deviceListItem) => 
          <DeviceItem 
            navigation={navigation}
            deviceListItem={deviceListItem}
            connectDevice={connectDevice}
            setSelectedDevice={setSelectedDevice}
          />}
        keyExtractor={(item) => item.device.id}
        ListEmptyComponent={EmptyList}
        ItemSeparatorComponent={Divider}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    marginTop: '3%',
  },

});
