
export const DEVICE_NAME = "SunFibre";
export const SERVICE_LED_CONTROL = "0000aaaa-1212-efde-1523-785fef13d123";
export const SERVICE_MAINTENANCE = "0000aaaa-1413-f0df-1624-7960f014d224";
export const DEVICE_SERVICES = [SERVICE_LED_CONTROL, SERVICE_MAINTENANCE];

// LED Control service
export const CHARACTERISTIC_DEBUG_LED_IDX = 0;
export const CHARACTERISTIC_DIM_LED_IDX = 1;
// Maintenance service
export const CHARACTERISTIC_BATTERY_LEVEL_IDX = 0;
export const CHARACTERISTIC_BATTERY_CHARGING_IDX = 1;
export const CHARACTERISTIC_TEMPERATURE_IDX = 2;