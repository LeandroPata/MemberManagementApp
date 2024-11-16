import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Pressable,
} from 'react-native';
import {
  Button,
  TextInput,
  Switch,
  Avatar,
  Text,
  Portal,
  Modal,
  useTheme,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DatePicker from 'react-native-date-picker';
import * as ImagePicker from 'expo-image-picker';
import { FirebaseError } from 'firebase/app';
import firestore, { Timestamp } from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

export default function AddMember() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const [loading, setLoading] = useState(false);
  const [autoNumber, setAutoNumber] = useState(true);

  const [dateModal, setDateModal] = useState(false);
  const [pictureModal, setPictureModal] = useState(false);

  const [name, setName] = useState('');
  const [memberNumber, setMemberNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [zipCode, setZipCode] = useState('');
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
          address: address.trim(),
          zipCode: zipCode.trim(),
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
          setAddress('');
          setZipCode('');
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
    <>
      <Portal>
        <Modal
          visible={pictureModal}
          onDismiss={() => {
            setPictureModal(false);
          }}
          style={styles.modalContainer}
          contentContainerStyle={[
            styles.modalContentContainer,
            { backgroundColor: theme.colors.primaryContainer },
          ]}
        >
          <Button
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonText}
            icon='file-image'
            mode='elevated'
            onPress={pickImage}
          >
            From gallery
          </Button>
          <Button
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonText}
            icon='camera'
            mode='elevated'
            onPress={takePicture}
          >
            Take Picture
          </Button>
        </Modal>
      </Portal>
      <View style={styles.container}>
        <KeyboardAvoidingView
          style={{ marginHorizontal: 20 }}
          behavior='padding'
        >
          <Pressable
            style={{ marginBottom: 15 }}
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
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            autoCapitalize='sentences'
            inputMode='text'
            keyboardType='default'
            label='Address'
          />
          <TextInput
            style={styles.input}
            value={zipCode}
            onChangeText={(text) => {
              setZipCode(text);
              if (text.length >= 4 && !text.includes('-')) {
                let a = text.substring(0, 4);
                let b = text.substring(4);
                a = a.concat('-');
                text = a.concat(b);
                setZipCode(text);
              }
            }}
            maxLength={8}
            autoCapitalize='none'
            inputMode='numeric'
            keyboardType='number-pad'
            label='Zip Code'
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
        </KeyboardAvoidingView>
        <View style={styles.buttonContainer}>
          <Button
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonText}
            icon='account-plus'
            mode='elevated'
            loading={loading}
            onPress={addMember}
          >
            Add Member
          </Button>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  modalContainer: {
    marginHorizontal: 30,
    alignItems: 'center',
  },
  modalContentContainer: {
    padding: 15,
    borderRadius: 20,
  },
  buttonContainer: {
    marginHorizontal: 20,
    alignItems: 'center',
  },
  button: {
    marginVertical: 8,
    justifyContent: 'center',
  },
  buttonContent: { minWidth: 280, minHeight: 80 },
  buttonText: {
    fontSize: 25,
    fontWeight: 'bold',
    overflow: 'visible',
    paddingTop: 10,
  },
  input: {
    marginVertical: 2,
  },
});
