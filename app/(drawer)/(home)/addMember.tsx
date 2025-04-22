import React, { useState } from 'react';
import {
	View,
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
import { globalStyles } from '@/styles/global';

export default function AddMember() {
	const theme = useTheme();
	const { t } = useTranslation();

	const [autoNumber, setAutoNumber] = useState(true);
	const [paid, setPaid] = useState(false);

	const [loading, setLoading] = useState(false);

	const [nameError, setNameError] = useState(false);
	const [memberNumberError, setMemberNumberError] = useState(false);
	const [emailError, setEmailError] = useState(false);
	const [zipCodeError, setZipCodeError] = useState(false);

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

		let errors = 0;

		if (!name.trim()) {
			showSnackbar(t('addMember.nameError'));
			setNameError(true);
			errors++;
			//setLoading(false);
			//return;
		} else setNameError(false);

		if (email?.trim() && !email.match(emailRegex)) {
			showSnackbar(t('addMember.emailError'));
			setEmailError(true);
			errors++;
			//setLoading(false);
			//return;
		} else setEmailError(false);

		if (autoNumber) {
			await assignMemberNumber();
		} else if (!memberNumber.trim()) {
			showSnackbar(t('addMember.memberNumberError'));
			setMemberNumberError(true);
			errors++;
			//setLoading(false);
			//return;
		} else {
			const numberAvailable = await checkNumber();
			if (numberAvailable > 1) {
				showSnackbar(t('addMember.memberNumberExists'));
				setMemberNumberError(true);
				errors++;
				//setLoading(false);
				//return;
			}
			minNumber = Number(memberNumber.trim());
			setMemberNumber(minNumber.toString());
		}

		if (zipCode.length < 8 && zipCode.length > 0) {
			showSnackbar(t('addMember.zipCodeError'));
			setZipCodeError(true);
			errors++;
			//setLoading(false);
			//return;
		} else setZipCodeError(false);

		console.log(
			`${nameError} : ${memberNumberError} : ${zipCodeError} : ${errors}`
		);
		if (errors > 0) {
			setLoading(false);
			return;
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
					style={globalStyles.modalContainer.global}
					contentContainerStyle={[
						globalStyles.modalContentContainer.global,
						{ backgroundColor: theme.colors.primaryContainer },
					]}
					testID='ProfilePictureModal'
				>
					<Button
						style={globalStyles.button.global}
						contentStyle={globalStyles.buttonContent.global}
						labelStyle={globalStyles.buttonText.global}
						icon='file-image'
						mode='elevated'
						onPress={pickImage}
						testID='GalleryButton'
					>
						{t('addMember.gallery')}
					</Button>
					<Button
						style={globalStyles.button.global}
						contentStyle={globalStyles.buttonContent.global}
						labelStyle={globalStyles.buttonText.global}
						icon='camera'
						mode='elevated'
						onPress={takePicture}
						testID='CameraButton'
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
				testID='EndDatePicker'
			/>

			<SnackbarInfo
				text={snackbarText}
				visible={snackbarVisible}
				onDismiss={onDismissSnackbar}
			/>

			<View
				style={globalStyles.container.global}
				testID='AddPage'
			>
				<ScrollView>
					<KeyboardAvoidingView style={{ paddingHorizontal: 10 }}>
						<Pressable
							style={globalStyles.pictureButton}
							onPress={() => {
								setPictureModal(true);
							}}
							testID='ProfilePicturePressable'
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
									flex: 1,
								}}
							>
								<Text
									style={[
										globalStyles.text.global,
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
									testID='AutoNumberSwitch'
								/>
							</View>
							<View style={{ flex: 1, flexDirection: 'column' }}>
								<TextInput
									disabled={autoNumber}
									style={[globalStyles.input, { flex: 3 }]}
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
									testID='MemberNumberInput'
								/>
								{memberNumberError ? (
									<HelperText
										type='error'
										visible={memberNumberError}
										style={globalStyles.text.errorHelper}
										testID='MemberNumberError'
									>
										{t('addMember.memberNumberError')}
									</HelperText>
								) : null}
							</View>
						</View>

						<TextInput
							style={globalStyles.input}
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
							testID='NameInput'
						/>
						{nameError ? (
							<HelperText
								type='error'
								visible={nameError}
								style={globalStyles.text.errorHelper}
								testID='NameError'
							>
								{t('addMember.nameError')}
							</HelperText>
						) : null}

						<TextInput
							style={globalStyles.input}
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
							testID='EmailInput'
						/>
						{emailError ? (
							<HelperText
								type='error'
								visible={emailError}
								style={globalStyles.text.errorHelper}
								testID='EmailError'
							>
								{t('addMember.emailError')}
							</HelperText>
						) : null}

						<TextInput
							style={globalStyles.input}
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
							testID='PhoneInput'
						/>
						<TextInput
							style={globalStyles.input}
							value={occupation}
							onChangeText={setOccupation}
							onEndEditing={() => {
								setOccupation(occupation.trim());
							}}
							autoCapitalize='sentences'
							inputMode='text'
							keyboardType='default'
							label={t('addMember.occupation')}
							testID='OccupationInput'
						/>
						<TextInput
							style={globalStyles.input}
							value={country}
							onChangeText={setCountry}
							onEndEditing={() => {
								setCountry(country.trim());
							}}
							autoCapitalize='sentences'
							inputMode='text'
							keyboardType='default'
							label={t('addMember.country')}
							testID='CountryInput'
						/>
						<TextInput
							style={globalStyles.input}
							value={address}
							onChangeText={setAddress}
							onEndEditing={() => {
								setAddress(address.trim());
							}}
							autoCapitalize='sentences'
							inputMode='text'
							keyboardType='default'
							label={t('addMember.address')}
							testID='AddressInput'
						/>
						<TextInput
							style={globalStyles.input}
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
								if (zipCode.length < 8 && zipCode.length > 0)
									setZipCodeError(true);
								else setZipCodeError(false);
								setZipCode(zipCode.trim());
							}}
							error={zipCodeError}
							maxLength={8}
							autoCapitalize='none'
							inputMode='numeric'
							keyboardType='number-pad'
							label={t('addMember.zipCode')}
							testID='ZipCodeInput'
						/>
						{zipCodeError ? (
							<HelperText
								type='error'
								visible={zipCodeError}
								style={globalStyles.text.errorHelper}
								testID='ZipCodeError'
							>
								{t('addMember.zipCodeError')}
							</HelperText>
						) : null}

						<>
							<Button
								style={{ marginVertical: 5 }}
								labelStyle={globalStyles.text.date}
								onPress={() => setBirthDateModal(true)}
								testID='BirthDateButton'
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
								testID='BirthDatePicker'
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
								labelStyle={[
									globalStyles.text.date,
									{ color: theme.colors.primary },
								]}
								status={paid ? 'checked' : 'unchecked'}
								onPress={() => {
									setPaid(!paid);
								}}
								testID='PaidCheckbox'
							/>
							{paid ? (
								<>
									<Button
										labelStyle={globalStyles.text.date}
										onPress={() => setPaidDateModal(true)}
										testID='PaidDateButton'
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
										testID='PaidDatePicker'
									/>
									<View style={{ flexDirection: 'column' }}>
										<Button
											labelStyle={globalStyles.text.date}
											onPress={() => setEndDateModal(true)}
											testID='EndDateButton'
										>
											{`${t('addMember.until')} ${endDate}`}
										</Button>
									</View>
								</>
							) : null}
						</View>
					</KeyboardAvoidingView>
				</ScrollView>

				<View style={globalStyles.container.button}>
					<Button
						style={globalStyles.button.global}
						contentStyle={globalStyles.buttonContent.global}
						labelStyle={globalStyles.buttonText.global}
						icon='account-plus'
						mode='elevated'
						loading={loading}
						onPress={addMember}
						testID='AddButton'
					>
						{t('addMember.addMember')}
					</Button>
				</View>
			</View>
		</>
	);
}
