import React, { useCallback, useState } from 'react';
import { View, Image } from 'react-native';
import { Button } from 'react-native-paper';
import { router, useFocusEffect } from 'expo-router';
import NfcManager, { Ndef, NfcTech, TagEvent } from 'react-native-nfc-manager';
import { useTranslation } from 'react-i18next';
import { globalStyles } from '@/styles/global';
import { checkDoc } from '@/utils/Firebase';

NfcManager.start();

export default function NFC() {
	const { t } = useTranslation();

	const [loadingRead, setLoadingRead] = useState(false);
	const [loadingWrite, setLoadingWrite] = useState(false);

	useFocusEffect(
		useCallback(() => {
			// Screen focused
			//console.log("Hello, I'm focused!");

			// Screen unfocused in return
			return () => {
				//console.log('This route is now unfocused.');
				NfcManager.cancelTechnologyRequest();
			};
		}, [])
	);

	// To decode the payload into plain text
	const decodePayload = (tag: TagEvent) => {
		const payload = Ndef.text.decodePayload(tag?.ndefMessage[0].payload);
		console.log(payload);
		return payload;
	};

	const goToProfile = (id: string) => {
		router.replace({
			pathname: '/(drawer)/(home)/(profile)/profile',
			params: { profileID: id },
		});
	};

	const checkNFC = async () => {
		const supported = await NfcManager.isSupported();
		console.log(`NFC Supported: ${supported}`);
		const enabled = await NfcManager.isEnabled();
		console.log(`NFC Enabled: ${enabled}`);

		if (supported && enabled) return true;
		else return false;
	};

	const readNFC = async () => {
		setLoadingRead(true);
		let payload = '';

		try {
			const check = checkNFC();
			if (!check) {
				setLoadingRead(false);
				return false;
			}

			await NfcManager.requestTechnology(NfcTech.Ndef);

			const tag = await NfcManager.getTag();
			console.log(tag);
			if (tag) payload = decodePayload(tag);

			const docCheck = await checkDoc(payload);
			if (docCheck) goToProfile(payload);
		} catch (e: any) {
			console.log(`Error: ${e.message}`);
			setLoadingRead(false);
		} finally {
			NfcManager.cancelTechnologyRequest();
			setLoadingRead(false);
		}
	};

	// Im aware that, as is, anyone with an external NFC tool can
	// get the plain text from the card, possibly resulting in their duplication
	// A solution would be to pass the id through a cypher first and then encoding it
	const writeNFC = async () => {
		setLoadingWrite(true);
		let result = false;

		try {
			const check = checkNFC();
			if (!check) {
				setLoadingRead(false);
				return false;
			}

			await NfcManager.requestTechnology(NfcTech.Ndef);

			const payload = Ndef.encodeMessage([
				Ndef.textRecord('pia3TdSAfLh2tXMgAEev'),
			]);
			console.log(payload);

			if (payload) {
				await NfcManager.ndefHandler.writeNdefMessage(payload);
				result = true;
			}
		} catch (e: any) {
			console.log(`Error: ${e.message}`);
			setLoadingWrite(false);
		} finally {
			NfcManager.cancelTechnologyRequest();
			setLoadingWrite(false);
		}
		return result;
	};

	return (
		<View
			style={globalStyles.container.global}
			testID='NFCPage'
		>
			<View style={globalStyles.container.button}>
				<Button
					style={globalStyles.button.global}
					contentStyle={globalStyles.buttonContent.global}
					labelStyle={globalStyles.buttonText.global}
					icon='nfc-search-variant'
					mode='elevated'
					loading={loadingRead}
					disabled={loadingRead}
					onPress={readNFC}
					testID='ReadNFC'
				>
					{t('nfc.readNFC')}
				</Button>
				<Button
					style={globalStyles.button.global}
					contentStyle={globalStyles.buttonContent.global}
					labelStyle={globalStyles.buttonText.global}
					icon='nfc-variant'
					mode='elevated'
					loading={loadingWrite}
					disabled={loadingWrite}
					onPress={writeNFC}
					testID='WriteNFC'
				>
					{t('nfc.writeNFC')}
				</Button>
			</View>
		</View>
	);
}
