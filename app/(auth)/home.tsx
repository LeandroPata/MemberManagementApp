import React from 'react';
import { View, Text, Button } from 'react-native';
import auth from '@react-native-firebase/auth';
import { router } from 'expo-router';

const Home = () => {
    const user = auth().currentUser;
    return (
        <View>
            <Text>Welcome back {user?.email}</Text>
            <Button title='Add member' onPress={() => router.replace('/(auth)/addUser')} />
            <Button title='Sign Out' onPress={() => auth().signOut()} />
        </View>
    )
}

export default Home