
import * as BLE from '../services/BLEService';
import * as BLE_C from '../constants/BLEConstants';
import * as utils from '../services/UtilsService';

//TODO: preserve state of device
export class SunFibreDevice{

  
  constructor(device, servicesCharacteristics, connected=false){
    this.device = device;
    this.servicesCharacteristics = servicesCharacteristics;
    this.connected = connected;
    this.lastSeenTimestamp = Date.now();
  }

  getBLEDevice() {
    return this.device;
  }

  getRSSI(){
    return this.device.rssi;
  }

  getName(){
    return this.device.name;
  }

  getMAC(){
    return this.device.id;
  }

  getLastSeenTimestamp(){
    return this.lastSeenTimestamp;
  }

  setLastSeenTimestamp(timestamp){
    this.lastSeenTimestamp = timestamp;
  }


  isConnected(){
    return this.connected;
  }

  setConnected(connected){
    this.connected = connected;
  }

  setServicesCharacteristics(servicesCharacteristics){
    this.servicesCharacteristics = servicesCharacteristics;
  }

  getService(service){
    if (!this.servicesCharacteristics)
      throw new Error("Device does not possesses ser/chars!");
    return this.servicesCharacteristics[service];
  }


  getServicesCharacteristics(){
    return this.servicesCharacteristics;
  }

  getServiceCharacteristic(service, characteristicIndex){
    if (!this.servicesCharacteristics)
      throw new Error("Device does not possesses ser/chars!");

    return this.servicesCharacteristics[service][characteristicIndex];
  }


  // #region BLE functions
  /**
   * Promise to write dim LED char.
   * @param {*} sunFibreDevice: SunFibreDevice
   * @returns writePromise: Promise<Characteristic>
   */
  writeDimLEDCharacteristics(value) {
    console.log("(SFD): Writing Dim LED char.: ", value);
    const ch = this.getServiceCharacteristic(BLE_C.SERVICE_LED_CONTROL, BLE_C.CHARACTERISTIC_DIM_LED_IDX);
    console.log("(SFD): char.: ", ch.uuid, ch.deviceID, ch.serviceUUID);
    return BLE.writeCharacteristics(this.device, ch, value);
  }

  /**
   * Promise to read dim LED char. and parse them to integer
   * @param {*} sunFibreDevice: SunFibreDevice
   * @returns readPromise: Promise<number>
   */
  readDimLEDCharacteristics(){
    console.log("(SFD): Reading Dim LED char.");
    let ch = this.getServiceCharacteristic(BLE_C.SERVICE_LED_CONTROL, BLE_C.CHARACTERISTIC_DIM_LED_IDX);
    return BLE.readCharacteristics(this.device, ch).then(
      value => utils.base64StrToUInt8(value)
    );
  }

  readVLEDCharacteristics(){
    console.log("(SFD): Reading VLED char.");
    let ch = this.getServiceCharacteristic(BLE_C.SERVICE_LED_CONTROL, BLE_C.CHARACTERISTIC_VLED_IDX);
    return BLE.readCharacteristics(this.device, ch).then(
      value => utils.base64StrToInt16(value)
    );
  }

  readISNSCharacteristics(){
    console.log("(SFD): Reading ISNS char.");
    let ch = this.getServiceCharacteristic(BLE_C.SERVICE_LED_CONTROL, BLE_C.CHARACTERISTIC_ISNS_IDX);
    return BLE.readCharacteristics(this.device, ch).then(
      value => utils.base64StrToInt16(value)
    );
  }



  /**
   * Promise to read battery level char. and parse them to integer
   * @param {*} sunFibreDevice: SunFibreDevice
   * @returns readPromise: Promise<number>
   */
  readBatteryLevelCharacteristics() {
    console.log("(SFD): Reading Battery Level char.");
    let ch = this.getServiceCharacteristic(BLE_C.SERVICE_MAINTENANCE, BLE_C.CHARACTERISTIC_BATTERY_LEVEL_IDX);
    return BLE.readCharacteristics(this.device, ch).then(
      value => utils.base64StrToUInt8(value)
    );
  }

  readBatteryChargeCharacteristics() {
    console.log("(SFD):Reading Battery Charge char.");
    let ch = this.getServiceCharacteristic(BLE_C.SERVICE_MAINTENANCE, BLE_C.CHARACTERISTIC_BATTERY_CHARGING_IDX);
    return BLE.readCharacteristics(this.device, ch).then(
      value => utils.base64StrToUInt8(value)
    );
  }

  readTempratureCharacteristics() {
    console.log("(SFD): Reading temperature char.");
    let ch = this.getServiceCharacteristic(BLE_C.SERVICE_MAINTENANCE, BLE_C.CHARACTERISTIC_TEMPERATURE_IDX);
    return BLE.readCharacteristics(this.device, ch).then(
      value => utils.base64StrToInt32(value)
    );
  }
  // #endregion
}