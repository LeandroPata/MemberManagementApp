import '../components/gesture-handler';
import { useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, View } from 'react-native';
import { Portal, Modal, TextInput, Button, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FirebaseError } from 'firebase/app';
import auth from '@react-native-firebase/auth';

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
          style={styles.modalContainer}
          contentContainerStyle={[
            styles.modalContentContainer,
            { backgroundColor: theme.colors.primaryContainer },
          ]}
        >
          <TextInput
            style={styles.input}
            label='Confirm Password'
            value={confirmPassword}
            onChangeText={(confirmPassword) =>
              setConfirmPassword(confirmPassword)
            }
            //error={true}
            autoCapitalize='none'
            secureTextEntry
          />
          <View style={[styles.buttonContainer, { marginTop: 15 }]}>
            <Button
              style={styles.button}
              contentStyle={{ minWidth: 150, minHeight: 30 }}
              labelStyle={{
                fontSize: 15,
                fontWeight: 'bold',
                overflow: 'visible',
              }}
              icon='check'
              mode='elevated'
              loading={confirmSignupLoading}
              onPress={confirmSignUp}
            >
              Confirm Password
            </Button>
          </View>
        </Modal>
      </Portal>
      <View style={[styles.container, { paddingTop: insets.top }]}>
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
            autoCapitalize='none'
            secureTextEntry
          />
        </KeyboardAvoidingView>
        <View style={[styles.buttonContainer, { marginTop: 50 }]}>
          <Button
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonText}
            icon='login'
            mode='elevated'
            loading={loginLoading}
            onPress={signIn}
          >
            Login
          </Button>
          <Button
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonText}
            icon='briefcase-plus'
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
  buttonContainer: {
    marginHorizontal: 20,
    alignItems: 'center',
  },
  modalContainer: {
    marginHorizontal: 30,
  },
  modalContentContainer: {
    padding: 15,
    borderRadius: 20,
  },
  inputModal: {
    width: '75%',
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  input: {
    marginVertical: 2,
  },
  button: {
    marginVertical: 8,
    justifyContent: 'center',
  },
  buttonContent: { minWidth: 250, minHeight: 80 },
  buttonText: {
    fontSize: 25,
    fontWeight: 'bold',
    overflow: 'visible',
    paddingTop: 10,
  },
});
