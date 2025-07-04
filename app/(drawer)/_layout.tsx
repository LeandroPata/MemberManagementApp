import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';
import { Keyboard, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomDrawerContent from '@/components/CustomDrawerContent';
import { globalStyles } from '@/styles/global';

const DrawerLayout = () => {
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
							onPress={() => {
								Keyboard.dismiss();
								navigation.toggleDrawer();
							}}
							style={{ maxWidth: 36 }}
							testID='DrawerButton'
						>
							<MaterialCommunityIcons
								name='menu'
								size={45}
								color={theme.colors.onBackground}
								style={{ alignSelf: 'center' }}
							/>
						</TouchableOpacity>
					</View>
				),
				sceneStyle: {
					backgroundColor: theme.colors.background,
				},
				drawerStyle: {
					backgroundColor: theme.colors.background,
					paddingTop: insets.top,
				},
				drawerLabelStyle: globalStyles.text.drawer,
				drawerActiveTintColor: theme.colors.primary,
				drawerInactiveTintColor: theme.colors.onBackground,
				drawerInactiveBackgroundColor: 'transparent',
			}}
		/>
	);
};

export default DrawerLayout;
