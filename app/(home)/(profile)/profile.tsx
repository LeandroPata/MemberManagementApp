import { View, Text, StyleSheet, Image, ActivityIndicator, Button } from 'react-native'
import React, { useEffect, useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import firestore from '@react-native-firebase/firestore';

export default function Profile() {
    const { profileID } = useLocalSearchParams();
    const [profile, setProfile] = useState();
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        setLoading(true);
        const subscriber = firestore()
        .collection('users')
        .doc(profileID)
        .onSnapshot(documentSnapshot => {
            setProfile(documentSnapshot.data());
        });
        setLoading(false);
        return () => subscriber();
    }, []);
    
    return (
        <View style={styles.container}>
        {loading || !profile ? (
            < ActivityIndicator size={'large'} style = {{ margin: 28 }}/>
        ) : (
            <>
            <Image style={styles.picture} src={profile.profilePicture} />
            <Text style={styles.title}>Name: {profile.name}</Text>
            <Text style={styles.title}>Member Number: {profile.memberNumber}</Text>
            <Text style={styles.title}>Email: {profile.email}</Text>
            <Text style={styles.title}>Phone Number: {profile.phoneNumber}</Text>
            <Text style={styles.title}>Added Date: {new Date(profile.addedDate.toDate()).toLocaleDateString('pt-pt')}</Text>
            <Button onPress={() => {
                router.push({ pathname: '/(home)/(profile)/editMember', params: { profileID: profileID } });
            }}
            title="Edit Member" />
            </>
        )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        flex: 1,
        justifyContent: 'center'
    },
    input: {
        marginVertical: 4,
        height: 50,
        borderWidth: 1,
        borderRadius: 1,
        padding: 5,
        backgroundColor: '#ffffff'
    },
    picture: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
        alignSelf: 'center'
    },
    title: {
        fontSize: 15,
    }
})