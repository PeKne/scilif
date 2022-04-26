export const DEVICE_NAMES = ["SunFibre", "BlueIoToy"];

export const SERVICE_LED_CONTROL = "0000aaaa-1212-efde-1523-785fef13d123";
export const SERVICE_MONITOR = "0000aaaa-1413-f0df-1624-7960f014d224";
export const SERVICE_RFID = "0000aaaa-1514-f1e0-1725-7a61f115d325";
export const SERVICE_DIS = "0000180a-0000-1000-8000-00805f9b34fb";

export const DEVICE_SERVICES = [SERVICE_LED_CONTROL, SERVICE_MONITOR, SERVICE_RFID, SERVICE_DIS];

// CONNECTIONS
export const DEVICE_CONNECT_TIMEOUT = 8000; //ms

// LED Control service
export const CHARACTERISTIC_DIM_LED_IDX = 0;
export const CHARACTERISTIC_DEBUG_LED_IDX = 1;
export const CHARACTERISTIC_VLED_IDX = 2;
export const CHARACTERISTIC_ISNS_IDX = 3;

// MONITOR service
export const CHARACTERISTIC_BATTERY_LEVEL_IDX = 0;
export const CHARACTERISTIC_BATTERY_CHARGING_IDX = 1;
export const CHARACTERISTIC_TEMPERATURE_IDX = 2;

// RFID service
export const CHARACTERISTIC_RFID_DETECTED_TAG_ID_IDX = 0;
export const CHARACTERISTIC_RFID_PAIRED_TAG_ID_IDX = 1;
export const CHARACTERISTIC_RFID_ENABLED_IDX = 2;

// DIS service
export const CHARACTERISTIC_DIS_FW_HW_VERSION = 1;


// POLLING
export const MONITOR_REFRESH_VLED_ISNS_INTERVAL = 5000;
export const MONITOR_REFRESH_TEMPERATURE_INTERVAL = 20000;
export const RFID_MONITOR_REFRESH_INTERVAL = 30000;
export const SETTINGS_REFRESH_INTERVAL = 15000;