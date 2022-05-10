import * as BLE_C from '../constants/BLEConstants';
import * as utils from './UtilsService';




// #region LAYER: react-native-ble-plx 
export const connect = (device) => {
  return device.connect({timeout: BLE_C.DEVICE_CONNECT_TIMEOUT}).then(
    (device) => { console.log(`BLE: Device ${device.name} connected...`); return device; },
    (error) => {
      if (error.message === "Operation was cancelled")
        console.warn('WARN (BLE) connection timeout');
      else
        console.error('ERROR (BLE) connect:', error);
      throw new Error(error);
    }
  );
}

export const disconnect = (device) => {
  return device.cancelConnection().then(
    (device) => { console.log(`(BLE): Device ${device.name} disconnected...`); return device; },
    (error) => {
      console.error('ERROR (BLE) disconnect:', error);
      throw new Error("Disconnect Failed");
    }
  );
}

export const getServicesAndCharacteristics = (device) => {
  console.log('BLE: Getting services & characteristics...');

  return new Promise(async (resolve, reject) => {
    try {
      // discover all services and characteristics
      await device.discoverAllServicesAndCharacteristics();
      // await device ble services and filter
      let services = await device.services();
      console.log(services.map(s => s.uuid))
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

export const writeCharacteristics = (device, characteristic, value_base64) => {
  return characteristic.writeWithResponse(value_base64).catch(
    (error) => {
      if (error.message.endsWith("was disconnected")){
        console.log("(BLE): Disconnect during characteristics write...");
      }
      else{
        console.error("(BLE) error - writeCharacteristics:", error.message);
        throw new Error("(BLE): WriteCharacteristics failed");
      }
    }
  );
}

export const readCharacteristics = (device, characteristic) => {
  return characteristic.read().then(
    (readCharacteristics) => utils.base64StrToBinaryArray(readCharacteristics.value),
    (error) => {
      if (error.message.endsWith("was disconnected")){
        console.log("(BLE): Disconnect during characteristics read...");
      }
      else{
        console.error('ERROR (BLE) readCharacteristics:', error.message);
        throw new Error("(BLE): readCharacteristics failed");
      }
    }
  )
}

export const monitorCharacteristic = (device, serviceUUID, characteristicUUID, onCharacteristicValueChangeHandler, onCharacteristicValueErrorHandler) => {

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

export const monitorDisconnection = (device, onDeviceDisconnectedHandler) => {
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
