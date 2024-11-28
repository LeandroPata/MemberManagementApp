import { View } from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from '@react-navigation/drawer';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';

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
              name={focused ? 'log-out' : 'log-out-outline'}
              color={color}
              size={size}
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
