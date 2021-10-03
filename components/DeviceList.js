import React from 'react';
import {
  RefreshControl, ActivityIndicator, FlatList, SafeAreaView, View, StyleSheet,
} from 'react-native';
import { Divider } from 'react-native-elements';
import { colors } from '../styles/theme';
import DeviceItem from './DeviceItem';

const wait = (timeout) => new Promise((resolve) => setTimeout(resolve, timeout));

export default function DeviceList({
  navigation, devices, scanDevices, connectDevice, ...props
}) {
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    scanDevices();
    setRefreshing(true);
    wait(1000).then(() => setRefreshing(false));
  }, []);

  const EmptyList = <View><ActivityIndicator size="large" /></View>;

  return (
    <SafeAreaView style={styles.wrapper}>
      <FlatList
        contentContainerStyle={devices.length === 0 ? styles.emptyList : styles.contentContainer}
        containerStyle={styles.wrapper}
        data={devices}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={(device) => <DeviceItem device={device} navigation={navigation} connectDevice={connectDevice} />}
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
