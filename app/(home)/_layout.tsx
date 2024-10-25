import React from 'react';
import { Stack } from 'expo-router';

const HomeLayout = () => {
  return (
    <Stack>
      <Stack.Screen name='home' />
      <Stack.Screen name='addMember' />
      <Stack.Screen name='searchMember' />
      <Stack.Screen name='(profile)' options={{headerShown: false}} />
    </Stack>
  )
}

export default HomeLayout