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
import firestore, { Timestamp } from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import DatePicker from 'react-native-date-picker';

export default function Profile() {
  const { profileID } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [pictureModal, setPictureModal] = useState(false);
  const [dateModal, setDateModal] = useState(false);

  const [name, setName] = useState('');
  const [memberNumber, setMemberNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhone] = useState('');
  const [endDate, setEndDate] = useState(new Date());
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);

    const subscriber = firestore()
      .collection('users')
      .doc(profileID)
      .onSnapshot((documentSnapshot) => {
        if (documentSnapshot) {
          setProfile(documentSnapshot.data());
          setName(documentSnapshot.data().name);
          setMemberNumber(documentSnapshot.data().memberNumber);
          setEmail(documentSnapshot.data().email);
          setPhone(documentSnapshot.data().phoneNumber);
          setEndDate(new Date(documentSnapshot.data().endDate.toDate()));
          setProfilePicture(documentSnapshot.data().profilePicture);
        }
      });
    setLoading(false);
    return () => subscriber();
  }, []);

  const reference = storage().ref(name + '.jpg');

  const pickImage = async () => {
    setPictureModal(false);
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      allowsEditing: true,
      quality: 0.5,
      aspect: [3, 4],
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

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      allowsEditing: true,
      quality: 0.5,
      aspect: [3, 4],
    });

    console.log(result);

    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
    }
  };

  const uploadPicture = async () => {
    // Delete previous picture if it is different from the placeholder
    if (
      profilePicture &&
      profilePicture != process.env.EXPO_PUBLIC_PLACEHOLDER_PICTURE_URL &&
      profilePicture != profile.profilePicture
    ) {
      await reference
        .delete()
        .then(() => {
          console.log('File deleted!');
        })
        .catch((e: any) => {
          const err = e as FirebaseError;
          alert('File deletion failed: ' + err.message);
          console.log('File deletion failed: ' + err.message);
          setLoading(false);
        });

      // Upload picture to Firebase if it is different from the placeholder

      const task = reference.putFile(profilePicture);

      task.on('state_changed', (taskSnapshot) => {
        console.log(
          `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`
        );
      });

      await task
        .then(() => {
          console.log('Image uploaded to the bucket!');
          alert('Image uploaded to the bucket!');
        })
        .catch((e: any) => {
          const err = e as FirebaseError;
          alert('File upload failed: ' + err.message);
          console.log('File upload failed: ' + err.message);
          setLoading(false);
        });

      //await reference.putFile(result.assets[0].uri);
      // Get download url
      const url = await reference.getDownloadURL();
      console.log(url);
      setProfilePicture(url);
      return url;
    }
    return null;
  };

  const checkNumber = async () => {
    let numberAvailable = 1;
    if (memberNumber != profile.memberNumber) {
      const snapshot = await firestore()
        .collection('users')
        .orderBy('memberNumber', 'asc')
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((documentSnapshot) => {
            if (memberNumber == documentSnapshot.data().memberNumber) {
              numberAvailable++;
              console.log('Number unavailable!');
            }
          });
        });
    }
    //console.log('Result: ' + numberAvailable);
    return numberAvailable;
  };

  const saveMember = async () => {
    setLoading(true);

    const url = await uploadPicture();

    const numberAvailable = await checkNumber();
    if (numberAvailable > 1) {
      alert('This member number is already attributed to another member!');
      setLoading(false);
      return;
    }

    try {
      firestore()
        .collection('users')
        .doc(profileID)
        .update({
          name: name.trim(),
          memberNumber: parseInt(memberNumber),
          email: email.trim(),
          phoneNumber: phoneNumber,
          endDate: Timestamp.fromDate(endDate),
          profilePicture: url ? url : profilePicture,
        })
        .then(() => {
          alert('Member Updated!');
        });
    } catch (e: any) {
      const err = e as FirebaseError;
      alert('Updating member failed: ' + err.message);
      console.log('Updating member failed: ' + err.message);
      setLoading(false);
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
            <Button title='Pick an image from gallery' onPress={pickImage} />
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
          <Text>{endDate.toLocaleDateString('pt-pt')}</Text>
          <Button title='Set End Date' onPress={() => setDateModal(true)} />
          <DatePicker
            modal
            mode='date'
            locale='pt-pt'
            open={dateModal}
            date={endDate}
            onConfirm={(endDate) => {
              setDateModal(false);
              setEndDate(endDate);
            }}
            onCancel={() => {
              setDateModal(false);
            }}
          />
          <Button onPress={saveMember} title='Save' />
        </KeyboardAvoidingView>
      ) : (
        <View>
          {profilePicture ? (
            <>
              <Image style={styles.picture} src={profilePicture} />
            </>
          ) : null}
          <Text style={styles.title}>Name: {name}</Text>
          <Text style={styles.title}>Member Number: {memberNumber}</Text>
          <Text style={styles.title}>Email: {email}</Text>
          <Text style={styles.title}>Phone Number: {phoneNumber}</Text>
          <Text style={styles.title}>
            Added Date:{' '}
            {new Date(profile.addedDate.toDate()).toLocaleDateString('pt-pt')}
          </Text>
          <Text style={styles.title}>
            End Date: {endDate.toLocaleDateString('pt-pt')}
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
