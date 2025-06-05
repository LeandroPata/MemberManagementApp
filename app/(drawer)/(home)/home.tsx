import React from 'react';
import { View, Image } from 'react-native';
import { Button } from 'react-native-paper';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { globalStyles } from '@/styles/global';
import { goToNFCSettings, readNFC } from '@/utils/NFC';
import { useDialog } from '@/context/DialogueConfirmationContext';
import { checkDoc } from '@/utils/Firebase';
import MenuComponent from '@/components/MenuComponent';
import { goToProfile } from '@/utils/Utils';

/* import firestore, { Timestamp } from '@react-native-firebase/firestore';
import type { FirebaseError } from 'firebase/app'; */

export default function Home() {
	const { t } = useTranslation();

	// All the logic to implement DialogConfirmation
	const { showDialog } = useDialog();

	/* const convertDB = async () => {
		await firestore()
			.collection('members')
			.orderBy('name', 'asc')
			.get()
			.then((querySnapshot) => {
				// biome-ignore lint/complexity/noForEach:<Method that returns iterator necessary>
				querySnapshot.forEach((doc) => {
					const docRef = firestore().collection('members').doc(doc.id);
					docRef.update({
						paidDate: Timestamp.fromDate(new Date()),
						endDate: new Date().getFullYear(),
					});
				});
			})
			.catch((e: any) => {
				const err = e as FirebaseError;
				//showSnackbar('File upload failed: ' + err.message);
				console.log(`Updating db failed: ${err.message}`);
			});
	}; */

	const rNFC = async () => {
		const payload = await readNFC();
		if (!payload) {
			showDialog({
				text: t('nfc.goToSettings'),
				onConfirmation: () => goToNFCSettings(),
				onDismissText: 'Cancel',
				onConfirmationText: 'Go to Settings',
			});
			MenuComponent;
			return false;
		}

		const docCheck = await checkDoc(payload);
		if (docCheck) goToProfile(payload);
	};

	return (
		<View
			style={globalStyles.container.home}
			testID='HomePage'
		>
			<View style={globalStyles.container.image}>
				<Image
					style={globalStyles.image.global}
					source={require('@/assets/images/logoReact.png')}
					testID='HomeLogo'
				/>
			</View>
			<View style={globalStyles.container.button}>
				<Button
					style={globalStyles.button.global}
					contentStyle={globalStyles.buttonContent.global}
					labelStyle={globalStyles.buttonText.global}
					icon='account-plus'
					mode='elevated'
					//loading={loginLoading}
					onPress={() => router.push('/(drawer)/(home)/addMember')}
					testID='AddButton'
				>
					{t('home.addMember')}
				</Button>
				<Button
					style={globalStyles.button.global}
					contentStyle={globalStyles.buttonContent.global}
					labelStyle={globalStyles.buttonText.global}
					icon='account-search'
					mode='elevated'
					//loading={loginLoading}
					onPress={() => router.push('/(drawer)/(home)/searchMember')}
					testID='SearchButton'
				>
					{t('home.searchMember')}
				</Button>
				<Button
					style={globalStyles.button.global}
					contentStyle={globalStyles.buttonContent.global}
					labelStyle={globalStyles.buttonText.global}
					icon='nfc'
					mode='elevated'
					//loading={loginLoading}
					onPress={() => router.push('/(drawer)/(home)/updateMembers')}
					testID='UpdateMembersButton'
				>
					{t('home.updateMembers')}
				</Button>
				<Button
					style={globalStyles.button.global}
					contentStyle={globalStyles.buttonContent.global}
					labelStyle={globalStyles.buttonText.global}
					icon='database'
					mode='elevated'
					//loading={loginLoading}
					onPress={() => router.push('/(drawer)/(home)/importExport')}
					testID='ImportExportButton'
				>
					{t('home.importExport')}
				</Button>
				<Button
					style={globalStyles.button.global}
					contentStyle={globalStyles.buttonContent.global}
					labelStyle={globalStyles.buttonText.global}
					icon='nfc'
					mode='elevated'
					//loading={loginLoading}
					onPress={rNFC}
					testID='NFCButton'
				>
					{t('home.nfc')}
				</Button>
			</View>
		</View>
	);
}
