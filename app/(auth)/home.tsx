import React from 'react';
import { View, Text, Button } from 'react-native';
import auth from '@react-native-firebase/auth';

const Page = () => {
    const user = auth().currentUser;
    return (
        <View>
            <Text>Welcome back {user?.email}</Text>
            <Button title='Sign Out' onPress={() => auth().signOut()} />
        </View>
    )
}

export default Page