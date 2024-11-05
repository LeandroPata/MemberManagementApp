import { useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, View } from 'react-native';
import { Portal, Modal, TextInput, Button, useTheme } from 'react-native-paper';
import { FirebaseError } from 'firebase/app';
import auth from '@react-native-firebase/auth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Index() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [confirmSignupLoading, setConfirmSignupLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const signUp = async () => {
    setSignupLoading(true);

    if (!email.trim() && !password.trim()) {
      alert('Email and password fields are empty!');
      setSignupLoading(false);
      return;
    } else if (!email.trim()) {
      alert('Email field is empty!');
      setSignupLoading(false);
      return;
    } else if (!password.trim()) {
      alert('Password field is empty!');
      setSignupLoading(false);
      return;
    } else if (!email.includes('@') || !email.includes('.')) {
      alert('Email is in the wrong format!');
      setSignupLoading(false);
      return;
    }

    setShowModal(true);
  };

  const confirmSignUp = async () => {
    setConfirmSignupLoading(true);
    if (!confirmPassword.trim()) {
      alert('Confirm password field is empty!');
      setSignupLoading(false);
      setConfirmSignupLoading(false);
      setShowModal(false);
      return;
    } else if (password != confirmPassword) {
      alert('Passwords do not match!');
      setSignupLoading(false);
      setConfirmSignupLoading(false);
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
      setSignupLoading(false);
      setConfirmSignupLoading(false);
      setShowModal(false);
    }
  };

  const signIn = async () => {
    setLoginLoading(true);
    if (!email.trim() && !password.trim()) {
      alert('Email and password fields are empty!');
      setLoginLoading(false);
      return;
    } else if (!email.trim()) {
      alert('Email field is empty!');
      setLoginLoading(false);
      return;
    } else if (!password.trim()) {
      alert('Password field is empty!');
      setLoginLoading(false);
      return;
    } else if (!email.includes('@') || !email.includes('.')) {
      alert('Email is in the wrong format!');
      setLoginLoading(false);
      return;
    }

    try {
      await auth().signInWithEmailAndPassword(email, password);
    } catch (e: any) {
      const err = e as FirebaseError;
      alert('Sign in failed: ' + err.message);
      console.log('Sign in failed: ' + err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <>
      <Portal>
        <Modal
          visible={showModal}
          onDismiss={() => {
            setSignupLoading(false);
            setLoginLoading(false);
            setShowModal(false);
          }}
          contentContainerStyle={styles.modalContainer}
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
          <Button
            style={styles.button}
            mode='elevated'
            loading={confirmSignupLoading}
            onPress={confirmSignUp}
          >
            Confirm Password
          </Button>
        </Modal>
      </Portal>
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, backgroundColor: theme.colors.background },
        ]}
      >
        <KeyboardAvoidingView
          style={{ marginHorizontal: 20 }}
          behavior='padding'
        >
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
        </KeyboardAvoidingView>
        <View style={{ marginHorizontal: 20 }}>
          <Button
            style={styles.button}
            mode='elevated'
            loading={loginLoading}
            onPress={signIn}
          >
            Login
          </Button>
          <Button
            style={styles.button}
            mode='elevated'
            loading={signupLoading}
            onPress={signUp}
          >
            Create Account
          </Button>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    //alignItems: 'center',
  },
  input: {
    marginVertical: 2,
    //width: '80%',
  },
  button: {
    marginVertical: 3,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 10,
  },
  inputModal: {
    //marginVertical: 4,
    width: '75%',
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    //backgroundColor: '#ffffff',
  },
});
