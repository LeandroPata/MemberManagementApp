import { ExpoConfig, ConfigContext } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "MemberManagementApp",
  slug: "MemberManagementApp",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "myapp",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/images/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.leandropata.membermanagementapp",
    googleServicesFile: "./GoogleService-Info.plist"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    package: "com.leandropata.membermanagementapp",
    googleServicesFile: "./google-services.json"
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png"
  },
  plugins: [
    "expo-router",
    [
      "expo-build-properties",
      {
        ios: {
          useFrameworks: "static"
        }
      }
    ],
    [
      "expo-image-picker",
      {
        photosPermission: "The app accesses your photos to set a profile picture.",
        cameraPermission: "The app accesses your camera to take a photo for profile pictures."
      }
    ],
    "@react-native-firebase/app",
    "@react-native-firebase/auth"
  ],
  experiments: {
    typedRoutes: true
  },
  extra: {
    eas: {
      projectId: "08a22d0f-3b5b-408b-a1ce-b7d51e0a8f82"
    }
  }
});