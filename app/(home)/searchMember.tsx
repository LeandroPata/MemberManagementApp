import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  TextInput,
  Button,
  ActivityIndicator,
  FlatList,
  Pressable,
  Image,
  Keyboard,
} from 'react-native';
import firestore, { Filter } from '@react-native-firebase/firestore';
import { router } from 'expo-router';

export default function SearchMember() {
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
      <Pressable
        style={styles.item}
        onPress={() => {
          router.push({
            pathname: '/(home)/(profile)/profile',
            params: { profileID: item.key },
          });
        }}
      >
        {item.profilePicture ? (
          <Image style={styles.picture} src={item.profilePicture} />
        ) : null}
        <Text style={styles.title}>Name: {item.name}</Text>
        <Text style={styles.title}>Member Number: {item.memberNumber}</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior='padding'>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          autoCapitalize='words'
          keyboardType='default'
          placeholder='Name'
        />
        <TextInput
          style={styles.input}
          value={memberNumber}
          onChangeText={setMemberNumber}
          autoCapitalize='none'
          keyboardType='numeric'
          placeholder='Member Number'
        />

        {loading ? (
          <ActivityIndicator size={'small'} style={{ margin: 28 }} />
        ) : (
          <>
            <Button onPress={searchMember} title='Search Member' />
          </>
        )}
      </KeyboardAvoidingView>
      {!members ? null : (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 10,
          }}
        >
          <View style={{ width: '45%' }}>
            <Button
              onPress={() => {
                console.log('Order by name');
                orderMembersName();
              }}
              title='Order by name'
            />
          </View>
          <View style={{ width: '45%' }}>
            <Button
              onPress={() => {
                console.log('Order by member number');
                orderMembersNumber();
              }}
              title='Order by member number'
            />
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
    marginHorizontal: 20,
    flex: 1,
    justifyContent: 'center',
    //flexDirection: 'row',
    //flexWrap: 'wrap'
  },
  input: {
    marginVertical: 4,
    height: 50,
    borderWidth: 1,
    borderRadius: 1,
    padding: 5,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignContent: 'center',
  },
  item: {
    //padding: 15,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginVertical: 8,
    marginHorizontal: 8,
    height: 150,
    width: 175,
    backgroundColor: '#0e8df2',
  },
  title: {
    fontSize: 15,
    color: 'white',
  },
  picture: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
});
