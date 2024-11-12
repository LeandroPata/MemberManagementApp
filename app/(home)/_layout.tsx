import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from '@/components/gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';

const HomeLayout = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Drawer
      screenOptions={{
        sceneContainerStyle: {
          backgroundColor: theme.colors.background,
        },
        drawerStyle: { backgroundColor: theme.colors.background },
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.onBackground,
        drawerInactiveBackgroundColor: 'transparent',
        drawerLabelStyle: { marginLeft: -20 },
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTitleStyle: { color: theme.colors.onBackground },
        headerShadowVisible: false,
        header: ({ navigation }) => (
          <View style={{ paddingTop: insets.top, paddingHorizontal: 5 }}>
            <TouchableOpacity
              onPress={() => navigation.toggleDrawer()}
              style={{ maxWidth: 36 }}
            >
              <Ionicons
                name='menu'
                size={32}
                color={theme.colors.onBackground}
                style={{ alignSelf: 'center' }}
              />
            </TouchableOpacity>
          </View>
        ),
      }}
    >
      <Drawer.Screen
        name='home'
        options={{
          drawerLabel: 'Home',
          title: 'Home',
          drawerIcon: ({ size, color }) => (
            <Ionicons name='home' size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name='addMember'
        options={{
          drawerLabel: 'Add Member',
          title: 'Add Member',
          drawerIcon: ({ size, color }) => (
            <Ionicons name='person-add' size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name='searchMember'
        options={{
          drawerLabel: 'Search Member',
          title: 'Search Member',
          drawerIcon: ({ size, color }) => (
            <Ionicons name='search' size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name='(profile)'
        options={{ drawerItemStyle: { display: 'none' } }}
      />
    </Drawer>
  );
};

export default HomeLayout;
