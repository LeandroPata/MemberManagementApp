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

    setConfirmModal(true);
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

  const confirmSignUp = async () => {
    if (!confirmPassword.trim()) {
      alert('Confirm password field is empty!');
      setLoading(false);
      setConfirmModal(false);
      return;
    } else if (password != confirmPassword) {
      alert('Passwords do not match!');
      setLoading(false);
      setConfirmModal(false);
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
      setConfirmModal(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
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
            style={styles.inputModal}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder='Confirm Password'
          />
          <Button title='Confirm' onPress={confirmSignUp} />
        </View>
      </Modal>
      <KeyboardAvoidingView behavior='padding'>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize='none'
          keyboardType='email-address'
          placeholder='Email'
          returnKeyType='next'
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
  input: {
    marginVertical: 4,
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#ffffff',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 100,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  inputModal: {
    //marginVertical: 4,

    width: '75%',
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#ffffff',
  },
});
