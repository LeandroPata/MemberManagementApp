import React from 'react';
import { useTheme } from 'react-native-paper';
import { Stack } from 'expo-router';

const ProfileLayout = () => {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name='profile' options={{ headerShown: false }} />
    </Stack>
  );
};

export default ProfileLayout;
