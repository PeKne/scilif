import React, { useContext } from 'react';
import { RefreshControl, ActivityIndicator, FlatList, SafeAreaView, View, StyleSheet } from 'react-native';
import { Divider } from 'react-native-elements';

import DeviceItem from './DeviceItem';

import { DevicesContext } from '../redux/DevicesContext';

import { colors } from '../styles/theme';

const wait = (timeout) => new Promise((resolve) => setTimeout(resolve, timeout));

const REFRESH_INTERVAL = 1000;

export default function DeviceList({navigation, ...props}) {

  const { devices, clearSunFibreDevices, startScanningSunFibreDevices } = useContext(DevicesContext);

  const [refreshing, setRefreshing] = React.useState(false);

  //TODO: more UI stuff - might be redundant
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    clearSunFibreDevices();
    startScanningSunFibreDevices();
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
