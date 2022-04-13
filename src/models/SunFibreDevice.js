
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


  getServicesCharacteristics(){
    return this.servicesCharacteristics;
  }

  setServicesCharacteristics(servicesCharacteristics){
    this.servicesCharacteristics = servicesCharacteristics;
  }

  getDimLEDCharacteristic(){
    if (!this.servicesCharacteristics) return null;
    return this.servicesCharacteristics[BLE_C.SERVICE_LED_CONTROL][BLE_C.CHARACTERISTIC_DIM_LED_IDX];
  }

  getBatteryLevelCharacteristic(){
    if (!this.servicesCharacteristics) return null;
    return this.servicesCharacteristics[BLE_C.SERVICE_MAINTENANCE][BLE_C.CHARACTERISTIC_BATTERY_LEVEL_IDX];
  }

  getBatteryChargeCharacteristic(){
    if (!this.servicesCharacteristics) return null;
    return this.servicesCharacteristics[BLE_C.SERVICE_MAINTENANCE][BLE_C.CHARACTERISTIC_BATTERY_CHARGING_IDX];
  }

  getTemperatureCharacteristic(){
    if (!this.servicesCharacteristics) return null;
    return this.servicesCharacteristics[BLE_C.SERVICE_MAINTENANCE][BLE_C.CHARACTERISTIC_TEMPERATURE_IDX];
  }



  // #region BLE functions
  /**
   * Promise to write dim LED char.
   * @param {*} sunFibreDevice: SunFibreDevice
   * @returns writePromise: Promise<Characteristic>
   */
  writeDimLEDCharacteristics(value) {
    console.log("(SFD): Writing Dim LED char.: ", value);
    const ch = this.getDimLEDCharacteristic();
    if (!ch) throw new Error("Device does not possesses requested characteristic!");
    return BLE.writeCharacteristics(this.device, ch, value);
  }

  /**
   * Promise to read dim LED char. and parse them to integer
   * @param {*} sunFibreDevice: SunFibreDevice
   * @returns readPromise: Promise<number>
   */
  readDimLEDCharacteristics(){
    console.log("(SFD): Reading Dim LED char.");
    const ch = this.getDimLEDCharacteristic();
    if (!ch) throw new Error("Device does not possesses requested characteristic!");

    return BLE.readCharacteristics(this.device, ch).then(
      value => utils.base64StrToUInt8(value)
    );
  }

  /**
   * Promise to read battery level char. and parse them to integer
   * @param {*} sunFibreDevice: SunFibreDevice
   * @returns readPromise: Promise<number>
   */
  readBatteryLevelCharacteristics() {
    console.log("(SFD): Reading Battery Level char.");
    const ch = this.getBatteryLevelCharacteristic();
    if (!ch) throw new Error("Device does not possesses requested characteristic!");

    return BLE.readCharacteristics(this.device, ch).then(
      value => utils.base64StrToUInt8(value)
    );
  }

  readBatteryChargeCharacteristics() {
    console.log("(SFD):Reading Battery Charge char.");
    const ch = this.getBatteryChargeCharacteristic();
    if (!ch) throw new Error("Device does not possesses requested characteristic!");

    return BLE.readCharacteristics(this.device, ch).then(
      value => utils.base64StrToUInt8(value)
    );
  }

  readTempratureCharacteristics() {
    console.log("(SFD): Reading temperature char.");
    const ch = this.getTemperatureCharacteristic();
    if (!ch) throw new Error("Device does not possesses requested characteristic!");

    return BLE.readCharacteristics(this.device, ch).then(
      value => utils.base64StrToInt32(value)
    );
  }
  // #endregion


}