
import { SunFibreDevice } from '../models/SunFibreDevice';

export function devicesReducer (devices, action) {
	switch (action.type) {
		/**
		 * Either add new device to device list or if existing update its timestamp
		 * @param {*} device
		 */
		case 'SCANNED_DEVICE': {
			const device = action.payload;
			const existingDevice = devices.find((sfd) => sfd.getMAC() == device.id);

			// if (!existingDevice && device.isConnectable) {
			if (!existingDevice) {
				console.log('BLE: addDevice', device.id, device.name);
				return [...devices, new SunFibreDevice(device, null)];
			}

			if (existingDevice) {
				// refresh timestamp
				existingDevice.setLastSeenTimestamp(Date.now());
				return devices;
			}
		}

		case 'CONNECTED_DEVICE': {
			const device = action.payload.device;
			const existingDevice = devices.find((sfd) => sfd.getMAC() == device.id);

			if (!existingDevice) throw new Error('Device is not in devices list!');

			existingDevice.setConnected(true);
			existingDevice.setServicesCharacteristics(action.payload.servicesCharacteristics);
			return devices;
		}

		case 'DISCONNECTED_DEVICE': {
			const device = action.payload;
			const existingDevice = devices.find((sfd) => sfd.getMAC() == device.id);

			if (!existingDevice) 
				return devices;
			// throw new Error('Device is not in devices list!');

			//NOTE: this might be redundant - object will be deleted anyway
			existingDevice.setConnected(false);
			existingDevice.setServicesCharacteristics(null);

			// filter devices
			return devices.filter(d => d.getMAC() !== device.id);
		}

		case 'CLEAR':
			console.log("Clearing devices...");
			return devices.filter((dev) => dev.isConnected());

		default:
			throw new Error('Unsupported devicesReducer action received.');
	}
};
