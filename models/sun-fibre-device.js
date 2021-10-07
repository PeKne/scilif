
//TODO: preserve state of device
import * as BLE from '../ble-constants';

export class SunFibreDevice{

  
  constructor(device, servicesCharacteristics, connected=false){
    this.device = device;
    this.servicesCharacteristics = servicesCharacteristics;
    this.connected = connected;
    this.lastSeenTimestamp = Date.now();
  }

  getDevice() {
    return this.device;
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
    return this.servicesCharacteristics[BLE.SERVICE_LED_CONTROL][BLE.CHARACTERISTIC_DIM_LED_IDX];
  }

  getBatteryLevelCharacteristic(){
    if (!this.servicesCharacteristics) return null;
    return this.servicesCharacteristics[BLE.SERVICE_MAINTENANCE][BLE.CHARACTERISTIC_BATTERY_LEVEL_IDX];
  }

  getBatteryChargeCharacteristic(){
    if (!this.servicesCharacteristics) return null;
    return this.servicesCharacteristics[BLE.SERVICE_MAINTENANCE][BLE.CHARACTERISTIC_BATTERY_CHARGING_IDX];
  }

  getTemperatureCharacteristic(){
    if (!this.servicesCharacteristics) return null;
    return this.servicesCharacteristics[BLE.SERVICE_MAINTENANCE][BLE.CHARACTERISTIC_TEMPERATURE_IDX];
  }

}