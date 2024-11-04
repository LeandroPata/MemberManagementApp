import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Text,
  Pressable,
} from 'react-native';
import {
  Button,
  TextInput,
  Switch,
  PaperProvider,
  Avatar,
  Portal,
  Modal,
} from 'react-native-paper';
import DatePicker from 'react-native-date-picker';
import { FirebaseError } from 'firebase/app';
import firestore, { Timestamp } from '@react-native-firebase/firestore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import storage from '@react-native-firebase/storage';
import * as ImagePicker from 'expo-image-picker';

export default function AddMember() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [autoNumber, setAutoNumber] = useState(true);

  const [dateModal, setDateModal] = useState(false);
  const [pictureModal, setPictureModal] = useState(false);

  const [name, setName] = useState('');
  const [memberNumber, setMemberNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhone] = useState('');
  const [endDate, setEndDate] = useState(new Date());
  const [profilePicture, setProfilePicture] = useState(
    process.env.EXPO_PUBLIC_PLACEHOLDER_PICTURE_URL
  );

  let minNumber = 0;

  const reference = storage().ref(name + '.jpg');

  const assignMemberNumber = async () => {
    await firestore()
      .collection('users')
      .orderBy('memberNumber', 'asc')
      .get()
      .then((querySnapshot) => {
        let i = 1;
        querySnapshot.forEach((documentSnapshot) => {
          if (i == documentSnapshot.data().memberNumber) {
            i = documentSnapshot.data().memberNumber + 1;
            //console.log(i);
          }
        });
        //setMemberNumber(minNumber.toString());
        minNumber = i;
      });
  };

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
    if (
      profilePicture &&
      profilePicture != process.env.EXPO_PUBLIC_PLACEHOLDER_PICTURE_URL
    ) {
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

      // Get download url
      const url = await reference.getDownloadURL();
      console.log(url);
      setProfilePicture(url);
      return url;
    }
    return null;
  };

  const addMember = async () => {
    setLoading(true);

    if (!name.trim()) {
      alert('Name is mandatory!');
      setLoading(false);
      return;
    }

    if (
      email &&
      email.trim() &&
      (!email.includes('@') || !email.includes('.'))
    ) {
      alert('Email is in the wrong format!');
      setLoading(false);
      return;
    }

    const url = await uploadPicture();

    if (autoNumber) {
      await assignMemberNumber();
    } else if (!memberNumber.trim()) {
      alert('Member number is mandatory!');
      setLoading(false);
      return;
    } else {
      minNumber = parseInt(memberNumber);
    }

    try {
      firestore()
        .collection('users')
        .add({
          name: name.trim(),
          memberNumber: minNumber,
          email: email.trim(),
          phoneNumber: phoneNumber,
          addedDate: Timestamp.fromDate(new Date()),
          endDate: Timestamp.fromDate(endDate),
          profilePicture: url ? url : profilePicture,
        })
        .then(() => {
          console.log('Added');
          setName('');
          setMemberNumber('');
          minNumber = 0;
          setEmail('');
          setPhone('');
          setEndDate(new Date());
          setProfilePicture(process.env.EXPO_PUBLIC_PLACEHOLDER_PICTURE_URL);
        });
    } catch (e: any) {
      const err = e as FirebaseError;
      console.log('Adding member failed: ' + err.message);
      alert('Adding member failed: ' + err.message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaperProvider>
      <Portal>
        <Modal
          visible={pictureModal}
          onDismiss={() => {
            setPictureModal(false);
          }}
          contentContainerStyle={styles.modalContainer}
        >
          <Button style={styles.button} mode='elevated' onPress={pickImage}>
            Pick an image from gallery
          </Button>
          <Button style={styles.button} mode='elevated' onPress={takePicture}>
            Take Picture
          </Button>
        </Modal>
      </Portal>
      <KeyboardAvoidingView
        style={[styles.container, { paddingTop: insets.top }]}
        behavior='padding'
      >
        <Pressable
          onPress={() => {
            setPictureModal(true);
          }}
        >
          <Avatar.Image
            size={200}
            style={{ alignSelf: 'center' }}
            source={{ uri: profilePicture }}
          />
        </Pressable>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          autoCapitalize='words'
          keyboardType='default'
          label='Name'
        />
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize='none'
          keyboardType='email-address'
          label='Email'
        />
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhone}
          autoCapitalize='none'
          inputMode='tel'
          keyboardType='phone-pad'
          label='Phone Number'
        />
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              flex: 2,
            }}
          >
            <Text>Auto Number</Text>
            <Switch value={autoNumber} onValueChange={setAutoNumber} />
          </View>
          <TextInput
            disabled={autoNumber}
            style={[styles.input, { flex: 3 }]}
            value={memberNumber}
            onChangeText={setMemberNumber}
            autoCapitalize='none'
            keyboardType='numeric'
            label='Member Number'
            placeholder='(leave empty for automatic assignment)'
          />
        </View>
        <Button onPress={() => setDateModal(true)}>
          End Date: {endDate.toLocaleDateString('pt-pt')}
        </Button>
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
        <Button
          style={styles.button}
          mode='elevated'
          loading={loading}
          onPress={addMember}
        >
          Add Member
        </Button>
      </KeyboardAvoidingView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    flex: 1,
    justifyContent: 'center',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    padding: 15,
  },
  input: {
    marginVertical: 2,
  },
  button: {
    marginVertical: 3,
  },
});
