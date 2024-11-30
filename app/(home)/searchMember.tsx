import React, { useEffect, useState } from 'react';
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
  TextInput,
  TouchableRipple,
  Text,
  useTheme,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import firestore from '@react-native-firebase/firestore';

export default function SearchMember() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(false);

  const [name, setName] = useState('');
  const [memberNumber, setMemberNumber] = useState('');
  const [members, setMembers] = useState([]);

  const [refreshFlatlist, setRefreshFlatlist] = useState(false);

  useEffect(() => {
    if (search) {
      setLoading(true);

      if (!name.trim() && !memberNumber.trim()) {
        const subscriber = firestore()
          .collection('members')
          .orderBy('memberNumber', 'asc')
          .onSnapshot((querySnapshot) => {
            const members = [];
            querySnapshot.forEach((documentSnapshot) => {
              members.push({
                key: documentSnapshot.id,
                ...documentSnapshot.data(),
              });
            });
            setMembers(members);
            //console.log(members);
          });
        setLoading(false);
        return () => subscriber();
      } else if (name && name.trim() && memberNumber && memberNumber.trim()) {
        const subscriber = firestore()
          .collection('members')
          .where('memberNumber', '==', parseInt(memberNumber))
          .onSnapshot((querySnapshot) => {
            const members = [];
            querySnapshot.forEach((documentSnapshot) => {
              if (documentSnapshot.data().name.includes(name)) {
                members.push({
                  key: documentSnapshot.id,
                  ...documentSnapshot.data(),
                });
              }
            });
            setMembers(members);
            //console.log(members);
          });
        setLoading(false);
        return () => subscriber();
      } else if (name && name.trim() && !memberNumber.trim()) {
        const subscriber = firestore()
          .collection('members')
          .orderBy('name', 'asc')
          .onSnapshot((querySnapshot) => {
            const members = [];
            querySnapshot.forEach((documentSnapshot) => {
              if (documentSnapshot.data().name.includes(name)) {
                members.push({
                  key: documentSnapshot.id,
                  ...documentSnapshot.data(),
                });
              }
            });
            setMembers(members);
            //console.log(members);
          });
        setLoading(false);
        return () => subscriber();
      } else if (memberNumber && memberNumber.trim() && !name.trim()) {
        const subscriber = firestore()
          .collection('members')
          .orderBy('memberNumber', 'asc')
          .where('memberNumber', '==', parseInt(memberNumber))
          .onSnapshot((querySnapshot) => {
            const members = [];
            querySnapshot.forEach((documentSnapshot) => {
              members.push({
                key: documentSnapshot.id,
                ...documentSnapshot.data(),
              });
            });
            setMembers(members);
            //console.log(members);
          });
        setLoading(false);
        return () => subscriber();
      }
    }
    setLoading(false);
  }, [search]);

  const searchMember = async () => {
    Keyboard.dismiss();
    setLoading(true);

    if (!name.trim() && !memberNumber.trim()) {
      console.log('None');
      const snapshot = firestore()
        .collection('members')
        .orderBy('memberNumber', 'asc')
        .get()
        .then((querySnapshot) => {
          const members = [];
          querySnapshot.forEach((documentSnapshot) => {
            members.push({
              key: documentSnapshot.id,
              ...documentSnapshot.data(),
            });
          });
          setMembers(members);
          //console.log(members);
          if (members.length <= 0) {
            console.log('No member found.');
          } else {
            setSearch(true);
          }
        });
      setLoading(false);
    } else if (name && name.trim() && memberNumber && memberNumber.trim()) {
      console.log('Both');
      const snapshot = await firestore()
        .collection('members')
        .where('memberNumber', '==', parseInt(memberNumber))
        .get()
        .then((querySnapshot) => {
          const members = [];
          querySnapshot.forEach((documentSnapshot) => {
            if (documentSnapshot.data().name.includes(name)) {
              members.push({
                key: documentSnapshot.id,
                ...documentSnapshot.data(),
              });
            }
          });
          setMembers(members);
          //console.log(members);
          if (members.length <= 0) {
            console.log('No member found.');
          } else {
            setSearch(true);
          }
        });
      setLoading(false);
    } else if (name && name.trim() && !memberNumber.trim()) {
      console.log('Name');
      const snapshot = await firestore()
        .collection('members')
        .orderBy('name', 'asc')
        .get()
        .then((querySnapshot) => {
          const members = [];
          querySnapshot.forEach((documentSnapshot) => {
            if (documentSnapshot.data().name.includes(name)) {
              members.push({
                key: documentSnapshot.id,
                ...documentSnapshot.data(),
              });
            }
          });
          setMembers(members);
          //console.log(members);
          if (members.length <= 0) {
            console.log('No member found.');
          } else {
            setSearch(true);
          }
        });
      setLoading(false);
    } else if (memberNumber && memberNumber.trim() && !name.trim()) {
      console.log('Number');
      const snapshot = await firestore()
        .collection('members')
        .orderBy('memberNumber', 'asc')
        .where('memberNumber', '==', parseInt(memberNumber))
        .get()
        .then((querySnapshot) => {
          const members = [];
          querySnapshot.forEach((documentSnapshot) => {
            members.push({
              key: documentSnapshot.id,
              ...documentSnapshot.data(),
            });
          });
          setMembers(members);
          //console.log(members);
          if (members.length <= 0) {
            console.log('No member found.');
          } else {
            setSearch(true);
          }
        });
    }
    setLoading(false);
  };

  const orderMembersName = () => {
    let orderedMembers = members;
    orderedMembers.sort((a, b) => a.name.localeCompare(b.name));
    setMembers(orderedMembers);
    setRefreshFlatlist(!refreshFlatlist);
  };

  const orderMembersNumber = () => {
    let orderedMembers = members;
    orderedMembers.sort((a, b) => a.memberNumber - b.memberNumber);
    setMembers(orderedMembers);
    setRefreshFlatlist(!refreshFlatlist);
  };

  const renderItem = ({ item }) => {
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
            Name: {item.name}
          </Text>
          <Text style={[styles.title, { color: theme.colors.onPrimary }]}>
            Member Number: {item.memberNumber}
          </Text>
        </View>
      </TouchableRipple>
    );
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ marginHorizontal: '3%' }}
        behavior='padding'
      >
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          autoCapitalize='words'
          keyboardType='default'
          label='Name'
        />
        <TextInput
          style={styles.input}
          value={memberNumber}
          onChangeText={setMemberNumber}
          autoCapitalize='none'
          keyboardType='numeric'
          label='Member Number'
        />
        <View style={styles.buttonContainer}>
          <Button
            style={[styles.button, { marginTop: 8 }]}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonText}
            icon='account-search'
            mode='elevated'
            loading={loading}
            onPress={searchMember}
          >
            Search Member
          </Button>
        </View>
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
              onPress={() => {
                console.log('Order by name');
                orderMembersName();
              }}
            >
              Order by name
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
              onPress={() => {
                console.log('Order by member number');
                orderMembersNumber();
              }}
            >
              Order by number
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
    //marginVertical: 8,
    justifyContent: 'center',
  },
  buttonContent: { minWidth: 250, minHeight: 50 },
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
  picture: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
});
