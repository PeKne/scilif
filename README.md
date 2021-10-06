# README
Demo aplication demostrating commucation of smartphone (*client*) with BLE devices (*servers*).

Based on [React Native](https://reactnative.dev/), with use of [Expo](https://docs.expo.dev/) framework.

Since Expo is not supporting Bluetooth communication yet, [expo development client](https://docs.expo.dev/clients/introduction/) in combination with [react-native-ble-plx](https://dotintent.github.io/react-native-ble-plx/) library is used. The _expo dev client_ is new Expo functionality allowing to build expo applications with third party packages (*react-native-ble-plx* in our case) without need of MacOS device.

Project is configured and tested running on physical Iphone SE device.


# TODO:
[ConnectionsScreen.js]
- add rssi ... device.getRssi()
- add mac address ... device.getId()
- select button green if device isConnected .... device.isConnected()
- add support for user defined names of devices (saved in app storage)


[TESTING]
- test all on iphone
- test bonding on iphone
- test production build permissions (does it ask to enable bluetooth)


