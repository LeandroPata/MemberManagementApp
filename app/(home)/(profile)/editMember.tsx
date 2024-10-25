import { View, Text } from 'react-native'
import React from 'react'
import { useLocalSearchParams } from 'expo-router'

export default function EditMember() {
    const { profileID } = useLocalSearchParams();
    console.log(profileID);
  return (
    <View>
      <Text>editMember</Text>
    </View>
  )
}

