import { createContext } from 'react';

export const DevicesContext = createContext(
	{
		controlledDevice: null, 
		devices: [],
		connectSunFibreDevice : () => console.error("Implementation needed"),
		disconnectSunFibreDevice : () => console.error("Implementation needed"),
		startScanningSunFibreDevices : () => console.error("Implementation needed"),
		stopScanningSunFibreDevices : () => console.error("Implementation needed"),
		clearSunFibreDevices:  () => console.error("Implementation needed"),
		setSunFibreDeviceToControl: () => console.error("Implementation needed"),
	}
);

