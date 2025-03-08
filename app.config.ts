import type { ExpoConfig, ConfigContext } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
	...config,
	name: 'MemberManagementApp',
	slug: 'MemberManagementApp',
	version: '1.1.1',
	orientation: 'portrait',
	icon: './assets/images/iconReact.png',
	scheme: 'myapp',
	userInterfaceStyle: 'automatic',
	newArchEnabled: false,
	ios: {
		supportsTablet: true,
		bundleIdentifier: 'com.leandropata.membermanagementapp',
		googleServicesFile:
			process.env.GOOGLE_SERVICES_PLIST || './GoogleService-Info.plist',
	},
	android: {
		adaptiveIcon: {
			foregroundImage: './assets/images/adaptiveIconReact.png',
			backgroundColor: '#fffbff',
		},
		package: 'com.leandropata.membermanagementapp',
		permissions: [
			'android.permission.READ_EXTERNAL_STORAGE',
			'android.permission.REQUEST_INSTALL_PACKAGES',
		],
		intentFilters: [
			{
				action: 'VIEW',
				data: [
					{
						scheme: 'file',
						mimeType: 'application/vnd.android.package-archive',
					},
				],
				category: ['BROWSABLE', 'DEFAULT'],
			},
		],
		googleServicesFile:
			process.env.GOOGLE_SERVICES_JSON || './google-services.json',
	},
	web: {
		bundler: 'metro',
		output: 'static',
		favicon: './assets/images/logoReact.png',
	},
	plugins: [
		'expo-router',
		[
			'expo-splash-screen',
			{
				image: './assets/images/logoReact.png',
				imageWidth: 200,
				resizeMode: 'contain',
				backgroundColor: '#fffbff',
				dark: {
					image: './assets/images/logoReact.png',
					imageWidth: 200,
					resizeMode: 'contain',
					backgroundColor: '#191918',
				},
			},
		],
		[
			'expo-build-properties',
			{
				android: {
					enableProguardInReleaseBuilds: true,
					enableShrinkResourcesInReleaseBuilds: true,
				},
				ios: {
					useFrameworks: 'static',
				},
			},
		],
		[
			'expo-image-picker',
			{
				photosPermission:
					'The app accesses your photos to set a profile picture.',
				cameraPermission:
					'The app accesses your camera to take a photo for profile pictures.',
			},
		],
		'expo-localization',
		'@react-native-firebase/app',
		'@react-native-firebase/auth',
	],
	experiments: {
		typedRoutes: true,
	},
	extra: {
		eas: {
			projectId: '08a22d0f-3b5b-408b-a1ce-b7d51e0a8f82',
		},
	},
});
