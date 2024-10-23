import React from 'react';
import { Stack } from 'expo-router';

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen name='home' />
      <Stack.Screen name='addMember' />
      <Stack.Screen name='searchMember' />
    </Stack>
  )
}

export default Layout