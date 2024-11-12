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
        drawerLabelStyle: { color: theme.colors.onBackground },
        drawerActiveTintColor: theme.colors.primary,
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
        options={{ drawerLabel: 'Home', title: 'Home' }}
      />
      <Drawer.Screen
        name='addMember'
        options={{ drawerLabel: 'Add Member', title: 'Add Member' }}
      />
      <Drawer.Screen
        name='searchMember'
        options={{ drawerLabel: 'Search Member', title: 'Search Member' }}
      />
      <Drawer.Screen
        name='(profile)'
        options={{ drawerItemStyle: { display: 'none' } }}
      />
    </Drawer>
  );
};

export default HomeLayout;
