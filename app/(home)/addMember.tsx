import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Text } from 'react-native';
import {
  Button,
  TextInput,
  Switch,
  PaperProvider,
  Avatar,
} from 'react-native-paper';
import DatePicker from 'react-native-date-picker';
import { FirebaseError } from 'firebase/app';
import firestore, { Timestamp } from '@react-native-firebase/firestore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AddMember() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [dateModal, setDateModal] = useState(false);
  const [autoNumber, setAutoNumber] = useState(true);

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

    if (autoNumber) {
      await assignMemberNumber();
    } else if (!memberNumber.trim()) {
      alert('Member number is mandatory!');
      setLoading(false);
      return;
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
    <PaperProvider>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <KeyboardAvoidingView behavior='padding'>
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
            value={email}
            onChangeText={setEmail}
            autoCapitalize='none'
            keyboardType='email-address'
            label='Email'
          />
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhone}
            autoCapitalize='none'
            inputMode='tel'
            keyboardType='phone-pad'
            label='Phone Number'
          />
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                flex: 2,
              }}
            >
              <Text>Auto Number</Text>
              <Switch value={autoNumber} onValueChange={setAutoNumber} />
            </View>
            <TextInput
              disabled={autoNumber}
              style={[styles.input, { flex: 3 }]}
              value={memberNumber}
              onChangeText={setMemberNumber}
              autoCapitalize='none'
              keyboardType='numeric'
              label='Member Number'
              placeholder='(leave empty for automatic assignment)'
            />
          </View>
          <Button onPress={() => setDateModal(true)}>
            End Date: {endDate.toLocaleDateString('pt-pt')}
          </Button>
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
          <Button
            style={styles.button}
            mode='elevated'
            loading={loading}
            onPress={addMember}
          >
            Add Member
          </Button>
        </KeyboardAvoidingView>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    marginVertical: 2,
  },
  button: {
    marginVertical: 3,
  },
});
