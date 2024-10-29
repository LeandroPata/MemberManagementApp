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

  const [selectedId, setSelectedId] = useState<string>();

  useEffect(() => {
    if (searchResults) {
      setLoading(true);

      if (name && name.trim() && memberNumber && memberNumber.trim()) {
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
      } else {
        const subscriber = firestore()
          .collection('users')
          .where(
            Filter.or(
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
      }
    }
  }, []);

  const searchMember = async () => {
    Keyboard.dismiss();
    setLoading(true);

    if (name && name.trim() && memberNumber && memberNumber.trim()) {
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
    } else {
      const snapshot = await firestore()
        .collection('users')
        .where(
          Filter.or(
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
    }
    setLoading(false);
  };

  const renderItem = ({ item }) => {
    const backgroundColor = item.key === selectedId ? '#0e8df2' : '#2196f3';
    const color = item.key === selectedId ? 'white' : 'black';

    return (
      <Pressable
        style={[styles.item, { backgroundColor }]}
        onPress={() => {
          setSelectedId(item.key);
          router.push({
            pathname: '/(home)/(profile)/profile',
            params: { profileID: item.key },
          });
        }}
      >
        <Image style={styles.picture} src={item.profilePicture} />
        <Text style={[styles.title, { color: color }]}>Name: {item.name}</Text>
        <Text style={[styles.title, { color: color }]}>
          Member Number: {item.memberNumber}
        </Text>
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
      <FlatList
        data={members}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        extraData={selectedId}
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
