import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { ThemeProvider } from 'react-native-elements';
import { BleManager } from 'react-native-ble-plx';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import AppLoading from 'expo-app-loading';
import * as Font from 'expo-font';
import { FontAwesome } from '@expo/vector-icons';
import { Asset } from 'expo-asset';

import IntroScreen from './components/screens/IntroScreen';
import DevicesScreen from './components/screens/DevicesScreen';
import ControlScreen from './components/screens/ControlScreen';

import DevicesContextProvider from './redux/DevicesContextProvider';

import theme from './styles/theme';

import { requestLocationPermission } from './services/PermissionsService';



export default function App() {

  const Stack = createStackNavigator();

  // resources
  const [resourcesLoaded, setResourcesLoaded] = useState(false);
  // BLE manager
  const [manager, setManager] = useState(null);
  // permissions granted
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  useEffect(() => {
    // create BLE manager
    console.log('(BLE): New ble manager...');
    const newManager = new BleManager();
    setManager(newManager);

    const subscription = newManager.onStateChange((state) => {
      if (state === 'PoweredOn') subscription.remove();
    }, true);

    // check permissions
    console.log("(BLE): Requesting permissions...");
    requestLocationPermission().then((permissionsGranted) => {
      setPermissionsGranted(permissionsGranted);
      if (!permissionsGranted)
        console.warn("(BLE): Permissions not granted!!!");
    });
  }, []);

  return (
    !resourcesLoaded ?
      <AppLoading
        startAsync={_fetchResources}
        onFinish={() => setResourcesLoaded(true)}
        onError={console.warn}
      />
      :
      <DevicesContextProvider manager={manager}>
        <ThemeProvider theme={theme}>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false}}>

              <Stack.Screen name="Intro">{(props) =>
                <IntroScreen {...props}
                  permissionsGranted={permissionsGranted}
                />}
              </Stack.Screen>

              <Stack.Screen name="Devices">{(props) =>
                <DevicesScreen {...props} />}
              </Stack.Screen>

              <Stack.Screen name="Control">{(props) =>
                <ControlScreen {...props} />}
              </Stack.Screen>

            </Stack.Navigator>
          </NavigationContainer>
        </ThemeProvider>
      </DevicesContextProvider>
  // #endregion
  );
}

  // Preloads static resources before displaying incomplete APP
  const _fetchResources = async () => {
    const images = [require('../resources/images/logo.jpg')];
    const fonts = [FontAwesome.font];

    const fontAssets = fonts.map(font => Font.loadAsync(font));

    const imageAssets = images.map(image => {
      return Asset.fromModule(image).downloadAsync();
    }); 
    return Promise.all([...imageAssets, ...fontAssets]);
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
