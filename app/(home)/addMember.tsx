import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  TextInput,
  Button,
  ActivityIndicator,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import { FirebaseError } from 'firebase/app';
import firestore, { Timestamp } from '@react-native-firebase/firestore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AddMember() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [dateModal, setDateModal] = useState(false);

  const [name, setName] = useState('');
  const [memberNumber, setMemberNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhone] = useState('');
  const [endDate, setEndDate] = useState(new Date());

  let minNumber = 0;

  const assignMemberNumber = async () => {
    await firestore()
      .collection('users')
      .orderBy('memberNumber', 'asc')
      .get()
      .then((querySnapshot) => {
        let i = 1;
        querySnapshot.forEach((documentSnapshot) => {
          if (i == documentSnapshot.data().memberNumber) {
            i = documentSnapshot.data().memberNumber + 1;
            //console.log(i);
          }
        });
        //setMemberNumber(minNumber.toString());
        minNumber = i;
      });
  };

  const addMember = async () => {
    setLoading(true);

    if (!name.trim()) {
      alert('Name is mandatory!');
      setLoading(false);
      return;
    }

    if (!memberNumber.trim()) {
      await assignMemberNumber();
    } else {
      minNumber = parseInt(memberNumber);
    }

    try {
      firestore()
        .collection('users')
        .add({
          name: name.trim(),
          memberNumber: minNumber,
          email: email.trim(),
          phoneNumber: phoneNumber,
          addedDate: Timestamp.fromDate(new Date()),
          endDate: Timestamp.fromDate(endDate),
          profilePicture: process.env.EXPO_PUBLIC_PLACEHOLDER_PICTURE_URL,
        })
        .then(() => {
          console.log('Added');
          setName('');
          setMemberNumber('');
          minNumber = 0;
          setEmail('');
          setPhone('');
          setEndDate(new Date());
        });
    } catch (e: any) {
      const err = e as FirebaseError;
      console.log('Adding member failed: ' + err.message);
      alert('Adding member failed: ' + err.message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView behavior='padding'>
        <TextInput
          style={[
            styles.input,
            { borderColor: !name.trim() ? '#ee1311' : '#000000' },
          ]}
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
          placeholder='Member Number (leave empty for automatic assignment)'
        />
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize='none'
          keyboardType='email-address'
          placeholder='Email'
        />
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhone}
          autoCapitalize='none'
          inputMode='tel'
          keyboardType='phone-pad'
          placeholder='Phone Number'
        />
        <Text>{endDate.toLocaleDateString('pt-pt')}</Text>
        <Button title='Set End Date' onPress={() => setDateModal(true)} />
        <DatePicker
          modal
          mode='date'
          locale='pt-pt'
          open={dateModal}
          date={endDate}
          onConfirm={(endDate) => {
            setDateModal(false);
            setEndDate(endDate);
          }}
          onCancel={() => {
            setDateModal(false);
          }}
        />
        {loading ? (
          <ActivityIndicator size={'small'} style={{ margin: 28 }} />
        ) : (
          <>
            <Button onPress={addMember} title='Add Member' />
          </>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    marginVertical: 4,
    height: 50,
    borderWidth: 1,
    borderRadius: 1,
    padding: 5,
    backgroundColor: '#ffffff',
  },
});
