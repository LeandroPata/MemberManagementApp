import React, { useCallback, useState } from 'react';
import {
	View,
	StyleSheet,
	KeyboardAvoidingView,
	Pressable,
	ScrollView,
	Keyboard,
} from 'react-native';
import {
	ActivityIndicator,
	Button,
	Modal,
	Portal,
	TextInput,
	Switch,
	Avatar,
	Text,
	useTheme,
	HelperText,
	Dialog,
} from 'react-native-paper';
import DatePicker from 'react-native-date-picker';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useBackHandler } from '@react-native-community/hooks';
import type { FirebaseError } from 'firebase/app';
import firestore, { Timestamp } from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { useTranslation } from 'react-i18next';
import SnackbarInfo from '@/components/SnackbarInfo';
import DialogConfirmation from '@/components/DialogConfirmation';

export default function Profile() {
	const { profileID } = useLocalSearchParams();

	const theme = useTheme();
	const { t } = useTranslation();

	const [autoNumber, setAutoNumber] = useState(false);
	const [profile, setProfile] = useState(null);
	const [editing, setEditing] = useState(false);

	const [loading, setLoading] = useState(false);
	const [loadingSave, setLoadingSave] = useState(false);
	const [loadingDelete, setLoadingDelete] = useState(false);

	const [nameError, setNameError] = useState(false);
	const [memberNumberError, setMemberNumberError] = useState(false);
	const [emailError, setEmailError] = useState(false);

	const [birthDateModal, setBirthDateModal] = useState(false);
	const [endDateModal, setEndDateModal] = useState(false);
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
	const [endDate, setEndDate] = useState(new Date());
	const [profilePicture, setProfilePicture] = useState<string | null>(null);

	// All the logic to implement SnackbarInfo
	const [snackbarVisible, setSnackbarVisible] = useState(false);
	const [snackbarText, setSnackbarText] = useState('');

	const showSnackbar = (text: string) => {
		setSnackbarText(text);
		setSnackbarVisible(true);
	};
	const onDismissSnackbar = () => setSnackbarVisible(false);

	// All the logic to implemet DialogConfirmation
	const [dialogConfirmationVisible, setDialogConfirmationVisible] =
		useState(false);
	const onDismissDialogConfirmation = () => setDialogConfirmationVisible(false);

	const emailRegex = /.+@.+\..+/g;
	const reference = storage().ref(`profilePicture/${profileID}.jpg`);
	let minNumber = 0;

	useBackHandler(() => {
		if (editing) {
			setEditing(false);

			setName('');
			setMemberNumber('');
			setEmail('');
			setPhoneNumber('');
			setOccupation('');
			setCountry('');
			setAddress('');
			setZipCode('');
			setBirthDate(new Date());
			setEndDate(new Date());
			setProfilePicture('');

			setNameError(false);
			setMemberNumberError(false);
			setEmailError(false);
		} else {
			router.replace('/(drawer)/(home)/searchMember');
		}
		return true;
	});

	useFocusEffect(
		useCallback(() => {
			// Screen focused
			//console.log("Hello, I'm focused!");
			getMember(profileID);
			// Screen unfocused in return
			return () => {
				//console.log('This route is now unfocused.');
				//setProfile(null);
				setName('');
				setMemberNumber('');
				setEmail('');
				setPhoneNumber('');
				setOccupation('');
				setCountry('');
				setAddress('');
				setZipCode('');
				setBirthDate(new Date());
				setEndDate(new Date());
				setProfilePicture('');

				setEditing(false);
				setPictureModal(false);
				setDialogConfirmationVisible(false);
				setBirthDateModal(false);
				setEndDateModal(false);

				setNameError(false);
				setMemberNumberError(false);
				setEmailError(false);
			};
		}, [profileID])
	);

	const getMember = async (id) => {
		setLoading(true);

		try {
			await firestore()
				.collection('members')
				.doc(id)
				.get()
				.then((documentSnapshot) => {
					if (documentSnapshot?.data()) {
						setProfile(documentSnapshot.data());
						/* setName(documentSnapshot.data().name);
            setMemberNumber(documentSnapshot.data().memberNumber.toString());
            setEmail(documentSnapshot.data().email);
            setPhoneNumber(documentSnapshot.data().phoneNumber);
            setOccupation(documentSnapshot.data().occupation);
            setCountry(documentSnapshot.data().country);
            setAddress(documentSnapshot.data().address);
            setZipCode(documentSnapshot.data().zipCode);
            setBirthDate(new Date(documentSnapshot.data().birthDate.toDate()));
            setEndDate(new Date(documentSnapshot.data().endDate.toDate()));
            setProfilePicture(documentSnapshot.data().profilePicture); */
					}
					//console.log(documentSnapshot.data());
				});
		} catch (e: any) {
			const err = e as FirebaseError;
			console.log(`Getting profile failed: ${err.message}`);
		}
		setLoading(false);
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

			console.log(result);

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
				showSnackbar(t('profile.cameraPermission'));
				return;
			}

			const result = await ImagePicker.launchCameraAsync({
				mediaTypes: 'images',
				allowsMultipleSelection: false,
				allowsEditing: true,
				quality: 0.5,
				aspect: [3, 4],
			});

			console.log(result);

			if (!result.canceled) {
				setProfilePicture(result.assets[0].uri);
			}
		} catch (e: any) {
			const err = e as FirebaseError;
			//showSnackbar('Taking picture failed: ' + err.message);
			console.log(`Taking picture failed: ${err.message}`);
		}
	};

	const uploadPicture = async () => {
		// Delete previous picture if it is different from the placeholder
		if (
			profilePicture &&
			profilePicture !== process.env.EXPO_PUBLIC_PLACEHOLDER_PICTURE_URL &&
			profilePicture !== profile.profilePicture
		) {
			await reference
				.delete()
				.then(() => {
					console.log('File deleted!');
				})
				.catch((e: any) => {
					const err = e as FirebaseError;
					//showSnackbar('File deletion failed: ' + err.message);
					console.log(`File deletion failed: ${err.message}`);
				});

			// Upload picture to Firebase if it is different from the placeholder

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
					//setLoadingSave(false);
				});

			//await reference.putFile(result.assets[0].uri);
			// Get download url
			const url = await reference.getDownloadURL();
			console.log(url);
			setProfilePicture(url);
			return url;
		}
		return null;
	};

	const deletePicture = async () => {
		if (
			(profile.profilePicture &&
				profile.profilePicture !==
					process.env.EXPO_PUBLIC_PLACEHOLDER_PICTURE_URL) ||
			(profilePicture &&
				profilePicture !== process.env.EXPO_PUBLIC_PLACEHOLDER_PICTURE_URL)
		) {
			await reference
				.delete()
				.then(() => {
					console.log('File deleted!');
				})
				.catch((e: any) => {
					const err = e as FirebaseError;
					//showSnackbar('File deletion failed: ' + err.message);
					console.log(`File deletion failed: ${err.message}`);
					//setLoadingDelete(false);
				});
		}
	};

	const assignMemberNumber = async () => {
		try {
			await firestore()
				.collection('members')
				.orderBy('memberNumber', 'asc')
				.get()
				.then((querySnapshot) => {
					let i = 1;
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

			if (memberNumber.trim() !== profile.memberNumber) {
				await firestore()
					.collection('members')
					.orderBy('memberNumber', 'asc')
					.get()
					.then((querySnapshot) => {
						querySnapshot.forEach((documentSnapshot) => {
							if (
								memberNumber.trim() === documentSnapshot.data().memberNumber
							) {
								numberAvailable++;
								console.log('Number unavailable!');
							}
						});
					});
			}
			//console.log('Result: ' + numberAvailable);
			return numberAvailable;
		} catch (e: any) {
			const err = e as FirebaseError;
			//showSnackbar('Checking number failed: ' + err.message);
			console.log(`Checking number number failed: ${err.message}`);
		}
	};

	const saveMember = async () => {
		setLoadingSave(true);
		Keyboard.dismiss();

		if (!name.trim()) {
			showSnackbar(t('profile.nameError'));
			setNameError(true);
			setLoadingSave(false);
			return;
		}

		if (email?.trim() && !email.match(emailRegex)) {
			showSnackbar(t('profile.emailError'));
			setEmailError(true);
			setLoadingSave(false);
			return;
		}

		if (autoNumber) {
			await assignMemberNumber();
		} else if (!memberNumber.trim()) {
			showSnackbar(t('profile.memberNumberError'));
			setLoadingSave(false);
			return;
		} else {
			const numberAvailable = await checkNumber();
			if (numberAvailable > 1) {
				showSnackbar(t('profile.memberNumberExists'));
				setLoadingSave(false);
				return;
			}
			minNumber = Number(memberNumber);
			setMemberNumber(minNumber.toString());
		}

		const url = await uploadPicture();

		try {
			firestore()
				.collection('members')
				.doc(profileID)
				.update({
					name: name.trim(),
					memberNumber: minNumber,
					email: email.trim(),
					phoneNumber: phoneNumber.trim(),
					occupation: occupation.trim(),
					country: country.trim(),
					address: address.trim(),
					zipCode: zipCode.trim(),
					birthDate: Timestamp.fromDate(birthDate),
					endDate: Timestamp.fromDate(endDate),
					profilePicture: url
						? url
						: profilePicture
						? profilePicture
						: profile.profilePicture,
				})
				.then(() => {
					showSnackbar(t('profile.updatedMember'));
					setEditing(false);
					getMember(profileID);
				});
		} catch (e: any) {
			const err = e as FirebaseError;
			//showSnackbar('Updating member failed: ' + err.message);
			console.log(`Updating member failed: ${err.message}`);
			setLoadingSave(false);
		} finally {
			setLoadingSave(false);
		}
	};

	const deleteMember = async () => {
		setLoadingDelete(true);

		await deletePicture();

		try {
			firestore()
				.collection('members')
				.doc(profileID)
				.delete()
				.then(() => {
					showSnackbar(t('profile.deletedMember'));
				});
		} catch (e: any) {
			const err = e as FirebaseError;
			//showSnackbar('Deleting member failed: ' + err.message);
			console.log(`Deleting member failed: ${err.message}`);
			setLoadingDelete(false);
		} finally {
			setLoadingDelete(false);
		}
		setLoadingDelete(false);
		setDialogConfirmationVisible(false);
		router.replace('/(drawer)/(home)/searchMember');
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
						{t('profile.gallery')}
					</Button>
					<Button
						style={styles.button}
						contentStyle={styles.buttonContent}
						labelStyle={styles.buttonText}
						icon='camera'
						mode='elevated'
						onPress={takePicture}
					>
						{t('profile.camera')}
					</Button>
				</Modal>
			</Portal>

			<DialogConfirmation
				text={t('profile.deleteConfirmation')}
				visible={dialogConfirmationVisible}
				onDismiss={onDismissDialogConfirmation}
				onConfirmation={deleteMember}
			/>

			<SnackbarInfo
				text={snackbarText}
				visible={snackbarVisible}
				onDismiss={onDismissSnackbar}
			/>

			<View style={styles.container}>
				{loading || !profile ? (
					<ActivityIndicator
						size={75}
						color={theme.colors.primary}
						style={{ margin: 28 }}
					/>
				) : (
					<>
						<ScrollView>
							<KeyboardAvoidingView style={{ marginHorizontal: 20 }}>
								<Pressable
									disabled={!editing}
									style={styles.pictureButton}
									onPress={() => {
										setPictureModal(true);
									}}
								>
									<Avatar.Image
										size={200}
										style={{ alignSelf: 'center' }}
										source={{
											uri: profilePicture
												? profilePicture
												: profile.profilePicture,
										}}
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
											{t('profile.autoNumber')}
										</Text>
										<Switch
											disabled={!editing}
											value={autoNumber}
											onValueChange={(input) => {
												setAutoNumber(input);
												setMemberNumber('');
												setMemberNumberError(false);
											}}
										/>
									</View>
									<TextInput
										disabled={Boolean(!editing || (editing && autoNumber))}
										style={[styles.input, { flex: 3 }]}
										value={
											memberNumber || editing
												? memberNumber
												: profile.memberNumber.toString()
										}
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
										label={t('profile.memberNumber')}
									/>
								</View>

								<TextInput
									disabled={!editing}
									style={styles.input}
									value={name || editing ? name : profile.name}
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
									label={t('profile.name')}
								/>
								{nameError ? (
									<HelperText
										type='error'
										visible={nameError}
										style={styles.errorHelper}
									>
										{t('profile.nameError')}
									</HelperText>
								) : null}

								<TextInput
									disabled={!editing}
									style={styles.input}
									value={email || editing ? email : profile.email}
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
									label={t('profile.email')}
								/>
								{emailError ? (
									<HelperText
										type='error'
										visible={emailError}
										style={styles.errorHelper}
									>
										{t('profile.emailError')}
									</HelperText>
								) : null}

								<TextInput
									disabled={!editing}
									style={styles.input}
									value={
										phoneNumber || editing ? phoneNumber : profile.phoneNumber
									}
									onChangeText={(input) => {
										setPhoneNumber(input.replace(/[^0-9+\-\s]/g, ''));
									}}
									onEndEditing={() => {
										setPhoneNumber(phoneNumber.trim());
									}}
									autoCapitalize='none'
									inputMode='tel'
									keyboardType='phone-pad'
									label={t('profile.phoneNumber')}
								/>
								<TextInput
									disabled={!editing}
									style={styles.input}
									value={
										occupation || editing ? occupation : profile.occupation
									}
									onChangeText={setOccupation}
									onEndEditing={() => {
										setOccupation(occupation.trim());
									}}
									autoCapitalize='sentences'
									inputMode='text'
									keyboardType='default'
									label={t('profile.occupation')}
								/>
								<TextInput
									disabled={!editing}
									style={styles.input}
									value={country || editing ? country : profile.country}
									onChangeText={setCountry}
									onEndEditing={() => {
										setCountry(country.trim());
									}}
									autoCapitalize='sentences'
									inputMode='text'
									keyboardType='default'
									label={t('profile.country')}
								/>
								<TextInput
									disabled={!editing}
									style={styles.input}
									value={address || editing ? address : profile.address}
									onChangeText={setAddress}
									onEndEditing={() => {
										setAddress(address.trim());
									}}
									autoCapitalize='sentences'
									inputMode='text'
									keyboardType='default'
									label={t('profile.address')}
								/>
								<TextInput
									disabled={!editing}
									style={styles.input}
									value={zipCode || editing ? zipCode : profile.zipCode}
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
									label={t('profile.zipCode')}
								/>

								<>
									<Button
										disabled={!editing}
										style={{ marginVertical: 5 }}
										labelStyle={styles.dateText}
										onPress={() => setBirthDateModal(true)}
									>
										{`${t('profile.birthDate')}: ${
											birthDate.toLocaleDateString('pt-pt') !==
											new Date().toLocaleDateString('pt-pt')
												? birthDate.toLocaleDateString('pt-pt')
												: new Date(
														profile.birthDate.toDate()
												  ).toLocaleDateString('pt-pt')
										}`}
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

								<>
									<Button
										disabled={!editing}
										style={{ marginVertical: 5 }}
										labelStyle={styles.dateText}
										onPress={() => setEndDateModal(true)}
									>
										{`${t('profile.endDate')}: ${
											endDate.toLocaleDateString('pt-pt') !==
											new Date().toLocaleDateString('pt-pt')
												? endDate.toLocaleDateString('pt-pt')
												: new Date(profile.endDate.toDate()).toLocaleDateString(
														'pt-pt'
												  )
										}`}
									</Button>
									<DatePicker
										modal
										mode='date'
										locale='pt-pt'
										open={endDateModal}
										date={endDate}
										minimumDate={new Date()}
										theme={theme.dark ? 'dark' : 'light'}
										onConfirm={(endDate) => {
											setEndDateModal(false);
											setEndDate(endDate);
										}}
										onCancel={() => {
											setEndDateModal(false);
										}}
									/>
								</>
							</KeyboardAvoidingView>
						</ScrollView>

						<View style={styles.buttonContainer}>
							{editing ? (
								<Button
									style={styles.button}
									contentStyle={styles.buttonContent}
									labelStyle={styles.buttonText}
									icon='content-save'
									mode='elevated'
									loading={loadingSave}
									onPress={saveMember}
								>
									{t('profile.saveMember')}
								</Button>
							) : (
								<>
									<Button
										style={styles.button}
										contentStyle={styles.buttonContent}
										labelStyle={styles.buttonText}
										icon='account-edit'
										mode='elevated'
										onPress={() => {
											setEditing(true);
											setName(profile.name);
											setMemberNumber(profile.memberNumber.toString());
											setEmail(profile.email);
											setPhoneNumber(profile.phoneNumber);
											setOccupation(profile.occupation);
											setCountry(profile.country);
											setAddress(profile.address);
											setZipCode(profile.zipCode);
											setBirthDate(new Date(profile.birthDate.toDate()));
											setEndDate(new Date(profile.endDate.toDate()));
											setProfilePicture('');
										}}
									>
										{t('profile.editMember')}
									</Button>
									<Button
										style={styles.button}
										contentStyle={styles.buttonContent}
										labelStyle={styles.buttonText}
										icon='account-remove'
										mode='elevated'
										loading={loadingDelete}
										onPress={() => {
											setDialogConfirmationVisible(true);
										}}
									>
										{t('profile.deleteMember')}
									</Button>
								</>
							)}
						</View>
					</>
				)}
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		//alignItems: 'center',
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
		marginVertical: 5,
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
