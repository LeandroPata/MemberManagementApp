import React from 'react';
import { View, Image } from 'react-native';
import { Button } from 'react-native-paper';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { globalStyles } from '@/styles/global';

export default function NFC() {
	const { t } = useTranslation();

	const readNFC = () => {};

	const writeNFC = () => {};

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
					//loading={loginLoading}
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
					//loading={loginLoading}
					onPress={writeNFC}
					testID='WriteNFC'
				>
					{t('nfc.writeNFC')}
				</Button>
			</View>
		</View>
	);
}
