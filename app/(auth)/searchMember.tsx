import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    TextInput,
    Button,
    ActivityIndicator,
    FlatList,
    Pressable,
    Image
} from 'react-native';
import { FirebaseError } from 'firebase/app';
//import firebase from '@react-native-firebase/app';
import firestore, { Filter, FirebaseFirestoreTypes, query } from '@react-native-firebase/firestore';
import { router } from 'expo-router';

export default function SearchMember() {
    const [loading, setLoading] = useState(false);
    const [searchResults, setSearchResults] = useState(false);
    const [name, setName] = useState('');
    const [members, setMembers] = useState([]);
    
    const [selectedId, setSelectedId] = useState<string>();
    
    useEffect(() => {
        if (searchResults) {
            setLoading(true);
            const subscriber = firestore()
            .collection('users')
            .where(Filter('name', '==', name))
            .onSnapshot(querySnapshot => {
                const members = [];
                querySnapshot.forEach(documentSnapshot => {
                    members.push({ key: documentSnapshot.id, ...documentSnapshot.data() });
                    //console.log(members)
                });
                setMembers(members);
                //console.log(members);
                setLoading(false);
            });
            return () => subscriber();
        }
    }, []);
    
    const searchMember = async () => {
        //console.log(members);
        setLoading(true);
        
        const snapshot = await firestore()
        .collection('users')
        .where(Filter('name', '==', name)).get()
        .then(querySnapshot => {
            const members = [];
            querySnapshot.forEach(documentSnapshot => {
                members.push({ key: documentSnapshot.id, ...documentSnapshot.data() });
                //console.log(members)
            });
            setMembers(members);
            console.log(members);
            if (members.length <= 0) {
                console.log('No member found.');
            } else {
                setSearchResults(true);
            }
            
        });
        
        setLoading(false);
    }
    
    const renderItem = ({ item }) => {
        const backgroundColor = item.key === selectedId ? '#6e3b6e' : '#f9c2ff';
        const color = item.key === selectedId ? 'white' : 'black';
        console.log(members);
        
        return (
            <Pressable
            style={[styles.item, { backgroundColor }]}
            onPress={() => setSelectedId(item.key)}>
            <Image style={styles.picture} src={item.profilePicture}/>
            <Text style={[styles.title, {color: color}]}>Name: {item.name}</Text>
            <Text style={[styles.title, {color: color}]}>Member Number: {item.memberNumber}</Text>
            </Pressable>
        )};
        
        return (
            <View style={styles.container}>
            {searchResults ? (
                <FlatList
                data={members}
                renderItem={renderItem}
                keyExtractor={item => item.key}
                extraData={selectedId}
                numColumns={2}
                />
            ) : (
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
                
            )}
            
            </View>
        );
    }
    
    const styles = StyleSheet.create({
        container: {
            marginHorizontal: 20,
            flex: 1,
            justifyContent: 'center',
            //flexDirection: 'row',
            //flexWrap: 'wrap'
        },
        input: {
            marginVertical: 4,
            height: 50,
            borderWidth: 1,
            borderRadius: 1,
            padding: 5,
            backgroundColor: '#ffffff',
            justifyContent: 'center',
            alignContent: 'center'
        },
        item: {
            //padding: 15,
            paddingHorizontal: 15,
            paddingVertical: 5,
            marginVertical: 8,
            marginHorizontal: 8,
            height: 150,
            width: 175
        },
        title: {
            fontSize: 15,
        },
        picture: {
            width: 100,
            height: 100,
            resizeMode: 'contain',
            alignSelf: 'center'
        }
    })