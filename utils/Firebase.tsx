import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import type { FirebaseError } from 'firebase/app';

export const getMembers = async () => {
	const querySnapshot = await firestore()
		.collection('members')
		.orderBy('name', 'asc')
		.get()
		.catch((e: any) => {
			const err = e as FirebaseError;
			//showSnackbar('Error getting all member list: ' + err.message);
			console.log(`Error getting all member list: ${err.message}`);
		});
	const membersAll = [];

	querySnapshot.forEach((doc) => {
		membersAll.push({
			key: doc.id,
			name: doc.data().name,
			memberNumber: doc.data().memberNumber,
			endDate: doc.data().endDate,
			profilePicture: doc.data().profilePicture,
		});
	});

	return membersAll;
};

export const getMemberNames = async () => {
	const querySnapshot = await firestore()
		.collection('members')
		.orderBy('name', 'asc')
		.get()
		.catch((e: any) => {
			const err = e as FirebaseError;
			//showSnackbar('Error getting member list: ' + err.message);
			console.log(`Error getting member list: ${err.message}`);
		});
	const membersName = [];

	querySnapshot.forEach((doc) => {
		if (!membersName.includes(doc.data().name))
			membersName.push(doc.data().name);
	});

	//console.log(membersName);
	return membersName;
};

export const getSingleMember = async (id: string) => {
	const docSnapshot = await firestore()
		.collection('members')
		.doc(id)
		.get()
		.catch((e: any) => {
			const err = e as FirebaseError;
			//showSnackbar('Getting profile failed: ' + err.message);
			console.log(`Getting profile failed: ${err.message}`);
		});
	//console.log(docSnapshot.data());
	return docSnapshot;
};

export const deleteDoc = async (id: string) => {
	await firestore()
		.collection('members')
		.doc(id)
		.delete()
		.catch((e: any) => {
			const err = e as FirebaseError;
			//showSnackbar('Doc deletion failed: ' + err.message);
			console.log(`Doc deletion failed: ${err.message}`);
			return false;
		});
	return true;
};

export const deleteMemberDoc = async (id: string) => {
	try {
		await deleteImage(id);
		await deleteDoc(id);
	} catch (e: any) {
		const err = e as FirebaseError;
		//showSnackbar('Member doc deletion failed: ' + err.message);
		console.log(`Member doc deletion failed: ${err.message}`);
		return false;
	}
	console.log('Deleted');
	return true;
};

export const checkDoc = async (id: string) => {
	console.log(id);
	let docCheck = false;
	const docRef = firestore().collection('members').doc(id);

	await docRef.get().then((doc) => {
		console.log(doc.data());
		console.log(doc.exists);
		if (doc.exists) docCheck = true;
	});
	return docCheck;
};

export const uploadImage = async (id: string, newImage: string) => {
	const reference = storage().ref(`profilePicture/${id}.jpg`);

	let image = '';

	if ((await reference.list()).items.length)
		image = await reference.getDownloadURL();

	// Delete previous picture if it is different from the placeholder
	// and current image
	if (
		image &&
		image !== process.env.EXPO_PUBLIC_PLACEHOLDER_PICTURE_URL &&
		image !== newImage
	) {
		await deleteImage(id);
	}
	if (
		newImage &&
		newImage !== process.env.EXPO_PUBLIC_PLACEHOLDER_PICTURE_URL
	) {
		// Upload picture to Firebase if it is different from the placeholder
		const task = reference.putFile(newImage);

		task.on('state_changed', (taskSnapshot) => {
			console.log(
				`${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`
			);
		});

		await task
			.then(() => {
				console.log('Image uploaded to the bucket!');
				//showSnackbar('Image uploaded to the bucket!');
			})
			.catch((e: any) => {
				const err = e as FirebaseError;
				//showSnackbar('Image upload failed: ' + err.message);
				console.log(`Image upload failed: ${err.message}`);
			});

		// Get download url
		const url = await reference.getDownloadURL();
		return url;
	}
	return null;
};

export const deleteImage = async (id: string) => {
	const reference = storage().ref(`profilePicture/${id}.jpg`);

	let image = '';

	if ((await reference.list()).items.length)
		image = await reference.getDownloadURL();

	if (image && image !== process.env.EXPO_PUBLIC_PLACEHOLDER_PICTURE_URL) {
		await reference
			.delete()
			.then(() => {
				console.log('File deleted!');
			})
			.catch((e: any) => {
				const err = e as FirebaseError;
				//showSnackbar('Image deletion failed: ' + err.message);
				console.log(`Image deletion failed: ${err.message}`);
				return false;
			});
	}
	return true;
};
