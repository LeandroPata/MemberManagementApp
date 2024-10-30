import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';
import { router } from 'expo-router';

export default function Home() {
  const user = auth().currentUser;
  return (
    <View style={styles.container}>
      <Text>Welcome back {user?.email}</Text>
      <Button
        title='Add member'
        onPress={() => router.push('/(home)/addMember')}
      />
      <Button
        title='Search member'
        onPress={() => router.push('/(home)/searchMember')}
      />
      <Button title='Sign Out' onPress={() => auth().signOut()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    flex: 1,
    justifyContent: 'center',
    padding: 10,
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
