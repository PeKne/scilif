import {
  Platform,
  PermissionsAndroid
} from 'react-native';


export async function requestLocationPermission() {

	if (Platform.OS === "android" && Platform.Version >= 23) {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      ); 
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('(PermissionService): Location permission for bluetooth scanning granted');
        return true;
      }
      else {
        console.log('(PermissionService): Location permission for bluetooth scanning revoked');
        return false;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true;
}