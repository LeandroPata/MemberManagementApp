import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  TextInput,
  Button,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { FirebaseError } from 'firebase/app';
import auth from '@react-native-firebase/auth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Index() {
  const [loading, setLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const signUp = async () => {
    setLoading(true);
    setConfirmModal(true);

    if (!email.trim() && !password.trim()) {
      alert('Email and password fields are empty!');
      setLoading(false);
      return;
    } else if (!email.trim()) {
      alert('Email field is empty!');
      setLoading(false);
      return;
    } else if (!password.trim()) {
      alert('Password field is empty!');
      setLoading(false);
      return;
    } else if (!email.includes('@') || !email.includes('.')) {
      alert('Email is in the wrong format!');
      setLoading(false);
      return;
    }

    try {
      await auth().createUserWithEmailAndPassword(email, password);
    } catch (e: any) {
      const err = e as FirebaseError;
      alert('Registration failed: ' + err.message);
      console.log('Registration failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async () => {
    setLoading(true);
    if (!email.trim() && !password.trim()) {
      alert('Email and password fields are empty!');
      setLoading(false);
      return;
    } else if (!email.trim()) {
      alert('Email field is empty!');
      setLoading(false);
      return;
    } else if (!password.trim()) {
      alert('Password field is empty!');
      setLoading(false);
      return;
    } else if (!email.includes('@') || !email.includes('.')) {
      alert('Email is in the wrong format!');
      setLoading(false);
      return;
    }

    try {
      await auth().signInWithEmailAndPassword(email, password);
    } catch (e: any) {
      const err = e as FirebaseError;
      alert('Sign in failed: ' + err.message);
      console.log('Sign in failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView behavior='padding'>
        <Modal
          animationType='fade'
          transparent={true}
          visible={confirmModal}
          onRequestClose={() => {
            setConfirmModal(false);
          }}
        >
          <View style={styles.modalContainer}>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder='Confirm Password'
            />
            <Button
              title='Confirm'
              onPress={() => {
                setConfirmModal(false);
              }}
            />
          </View>
        </Modal>
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
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder='Password'
        />
        {loading ? (
          <ActivityIndicator size={'small'} style={{ margin: 28 }} />
        ) : (
          <>
            <Button onPress={signIn} title='Login' />
            <Button onPress={signUp} title='Create Account' />
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
  modalContainer: {
    flex: 1,
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    //alignSelf: 'center',
    width: '75%',
    height: '50%',
  },
  input: {
    marginVertical: 4,
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#ffffff',
  },
});
