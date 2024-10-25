import React from 'react'
import { Stack } from 'expo-router'

const ProfileLayout = () => {
  return (
    <Stack>
      <Stack.Screen name='profile' />
      <Stack.Screen name='editMember' />
    </Stack>
  )
}

export default ProfileLayout