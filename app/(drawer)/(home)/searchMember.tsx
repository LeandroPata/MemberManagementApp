import React, { useCallback, useState } from 'react';
import { View, KeyboardAvoidingView, FlatList, Keyboard } from 'react-native';
import {
	Avatar,
	Button,
	TouchableRipple,
	Text,
	useTheme,
	Divider,
	Searchbar,
	Portal,
	Modal,
	IconButton,
} from 'react-native-paper';
import { router, useFocusEffect } from 'expo-router';
import firestore from '@react-native-firebase/firestore';
import type { FirebaseError } from 'firebase/app';
import { useTranslation } from 'react-i18next';
import Fuse from 'fuse.js';
import SearchList from '@/components/SearchList';
import { globalStyles } from '@/styles/global';
import { useBackHandler } from '@react-native-community/hooks';
import { getMembers, getMemberNames, getSingleMember } from '@/utils/Firebase';

export default function SearchMember() {
	const theme = useTheme();
	const { t } = useTranslation();

	const [memberList, setMemberList] = useState([]);
	const [hintMemberList, setHintMemberList] = useState([]);

	const [loadingName, setLoadingName] = useState(false);
	const [loadingNumber, setLoadingNumber] = useState(false);

	const [orderModal, setOrderModal] = useState(false);
	const [orderAscending, setOrderAscending] = useState(true);

	const [name, setName] = useState('');
	const [memberNumber, setMemberNumber] = useState('');
	const [members, setMembers] = useState([]);

	const [refreshFlatlist, setRefreshFlatlist] = useState(false);

	useBackHandler(() => {
		router.replace('/(drawer)/(home)/home');
		return true;
	});

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

	const getAllMembers = async () => {
		setLoadingName(true);
		setLoadingNumber(true);
		try {
			const membersAll = await getMembers();
			//console.log(membersAll);
			orderMembersEndDate(membersAll);
			//setMembers(membersAll);
			setOrderAscending(true);
			setLoadingName(false);
			setLoadingNumber(false);
		} catch (e: any) {
			const err = e as FirebaseError;
			console.log(`Error getting all member list: ${err.message}`);
			setLoadingName(false);
			setLoadingNumber(false);
		}
	};

	const getMemberList = async () => {
		try {
			const membersName = await getMemberNames();
			//console.log(membersName);
			setMemberList(membersName);
		} catch (e: any) {
			const err = e as FirebaseError;
			console.log(`Error getting member list: ${err.message}`);
		}
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
						// biome-ignore lint/complexity/noForEach:<Method that returns iterator necessary>
						querySnapshot.forEach((doc) => {
							for (const hintMember of hintMemberList) {
								//console.log(hintMember);
								//console.log(doc.data());
								if (doc.data().name === hintMember.item)
									currentMembers.push({
										key: doc.id,
										name: doc.data().name,
										memberNumber: doc.data().memberNumber,
										endDate: doc.data().endDate,
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
						// biome-ignore lint/complexity/noForEach:<Method that returns iterator necessary>
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
		orderMembersEndDate(currentMembers);
		//setMembers(currentMembers);
		setOrderAscending(true);
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
						// biome-ignore lint/complexity/noForEach:<Method that returns iterator necessary>
						querySnapshot.forEach((doc) => {
							//console.log(doc.data());
							currentMembers.push({
								key: doc.id,
								name: doc.data().name,
								memberNumber: doc.data().memberNumber,
								endDate: doc.data().endDate,
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
		orderMembersEndDate(currentMembers);
		//setMembers(currentMembers);
		setOrderAscending(true);
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
			console.log(`Ordering members by number failed: ${err.message}`);
			//showSnackbar('Ordering members by number failed: ' + err.message);
		}
	};

	const orderMembersEndDate = (newMembers?: object[]) => {
		try {
			let orderedMembers = [];
			if (newMembers && newMembers.length > 0) orderedMembers = newMembers;
			else orderedMembers = members;
			orderedMembers.sort((a, b) => {
				if (!a.endDate) return 1;
				if (!b.endDate) return -1;
				return a.endDate - b.endDate;
			});
			setMembers(orderedMembers);
			setRefreshFlatlist(!refreshFlatlist);
		} catch (e: any) {
			const err = e as FirebaseError;
			console.log(`Ordering members by endDate failed: ${err.message}`);
			//showSnackbar('Ordering members by endDate failed: ' + err.message);
		}
	};

	const invertOrder = () => {
		try {
			const newOrder = members.toReversed();
			setMembers(newOrder);
		} catch (e: any) {
			const err = e as FirebaseError;
			console.log(`Inverting members order failed: ${err.message}`);
			//showSnackbar('Inverting members order failed: ' + err.message);
		}
	};

	const renderItem = ({ item }) => {
		//console.log(item);
		return (
			<TouchableRipple
				style={[globalStyles.item, { backgroundColor: theme.colors.primary }]}
				onPress={() => {
					router.push({
						pathname: '/profile',
						params: { profileID: item.key },
					});
				}}
				testID='ItemButton'
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
					<Text
						style={[
							globalStyles.text.search,
							{ color: theme.colors.onPrimary },
						]}
					>
						{`${t('searchMember.name')}: ${item.name}`}
					</Text>
					<Text
						style={[
							globalStyles.text.search,
							{ color: theme.colors.onPrimary },
						]}
					>
						{`${t('searchMember.memberNumber')}: ${item.memberNumber}`}
					</Text>
					<Text
						style={[
							globalStyles.text.search,
							{ color: theme.colors.onPrimary },
						]}
					>
						{item.endDate
							? `${t('searchMember.paid')} ${item.endDate}`
							: t('searchMember.notPaid')}
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
					testID='NameHintList'
				>
					<Text style={{ padding: 5 }}>{item.item}</Text>
				</TouchableRipple>
				<Divider bold={true} />
			</>
		);
	};

	return (
		<>
			<Portal>
				<Modal
					visible={orderModal}
					onDismiss={() => {
						setOrderModal(false);
					}}
					style={globalStyles.modalContainer.global}
					contentContainerStyle={[
						globalStyles.modalContentContainer.global,
						{ backgroundColor: theme.colors.primaryContainer },
					]}
					testID='OrderModal'
				>
					<Button
						style={globalStyles.button.global}
						contentStyle={globalStyles.buttonContent.global}
						labelStyle={globalStyles.buttonText.global}
						icon='sort-alphabetical-variant'
						mode='elevated'
						onPress={() => {
							orderMembersName();
							setOrderModal(false);
						}}
						testID='OrderNameButton'
					>
						{t('searchMember.orderName')}
					</Button>

					<Button
						style={globalStyles.button.global}
						contentStyle={globalStyles.buttonContent.global}
						labelStyle={[
							globalStyles.buttonText.global,
							{ wordWrap: 'wrap', flexWrap: 'wrap', flexShrink: 1 },
						]}
						icon='sort-numeric-variant'
						mode='elevated'
						onPress={() => {
							orderMembersNumber();
							setOrderModal(false);
						}}
						testID='OrderNumberButton'
					>
						{t('searchMember.orderNumber')}
					</Button>

					<Button
						style={globalStyles.button.global}
						contentStyle={globalStyles.buttonContent.global}
						labelStyle={globalStyles.buttonText.global}
						icon='sort-calendar-ascending'
						mode='elevated'
						onPress={() => {
							orderMembersName();
							orderMembersEndDate();
							setOrderModal(false);
						}}
						testID='OrderDateButton'
					>
						{t('searchMember.orderEndDate')}
					</Button>
				</Modal>
			</Portal>

			<View
				style={globalStyles.container.global}
				testID='SearchPage'
			>
				<SearchList
					style={globalStyles.searchBar}
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
					autoCapitalize='words'
					onClearIconPress={() => {
						setName('');
						setHintMemberList([]);
						getAllMembers();
					}}
					testID='NameSearch'
				/>
				<Searchbar
					style={globalStyles.searchBar}
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
						getAllMembers();
					}}
					testID='NumberSearch'
				/>
				<KeyboardAvoidingView
					style={{ marginHorizontal: '3%' }}
					behavior='padding'
				>
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'center',
							alignItems: 'center',
							marginVertical: '3%',
						}}
					>
						<Button
							style={globalStyles.button.search}
							contentStyle={globalStyles.buttonContent.modal}
							labelStyle={[globalStyles.buttonText.search, { paddingTop: 0 }]}
							icon='sort'
							mode='elevated'
							onPress={() => setOrderModal(true)}
							testID='OrderButton'
						>
							{t('searchMember.orderBy')}
						</Button>

						<IconButton
							icon={orderAscending ? 'arrow-down' : 'arrow-up'}
							size={25}
							mode='contained-tonal'
							iconColor={theme.colors.primary}
							containerColor={theme.colors.elevation.level1}
							onPress={() => {
								invertOrder();
								setOrderAscending(!orderAscending);
							}}
							animated={true}
							testID='OrderReverseButton'
						/>
					</View>
				</KeyboardAvoidingView>

				<FlatList
					data={members}
					renderItem={renderItem}
					keyExtractor={(item) => item.key}
					extraData={refreshFlatlist}
					numColumns={2}
					testID='MembersList'
				/>
			</View>
		</>
	);
}
