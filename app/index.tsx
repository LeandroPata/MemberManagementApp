import { useState } from 'react';
import {
  StyleSheet,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import {
  PaperProvider,
  Portal,
  Modal,
  TextInput,
  Button,
} from 'react-native-paper';
import { FirebaseError } from 'firebase/app';
import auth from '@react-native-firebase/auth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Index() {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
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

    setShowModal(true);
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
      setShowModal(false);
      return;
    } else if (password != confirmPassword) {
      alert('Passwords do not match!');
      setLoading(false);
      setShowModal(false);
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
      setShowModal(false);
    }
  };

  return (
    <PaperProvider>
      <Portal>
        <Modal
          visible={showModal}
          onDismiss={() => {
            setLoading(false);
            setShowModal(false);
          }}
          contentContainerStyle={styles.modalContainerTest}
        >
          <TextInput
            style={styles.input}
            label='Confirm Password'
            value={confirmPassword}
            onChangeText={(confirmPassword) =>
              setConfirmPassword(confirmPassword)
            }
            //error={true}
            secureTextEntry
          />
          <Button title='Confirm' onPress={confirmSignUp} />
        </Modal>
      </Portal>
      <KeyboardAvoidingView style={styles.container} behavior='padding'>
        <TextInput
          style={styles.input}
          label='Email'
          value={email}
          onChangeText={(email) => setEmail(email)}
          //error={true}
          autoCapitalize='none'
          keyboardType='email-address'
          returnKeyType='next'
        />
        <TextInput
          style={styles.input}
          label='Password'
          value={password}
          onChangeText={(password) => setPassword(password)}
          //error={true}
          secureTextEntry
        />
        <Button
          style={styles.button}
          mode='elevated'
          loading={loading}
          onPress={signIn}
        >
          Login
        </Button>
        <Button
          style={styles.button}
          mode='elevated'
          loading={loading}
          onPress={signUp}
        >
          Create Account
        </Button>
      </KeyboardAvoidingView>
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
  modalContainerTest: {
    backgroundColor: '#ffffff',
    padding: 15,
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
