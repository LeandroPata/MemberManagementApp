import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { PaperProvider, Portal, useTheme } from 'react-native-paper';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SystemUI from 'expo-system-ui';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const theme = useTheme();

  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>();

  const onAuthStateChanged = (user: FirebaseAuthTypes.User | null) => {
    //console.log('onAuthStateChanged', user);
    setUser(user);
    if (initializing) setInitializing(false);
  };

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  useEffect(() => {
    if (initializing) return;

    const inAuthGroup = segments[0] === '(home)';

    if (user && !inAuthGroup) {
      router.replace('/(home)/home');
    } else if (!user && inAuthGroup) {
      router.replace('/');
    }
  }, [user, initializing]);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.colors.background);
  }, [theme.colors.background]);

  if (initializing)
    return (
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
        }}
      >
        <ActivityIndicator size='large' />
      </View>
    );

  return (
    <PaperProvider>
      <Portal.Host>
        <Stack>
          <Stack.Screen name='index' options={{ headerShown: false }} />
          <Stack.Screen name='(home)' options={{ headerShown: false }} />
        </Stack>
      </Portal.Host>
    </PaperProvider>
  );
}
