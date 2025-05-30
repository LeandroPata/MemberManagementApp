import * as ImagePicker from 'expo-image-picker';

// Ask the user for the permission to access the camera
export const askPermission = async () => {
	const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

	return permissionResult.granted;
};

export const launchGallery = async () => {
	try {
		// No permissions request is necessary for launching the image library
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: 'images',
			allowsMultipleSelection: false,
			allowsEditing: true,
			quality: 0.5,
			aspect: [3, 4],
		});

		//console.log(result);

		if (!result.canceled) {
			return result.assets[0].uri;
		}
		return '';
	} catch (e: any) {
		//showSnackbar('Picking picture failed: ' + e.message);
		console.log(`Picking picture failed: ${e.message}`);
		return '';
	}
};

export const launchCamera = async () => {
	try {
		const result = await ImagePicker.launchCameraAsync({
			mediaTypes: 'images',
			allowsMultipleSelection: false,
			allowsEditing: true,
			quality: 0.5,
			aspect: [3, 4],
		});

		//console.log(result);

		if (!result.canceled) {
			//console.log(result.assets[0].uri);
			return result.assets[0].uri;
		}
	} catch (e: any) {
		//showSnackbar('Taking picture failed: ' + e.message);
		console.log(`Taking picture failed: ${e.message}`);
		return '';
	}
	return '';
};
