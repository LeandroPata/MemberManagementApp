import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import auth from '@react-native-firebase/auth';

export default function Home() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={{ marginHorizontal: 20 }}>
        <Button
          style={styles.button}
          mode='elevated'
          //loading={loginLoading}
          onPress={() => router.push('/(home)/addMember')}
        >
          Add Member
        </Button>
        <Button
          style={styles.button}
          mode='elevated'
          //loading={loginLoading}
          onPress={() => router.push('/(home)/searchMember')}
        >
          Search Member
        </Button>
        <Button
          style={styles.button}
          mode='elevated'
          //loading={loginLoading}
          onPress={() => auth().signOut()}
        >
          Sign Out
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    marginVertical: 4,
    height: 50,
    borderWidth: 1,
    borderRadius: 1,
    padding: 5,
    //backgroundColor: '#ffffff',
  },
  button: {
    marginVertical: 3,
  },
});
