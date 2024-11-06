import { useEffect, useState } from 'react';
import { ActivityIndicator, useColorScheme, View } from 'react-native';
import {
  PaperProvider,
  Portal,
  useTheme,
  MD3LightTheme as DefaultLightTheme,
  MD3DarkTheme as DefaultDarkTheme,
} from 'react-native-paper';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SystemUI from 'expo-system-ui';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const colorScheme = useColorScheme();
  //console.log(colorScheme);
  const theme =
    colorScheme === 'dark'
      ? {
          ...DefaultDarkTheme,
          colors: {
            primary: 'rgb(85, 219, 198)',
            onPrimary: 'rgb(0, 55, 48)',
            primaryContainer: 'rgb(0, 80, 71)',
            onPrimaryContainer: 'rgb(118, 248, 226)',
            secondary: 'rgb(177, 204, 197)',
            onSecondary: 'rgb(28, 53, 48)',
            secondaryContainer: 'rgb(51, 75, 70)',
            onSecondaryContainer: 'rgb(205, 232, 225)',
            tertiary: 'rgb(172, 202, 229)',
            onTertiary: 'rgb(19, 51, 72)',
            tertiaryContainer: 'rgb(44, 74, 96)',
            onTertiaryContainer: 'rgb(202, 230, 255)',
            error: 'rgb(255, 180, 171)',
            onError: 'rgb(105, 0, 5)',
            errorContainer: 'rgb(147, 0, 10)',
            onErrorContainer: 'rgb(255, 180, 171)',
            background: 'rgb(25, 28, 27)',
            onBackground: 'rgb(224, 227, 225)',
            surface: 'rgb(25, 28, 27)',
            onSurface: 'rgb(224, 227, 225)',
            surfaceVariant: 'rgb(63, 73, 70)',
            onSurfaceVariant: 'rgb(190, 201, 197)',
            outline: 'rgb(137, 147, 144)',
            outlineVariant: 'rgb(63, 73, 70)',
            shadow: 'rgb(0, 0, 0)',
            scrim: 'rgb(0, 0, 0)',
            inverseSurface: 'rgb(224, 227, 225)',
            inverseOnSurface: 'rgb(45, 49, 48)',
            inversePrimary: 'rgb(0, 107, 94)',
            elevation: {
              level0: 'transparent',
              level1: 'rgb(28, 38, 36)',
              level2: 'rgb(30, 43, 41)',
              level3: 'rgb(32, 49, 46)',
              level4: 'rgb(32, 51, 48)',
              level5: 'rgb(33, 55, 51)',
            },
            surfaceDisabled: 'rgba(224, 227, 225, 0.12)',
            onSurfaceDisabled: 'rgba(224, 227, 225, 0.38)',
            backdrop: 'rgba(41, 50, 48, 0.4)',
          },
        }
      : {
          ...DefaultLightTheme,
          colors: {
            primary: 'rgb(0, 107, 94)',
            onPrimary: 'rgb(255, 255, 255)',
            primaryContainer: 'rgb(118, 248, 226)',
            onPrimaryContainer: 'rgb(0, 32, 27)',
            secondary: 'rgb(74, 99, 94)',
            onSecondary: 'rgb(255, 255, 255)',
            secondaryContainer: 'rgb(205, 232, 225)',
            onSecondaryContainer: 'rgb(6, 32, 27)',
            tertiary: 'rgb(68, 97, 121)',
            onTertiary: 'rgb(255, 255, 255)',
            tertiaryContainer: 'rgb(202, 230, 255)',
            onTertiaryContainer: 'rgb(0, 30, 48)',
            error: 'rgb(186, 26, 26)',
            onError: 'rgb(255, 255, 255)',
            errorContainer: 'rgb(255, 218, 214)',
            onErrorContainer: 'rgb(65, 0, 2)',
            background: 'rgb(250, 253, 251)',
            onBackground: 'rgb(25, 28, 27)',
            surface: 'rgb(250, 253, 251)',
            onSurface: 'rgb(25, 28, 27)',
            surfaceVariant: 'rgb(218, 229, 225)',
            onSurfaceVariant: 'rgb(63, 73, 70)',
            outline: 'rgb(111, 121, 118)',
            outlineVariant: 'rgb(190, 201, 197)',
            shadow: 'rgb(0, 0, 0)',
            scrim: 'rgb(0, 0, 0)',
            inverseSurface: 'rgb(45, 49, 48)',
            inverseOnSurface: 'rgb(239, 241, 239)',
            inversePrimary: 'rgb(85, 219, 198)',
            elevation: {
              level0: 'transparent',
              level1: 'rgb(238, 246, 243)',
              level2: 'rgb(230, 241, 238)',
              level3: 'rgb(223, 237, 234)',
              level4: 'rgb(220, 236, 232)',
              level5: 'rgb(215, 233, 229)',
            },
            surfaceDisabled: 'rgba(25, 28, 27, 0.12)',
            onSurfaceDisabled: 'rgba(25, 28, 27, 0.38)',
            backdrop: 'rgba(41, 50, 48, 0.4)',
          },
        };

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
  }, [theme.colors.background, colorScheme]);

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
    <PaperProvider theme={theme}>
      <Portal.Host>
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: theme.colors.background },
          }}
        >
          <Stack.Screen name='index' options={{ headerShown: false }} />
          <Stack.Screen name='(home)' options={{ headerShown: false }} />
        </Stack>
      </Portal.Host>
    </PaperProvider>
  );
}
