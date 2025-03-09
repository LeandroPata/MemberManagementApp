import React, { useState } from 'react';
import {
	View,
	StyleSheet,
	KeyboardAvoidingView,
	Pressable,
	ScrollView,
	Keyboard,
} from 'react-native';
import {
	Button,
	TextInput,
	Switch,
	Avatar,
	Text,
	Portal,
	Modal,
	useTheme,
	HelperText,
	Checkbox,
} from 'react-native-paper';
import DatePicker from 'react-native-date-picker';
import * as ImagePicker from 'expo-image-picker';
import type { FirebaseError } from 'firebase/app';
import firestore, { Timestamp } from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { useTranslation } from 'react-i18next';
import SnackbarInfo from '@/components/SnackbarInfo';
import YearPicker from '@/components/YearPicker';

export default function AddMember() {
	const theme = useTheme();
	const { t } = useTranslation();

	const [autoNumber, setAutoNumber] = useState(true);
	const [paid, setPaid] = useState(false);

	const [loading, setLoading] = useState(false);

	const [nameError, setNameError] = useState(false);
	const [memberNumberError, setMemberNumberError] = useState(false);
	const [emailError, setEmailError] = useState(false);

	const [birthDateModal, setBirthDateModal] = useState(false);
	const [paidDateModal, setPaidDateModal] = useState(false);

	const [pictureModal, setPictureModal] = useState(false);

	const [name, setName] = useState('');
	const [memberNumber, setMemberNumber] = useState('');
	const [email, setEmail] = useState('');
	const [phoneNumber, setPhoneNumber] = useState('');
	const [occupation, setOccupation] = useState('');
	const [country, setCountry] = useState('');
	const [address, setAddress] = useState('');
	const [zipCode, setZipCode] = useState('');
	const [birthDate, setBirthDate] = useState(new Date());
	const [paidDate, setPaidDate] = useState(new Date());
	const [endDate, setEndDate] = useState(new Date().getFullYear());
	const [profilePicture, setProfilePicture] = useState(
		process.env.EXPO_PUBLIC_PLACEHOLDER_PICTURE_URL
	);

	// All the logic to implement the snackbar
	const [snackbarVisible, setSnackbarVisible] = useState(false);
	const [snackbarText, setSnackbarText] = useState('');

	const showSnackbar = (text: string) => {
		setSnackbarText(text);
		setSnackbarVisible(true);
	};
	const onDismissSnackbar = () => setSnackbarVisible(false);

	// All the logic to implement the YearPicker
	const [endDateModal, setEndDateModal] = useState(false);

	const onYearReceived = (year: number) => {
		setEndDate(year);
	};

	const emailRegex = /.+@.+\..+/g;
	let minNumber = 0;

	const assignMemberNumber = async () => {
		try {
			await firestore()
				.collection('members')
				.orderBy('memberNumber', 'asc')
				.get()
				.then((querySnapshot) => {
					let i = 1;
					// biome-ignore lint/complexity/noForEach:<Method that returns iterator necessary>
					querySnapshot.forEach((documentSnapshot) => {
						if (i === Number(memberNumber.trim())) {
							minNumber = i;
						} else if (i === Number(documentSnapshot.data().memberNumber)) {
							i = Number(documentSnapshot.data().memberNumber) + 1;
						}
					});
					if (!minNumber) {
						minNumber = i;
					}
					setMemberNumber(minNumber.toString());
				});
		} catch (e: any) {
			const err = e as FirebaseError;
			//showSnackbar('Assigning member number failed: ' + err.message);
			console.log(`Assigning member number failed: ${err.message}`);
		}
	};

	const checkNumber = async () => {
		try {
			let numberAvailable = 1;
			await firestore()
				.collection('members')
				.orderBy('memberNumber', 'asc')
				.get()
				.then((querySnapshot) => {
					// biome-ignore lint/complexity/noForEach:<Method that returns iterator necessary>
					querySnapshot.forEach((documentSnapshot) => {
						if (memberNumber.trim() === documentSnapshot.data().memberNumber) {
							numberAvailable++;
							console.log(t('addMember.memberNumberUnavailable'));
						}
					});
				});
			//console.log('Result: ' + numberAvailable);
			return numberAvailable;
		} catch (e: any) {
			const err = e as FirebaseError;
			//showSnackbar('Checking number failed: ' + err.message);
			console.log(`Checking number number failed: ${err.message}`);
		}
	};

	const pickImage = async () => {
		setPictureModal(false);

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
				setProfilePicture(result.assets[0].uri);
			}
		} catch (e: any) {
			const err = e as FirebaseError;
			//showSnackbar('Picking picture failed: ' + err.message);
			console.log(`Picking picture failed: ${err.message}`);
		}
	};

	const takePicture = async () => {
		setPictureModal(false);

		try {
			// Ask the user for the permission to access the camera
			const permissionResult =
				await ImagePicker.requestCameraPermissionsAsync();

			if (permissionResult.granted === false) {
				showSnackbar(t('addMember.cameraPermission'));
				return;
			}

			const result = await ImagePicker.launchCameraAsync({
				mediaTypes: 'images',
				allowsMultipleSelection: false,
				allowsEditing: true,
				quality: 0.5,
				aspect: [3, 4],
			});

			//console.log(result);

			if (!result.canceled) {
				setProfilePicture(result.assets[0].uri);
			}
		} catch (e: any) {
			const err = e as FirebaseError;
			//showSnackbar('Taking picture failed: ' + err.message);
			console.log(`Taking picture failed: ${err.message}`);
		}
	};

	const uploadPicture = async (docID) => {
		if (
			profilePicture &&
			profilePicture !== process.env.EXPO_PUBLIC_PLACEHOLDER_PICTURE_URL
		) {
			// Upload picture to Firebase if it is different from the placeholder

			const reference = storage().ref(`profilePicture/${docID}.jpg`);

			const task = reference.putFile(profilePicture);

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
					//showSnackbar('File upload failed: ' + err.message);
					console.log(`File upload failed: ${err.message}`);
					setLoading(false);
				});

			// Get download url
			const url = await reference.getDownloadURL();
			//console.log(url);
			setProfilePicture(url);
			return url;
		}
		return null;
	};

	const addMember = async () => {
		setLoading(true);
		Keyboard.dismiss();

		if (!name.trim()) {
			showSnackbar(t('addMember.nameError'));
			setNameError(true);
			setLoading(false);
			return;
		}

		if (email?.trim() && !email.match(emailRegex)) {
			showSnackbar(t('addMember.emailError'));
			setEmailError(true);
			setLoading(false);
			return;
		}

		if (autoNumber) {
			await assignMemberNumber();
		} else if (!memberNumber.trim()) {
			showSnackbar(t('addMember.memberNumberError'));
			setMemberNumberError(true);
			setLoading(false);
			return;
		} else {
			const numberAvailable = await checkNumber();
			if (numberAvailable > 1) {
				showSnackbar(t('addMember.memberNumberExists'));
				setMemberNumberError(true);
				setLoading(false);
				return;
			}
			minNumber = Number(memberNumber.trim());
			setMemberNumber(minNumber.toString());
		}

		const docRef = firestore().collection('members').doc();

		const url = await uploadPicture(docRef.id);

		try {
			docRef
				.set({
					name: name.trim(),
					memberNumber: minNumber,
					email: email.trim(),
					phoneNumber: phoneNumber.trim(),
					occupation: occupation.trim(),
					country: country.trim(),
					address: address.trim(),
					zipCode: zipCode.trim(),
					birthDate: Timestamp.fromDate(birthDate),
					addedDate: Timestamp.fromDate(new Date()),
					paidDate: paid ? Timestamp.fromDate(paidDate) : null,
					endDate: paid ? endDate : 0,
					profilePicture: url ? url : profilePicture,
				})
				.then(() => {
					console.log('Added');
					setName('');
					setMemberNumber('');
					setEmail('');
					setPhoneNumber('');
					setOccupation('');
					setCountry('');
					setAddress('');
					setZipCode('');
					setBirthDate(new Date());
					setPaidDate(new Date());
					setEndDate(new Date().getFullYear());
					setProfilePicture(process.env.EXPO_PUBLIC_PLACEHOLDER_PICTURE_URL);
				});
		} catch (e: any) {
			const err = e as FirebaseError;
			console.log(`Adding member failed: ${err.message}`);
			//showSnackbar('Adding member failed: ' + err.message);
			setLoading(false);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<Portal>
				<Modal
					visible={pictureModal}
					onDismiss={() => {
						setPictureModal(false);
					}}
					style={styles.modalContainer}
					contentContainerStyle={[
						styles.modalContentContainer,
						{ backgroundColor: theme.colors.primaryContainer },
					]}
				>
					<Button
						style={styles.button}
						contentStyle={styles.buttonContent}
						labelStyle={styles.buttonText}
						icon='file-image'
						mode='elevated'
						onPress={pickImage}
					>
						{t('addMember.gallery')}
					</Button>
					<Button
						style={styles.button}
						contentStyle={styles.buttonContent}
						labelStyle={styles.buttonText}
						icon='camera'
						mode='elevated'
						onPress={takePicture}
					>
						{t('addMember.camera')}
					</Button>
				</Modal>
			</Portal>

			<YearPicker
				visible={endDateModal}
				onDismiss={() => {
					setEndDateModal(false);
				}}
				onConfirm={onYearReceived}
			/>

			<SnackbarInfo
				text={snackbarText}
				visible={snackbarVisible}
				onDismiss={onDismissSnackbar}
			/>

			<View style={styles.container}>
				<ScrollView>
					<KeyboardAvoidingView style={{ paddingHorizontal: 10 }}>
						<Pressable
							style={styles.pictureButton}
							onPress={() => {
								setPictureModal(true);
							}}
						>
							<Avatar.Image
								size={200}
								style={{ alignSelf: 'center' }}
								source={{ uri: profilePicture }}
							/>
						</Pressable>

						<View
							style={{
								flexDirection: 'row',
								flexWrap: 'wrap',
								justifyContent: 'space-between',
							}}
						>
							<View
								style={{
									flexDirection: 'row',
									justifyContent: 'center',
									alignItems: 'center',
									flex: 2,
								}}
							>
								<Text
									style={[
										styles.title,
										{
											fontSize: 15,
											color: theme.colors.onBackground,
											maxWidth: '80%',
										},
									]}
								>
									{t('addMember.autoNumber')}
								</Text>
								<Switch
									value={autoNumber}
									onValueChange={(input) => {
										setAutoNumber(input);
										setMemberNumberError(false);
									}}
								/>
							</View>
							<TextInput
								disabled={autoNumber}
								style={[styles.input, { flex: 3 }]}
								value={memberNumber}
								onChangeText={(input) => {
									setMemberNumber(input.replace(/[^0-9]/g, ''));
								}}
								onEndEditing={() => {
									if (!autoNumber && !memberNumber.trim()) {
										setMemberNumberError(true);
									} else setMemberNumberError(false);
									setMemberNumber(memberNumber.trim());
								}}
								maxLength={6}
								error={memberNumberError}
								autoCapitalize='none'
								keyboardType='numeric'
								label={t('addMember.memberNumber')}
							/>
						</View>

						<TextInput
							style={styles.input}
							value={name}
							onChangeText={setName}
							onEndEditing={() => {
								if (!name.trim()) {
									setNameError(true);
								} else setNameError(false);
								setName(name.trim());
							}}
							error={nameError}
							autoCapitalize='words'
							keyboardType='default'
							label={t('addMember.name')}
						/>
						{nameError ? (
							<HelperText
								type='error'
								visible={nameError}
								style={styles.errorHelper}
							>
								{t('addMember.nameError')}
							</HelperText>
						) : null}

						<TextInput
							style={styles.input}
							value={email}
							onChangeText={setEmail}
							onEndEditing={() => {
								if (email?.trim() && !email.match(emailRegex)) {
									setEmailError(true);
								} else setEmailError(false);
								setEmail(email.trim());
							}}
							error={emailError}
							autoCapitalize='none'
							keyboardType='email-address'
							label={t('addMember.email')}
						/>
						{emailError ? (
							<HelperText
								type='error'
								visible={emailError}
								style={styles.errorHelper}
							>
								{t('addMember.emailError')}
							</HelperText>
						) : null}

						<TextInput
							style={styles.input}
							value={phoneNumber}
							onChangeText={(input) => {
								setPhoneNumber(input.replace(/[^0-9+\-\s]/g, ''));
							}}
							onEndEditing={() => {
								setPhoneNumber(phoneNumber.trim());
							}}
							autoCapitalize='none'
							inputMode='tel'
							keyboardType='phone-pad'
							label={t('addMember.phoneNumber')}
						/>
						<TextInput
							style={styles.input}
							value={occupation}
							onChangeText={setOccupation}
							onEndEditing={() => {
								setOccupation(occupation.trim());
							}}
							autoCapitalize='sentences'
							inputMode='text'
							keyboardType='default'
							label={t('addMember.occupation')}
						/>
						<TextInput
							style={styles.input}
							value={country}
							onChangeText={setCountry}
							onEndEditing={() => {
								setCountry(country.trim());
							}}
							autoCapitalize='sentences'
							inputMode='text'
							keyboardType='default'
							label={t('addMember.country')}
						/>
						<TextInput
							style={styles.input}
							value={address}
							onChangeText={setAddress}
							onEndEditing={() => {
								setAddress(address.trim());
							}}
							autoCapitalize='sentences'
							inputMode='text'
							keyboardType='default'
							label={t('addMember.address')}
						/>
						<TextInput
							style={styles.input}
							value={zipCode}
							onChangeText={(input) => {
								setZipCode(input.replace(/[^0-9\-]/g, ''));
								if (input.length > 4 && !input.includes('-')) {
									let a = input.substring(0, 4);
									const b = input.substring(4);
									a = a.concat('-');
									input = a.concat(b);
									setZipCode(input);
								}
							}}
							onEndEditing={() => {
								setZipCode(zipCode.trim());
							}}
							maxLength={8}
							autoCapitalize='none'
							inputMode='numeric'
							keyboardType='number-pad'
							label={t('addMember.zipCode')}
						/>

						<>
							<Button
								style={{ marginVertical: 5 }}
								labelStyle={styles.dateText}
								onPress={() => setBirthDateModal(true)}
							>
								{`${t('addMember.birthDate')}: ${birthDate.toLocaleDateString(
									'pt-pt'
								)}`}
							</Button>
							<DatePicker
								modal
								mode='date'
								locale='pt-pt'
								open={birthDateModal}
								date={birthDate}
								maximumDate={new Date()}
								minimumDate={new Date('1900-01-01')}
								theme={theme.dark ? 'dark' : 'light'}
								onConfirm={(birthDate) => {
									setBirthDateModal(false);
									setBirthDate(birthDate);
								}}
								onCancel={() => {
									setBirthDateModal(false);
								}}
							/>
						</>

						<View
							style={{
								flexDirection: 'row',
								flexWrap: 'wrap',
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>
							<Checkbox.Item
								uncheckedColor={theme.colors.primary}
								label={paid ? t('addMember.paid') : t('addMember.notPaid')}
								labelStyle={[styles.dateText, { color: theme.colors.primary }]}
								status={paid ? 'checked' : 'unchecked'}
								onPress={() => {
									setPaid(!paid);
								}}
							/>
							{paid ? (
								<>
									<Button
										labelStyle={styles.dateText}
										onPress={() => setPaidDateModal(true)}
									>
										{`${t('addMember.on')} ${paidDate.toLocaleDateString(
											'pt-pt'
										)}`}
									</Button>
									<DatePicker
										modal
										mode='date'
										locale='pt-pt'
										open={paidDateModal}
										date={paidDate}
										//minimumDate={new Date()}
										theme={theme.dark ? 'dark' : 'light'}
										onConfirm={(date) => {
											setPaidDateModal(false);
											setPaidDate(date);
										}}
										onCancel={() => {
											setPaidDateModal(false);
										}}
									/>
									<View style={{ flexDirection: 'column' }}>
										<Button
											labelStyle={styles.dateText}
											onPress={() => setEndDateModal(true)}
										>
											{`${t('addMember.until')} ${endDate}`}
										</Button>
									</View>
								</>
							) : null}
						</View>
					</KeyboardAvoidingView>
				</ScrollView>

				<View style={styles.buttonContainer}>
					<Button
						style={styles.button}
						contentStyle={styles.buttonContent}
						labelStyle={styles.buttonText}
						icon='account-plus'
						mode='elevated'
						loading={loading}
						onPress={addMember}
					>
						{t('addMember.addMember')}
					</Button>
				</View>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
	},
	modalContainer: {
		marginHorizontal: 30,
		alignItems: 'center',
	},
	modalContentContainer: {
		paddingVertical: 10,
		paddingHorizontal: 15,
		borderRadius: 20,
	},
	buttonContainer: {
		marginHorizontal: 20,
		alignItems: 'center',
	},
	button: {
		marginVertical: 8,
		justifyContent: 'center',
	},
	buttonContent: {
		minWidth: 280,
		minHeight: 80,
	},
	buttonText: {
		fontSize: 25,
		fontWeight: 'bold',
		overflow: 'visible',
		paddingTop: 10,
	},
	input: {
		marginVertical: 2,
	},
	pictureButton: {
		padding: 15,
		alignSelf: 'center',
	},
	title: {
		fontSize: 20,
		fontWeight: 'bold',
		marginVertical: 3,
	},
	dateText: {
		fontWeight: 'bold',
		textAlignVertical: 'center',
		fontSize: 20,
	},
	errorHelper: {
		fontWeight: 'bold',
		fontSize: 15,
	},
});
