import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    TextInput,
    Button,
    ActivityIndicator
} from 'react-native';
import { FirebaseError } from 'firebase/app';
//import firebase from '@react-native-firebase/app';
import firestore, { Filter } from '@react-native-firebase/firestore';
import { router } from 'expo-router';

export default function SearchMember() {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');

    const searchMember = async () => {
        setLoading(true);

        const snapshot = await firestore().collection('users')
            .where(Filter('name', '==', name)).get()
        
        snapshot.forEach(userDoc => {
            console.log('User ID: ', userDoc.id, userDoc.data());
        })

        /* try {
            var snapshot = await firestore().collection('users')
                .where(Filter('name', '==', name))
                .get()
            console.log(snapshot)
        } catch (e: any) {
            const err = e as FirebaseError;
            alert('Searching member failed: ' + err.message)
        } finally {
            
            setLoading(false);
        } */
        setLoading(false);
    }

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView behavior='padding'>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize='words'
                    keyboardType='default'
                    placeholder="Name"
                />
                
                {loading ? (
                < ActivityIndicator size={'small'} style = {{ margin: 28 }}/>
                ) : (
                <>
                    <Button onPress={searchMember} title="Search Member" />
                </>
                )}
            </KeyboardAvoidingView>
        </View>
    );
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
  }
})