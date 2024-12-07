import { useEffect, useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, View, Keyboard } from 'react-native';
import {
  Portal,
  Modal,
  TextInput,
  Button,
  useTheme,
  HelperText,
} from 'react-native-paper';
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

  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const emailRegex = /.+@.+\..+/g;

  const signUp = async () => {
    setSignupLoading(true);
    Keyboard.dismiss();

    if (!email.trim() && !password.trim()) {
      alert(t('index.emailPasswordEmpty'));
      setSignupLoading(false);
      setEmailError(true);
      setPasswordError(true);
      return;
    } else if (!email.trim()) {
      alert(t('index.emailEmpty'));
      setSignupLoading(false);
      setEmailError(true);
      return;
    } else if (!password.trim()) {
      alert(t('index.passwordEmpty'));
      setSignupLoading(false);
      return;
    } else if (!email.match(emailRegex)) {
      alert(t('index.emailError'));
      setSignupLoading(false);
      setEmailError(true);
      return;
    } else if (password.length < 6) {
      alert(t('index.passwordError'));
      setSignupLoading(false);
      setPasswordError(true);
      return;
    }
    setEmailError(false);
    setPasswordError(false);
    setShowModal(true);
  };

  const confirmSignUp = async () => {
    setConfirmSignupLoading(true);
    Keyboard.dismiss();
    if (!confirmPassword.trim()) {
      alert(t('index.passwordEmpty'));
      setConfirmSignupLoading(false);
      setConfirmPasswordError(true);
      return;
    } else if (password != confirmPassword) {
      alert(t('index.passwordNotMatch'));
      setConfirmSignupLoading(false);
      setConfirmPassword('');
      setConfirmPasswordError(true);
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

  const logIn = async () => {
    setLoginLoading(true);
    Keyboard.dismiss();

    if (!email.trim() && !password.trim()) {
      alert(t('index.emailPasswordEmpty'));
      setLoginLoading(false);
      setEmailError(true);
      setPasswordError(true);
      return;
    } else {
      if (!email.trim()) {
        alert(t('index.emailEmpty'));
        setLoginLoading(false);
        setEmailError(true);
        return;
      } else if (!email.match(emailRegex)) {
        alert(t('index.emailError'));
        setLoginLoading(false);
        setEmailError(true);
        return;
      }

      if (!password.trim()) {
        alert(t('index.passwordEmpty'));
        setLoginLoading(false);
        setPasswordError(true);
        return;
      } else if (password.length < 6) {
        alert(t('index.passwordError'));
        setLoginLoading(false);
        setPasswordError(true);
        return;
      }
    }
    setEmailError(false);
    setPasswordError(false);

    try {
      await auth().signInWithEmailAndPassword(email, password);
    } catch (e: any) {
      const err = e as FirebaseError;
      if (err.code == 'auth/invalid-credential') {
        alert(t('index.emailPasswordWrong'));
        setLoginLoading(false);
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
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            onEndEditing={() => {
              if (password != confirmPassword) {
                setConfirmPasswordError(true);
              } else setConfirmPasswordError(false);
              setConfirmPassword(confirmPassword.trim());
            }}
            error={confirmPasswordError}
            autoCapitalize='none'
            label={t('index.confirmPassword')}
            secureTextEntry
          />
          {confirmPasswordError ? (
            <HelperText
              type='error'
              visible={confirmPasswordError}
              style={styles.errorHelper}
            >
              {t('index.confirmPasswordError')}
            </HelperText>
          ) : null}

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
            value={email}
            onChangeText={setEmail}
            onEndEditing={() => {
              if (!email.match(emailRegex)) {
                setEmailError(true);
              } else setEmailError(false);
              setEmail(email.trim());
            }}
            error={emailError}
            autoCapitalize='none'
            keyboardType='email-address'
            label={t('index.email')}
          />
          {emailError ? (
            <HelperText
              type='error'
              visible={emailError}
              style={styles.errorHelper}
            >
              {t('index.emailError')}
            </HelperText>
          ) : null}
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            onEndEditing={() => {
              if (password.length < 6) {
                setPasswordError(true);
              } else setPasswordError(false);
              setPassword(password.trim());
            }}
            error={passwordError}
            autoCapitalize='none'
            keyboardType='default'
            label={t('index.password')}
            secureTextEntry
          />
          {passwordError ? (
            <HelperText
              type='error'
              visible={passwordError}
              style={styles.errorHelper}
            >
              {t('index.passwordError')}
            </HelperText>
          ) : null}
        </KeyboardAvoidingView>

        <View style={[styles.buttonContainer, { marginTop: 50 }]}>
          <Button
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonText}
            icon='login'
            mode='elevated'
            loading={loginLoading}
            onPress={() => {
              logIn();
            }}
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
  errorHelper: {
    fontWeight: 'bold',
    fontSize: 15,
  },
});
