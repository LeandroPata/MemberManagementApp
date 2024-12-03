import { useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, View } from 'react-native';
import { Portal, Modal, TextInput, Button, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FirebaseError } from 'firebase/app';
import auth from '@react-native-firebase/auth';
import { useTranslation } from 'react-i18next';

export default function Index() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t } = useTranslation();

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
      alert(t('index.emailPasswordEmpty'));
      setSignupLoading(false);
      return;
    } else if (!email.trim()) {
      alert(t('index.emailEmpty'));
      setSignupLoading(false);
      return;
    } else if (!email.includes('@') || !email.includes('.')) {
      alert(t('index.emailFormat'));
      setSignupLoading(false);
      return;
    } else if (!password.trim()) {
      alert(t('index.passwordEmpty'));
      setSignupLoading(false);
      return;
    }

    setShowModal(true);
  };

  const confirmSignUp = async () => {
    setConfirmSignupLoading(true);
    if (!confirmPassword.trim()) {
      alert(t('index.passwordEmpty'));
      setConfirmSignupLoading(false);
      return;
    } else if (password != confirmPassword) {
      alert(t('index.passwordNotMatch'));
      setConfirmSignupLoading(false);
      setConfirmPassword('');
      return;
    }

    try {
      await auth().createUserWithEmailAndPassword(email, password);
    } catch (e: any) {
      const err = e as FirebaseError;
      //alert('Registration failed: ' + err.message);
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
      alert(t('index.emailPasswordEmpty'));
      setLoginLoading(false);
      return;
    } else if (!email.trim()) {
      alert(t('index.emailEmpty'));
      setLoginLoading(false);
      return;
    } else if (!email.includes('@') || !email.includes('.')) {
      alert(t('index.emailFormat'));
      setLoginLoading(false);
      return;
    } else if (!password.trim()) {
      alert(t('index.passwordEmpty'));
      setLoginLoading(false);
      return;
    }

    try {
      await auth().signInWithEmailAndPassword(email, password);
    } catch (e: any) {
      const err = e as FirebaseError;
      if (err.code == 'auth/invalid-credential') {
        alert(t('index.emailPasswordWrong'));
        setPassword('');
      } else {
        //alert('Sign in failed: ' + err.message);
        console.log('Sign in failed: ' + err.message);
      }
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
            label={t('index.confirmPassword')}
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
              {t('index.confirmPassword')}
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
            label={t('index.email')}
            value={email}
            onChangeText={(email) => setEmail(email)}
            //error={true}
            autoCapitalize='none'
            keyboardType='email-address'
            returnKeyType='next'
          />
          <TextInput
            style={styles.input}
            label={t('index.password')}
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
            {t('index.login')}
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
            {t('index.createAccount')}
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
    paddingVertical: 10,
    paddingHorizontal: 15,
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
