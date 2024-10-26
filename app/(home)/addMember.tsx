import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  TextInput,
  Button,
  ActivityIndicator,
} from 'react-native';
import { FirebaseError } from 'firebase/app';
import firestore, { Timestamp } from '@react-native-firebase/firestore';

export default function AddMember() {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [memberNumber, setMemberNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhone] = useState('');

  const addMember = async () => {
    setLoading(true);
    try {
      firestore()
        .collection('users')
        .add({
          name: name,
          memberNumber: parseInt(memberNumber),
          email: email,
          phoneNumber: phoneNumber,
          addedDate: Timestamp.fromDate(new Date()),
          profilePicture:
            '',
        })
        .then(() => {
          console.log('Added');
          setName('');
          setMemberNumber('');
          setEmail('');
          setPhone('');
        });
    } catch (e: any) {
      const err = e as FirebaseError;
      alert('Adding member failed: ' + err.message);
    } finally {
      setLoading(false);
    }
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
