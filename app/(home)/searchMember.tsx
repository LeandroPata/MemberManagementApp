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
import firestore, { Filter } from '@react-native-firebase/firestore';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SearchMember() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(false);

  const [name, setName] = useState('');
  const [memberNumber, setMemberNumber] = useState('');
  const [members, setMembers] = useState([]);

  const [refreshFlatlist, setRefreshFlatlist] = useState(false);

  useEffect(() => {
    if (searchResults) {
      setLoading(true);

      if (!name.trim() && !memberNumber.trim()) {
        const subscriber = firestore()
          .collection('users')
          .orderBy('name', 'asc')
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
          .collection('users')
          .where(
            Filter.and(
              Filter('name', '==', name),
              Filter('memberNumber', '==', parseInt(memberNumber))
            )
          )
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
      } else if (name && name.trim() && !memberNumber.trim()) {
        const subscriber = firestore()
          .collection('users')
          .orderBy('name', 'asc')
          .where(Filter('name', '==', name))
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
      } else if (memberNumber && memberNumber.trim() && !name.trim()) {
        const subscriber = firestore()
          .collection('users')
          .orderBy('memberNumber', 'asc')
          .where(Filter('memberNumber', '==', parseInt(memberNumber)))
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
  }, []);

  const searchMember = async () => {
    Keyboard.dismiss();
    setLoading(true);

    if (!name.trim() && !memberNumber.trim()) {
      console.log('None');
      const snapshot = firestore()
        .collection('users')
        .orderBy('name', 'asc')
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
            setSearchResults(true);
          }
        });
      setLoading(false);
    } else if (name && name.trim() && memberNumber && memberNumber.trim()) {
      console.log('Both');
      const snapshot = await firestore()
        .collection('users')
        .where(
          Filter.and(
            Filter('name', '==', name),
            Filter('memberNumber', '==', parseInt(memberNumber))
          )
        )
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
            setSearchResults(true);
          }
        });
    } else if (name && name.trim() && !memberNumber.trim()) {
      console.log('Name');
      const snapshot = await firestore()
        .collection('users')
        .orderBy('name', 'asc')
        .where(Filter('name', '==', name))
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
            setSearchResults(true);
          }
        });
    } else if (memberNumber && memberNumber.trim() && !name.trim()) {
      console.log('Number');
      const snapshot = await firestore()
        .collection('users')
        .orderBy('memberNumber', 'asc')
        .where(Filter('memberNumber', '==', parseInt(memberNumber)))
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
            setSearchResults(true);
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
        style={[styles.item, { backgroundColor: '#26212a' }]}
        onPress={() => {
          router.push({
            pathname: '/(home)/(profile)/profile',
            params: { profileID: item.key },
          });
        }}
      >
        <View>
          {item.profilePicture ? (
            <Avatar.Image
              size={100}
              style={{ alignSelf: 'center' }}
              source={{ uri: item.profilePicture }}
            />
          ) : null}
          <Text style={[styles.title, { color: '#c7b5f6' }]}>
            Name: {item.name}
          </Text>
          <Text style={[styles.title, { color: '#c7b5f6' }]}>
            Member Number: {item.memberNumber}
          </Text>
        </View>
      </TouchableRipple>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: theme.colors.background },
      ]}
    >
      <KeyboardAvoidingView style={{ marginHorizontal: 20 }} behavior='padding'>
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
        <Button
          style={styles.button}
          mode='elevated'
          loading={loading}
          onPress={searchMember}
        >
          Search Member
        </Button>
      </KeyboardAvoidingView>
      {!members ? null : (
        <View
          style={{
            marginHorizontal: 20,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 10,
          }}
        >
          <View style={{ width: '48%' }}>
            <Button
              style={styles.button}
              mode='elevated'
              onPress={() => {
                console.log('Order by name');
                orderMembersName();
              }}
            >
              Order by name
            </Button>
          </View>
          <View style={{ width: '48%' }}>
            <Button
              style={styles.button}
              mode='elevated'
              onPress={() => {
                console.log('Order by member number');
                orderMembersNumber();
              }}
            >
              Order by member number
            </Button>
          </View>
        </View>
      )}
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
  input: {
    marginVertical: 2,
  },
  button: {
    marginVertical: 3,
    //paddingHorizontal: 2,
    //paddingVertical: 0,
    textAlign: 'center',
    verticalAlign: 'middle',
  },
  item: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginVertical: 3,
    marginHorizontal: 5,
    width: '48%',
  },
  title: {
    fontSize: 15,
  },
  picture: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
});
