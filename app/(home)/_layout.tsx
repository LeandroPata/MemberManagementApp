import '@/components/gesture-handler';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from '@/components/gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import CustomDrawerContent from '@/components/CustomDrawerContent';

const HomeLayout = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTitleStyle: { color: theme.colors.onBackground },
        headerShadowVisible: false,
        header: ({ navigation }) => (
          <View
            style={{
              paddingTop: insets.top,
              paddingHorizontal: 5,
            }}
          >
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
        sceneStyle: {
          backgroundColor: theme.colors.background,
        },
        drawerStyle: { backgroundColor: theme.colors.background },
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.onBackground,
        drawerInactiveBackgroundColor: 'transparent',
      }}
    >
      <Drawer.Screen
        name='home'
        options={{
          drawerLabel: 'Home',
          title: 'Home',
          drawerIcon: ({ focused, size, color }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Drawer.Screen
        name='addMember'
        options={{
          drawerLabel: 'Add Member',
          title: 'Add Member',
          drawerIcon: ({ focused, size, color }) => (
            <Ionicons
              name={focused ? 'person-add' : 'person-add-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Drawer.Screen
        name='searchMember'
        options={{
          drawerLabel: 'Search Member',
          title: 'Search Member',
          drawerIcon: ({ focused, size, color }) => (
            <Ionicons
              name={focused ? 'search' : 'search-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Drawer.Screen
        name='importExport'
        options={{
          drawerLabel: 'Import/Export',
          title: 'Import/Export',
          drawerIcon: ({ focused, size, color }) => (
            <Ionicons
              name={focused ? 'server' : 'server-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Drawer.Screen
        name='(profile)/profile'
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
    </Drawer>
  );
};

export default HomeLayout;
