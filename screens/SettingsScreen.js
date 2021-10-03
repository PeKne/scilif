import React from 'react';
import {
  StyleSheet, View, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { Text, Button } from 'react-native-elements';
import StatusBar from '../components/StatusBar';
import { colors } from '../styles/theme';

import DeviceCard from '../components/DeviceCard';

export default function SettingsScreen({
  device, mode, dispatchMode, navigation, disconnectDevice, readBattery, ...props
}) {
  const disconnectHandler = () => {
    disconnectDevice(device);
    navigation.navigate('Intro');
    // TODO: popup message DEVICE DISCONNECTED
  };

  const OptionButton = (props) => <Button type="outline" disabledStyle={device ? styles.activatedButton : null} disabledTitleStyle={device ? styles.activeButtonTitle : null} {...props} />;

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar navigation={navigation} />
      <Text h1>Device Control</Text>

      <View style={styles.deviceInfoWrapper}>
        {device ? 
          <DeviceCard device={device} readBattery={readBattery} />
          : <ActivityIndicator size="large" />}
      </View>

      <View style={styles.buttonWrapper}>
        <OptionButton disabled={!device || mode === 'OFF'} title="OFF" onPress={() => dispatchMode('SET_OFF')} />
        <OptionButton disabled={!device || mode === 'ON_MILD'} title="ON MILD" onPress={() => dispatchMode('SET_ON_MILD')} />
        <OptionButton disabled={!device || mode === 'ON_STRONG'} title="ON STRONG" onPress={() => dispatchMode('SET_ON_STRONG')} />
        <OptionButton disabled={!device || mode === 'FLASH'} title="FLASH MODE" onPress={() => dispatchMode('SET_FLASH')} />
        <Button title="Disconnect" disabled={!device} titleStyle={styles.disconnectButtonTitle} onPress={disconnectHandler} />
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#000',
    flex: 1,
    justifyContent: 'center',
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: '15%',
    marginVertical: '12%',
  },
  text: {
    textAlign: 'center',
  },
  deviceInfoWrapper: {
    marginTop: '5%',
    marginHorizontal: '5%',
    height: '20%',
    textAlign: 'center',
    justifyContent: 'center',
  },
  disconnectButtonTitle: {
    textTransform: 'uppercase',
    fontSize: 20,
    color: colors.red,
  },
  activatedButton: {
    borderWidth: 2,
    borderColor: colors.yellow,

  },
  activeButtonTitle: {
    color: colors.yellow,
  },
});
