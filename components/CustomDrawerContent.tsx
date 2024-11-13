import { View, Text } from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

export default function CustomDrawerContent(props: any) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props} scrollEnabled={false}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      <View style={{ paddingBottom: 20 + insets.bottom }}>
        <DrawerItem
          label={'Sign Out'}
          icon={({ focused, color, size }) => (
            <Ionicons
              color={color}
              size={size}
              name={focused ? 'log-out' : 'log-out-outline'}
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
