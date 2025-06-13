import React, { useState } from 'react';
import { View } from 'react-native';
import { Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import type { FirebaseError } from 'firebase/app';
import firestore from '@react-native-firebase/firestore';
import { useSnackbar } from '@/context/SnackbarContext';
import { globalStyles } from '@/styles/global';

export default function UpdateMembers() {
	const { t } = useTranslation();

	const [loadingNumbers, setLoadingNumbers] = useState(false);

	// All the logic to implement the snackbar
	const { showSnackbar } = useSnackbar();

	const updateMembersNumbers = async () => {
		setLoadingNumbers(true);

		try {
			const members = await firestore()
				.collection('members')
				.orderBy('memberNumber', 'asc')
				.get();

			const batch = firestore().batch();
			let minNumber = 1;
			// biome-ignore lint/complexity/noForEach:<Method that returns iterator necessary></Method>
			members.forEach((docSnapshot) => {
				batch.update(docSnapshot.ref, { memberNumber: minNumber });
				minNumber++;
			});

			await batch.commit();
			showSnackbar(t('dialog.updateNumbersSuccess'));
		} catch (e: any) {
			const err = e as FirebaseError;
			//showSnackbar('Updating members numbers failed: ' + err.message);
			console.log(`Updating members numbers failed: ${err.message}`);
			setLoadingNumbers(false);
			return;
		}
		setLoadingNumbers(false);
	};

	return (
		<View
			style={globalStyles.container.global}
			testID='UpdateMemberPage'
		>
			<View style={globalStyles.container.button}>
				<Button
					style={globalStyles.button.global}
					contentStyle={globalStyles.buttonContent.global}
					labelStyle={globalStyles.buttonText.global}
					icon='format-list-numbered'
					mode='elevated'
					loading={loadingNumbers}
					onPress={updateMembersNumbers}
					testID='UpdateNumbersButton'
				>
					{t('button.updateMembersNumbers')}
				</Button>
			</View>
		</View>
	);
}
