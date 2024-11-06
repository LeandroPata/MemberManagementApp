import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
} from 'react-native';
import {
  Button,
  Modal,
  Portal,
  TextInput,
  Switch,
  Avatar,
  Text,
  useTheme,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DatePicker from 'react-native-date-picker';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { FirebaseError } from 'firebase/app';
import firestore, { Timestamp } from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

export default function Profile() {
  const { profileID } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [autoNumber, setAutoNumber] = useState(true);

  const [pictureModal, setPictureModal] = useState(false);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
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
          //setLoadingEdit(false);
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
          //setLoadingEdit(false);
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

  const deletePicture = async () => {
    if (
      profilePicture &&
      profilePicture != process.env.EXPO_PUBLIC_PLACEHOLDER_PICTURE_URL
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
          //setLoadingDelete(false);
        });
    }
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
    setLoadingEdit(true);

    const url = await uploadPicture();

    const numberAvailable = await checkNumber();
    if (numberAvailable > 1) {
      alert('This member number is already attributed to another member!');
      setLoadingEdit(false);
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
      setLoadingEdit(false);
    } finally {
      setLoadingEdit(false);
    }
  };

  const deleteMember = async () => {
    setLoadingDelete(true);

    await deletePicture();

    try {
      firestore()
        .collection('users')
        .doc(profileID)
        .delete()
        .then(() => {
          alert('Member Deleted!');
        });
    } catch (e: any) {
      const err = e as FirebaseError;
      alert('Deleting member failed: ' + err.message);
      console.log('Deleting member failed: ' + err.message);
      setLoadingDelete(false);
    } finally {
      setLoadingDelete(false);
    }

    setLoadingDelete(false);
    setConfirmDeleteModal(false);
    router.back();
  };

  return (
    <>
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
      <Portal>
        <Modal
          visible={confirmDeleteModal}
          onDismiss={() => {
            setConfirmDeleteModal(false);
          }}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={{ alignSelf: 'center', marginBottom: 10 }}>
            Are you sure you want to delete this member?
          </Text>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <Button
              style={[styles.button, { width: '45%' }]}
              mode='elevated'
              onPress={() => {
                deleteMember();
              }}
            >
              Yes
            </Button>
            <Button
              style={[styles.button, { width: '45%' }]}
              mode='elevated'
              onPress={() => {
                setConfirmDeleteModal(false);
              }}
            >
              No
            </Button>
          </View>
        </Modal>
      </Portal>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {loading || !profile ? (
          <ActivityIndicator size={'large'} style={{ margin: 28 }} />
        ) : editing ? (
          <KeyboardAvoidingView
            style={{ marginHorizontal: 20 }}
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
            <Button style={styles.button} mode='elevated' onPress={saveMember}>
              Save
            </Button>
          </KeyboardAvoidingView>
        ) : (
          <View style={{ marginHorizontal: 20 }}>
            {profilePicture ? (
              <>
                <Avatar.Image
                  size={250}
                  style={{ alignSelf: 'center' }}
                  source={{ uri: profilePicture }}
                />
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
              style={styles.button}
              mode='elevated'
              loading={loadingEdit}
              onPress={() => {
                setEditing(true);
              }}
            >
              Edit Member
            </Button>
            <Button
              style={styles.button}
              mode='elevated'
              loading={loadingDelete}
              onPress={() => {
                setConfirmDeleteModal(true);
              }}
            >
              Delete Member
            </Button>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    //alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 10,
  },
  input: {
    marginVertical: 2,
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
  button: {
    marginVertical: 3,
  },
});
