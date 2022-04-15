import * as BLE_C from '../constants/BLEConstants';
import * as utils from './UtilsService';




// #region LAYER: react-native-ble-plx 
export function connect(device) {
  return new Promise(async (resolve, reject) => {
    try {
      // wait until connected
      let connectedDevice = await device.connect({timeout: BLE_C.DEVICE_CONNECT_TIMEOUT});
      console.log(`BLE: Device ${device.name} connected...`);
      resolve(connectedDevice);
    }
    catch (error) {
      if (error.message === "Operation was cancelled")
        console.warn('WARN (BLE) connection timeout');
      else
        console.error('ERROR (BLE) connect:', error);
      reject(new Error("Connect failed"));
    }
  });
}

export function disconnect(device) {
  return new Promise(async (resolve, reject) => {
    try {
      let disconnectedDevice = await device.cancelConnection();
      console.log(`(BLE): Device ${device.name} disconnected...`);
      resolve(disconnectedDevice);
    } catch (error) {
      console.error('ERROR (BLE) disconnect:', error);
      reject(new Error("Disconnect failed"));
    }
  });
}

export function getServicesAndCharacteristics(device) {
  console.log('BLE: Getting services & characteristics...');

  return new Promise(async (resolve, reject) => {
    try {
      // discover all services and characteristics
      await device.discoverAllServicesAndCharacteristics();
      // await device ble services and filter
      let services = await device.services();
      services = services.filter((s) => BLE_C.DEVICE_SERVICES.includes(s.uuid));

      // map services and characteristics
      // NOTE: important to use for instead of forEach
      const serviceCharacteristics = {};
      for (const s of services) {
        serviceCharacteristics[s.uuid] = [];
        const characteristics = await s.characteristics();
        characteristics.forEach((ch) => {
          serviceCharacteristics[s.uuid].push(ch);
        });
      }
      resolve(serviceCharacteristics);
    } catch (error) {
      console.error('ERROR (BLE) connect:', error);
    }
  });
}

export function writeCharacteristics(device, characteristic, value) {
  return new Promise((resolve, reject) => {
    characteristic.writeWithResponse(utils.binaryArrayToBase64Str([value])).then(
      () => resolve(characteristic),
      (error) => {
        // if (error.message.endsWith("was disconnected")){
        //   console.warn("(BLE): Disconnect in characteristics write...");
        //   throw new Error(error);
        // }
        // else{
          console.error("(BLE) error - writeCharacteristics:", error.message);
          reject(new Error("Write failed"));
        // }
      }
    );
  });
}

// export function readCharacteristics(device, characteristic) {

//   return new Promise(async (resolve, reject) => {

//     try {
//       //NOTE: this must be assigned to a new variable 
//       let readCharacteristics = await characteristic.read();
//       console.log('(BLE) readCharacteristics: ', characteristic.uuid, utils.base64StrToHexStr(readCharacteristics.value));
//       resolve(utils.base64StrToBinaryArray(readCharacteristics.value));
//     } catch (error) {
//       console.error('ERROR (BLE) readCharacteristics:', error.message);
//       reject(new Error("Read failed"));
//     }
//   });
// }

export function readCharacteristics(device, characteristic) {

  return new Promise((resolve, reject) => {
    try {
      //NOTE: this must be assigned to a new variable 
      characteristic.read().then(
        (readCharacteristics) => {
          // console.log('(BLE) readCharacteristics: ', characteristic.uuid, utils.base64StrToHexStr(readCharacteristics.value));
          resolve(utils.base64StrToBinaryArray(readCharacteristics.value));
        }
      )
    } catch (error) {
      console.error('ERROR (BLE) readCharacteristics:', error.message);
      reject(new Error("(BLE): readCharacteristics failed"));
    }
  });
}

export function monitorCharacteristic(device, serviceUUID, characteristicUUID, onCharacteristicValueChangeHandler, onCharacteristicValueErrorHandler){

  return device.monitorCharacteristicForService(serviceUUID, characteristicUUID, (error, characteristic) => {
    if (error === null){
      console.log(`(BLE): Monitor ${characteristic.uuid}, value has changed: ${utils.base64StrToHexStr(characteristic.value)}`);
      onCharacteristicValueChangeHandler(characteristic.value);
    }
    else if (error.message === "Operation was cancelled") return;
    else if (error.message.endsWith("was disconnected")) return;
    else {
      console.error("(BLE) Error in monitoring", error.message);
      if (onCharacteristicValueErrorHandler) 
        onCharacteristicValueErrorHandler(error);
    }
  })
}

export function monitorDisconnection(device, onDeviceDisconnectedHandler){
  console.log(`(BLE): Device ${device.name} listening disconnections...`);

  return device.onDisconnected((error, d) => {
    if (error === null){
      console.log(`(BLE): monitorDisconnection - device ${device.name} disconnected.`);
      onDeviceDisconnectedHandler(device);
    }
    else {
      console.error("(BLE) Error in disconnection", error.message);
    }
  });
}
//#endregion
