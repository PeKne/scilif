
import * as utils from './UtilsService';


export const DEVICE_NAMES = ["SunFibre", "BlueIoToy"];
export const SERVICE_LED_CONTROL = "0000aaaa-1212-efde-1523-785fef13d123";
export const SERVICE_MAINTENANCE = "0000aaaa-1413-f0df-1624-7960f014d224";
export const DEVICE_SERVICES = [SERVICE_LED_CONTROL, SERVICE_MAINTENANCE];

// CONNECTIONS
export const DEVICE_CONNECT_TIMEOUT = 2000; //ms

// LED Control service
export const CHARACTERISTIC_DEBUG_LED_IDX = 0;
export const CHARACTERISTIC_DIM_LED_IDX = 1;
// Maintenance service
export const CHARACTERISTIC_BATTERY_LEVEL_IDX = 0;
export const CHARACTERISTIC_BATTERY_CHARGING_IDX = 1;
export const CHARACTERISTIC_TEMPERATURE_IDX = 2;


// POLLING
export const BATTERY_REFRESH_INTERVAL = 30000;
export const TEMPERATURE_REFRESH_INTERVAL = 30000;



// #region LAYER: react-native-ble-plx 
export function connect(device) {
  return new Promise(async (resolve, reject) => {
    try {
      // wait until connected
      let connectedDevice = await device.connect({timeout: DEVICE_CONNECT_TIMEOUT});
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
      services = services.filter((s) => DEVICE_SERVICES.includes(s.uuid));

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
  return new Promise(async (resolve, reject) => {
    try {
      await characteristic.writeWithResponse(utils.binaryArrayToBase64Str([value]));
      resolve(characteristic);
    } catch (error) {
      // if (error.message.endsWith("was disconnected")){
      //   console.warn("(BLE): Disconnect in characteristics write...");
      //   throw new Error(error);
      // }
      // else{
        console.error("ERROR (BLE) writeCharacteristics:", error.message);
        reject(new Error("Write failed"));
      // }
    }
  });
}

export function readCharacteristics(device, characteristic) {

  return new Promise(async (resolve, reject) => {

    try {
      //NOTE: this must be assigned to a new variable 
      let readCharacteristics = await characteristic.read();
      console.log('(BLE) readCharacteristics: ', characteristic.uuid, utils.base64StrToHexStr(readCharacteristics.value));
      resolve(utils.base64StrToBinaryArray(readCharacteristics.value));
    } catch (error) {
      console.error('ERROR (BLE) readCharacteristics:', error.message);
      reject(new Error("Read failed"));
    }
  });
}

export function monitorCharacteristic(characteristic, onCharacteristicValueChange, onCharacteristicValueError){
  return characteristic.monitor((error, characteristic) => {
    if (error === null){
      console.log(`(BLE): Monitor ${characteristic.uuid}, value has changed: ${utils.base64StrToHexStr(characteristic.value)}`);
      onCharacteristicValueChange(characteristic.value);
    }
    else if (error.message === "Operation was cancelled") return;
    else if (error.message.endsWith("was disconnected")) return;
    else {
      console.error("(BLE) Error in monitoring", error.message);
      if (onCharacteristicValueError) 
        onCharacteristicValueError(error);
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
