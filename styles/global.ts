import { StyleSheet } from 'react-native';
import {
	MD3LightTheme as DefaultLightTheme,
	MD3DarkTheme as DefaultDarkTheme,
} from 'react-native-paper';

export const globalTheme = {
	dark: {
		...DefaultDarkTheme,
		colors: {
			primary: 'rgb(255, 180, 172)',
			onPrimary: 'rgb(96, 18, 17)',
			primaryContainer: 'rgb(127, 41, 36)',
			onPrimaryContainer: 'rgb(255, 218, 214)',
			secondary: 'rgb(231, 189, 184)',
			onSecondary: 'rgb(68, 41, 39)',
			secondaryContainer: 'rgb(93, 63, 60)',
			onSecondaryContainer: 'rgb(255, 218, 214)',
			tertiary: 'rgb(224, 195, 140)',
			onTertiary: 'rgb(63, 45, 4)',
			tertiaryContainer: 'rgb(88, 68, 25)',
			onTertiaryContainer: 'rgb(254, 223, 166)',
			error: 'rgb(142, 0, 3)',
			onError: 'rgb(105, 0, 5)',
			errorContainer: 'rgb(147, 0, 10)',
			onErrorContainer: 'rgb(255, 255, 255)',
			background: 'rgb(25, 25, 24)',
			onBackground: 'rgb(237, 224, 222)',
			surface: 'rgb(32, 26, 25)',
			onSurface: 'rgb(237, 224, 222)',
			surfaceVariant: 'rgb(83, 67, 65)',
			onSurfaceVariant: 'rgb(216, 194, 191)',
			outline: 'rgb(160, 140, 138)',
			outlineVariant: 'rgb(83, 67, 65)',
			shadow: 'rgb(0, 0, 0)',
			scrim: 'rgb(0, 0, 0)',
			inverseSurface: 'rgb(237, 224, 222)',
			inverseOnSurface: 'rgb(54, 47, 46)',
			inversePrimary: 'rgb(158, 64, 57)',
			elevation: {
				level0: 'transparent',
				level1: 'rgb(43, 34, 32)',
				level2: 'rgb(50, 38, 37)',
				level3: 'rgb(57, 43, 41)',
				level4: 'rgb(59, 45, 43)',
				level5: 'rgb(63, 48, 46)',
			},
			surfaceDisabled: 'rgba(237, 224, 222, 0.12)',
			onSurfaceDisabled: 'rgb(237, 224, 222)',
			backdrop: 'rgba(59, 45, 43, 0.4)',
		},
	},
	light: {
		...DefaultLightTheme,
		colors: {
			primary: 'rgb(157, 65, 57)',
			onPrimary: 'rgb(255, 255, 255)',
			primaryContainer: 'rgb(255, 218, 214)',
			onPrimaryContainer: 'rgb(65, 0, 2)',
			secondary: 'rgb(119, 86, 82)',
			onSecondary: 'rgb(255, 255, 255)',
			secondaryContainer: 'rgb(255, 218, 214)',
			onSecondaryContainer: 'rgb(44, 21, 19)',
			tertiary: 'rgb(113, 91, 46)',
			onTertiary: 'rgb(255, 255, 255)',
			tertiaryContainer: 'rgb(253, 223, 166)',
			onTertiaryContainer: 'rgb(38, 25, 0)',
			error: 'rgb(186, 26, 26)',
			onError: 'rgb(255, 255, 255)',
			errorContainer: 'rgb(255, 218, 214)',
			onErrorContainer: 'rgb(65, 0, 2)',
			background: 'rgb(255, 251, 255)',
			onBackground: 'rgb(32, 26, 25)',
			surface: 'rgb(255, 251, 255)',
			onSurface: 'rgb(32, 26, 25)',
			surfaceVariant: 'rgb(245, 221, 218)',
			onSurfaceVariant: 'rgb(83, 67, 65)',
			outline: 'rgb(133, 115, 113)',
			outlineVariant: 'rgb(216, 194, 191)',
			shadow: 'rgb(0, 0, 0)',
			scrim: 'rgb(0, 0, 0)',
			inverseSurface: 'rgb(54, 47, 46)',
			inverseOnSurface: 'rgb(251, 238, 236)',
			inversePrimary: 'rgb(255, 180, 171)',
			elevation: {
				level0: 'transparent',
				level1: 'rgb(250, 242, 245)',
				level2: 'rgb(247, 236, 239)',
				level3: 'rgb(244, 231, 233)',
				level4: 'rgb(243, 229, 231)',
				level5: 'rgb(241, 225, 227)',
			},
			surfaceDisabled: 'rgba(32, 26, 25, 0.12)',
			onSurfaceDisabled: 'rgb(32, 26, 25)',
			backdrop: 'rgba(59, 45, 43, 0.4)',
		},
	},
};

export const globalStyles = StyleSheet.create({
	container: {
		global: {
			flex: 1,
			justifyContent: 'center',
		},
		home: {
			flex: 1,
		},
		button: {
			marginHorizontal: 20,
			alignItems: 'center',
		},
		image: {
			justifyContent: 'center',
			alignSelf: 'center',
			width: '50%',
			height: '35%',
		},
	},
	modalContainer: {
		global: {
			marginHorizontal: 30,
			alignItems: 'center',
		},
		drawer: {
			marginHorizontal: 30,
		},
	},
	modalContentContainer: {
		global: {
			paddingVertical: 10,
			paddingHorizontal: 15,
			borderRadius: 20,
		},
		drawer: {
			paddingVertical: 5,
			paddingHorizontal: 15,
			borderRadius: 20,
			justifyContent: 'center',
		},
		yearPicker: {
			paddingVertical: 10,
			paddingHorizontal: 10,
			borderRadius: 20,
			minWidth: '40%',
			alignItems: 'center',
		},
	},
	button: {
		global: {
			marginVertical: 8,
			justifyContent: 'center',
		},
		search: {
			justifyContent: 'center',
		},
		profile: {
			marginVertical: 4,
			justifyContent: 'center',
		},
	},
	buttonContent: {
		global: {
			minWidth: 280,
			minHeight: 80,
		},
		modal: {
			minWidth: 150,
			minHeight: 30,
		},
	},
	buttonText: {
		global: {
			fontSize: 25,
			fontWeight: 'bold',
			overflow: 'visible',
			paddingTop: 10,
		},
		search: {
			fontSize: 15,
			fontWeight: 'normal',
			overflow: 'visible',
		},
		modal: {
			fontSize: 15,
			fontWeight: 'bold',
			overflow: 'visible',
		},
	},
	input: {
		marginVertical: 2,
	},
	image: {
		global: {
			resizeMode: 'contain',
			width: '100%',
			height: '100%',
		},
		drawer: {
			alignSelf: 'center',
			resizeMode: 'contain',
		},
	},
	pictureButton: {
		padding: 15,
		alignSelf: 'center',
	},
	text: {
		global: {
			fontSize: 20,
			fontWeight: 'bold',
			marginVertical: 3,
		},
		search: {
			fontSize: 15,
			fontWeight: 'normal',
		},
		footer: {
			fontSize: 13,
			textAlign: 'center',
			textAlignVertical: 'center',
		},
		date: {
			fontWeight: 'bold',
			textAlignVertical: 'center',
			fontSize: 20,
		},
		snackbarInfo: {
			fontSize: 15,
		},
		errorHelper: {
			fontSize: 15,
			fontWeight: 'bold',
		},
		dialog: {
			fontSize: 15,
		},
		drawer: {
			fontSize: 15,
			fontWeight: 'bold',
		},
	},
	item: {
		borderRadius: 5,
		paddingHorizontal: 10,
		paddingVertical: 5,
		marginVertical: '1%',
		marginHorizontal: '1%',
		width: '48%',
	},
	content: {
		overflow: 'hidden',
	},
	wheelPickerContainer: {
		maxWidth: '20%',
	},
	wheelPickerItem: {
		maxWidth: '10%',
		backgroundColor: 'blue',
	},
	wheelPickerText: {
		fontSize: 15,
		fontWeight: 'bold',
	},
	drawerStyle: {
		minHeight: 10,
	},
	searchBar: {
		marginBottom: 10,
		marginHorizontal: 10,
	},
});
