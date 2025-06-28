import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';

const HomeLayout = () => {
	const theme = useTheme();

	return (
		<Stack
			screenOptions={{
				contentStyle: { backgroundColor: theme.colors.background },
			}}
		>
			<Stack.Screen
				name='profile'
				options={{ headerShown: false }}
			/>
		</Stack>
	);
};

export default HomeLayout;
