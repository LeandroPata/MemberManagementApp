import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, View } from 'react-native';
import NfcManager from 'react-native-nfc-manager';
import { ActivityIndicator, Button, Dialog, Portal } from 'react-native-paper';
import { useDialog } from '@/context/DialogContext';
import { useSnackbar } from '@/context/SnackbarContext';
import { globalStyles } from '@/styles/global';
import { checkDoc } from '@/utils/Firebase';
import { checkNFC, goToNFCSettings, readNFC } from '@/utils/NFC';
import { goToProfile } from '@/utils/Utils';

/* import firestore, { Timestamp } from '@react-native-firebase/firestore';
import type { FirebaseError } from 'firebase/app'; */

export default function Home() {
	const { t } = useTranslation();

	const [readNFCVisible, setReadNFCVisible] = useState(false);

	// All the logic to implement DialogContext
	const { showDialog } = useDialog();

	// All the logic to implement the snackbar
	const { showSnackbar } = useSnackbar();

	/* const convertDB = async () => {
		await firestore()
			.collection('members')
			.orderBy('name', 'asc')
			.get()
			.then((querySnapshot) => {
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
		const nfcStatus = await checkNFC();
		if (!nfcStatus) {
			showDialog({
				text: t('nfc.isDisabled'),
				onConfirmation: () => goToNFCSettings(),
				onDismissText: t('dialog.cancel'),
				onConfirmationText: t('nfc.settings'),
				testID: 'NFCDisabledDialog',
			});
			return false;
		}

		setReadNFCVisible(true);

		const payload = await readNFC();
		if (!payload) {
			showSnackbar(t('nfc.invalidTag'));
			return false;
		}

		setReadNFCVisible(false);

		const docCheck = await checkDoc(payload);
		if (docCheck) goToProfile(payload);
		else showSnackbar(t('nfc.memberNotFound'));
	};

	return (
		<>
			<Portal>
				<Dialog
					visible={readNFCVisible}
					onDismiss={() => {
						NfcManager.cancelTechnologyRequest();
						setReadNFCVisible(false);
					}}
					testID='ReadNFCDialog'
				>
					<Dialog.Title style={{ textAlign: 'center' }}>
						{t('nfc.readNFC')}
					</Dialog.Title>
					<Dialog.Content>
						<ActivityIndicator size='large' />
					</Dialog.Content>
				</Dialog>
			</Portal>

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
						onPress={() => router.push('/addMember')}
						testID='AddButton'
					>
						{t('button.addMember')}
					</Button>
					<Button
						style={globalStyles.button.global}
						contentStyle={globalStyles.buttonContent.global}
						labelStyle={globalStyles.buttonText.global}
						icon='account-search'
						mode='elevated'
						//loading={loginLoading}
						onPress={() => router.push('/searchMember')}
						testID='SearchButton'
					>
						{t('button.searchMember')}
					</Button>
					<Button
						style={globalStyles.button.global}
						contentStyle={globalStyles.buttonContent.global}
						labelStyle={globalStyles.buttonText.global}
						icon='account-sync'
						mode='elevated'
						//loading={loginLoading}
						onPress={() => router.push('/updateMembers')}
						testID='UpdateButton'
					>
						{t('button.updateMembers')}
					</Button>
					<Button
						style={globalStyles.button.global}
						contentStyle={globalStyles.buttonContent.global}
						labelStyle={globalStyles.buttonText.global}
						icon='database'
						mode='elevated'
						//loading={loginLoading}
						onPress={() => router.push('/importExport')}
						testID='ImportExportButton'
					>
						{t('button.importExport')}
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
						{t('button.nfc')}
					</Button>
				</View>
			</View>
		</>
	);
}
