import React from 'react';
import { Stack } from 'expo-router';

const HomeLayout = () => {
  return (
    <Stack>
      <Stack.Screen name='home' options={{ headerShown: false }} />
      <Stack.Screen name='addMember' options={{ headerShown: false }} />
      <Stack.Screen name='searchMember' options={{ headerShown: false }} />
      <Stack.Screen name='(profile)' options={{ headerShown: false }} />
    </Stack>
  );
};

export default HomeLayout;
