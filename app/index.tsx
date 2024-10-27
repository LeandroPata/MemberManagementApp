import { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  TextInput,
  Button,
  ActivityIndicator,
} from 'react-native';
import { FirebaseError } from 'firebase/app';
import auth from '@react-native-firebase/auth';

export default function Index() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const signUp = async () => {
    setLoading(true);
    try {
      await auth().createUserWithEmailAndPassword(email, password);
      alert('Check your emails!');
    } catch (e: any) {
      const err = e as FirebaseError;
      console.log('Registration failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async () => {
    setLoading(true);
    try {
      await auth().signInWithEmailAndPassword(email, password);
    } catch (e: any) {
      const err = e as FirebaseError;
      console.log('Sign in failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior='padding'>
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
  input: {
    marginVertical: 4,
    height: 50,
    borderWidth: 1,
    borderRadius: 1,
    padding: 10,
    backgroundColor: '#ffffff',
  },
});
