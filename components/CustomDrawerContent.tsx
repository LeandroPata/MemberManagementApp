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

export default function CustomDrawerContent(props: any) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const [expanded, setExpanded] = useState(false);
  const [darkModeSwitch, setDarkModeSwitch] = useState(false);

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

  return (
    <View style={{ flex: 1 }}>
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
            title='Dark Mode'
            titleStyle={{ fontSize: 15, fontWeight: 'bold' }}
            left={(props) => (
              <Ionicons {...props} name='moon-sharp' size={25} />
            )}
          />
          <Switch value={darkModeSwitch} onValueChange={changeColorScheme} />
        </View>
        <TouchableOpacity style={{ marginLeft: -4 }} onPress={toggleAccordion}>
          <List.Item
            title='Language'
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
          label={t('drawer.signOut')}
          icon={({ focused, color }) => (
            <Ionicons
              name={focused ? 'log-out' : 'log-out-outline'}
              color={color}
              size={32}
            />
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
