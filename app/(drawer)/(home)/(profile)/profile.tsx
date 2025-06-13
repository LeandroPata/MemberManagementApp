import React, { useCallback, useState } from 'react';
import {
	View,
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
	Checkbox,
} from 'react-native-paper';
import DatePicker from 'react-native-date-picker';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useBackHandler } from '@react-native-community/hooks';
import type { FirebaseError } from 'firebase/app';
import firestore, { Timestamp } from '@react-native-firebase/firestore';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from '@/context/SnackbarContext';
import { useDialog } from '@/context/DialogueConfirmationContext';
import YearPicker from '@/components/YearPicker';
import { globalStyles } from '@/styles/global';
import { getLastNumber, checkNumber } from '@/utils/NumberManagement';
import {
	deleteMemberDoc,
	getSingleMember,
	uploadImage,
} from '@/utils/Firebase';
import { askPermission, launchCamera, launchGallery } from '@/utils/Image';

export default function Profile() {
	const { profileID } = useLocalSearchParams();

	const theme = useTheme();
	const { t } = useTranslation();

	const [autoNumber, setAutoNumber] = useState(false);
	const [paid, setPaid] = useState(false);
	const [profile, setProfile] = useState(null);
	const [editing, setEditing] = useState(false);

	const [loading, setLoading] = useState(false);
	const [loadingSave, setLoadingSave] = useState(false);
	const [loadingDelete, setLoadingDelete] = useState(false);

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
	const [endDate, setEndDate] = useState(0);
	const [profilePicture, setProfilePicture] = useState<string | null>(null);

	// All the logic to implement the snackbar
	const { showSnackbar } = useSnackbar();

	// All the logic to implement DialogConfirmation
	const { showDialog, hideDialog } = useDialog();

	// All the logic to implement the YearPicker
	const [endDateModal, setEndDateModal] = useState(false);

	const onYearReceived = (year: number) => {
		setEndDate(year);
	};

	const emailRegex = /.+@.+\..+/g;
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
			setPaidDate(new Date());
			setEndDate(0);
			setProfilePicture('');
			setPaid(!!profile?.paidDate);
			setAutoNumber(false);

			setNameError(false);
			setMemberNumberError(false);
			setEmailError(false);
			setZipCodeError(false);
		} else {
			router.back();
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
				setPaidDate(new Date());
				setEndDate(new Date().getFullYear());
				setProfilePicture('');

				setEditing(false);
				setPictureModal(false);
				hideDialog();
				setBirthDateModal(false);
				setPaidDateModal(false);
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
			const documentSnapshot = await getSingleMember(id);
			if (documentSnapshot?.data()) {
				setProfile(documentSnapshot.data());
				setPaid(!!documentSnapshot.data()?.paidDate);
			}
			//console.log(documentSnapshot.data());
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
			const result = await launchGallery();

			if (result) setProfilePicture(result);
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
			const permissionResult = await askPermission();

			if (permissionResult === false) {
				showSnackbar(t('permission.camera'));
				return;
			}

			const result = await launchCamera();

			if (result) setProfilePicture(result);
		} catch (e: any) {
			const err = e as FirebaseError;
			//showSnackbar('Taking picture failed: ' + err.message);
			console.log(`Taking picture failed: ${err.message}`);
		}
	};

	const assignMemberNumber = async () => {
		try {
			const lastNumber = await getLastNumber();
			if (lastNumber == profile.memberNumber) minNumber = lastNumber;
			else minNumber = lastNumber + 1;
			setMemberNumber(minNumber.toString());
		} catch (e: any) {
			const err = e as FirebaseError;
			//showSnackbar('Assigning member number failed: ' + err.message);
			console.log(`Assigning member number failed: ${err.message}`);
		}
	};

	const saveMember = async () => {
		setLoadingSave(true);
		Keyboard.dismiss();

		let errors = 0;

		if (!name.trim()) {
			showSnackbar(t('member.nameError'));
			setNameError(true);
			errors++;
			//setLoadingSave(false);
			//return;
		}

		if (email?.trim() && !email.match(emailRegex)) {
			showSnackbar(t('member.emailError'));
			setEmailError(true);
			errors++;
			//setLoadingSave(false);
			//return;
		}

		if (autoNumber) {
			await assignMemberNumber();
		} else if (!memberNumber.trim()) {
			showSnackbar(t('member.memberNumberError'));
			setMemberNumberError(true);
			errors++;
			//setLoadingSave(false);
			//return;
		} else {
			const numberAvailable = await checkNumber();
			/* console.log(
				`${memberNumber} : ${profile.memberNumber} : ${
					memberNumber != profile.memberNumber
				} : ${numberAvailable}`
			); */
			if (memberNumber != profile.memberNumber && numberAvailable > 1) {
				showSnackbar(t('member.memberNumberExists'));
				setMemberNumberError(true);
				errors++;
				//setLoadingSave(false);
				//return;
			}
			minNumber = Number(memberNumber);
			setMemberNumber(minNumber.toString());
		}

		if (zipCode.length < 8 && zipCode.length > 0) {
			showSnackbar(t('addMember.zipCodeError'));
			setZipCodeError(true);
			errors++;
			//setLoadingSave(false);
			//return;
		} else setZipCodeError(false);

		/* console.log(
			`${nameError} : ${memberNumberError} : ${zipCodeError} : ${errors}`
		); */

		if (errors > 0) {
			setLoadingSave(false);
			return;
		}

		const url = await uploadImage(profileID, profilePicture);

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
					paidDate: paid ? Timestamp.fromDate(paidDate) : null,
					endDate: paid ? endDate : 0,
					profilePicture: url
						? url
						: profilePicture
						? profilePicture
						: profile.profilePicture,
				})
				.then(() => {
					showSnackbar(t('dialog.updatedMember'));
					setEditing(false);
					setAutoNumber(false);
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

		try {
			const confirm = await deleteMemberDoc(profileID);
			console.log(confirm);
			if (confirm) {
				showSnackbar(t('dialog.deletedMember'));
				router.replace('/(drawer)/(home)/searchMember');
			}
		} catch (e: any) {
			const err = e as FirebaseError;
			//showSnackbar('Deleting member failed: ' + err.message);
			console.log(`Deleting member failed: ${err.message}`);
			setLoadingDelete(false);
		}
		setLoadingDelete(false);
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
						{t('button.gallery')}
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
						{t('button.camera')}
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

			<View
				style={globalStyles.container.global}
				testID='ProfilePage'
			>
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
									style={globalStyles.pictureButton}
									onPress={() => {
										setPictureModal(true);
									}}
									testID='ProfilePicturePressable'
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
											{t('member.autoNumber')}
										</Text>
										<Switch
											disabled={!editing}
											value={autoNumber}
											onValueChange={(input) => {
												setAutoNumber(input);
												setMemberNumberError(false);
												if (input) assignMemberNumber();
												else setMemberNumber(profile.memberNumber.toString());
											}}
											testID='AutoNumberSwitch'
										/>
									</View>
									<View style={{ flex: 1, flexDirection: 'column' }}>
										<TextInput
											disabled={Boolean(!editing || (editing && autoNumber))}
											style={[globalStyles.input, { flex: 3 }]}
											value={
												memberNumber || editing
													? memberNumber
													: profile.memberNumber.toString()
											}
											onChangeText={(input) => {
												setMemberNumber(input.replace(/[^0-9]/g, ''));
											}}
											onEndEditing={() => {
												if (!autoNumber && !memberNumber.trim() && editing) {
													setMemberNumberError(true);
												} else setMemberNumberError(false);
												setMemberNumber(memberNumber.trim());
											}}
											maxLength={6}
											error={memberNumberError}
											autoCapitalize='none'
											keyboardType='numeric'
											label={t('member.memberNumber')}
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
									disabled={!editing}
									style={globalStyles.input}
									value={name || editing ? name : profile.name}
									onChangeText={setName}
									onEndEditing={() => {
										if (!name.trim() && editing) {
											setNameError(true);
										} else setNameError(false);
										setName(name.trim());
									}}
									error={nameError}
									autoCapitalize='words'
									keyboardType='default'
									label={t('member.name')}
									testID='NameInput'
								/>
								{nameError ? (
									<HelperText
										type='error'
										visible={nameError}
										style={globalStyles.text.errorHelper}
										testID='NameError'
									>
										{t('member.nameError')}
									</HelperText>
								) : null}

								<TextInput
									disabled={!editing}
									style={globalStyles.input}
									value={email || editing ? email : profile.email}
									onChangeText={setEmail}
									onEndEditing={() => {
										if (email?.trim() && !email.match(emailRegex) && editing) {
											setEmailError(true);
										} else setEmailError(false);
										setEmail(email.trim());
									}}
									error={emailError}
									autoCapitalize='none'
									keyboardType='email-address'
									label={t('member.email')}
									testID='EmailInput'
								/>
								{emailError ? (
									<HelperText
										type='error'
										visible={emailError}
										style={globalStyles.text.errorHelper}
										testID='EmailError'
									>
										{t('member.emailError')}
									</HelperText>
								) : null}

								<TextInput
									disabled={!editing}
									style={globalStyles.input}
									value={
										phoneNumber || editing ? phoneNumber : profile.phoneNumber
									}
									onChangeText={(input) => {
										setPhoneNumber(input.replace(/[^0-9+-]/g, ''));
									}}
									onEndEditing={() => {
										setPhoneNumber(phoneNumber.trim());
									}}
									autoCapitalize='none'
									inputMode='tel'
									keyboardType='phone-pad'
									label={t('member.phoneNumber')}
									testID='PhoneInput'
								/>
								<TextInput
									disabled={!editing}
									style={globalStyles.input}
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
									label={t('member.occupation')}
									testID='OccupationInput'
								/>
								<TextInput
									disabled={!editing}
									style={globalStyles.input}
									value={country || editing ? country : profile.country}
									onChangeText={setCountry}
									onEndEditing={() => {
										setCountry(country.trim());
									}}
									autoCapitalize='sentences'
									inputMode='text'
									keyboardType='default'
									label={t('member.country')}
									testID='CountryInput'
								/>
								<TextInput
									disabled={!editing}
									style={globalStyles.input}
									value={address || editing ? address : profile.address}
									onChangeText={setAddress}
									onEndEditing={() => {
										setAddress(address.trim());
									}}
									autoCapitalize='sentences'
									inputMode='text'
									keyboardType='default'
									label={t('member.address')}
									testID='AddressInput'
								/>
								<TextInput
									disabled={!editing}
									style={globalStyles.input}
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
										if (zipCode.length < 8 && zipCode.length > 0 && editing)
											setZipCodeError(true);
										else setZipCodeError(false);
										setZipCode(zipCode.trim());
									}}
									maxLength={8}
									autoCapitalize='none'
									inputMode='numeric'
									keyboardType='number-pad'
									label={t('member.zipCode')}
									testID='ZipCodeInput'
								/>
								{zipCodeError ? (
									<HelperText
										type='error'
										visible={zipCodeError}
										style={globalStyles.text.errorHelper}
										testID='ZipCodeError'
									>
										{t('member.zipCodeError')}
									</HelperText>
								) : null}

								<>
									<Button
										disabled={!editing}
										style={{ marginVertical: 5 }}
										labelStyle={globalStyles.text.date}
										onPress={() => setBirthDateModal(true)}
										testID='BirthDateButton'
									>
										{`${t('member.birthDate')}: ${
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
										disabled={!editing}
										uncheckedColor={theme.colors.primary}
										label={paid ? t('member.paid') : t('member.notPaid')}
										labelStyle={[
											globalStyles.text.date,
											{
												color: !editing
													? theme.colors.onSurfaceDisabled
													: theme.colors.primary,
											},
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
												disabled={!editing}
												labelStyle={globalStyles.text.date}
												onPress={() => setPaidDateModal(true)}
												testID='PaidDateButton'
											>
												{`${t('member.on')} ${
													paidDate.toLocaleDateString('pt-pt') !==
													new Date().toLocaleDateString('pt-pt')
														? paidDate.toLocaleDateString('pt-pt')
														: profile.paidDate
														? new Date(
																profile.paidDate.toDate()
														  ).toLocaleDateString('pt-pt')
														: new Date().toLocaleDateString('pt-pt')
												}`}
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
													disabled={!editing}
													labelStyle={globalStyles.text.date}
													onPress={() => setEndDateModal(true)}
													testID='EndDateButton'
												>
													{`${t('member.until')} ${
														endDate || editing ? endDate : profile.endDate
													}`}
												</Button>
											</View>
										</>
									) : null}
								</View>
							</KeyboardAvoidingView>
						</ScrollView>

						<View style={globalStyles.container.button}>
							{editing ? (
								<Button
									style={globalStyles.button.profile}
									contentStyle={globalStyles.buttonContent.global}
									labelStyle={globalStyles.buttonText.global}
									icon='content-save'
									mode='elevated'
									loading={loadingSave}
									onPress={saveMember}
									testID='SaveButton'
								>
									{t('button.saveMember')}
								</Button>
							) : (
								<>
									<Button
										style={globalStyles.button.profile}
										contentStyle={globalStyles.buttonContent.global}
										labelStyle={globalStyles.buttonText.global}
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
											setPaidDate(
												profile.paidDate
													? new Date(profile.paidDate.toDate())
													: new Date()
											);
											setEndDate(profile.endDate || new Date().getFullYear());
											setProfilePicture('');
										}}
										testID='EditButton'
									>
										{t('button.editMember')}
									</Button>
									<Button
										style={globalStyles.button.profile}
										contentStyle={globalStyles.buttonContent.global}
										labelStyle={globalStyles.buttonText.global}
										icon='account-remove'
										mode='elevated'
										loading={loadingDelete}
										onPress={() => {
											showDialog({
												text: t('dialog.deleteConfirmation'),
												onConfirmation: () => {
													deleteMember();
												},
											});
										}}
										testID='DeleteButton'
									>
										{t('button.deleteMember')}
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
