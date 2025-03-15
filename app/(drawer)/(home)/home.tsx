import React from 'react';
import { View, Image } from 'react-native';
import { Button } from 'react-native-paper';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { globalStyles } from '@/styles/global';

/* import firestore, { Timestamp } from '@react-native-firebase/firestore';
import type { FirebaseError } from 'firebase/app'; */

export default function Home() {
	const { t } = useTranslation();

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

	return (
		<View style={globalStyles.container.home}>
			<View style={globalStyles.container.image}>
				<Image
					style={globalStyles.image.global}
					source={require('@/assets/images/logoReact.png')}
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
				>
					{t('home.searchMember')}
				</Button>
				<Button
					style={globalStyles.button.global}
					contentStyle={globalStyles.buttonContent.global}
					labelStyle={globalStyles.buttonText.global}
					icon='database'
					mode='elevated'
					//loading={loginLoading}
					onPress={() => router.push('/(drawer)/(home)/importExport')}
				>
					{t('home.importExport')}
				</Button>
			</View>
		</View>
	);
}
