import { router } from 'expo-router';

export const goToProfile = (id: string) => {
	router.push({
		pathname: '/profile',
		params: { profileID: id },
	});
};
