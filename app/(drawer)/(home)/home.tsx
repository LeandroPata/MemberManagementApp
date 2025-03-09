import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Button } from 'react-native-paper';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

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
		<View style={styles.container}>
			<View style={styles.imageContainer}>
				<Image
					style={styles.image}
					source={require('@/assets/images/logoReact.png')}
				/>
			</View>
			<View style={styles.buttonContainer}>
				<Button
					style={styles.button}
					contentStyle={styles.buttonContent}
					labelStyle={styles.buttonText}
					icon='account-plus'
					mode='elevated'
					//loading={loginLoading}
					onPress={() => router.push('/(drawer)/(home)/addMember')}
				>
					{t('home.addMember')}
				</Button>
				<Button
					style={styles.button}
					contentStyle={styles.buttonContent}
					labelStyle={styles.buttonText}
					icon='account-search'
					mode='elevated'
					//loading={loginLoading}
					onPress={() => router.push('/(drawer)/(home)/searchMember')}
				>
					{t('home.searchMember')}
				</Button>
				<Button
					style={styles.button}
					contentStyle={styles.buttonContent}
					labelStyle={styles.buttonText}
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

const styles = StyleSheet.create({
	container: {
		flex: 1,
		//justifyContent: 'center',
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
	imageContainer: {
		justifyContent: 'center',
		alignSelf: 'center',
		width: '50%',
		height: '35%',
	},
	image: {
		resizeMode: 'contain',
		width: '100%',
		height: '100%',
	},
});
