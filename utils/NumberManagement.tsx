import type { FirebaseError } from 'firebase/app';
import firestore from '@react-native-firebase/firestore';

export const getLastNumber = async (): Promise<number> => {
	try {
		const querySnapshot = await firestore()
			.collection('members')
			.orderBy('memberNumber', 'desc')
			.limit(1)
			.get();

		return querySnapshot.docs[0].data().memberNumber++ || 0;
	} catch (e: any) {
		const err = e as FirebaseError;
		//showSnackbar('Assigning member number failed: ' + err.message);
		console.log(`Assigning member number failed: ${err.message}`);
		return 0;
	}
};

export const getAssignNumber = async (curNumber: number) => {
	const numCheck = checkNumber(curNumber);
	console.log(numCheck);

	try {
		const querySnapshot = await firestore()
			.collection('members')
			.orderBy('memberNumber', 'asc')
			.get();

		let minNumber = 0;
		let i = 1;
		// biome-ignore lint/complexity/noForEach:<Method that returns iterator necessary>
		querySnapshot.forEach((documentSnapshot) => {
			if (numCheck <= 1 && i === curNumber) {
				minNumber = i;
			} else if (i === Number(documentSnapshot.data().memberNumber)) {
				i = Number(documentSnapshot.data().memberNumber) + 1;
			}
		});
		if (!minNumber) {
			minNumber = i;
		}
		return minNumber;
	} catch (e: any) {
		const err = e as FirebaseError;
		//showSnackbar('Getting number to assign to member failed: ' + err.message);
		console.log(`Getting number to assign to member failed: ${err.message}`);
	}
};

export const checkNumber = async (curNumber: number) => {
	try {
		let numberAvailable = 1;
		const querySnapshot = await firestore()
			.collection('members')
			.orderBy('memberNumber', 'asc')
			.get();

		// biome-ignore lint/complexity/noForEach:<Method that returns iterator necessary>
		querySnapshot.forEach((documentSnapshot) => {
			if (curNumber === documentSnapshot.data().memberNumber) {
				numberAvailable++;
			}
		});

		//console.log(`Result: ${numberAvailable}`);
		return numberAvailable;
	} catch (e: any) {
		const err = e as FirebaseError;
		//showSnackbar('Checking number failed: ' + err.message);
		console.log(`Checking number number failed: ${err.message}`);
		return 0;
	}
};
