import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Button,
  TextInput,
  KeyboardAvoidingView,
  Pressable,
  Modal,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FirebaseError } from 'firebase/app';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import * as ImagePicker from 'expo-image-picker';

export default function Profile() {
  const { profileID } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [pictureModal, setPictureModal] = useState(false);

  const [name, setName] = useState('');
  const [memberNumber, setMemberNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhone] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);

    const subscriber = firestore()
      .collection('users')
      .doc(profileID)
      .onSnapshot((documentSnapshot) => {
        setProfile(documentSnapshot.data());
        setName(documentSnapshot.data().name);
        setMemberNumber(documentSnapshot.data().memberNumber);
        setEmail(documentSnapshot.data().email);
        setPhone(documentSnapshot.data().phoneNumber);
        setProfilePicture(documentSnapshot.data().profilePicture);
      });
    setLoading(false);
    return () => subscriber();
  }, []);

  const reference = storage().ref(name + '.png');

  const pickImage = async () => {
    setPictureModal(false);
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      allowsEditing: true,
      quality: 0.5,
    });

    console.log(result);

    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
    }
  };

  const takePicture = async () => {
    setPictureModal(false);
    // Ask the user for the permission to access the camera
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      alert('Permission to access camera denied!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync();

    console.log(result);

    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
    }
  };

  const uploadPicture = async () => {
    // Delete previous picture if it is different from the placeholder
    reference
      .delete()
      .then(() => {
        console.log('File deleted!');
      })
      .catch((e: any) => {
        const err = e as FirebaseError;
        console.log('File deletion failed: ' + err.message);
      });

    // Upload picture to Firebase
    const task = reference.putFile(profilePicture);

    task.on('state_changed', (taskSnapshot) => {
      console.log(
        `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`
      );
    });

    task.then(() => {
      console.log('Image uploaded to the bucket!');
    });

    //await reference.putFile(result.assets[0].uri);
    // Get download url
    const url = await reference.getDownloadURL();
    setProfilePicture(url);
  };

  const saveMember = async () => {
    setLoading(true);

    await uploadPicture();

    try {
      firestore()
        .collection('users')
        .doc(profileID)
        .update({
          name: name,
          memberNumber: memberNumber,
          email: email,
          phoneNumber: phoneNumber,
          profilePicture: profilePicture,
        })
        .then(() => {
          console.log('Member Updated');
        });
    } catch (e: any) {
      const err = e as FirebaseError;
      console.log('Updating member failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Modal
        animationType='fade'
        transparent={true}
        visible={pictureModal}
        onRequestClose={() => {
          setPictureModal(false);
        }}
      >
        <View style={styles.container}>
          <View style={styles.modalContainer}>
            <Button
              title='Pick an image from camera roll'
              onPress={pickImage}
            />
            <Button title='Take Picture' onPress={takePicture} />
          </View>
        </View>
      </Modal>
      {loading || !profile ? (
        <ActivityIndicator size={'large'} style={{ margin: 28 }} />
      ) : editing ? (
        <KeyboardAvoidingView behavior='padding'>
          <Pressable
            onPress={() => {
              setPictureModal(true);
            }}
          >
            <Image style={styles.picture} src={profilePicture} />
          </Pressable>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            autoCapitalize='words'
            keyboardType='default'
            placeholder='Name'
          />
          <TextInput
            style={styles.input}
            value={memberNumber.toString()}
            onChangeText={setMemberNumber}
            autoCapitalize='none'
            keyboardType='numeric'
            placeholder='Member Number (leave empty for automatic assignment)'
          />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize='none'
            keyboardType='email-address'
            placeholder='Email'
          />
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhone}
            autoCapitalize='none'
            inputMode='tel'
            keyboardType='phone-pad'
            placeholder='Phone Number'
          />
          <Button onPress={saveMember} title='Save' />
        </KeyboardAvoidingView>
      ) : (
        <View>
          {profilePicture ? (
            <Image style={styles.picture} src={profilePicture} />
          ) : null}
          <Text style={styles.title}>Name: {name}</Text>
          <Text style={styles.title}>Member Number: {memberNumber}</Text>
          <Text style={styles.title}>Email: {email}</Text>
          <Text style={styles.title}>Phone Number: {phoneNumber}</Text>
          <Text style={styles.title}>
            Added Date:{' '}
            {new Date(profile.addedDate.toDate()).toLocaleDateString('pt-pt')}
          </Text>
          <Button
            onPress={() => {
              setEditing(true);
            }}
            title='Edit Member'
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    //marginHorizontal: 20,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    marginVertical: 4,
    height: 50,
    borderWidth: 1,
    borderRadius: 1,
    padding: 5,
    backgroundColor: '#ffffff',
  },
  picture: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  title: {
    fontSize: 15,
  },
});
