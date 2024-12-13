import React, { useState } from 'react';
import {
  Platform,
  UIManager,
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from '@react-navigation/drawer';
import { List, Switch, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';
import { useTranslation } from 'react-i18next';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { EventRegister } from 'react-native-event-listeners';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18next from 'i18next';
import DialogConfirmation from './DialogConfirmation';
import { FirebaseError } from 'firebase/app';
import storage from '@react-native-firebase/storage';
import RNFS from 'react-native-fs';
import * as IntentLaucher from 'expo-intent-launcher';
import RNFetchBlob from 'rn-fetch-blob';

export default function CustomDrawerContent(props: any) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const [expanded, setExpanded] = useState(false);
  const [darkModeSwitch, setDarkModeSwitch] = useState(false);

  let updateName = '';

  // All the logic to implemet DialogConfirmation
  const [checkUpdateConfirmationVisible, setCheckUpdateConfirmationVisible] =
    useState(false);
  const [runUpdateConfirmationVisible, setRunUpdateConfirmationVisible] =
    useState(false);
  const onDismissDialogConfirmation = () => {
    setCheckUpdateConfirmationVisible(false);
    setRunUpdateConfirmationVisible(false);
  };

  AsyncStorage.getItem('colorScheme').then((token) => {
    token == 'dark' ? setDarkModeSwitch(true) : setDarkModeSwitch(false);
  });

  const height = useSharedValue(0); // Animated height value

  if (Platform.OS === 'android') {
    // Enable LayoutAnimation for Android
    UIManager.setLayoutAnimationEnabledExperimental &&
      UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  const toggleAccordion = () => {
    setExpanded((prev) => !prev);
    height.value = expanded ? withTiming(0) : withTiming(120);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  const changeColorScheme = async () => {
    setDarkModeSwitch(!darkModeSwitch);
    const darkMode = !darkModeSwitch;
    if (darkMode) {
      EventRegister.emit('updateTheme', 'dark');
      AsyncStorage.setItem('colorScheme', 'dark');
    } else {
      EventRegister.emit('updateTheme', 'light');
      AsyncStorage.setItem('colorScheme', 'light');
    }

    console.log(darkMode);
  };

  const checkUpdates = async () => {
    setCheckUpdateConfirmationVisible(false);

    const updatesStorageRef = storage().ref('updates');
    const currentVersion = 0;
    let updateVersion = currentVersion;

    await updatesStorageRef
      .listAll()
      .then((result) => {
        result.items.forEach((ref) => {
          if (ref.name.endsWith('.apk')) {
            const refName = ref.name.split('.');
            refName.pop();
            const apkName = refName.join('.').toString();
            const apkVersion = apkName.match(/V(\d+)/)[1];
            console.log(apkVersion);
            if (Number(apkVersion) && Number(apkVersion) > updateVersion) {
              updateVersion = Number(apkVersion);
              updateName = ref.name;
              console.log(updateName);
            }
          }
        });
      })
      .catch((e: any) => {
        const err = e as FirebaseError;
        console.log('Update checking error: ' + err.message);
      })
      .finally(() => {
        if (updateVersion > currentVersion) {
          console.log('Do update?');

          setRunUpdateConfirmationVisible(true);
        } else console.log('No update');
      });
  };

  const downloadUpdate = async (updateFileName: string) => {
    setRunUpdateConfirmationVisible(false);

    console.log('Downloading update: ' + updateFileName);

    const updateStorageRef = storage().ref('updates/' + updateFileName);

    const apkPath = RNFS.DownloadDirectoryPath + '/' + updateFileName;

    const task = updateStorageRef.writeToFile(apkPath);

    task.on('state_changed', (taskSnapshot) => {
      console.log(
        `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`
      );
    });

    await task
      .then(() => {
        console.log('Update Downloaded!');
        installUpdate(apkPath);
      })
      .catch((e: any) => {
        const err = e as FirebaseError;
        console.log('Update download failed: ' + err.message);
      });
  };

  const installUpdate = async (apkPath: string) => {
    console.log('Installing: ' + apkPath);
    try {
      await RNFetchBlob.android.actionViewIntent(
        apkPath,
        'application/vnd.android.package-archive'
      );
    } catch (e: any) {
      console.log('Installing apk failed: ' + e);
    } finally {
      console.log('Finished');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <DialogConfirmation
        text='Check for updates?'
        visible={checkUpdateConfirmationVisible}
        onDismiss={onDismissDialogConfirmation}
        onConfirmation={checkUpdates}
      />

      <DialogConfirmation
        text='There is a new version available, do you want to update?'
        visible={runUpdateConfirmationVisible}
        onDismiss={onDismissDialogConfirmation}
        onConfirmation={() => downloadUpdate(updateName)}
      />

      <DrawerContentScrollView {...props} scrollEnabled={false}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      <View style={{ paddingBottom: 20 + insets.bottom }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '95%',
          }}
        >
          <List.Item
            title={t('drawer.darkMode')}
            titleStyle={{ fontSize: 15, fontWeight: 'bold' }}
            left={(props) => (
              <Ionicons {...props} name='moon-sharp' size={25} />
            )}
          />
          <Switch value={darkModeSwitch} onValueChange={changeColorScheme} />
        </View>
        <TouchableOpacity style={{ marginLeft: -4 }} onPress={toggleAccordion}>
          <List.Item
            title={t('drawer.language')}
            titleStyle={{ fontSize: 15, fontWeight: 'bold' }}
            left={(props) => (
              <Ionicons {...props} name='language-sharp' size={32} />
            )}
            right={(props) => (
              <Ionicons
                {...props}
                name={expanded ? 'arrow-up' : 'arrow-down'}
                size={25}
              />
            )}
          />
        </TouchableOpacity>
        <Animated.View style={[styles.content, animatedStyle]}>
          <View
            style={{
              width: '80%',
              justifyContent: 'center',

              alignSelf: 'center',
            }}
          >
            <List.Item
              title='English'
              left={(props) => (
                <Ionicons {...props} name='language-sharp' size={25} />
              )}
              onPress={() => {
                i18next.changeLanguage('en-US');
                AsyncStorage.setItem('language', 'en-US');
              }}
            />
            <List.Item
              title='Português'
              left={(props) => (
                <Ionicons {...props} name='language-sharp' size={25} />
              )}
              onPress={() => {
                i18next.changeLanguage('pt-PT');
                AsyncStorage.setItem('language', 'pt-PT');
              }}
            />
          </View>
        </Animated.View>

        <DrawerItem
          labelStyle={{ fontSize: 15, fontWeight: 'bold' }}
          label={'Check Updates'}
          icon={({ color }) => (
            <Ionicons name={'cloud-download-outline'} color={color} size={32} />
          )}
          inactiveTintColor={theme.colors.onBackground}
          activeTintColor={theme.colors.primary}
          inactiveBackgroundColor='transparent'
          onPress={() => setCheckUpdateConfirmationVisible(true)}
        />

        <DrawerItem
          labelStyle={{ fontSize: 15, fontWeight: 'bold' }}
          label={t('drawer.signOut')}
          icon={({ focused, color }) => (
            <Ionicons name={'log-out-outline'} color={color} size={32} />
          )}
          inactiveTintColor={theme.colors.onBackground}
          activeTintColor={theme.colors.primary}
          inactiveBackgroundColor='transparent'
          onPress={() => auth().signOut()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    overflow: 'hidden',
  },
});
