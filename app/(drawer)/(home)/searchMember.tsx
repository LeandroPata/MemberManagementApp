import React, { useCallback, useState } from 'react';
import {
	View,
	StyleSheet,
	KeyboardAvoidingView,
	FlatList,
	Keyboard,
} from 'react-native';
import {
	Avatar,
	Button,
	TouchableRipple,
	Text,
	useTheme,
	Divider,
	Searchbar,
} from 'react-native-paper';
import { router, useFocusEffect } from 'expo-router';
import firestore from '@react-native-firebase/firestore';
import type { FirebaseError } from 'firebase/app';
import { useTranslation } from 'react-i18next';
import Fuse from 'fuse.js';
import SearchList from '@/components/SearchList';

export default function SearchMember() {
	const theme = useTheme();
	const { t } = useTranslation();

	const [memberList, setMemberList] = useState([]);
	const [hintMemberList, setHintMemberList] = useState([]);

	const [loadingName, setLoadingName] = useState(false);
	const [loadingNumber, setLoadingNumber] = useState(false);

	const [name, setName] = useState('');
	const [memberNumber, setMemberNumber] = useState('');
	const [members, setMembers] = useState([]);

	const [refreshFlatlist, setRefreshFlatlist] = useState(false);

	useFocusEffect(
		useCallback(() => {
			// Screen focused
			//console.log("Hello, I'm focused!");
			getMemberList();
			getAllMembers();

			// Screen unfocused in return
			return () => {
				//console.log('This route is now unfocused.');
			};
		}, [])
	);

	const getAllMembers = () => {
		setLoadingName(true);
		setLoadingNumber(true);

		firestore()
			.collection('members')
			.orderBy('name', 'asc')
			.get()
			.then((querySnapshot) => {
				const membersAll = [];
				querySnapshot.forEach((doc) => {
					membersAll.push({
						key: doc.id,
						name: doc.data().name,
						memberNumber: doc.data().memberNumber,
						profilePicture: doc.data().profilePicture,
					});
				});
				//console.log(membersAll);
				setMembers(membersAll);
				setLoadingName(false);
				setLoadingNumber(false);
			})
			.catch((e: any) => {
				const err = e as FirebaseError;
				console.log(`Error getting all member list: ${err.message}`);
				setLoadingName(false);
				setLoadingNumber(false);
			});
	};

	const getMemberList = async () => {
		await firestore()
			.collection('members')
			.orderBy('name', 'asc')
			.get()
			.then((querySnapshot) => {
				const membersName = [];

				// biome-ignore lint/complexity/noForEach:<Method that returns iterator necessary>
				querySnapshot.forEach((doc) => {
					if (!membersName.includes(doc.data().name))
						membersName.push(doc.data().name);
				});
				//console.log(membersName);
				setMemberList(membersName);
			})
			.catch((e: any) => {
				const err = e as FirebaseError;
				console.log(`Error getting member list: ${err.message}`);
			});
	};

	const filterMemberList = async (input: string) => {
		const fuseOptions = {
			includeScore: true,
			shouldSort: true,
			keys: ['name'],
			minMatchCharLength: 2,
			threshold: 0.3,
		};
		const fuse = new Fuse(memberList, fuseOptions);

		const results = fuse.search(input);

		//console.log(results);
		setHintMemberList(results);
	};

	const getMembersByName = async (memberName: string, fuzzySearch = false) => {
		setLoadingName(true);
		const currentMembers = [];

		if (!memberName && !name) {
			if (memberNumber) {
				getMembersByNumber(Number(memberNumber));
				setLoadingName(false);
			} else getAllMembers();
			return;
		} else if (fuzzySearch) {
			await firestore()
				.collection('members')
				.orderBy('name', 'asc')
				.get()
				.then((querySnapshot) => {
					if (querySnapshot.docs.length) {
						querySnapshot.forEach((doc) => {
							for (const hintMember of hintMemberList) {
								//console.log(hintMember);
								//console.log(doc.data());
								if (doc.data().name === hintMember.item)
									currentMembers.push({
										key: doc.id,
										name: doc.data().name,
										memberNumber: doc.data().memberNumber,
										profilePicture: doc.data().profilePicture,
									});
							}
						});
					}
				})
				.catch((e: any) => {
					const err = e as FirebaseError;
					console.log(`Error getting member list: ${err.message}`);
					setLoadingName(false);
				});
		} else {
			//console.log(memberName);
			await firestore()
				.collection('members')
				.orderBy('name', 'asc')
				.where('name', '==', memberName)
				.get()
				.then((querySnapshot) => {
					if (querySnapshot.docs.length) {
						querySnapshot.forEach((doc) => {
							//console.log(doc.data());
							currentMembers.push({
								key: doc.id,
								name: doc.data().name,
								memberNumber: doc.data().memberNumber,
								profilePicture: doc.data().profilePicture,
							});
						});
					}
				})
				.catch((e: any) => {
					const err = e as FirebaseError;
					console.log(`Error getting member list: ${err.message}`);
					setLoadingName(false);
				});
		}
		setMembers(currentMembers);
		setHintMemberList([]);
		setLoadingName(false);
	};

	const getMembersByNumber = async (number: number) => {
		setLoadingNumber(true);
		const currentMembers = [];

		if (!number || number <= 0) {
			if (name) {
				getMembersByName(name);
				setLoadingNumber(false);
			} else getAllMembers();
			return;
		} else {
			await firestore()
				.collection('members')
				.orderBy('memberNumber', 'asc')
				.where('memberNumber', '==', number)
				.get()
				.then((querySnapshot) => {
					if (querySnapshot.docs.length) {
						querySnapshot.forEach((doc) => {
							//console.log(doc.data());
							currentMembers.push({
								key: doc.id,
								name: doc.data().name,
								memberNumber: doc.data().memberNumber,
								profilePicture: doc.data().profilePicture,
							});
						});
					}
				})
				.catch((e: any) => {
					const err = e as FirebaseError;
					console.log(`Error getting member list: ${err.message}`);
					setLoadingNumber(false);
				});
		}
		setMembers(currentMembers);
		setLoadingNumber(false);
	};

	const orderMembersName = () => {
		try {
			const orderedMembers = members;
			orderedMembers.sort((a, b) => a.name.localeCompare(b.name));
			setMembers(orderedMembers);
			setRefreshFlatlist(!refreshFlatlist);
		} catch (e: any) {
			const err = e as FirebaseError;
			console.log(`Ordering members by name failed: ${err.message}`);
			//showSnackbar('Ordering members by name failed: ' + err.message);
		}
	};

	const orderMembersNumber = () => {
		try {
			const orderedMembers = members;
			orderedMembers.sort((a, b) => a.memberNumber - b.memberNumber);
			setMembers(orderedMembers);
			setRefreshFlatlist(!refreshFlatlist);
		} catch (e: any) {
			const err = e as FirebaseError;
			console.log(`Ordering members by name failed: ${err.message}`);
			//showSnackbar('Ordering members by name failed: ' + err.message);
		}
	};

	const renderItem = ({ item }) => {
		//console.log(item);
		return (
			<TouchableRipple
				style={[styles.item, { backgroundColor: theme.colors.primary }]}
				onPress={() => {
					router.push({
						pathname: '/profile',
						params: { profileID: item.key },
					});
				}}
			>
				<View>
					<Avatar.Image
						size={100}
						style={{ alignSelf: 'center', marginBottom: 10 }}
						source={{
							uri: item.profilePicture
								? item.profilePicture
								: process.env.EXPO_PUBLIC_PLACEHOLDER_PICTURE_URL,
						}}
					/>
					<Text style={[styles.title, { color: theme.colors.onPrimary }]}>
						{`${t('searchMember.name')}: ${item.name}`}
					</Text>
					<Text style={[styles.title, { color: theme.colors.onPrimary }]}>
						{`${t('searchMember.memberNumber')}: ${item.memberNumber}`}
					</Text>
				</View>
			</TouchableRipple>
		);
	};

	const renderMemberHint = ({ item }) => {
		//console.log(item.item + ' : ' + item.score);
		//console.log(item);
		return (
			<>
				<Divider bold={true} />
				<TouchableRipple
					onPress={() => {
						Keyboard.dismiss();

						setName(item.item);
						getMembersByName(item.item);
					}}
				>
					<Text style={{ padding: 5 }}>{item.item}</Text>
				</TouchableRipple>
				<Divider bold={true} />
			</>
		);
	};

	return (
		<View style={styles.container}>
			<SearchList
				style={{ marginBottom: 10 }}
				icon='account'
				value={name}
				placeholder={t('searchMember.name')}
				data={hintMemberList}
				onChangeText={(input) => {
					setName(input);
					if (input.trim()) filterMemberList(input);
					else setHintMemberList([]);
				}}
				/* onEndEditing={() => {
						getMembersByName(name, true);
					}} */
				onSubmitEditing={() => {
					getMembersByName(name, true);
				}}
				onFocus={() => filterMemberList(name)}
				onBlur={() => setHintMemberList([])}
				renderItem={renderMemberHint}
				loading={loadingName}
				onClearIconPress={() => {
					setName('');
					setHintMemberList([]);
				}}
			/>
			<Searchbar
				style={{ marginBottom: 10 }}
				icon='numeric'
				value={memberNumber}
				//onChangeText={setMemberNumber}
				onChangeText={(input) => {
					setMemberNumber(input.replace(/[^0-9]/g, ''));
				}}
				//onEndEditing={props.onEndEditing}
				onSubmitEditing={() => {
					getMembersByNumber(Number(memberNumber.trim()));
				}}
				maxLength={6}
				loading={loadingNumber}
				autoCapitalize='none'
				keyboardType='numeric'
				placeholder={t('searchMember.memberNumber')}
				onClearIconPress={() => {
					setMemberNumber('');
				}}
			/>
			<KeyboardAvoidingView
				style={{ marginHorizontal: '3%' }}
				behavior='padding'
			>
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'space-between',
						alignItems: 'center',
						marginVertical: '3%',
					}}
				>
					<View style={{ width: '49%' }}>
						<Button
							style={styles.button}
							labelStyle={[
								styles.buttonText,
								{ fontSize: 15, paddingTop: 0, fontWeight: 'normal' },
							]}
							mode='elevated'
							onPress={() => orderMembersName()}
						>
							{t('searchMember.orderName')}
						</Button>
					</View>

					<View style={{ width: '49%' }}>
						<Button
							style={styles.button}
							labelStyle={[
								styles.buttonText,
								{ fontSize: 13, paddingTop: 0, fontWeight: 'normal' },
							]}
							mode='elevated'
							onPress={() => orderMembersNumber()}
						>
							{t('searchMember.orderNumber')}
						</Button>
					</View>
				</View>
			</KeyboardAvoidingView>

			<FlatList
				data={members}
				renderItem={renderItem}
				keyExtractor={(item) => item.key}
				extraData={refreshFlatlist}
				numColumns={2}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
	},
	buttonContainer: {
		marginHorizontal: 20,
		alignItems: 'center',
	},
	button: {
		justifyContent: 'center',
	},
	buttonContent: {
		minWidth: 250,
		minHeight: 50,
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
	item: {
		borderRadius: 5,
		paddingHorizontal: 10,
		paddingVertical: 5,
		marginVertical: '1%',
		marginHorizontal: '1%',
		width: '48%',
	},
	title: {
		fontSize: 15,
		fontWeight: 'bold',
	},
});
