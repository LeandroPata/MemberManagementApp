import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';

export default function Home() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <PaperProvider>
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, backgroundColor: theme.colors.primary },
        ]}
      >
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
    </PaperProvider>
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
