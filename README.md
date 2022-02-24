# SCILIF SUNFIBRE Native App
Demo aplication demostrating commucation of smartphone (*client*) with [SCILIF SUNFIBRE](https://www.scilif.com/) BLE devices (*servers*).

Based on [React Native](https://reactnative.dev/), with use of [Expo](https://docs.expo.dev/) framework.

Since Expo is not supporting Bluetooth communication yet, [expo development client](https://docs.expo.dev/clients/introduction/) in combination with [react-native-ble-plx](https://dotintent.github.io/react-native-ble-plx/) library is used. The _expo dev client_ is new Expo functionality allowing to build expo applications with third party packages (*react-native-ble-plx* in our case) without need of MacOS device.

Project is configured and tested running on physical Iphone SE device and Android device OnePlus 7.

## Demostration
Very vague demostration of app functionality:
https://user-images.githubusercontent.com/26143964/155496807-cac9e525-d333-4e8a-a7ab-c60a35547dcb.mp4

Steps demostrated:
1. connection of app to BLE device
2. writing data to device memory
3. changing lightning mode  of device
4. disconnection of the device


