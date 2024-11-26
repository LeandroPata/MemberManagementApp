import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
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
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useBackHandler } from '@react-native-community/hooks';
import { FirebaseError } from 'firebase/app';
import firestore, { Timestamp } from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

export default function Profile() {
  const { profileID } = useLocalSearchParams();
  //console.log(profileID);
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
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
  const [address, setAddress] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [endDate, setEndDate] = useState(new Date());
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  let minNumber = 0;
  const reference = storage().ref('profilePicture/' + profileID + '.jpg');

  useEffect(() => {
    setLoading(true);

    const subscriber = firestore()
      .collection('members')
      .doc(profileID)
      .onSnapshot((documentSnapshot) => {
        if (documentSnapshot && documentSnapshot.data()) {
          setProfile(documentSnapshot.data());
          setName(documentSnapshot.data().name);
          setMemberNumber(documentSnapshot.data().memberNumber);
          setEmail(documentSnapshot.data().email);
          setPhone(documentSnapshot.data().phoneNumber);
          setAddress(documentSnapshot.data().address);
          setZipCode(documentSnapshot.data().zipCode);
          setEndDate(new Date(documentSnapshot.data().endDate.toDate()));
          setProfilePicture(documentSnapshot.data().profilePicture);
        }
      });
    setLoading(false);
    return () => subscriber();
  }, [profileID]);

  useBackHandler(() => {
    if (editing) {
      setEditing(false);
    } else {
      router.replace('/(home)/searchMember');
    }
    return true;
  });

  useFocusEffect(
    useCallback(() => {
      // Check if current screen is unfocused
      return () => {
        //console.log('This route is now unfocused.');
        setProfile(null);
        setName('');
        setMemberNumber('');
        setEmail('');
        setPhone('');
        setAddress('');
        setZipCode('');
        setEndDate(new Date());
        setProfilePicture('');
        setEditing(false);
        setPictureModal(false);
        setConfirmDeleteModal(false);
        setDateModal(false);
      };
    }, [])
  );

  const pickImage = async () => {
    setPictureModal(false);
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
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
      mediaTypes: 'images',
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
          //alert('File deletion failed: ' + err.message);
          console.log('File deletion failed: ' + err.message);
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
          //alert('Image uploaded to the bucket!');
        })
        .catch((e: any) => {
          const err = e as FirebaseError;
          //alert('File upload failed: ' + err.message);
          console.log('File upload failed: ' + err.message);
          //setLoadingSave(false);
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
          //alert('File deletion failed: ' + err.message);
          console.log('File deletion failed: ' + err.message);
          //setLoadingDelete(false);
        });
    }
  };

  const assignMemberNumber = async () => {
    await firestore()
      .collection('members')
      .orderBy('memberNumber', 'asc')
      .get()
      .then((querySnapshot) => {
        let i = 1;
        querySnapshot.forEach((documentSnapshot) => {
          if (i == parseInt(memberNumber)) {
            minNumber = i;
          } else if (i == documentSnapshot.data().memberNumber) {
            i = documentSnapshot.data().memberNumber + 1;
            //console.log(i);
          }
        });
        if (!minNumber) {
          minNumber = i;
        }
        setMemberNumber(minNumber.toString());
      });
  };

  const checkNumber = async () => {
    let numberAvailable = 1;
    if (memberNumber != profile.memberNumber) {
      const snapshot = await firestore()
        .collection('members')
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
    setLoadingSave(true);

    if (autoNumber) {
      await assignMemberNumber();
    } else if (!memberNumber.trim()) {
      alert('Member number is mandatory!');
      setLoading(false);
      return;
    } else {
      const numberAvailable = await checkNumber();
      if (numberAvailable > 1) {
        alert('This member number is already attributed to another member!');
        setLoading(false);
        return;
      }
      minNumber = parseInt(memberNumber);
    }

    const url = await uploadPicture();

    try {
      firestore()
        .collection('members')
        .doc(profileID)
        .update({
          name: name.trim(),
          memberNumber: minNumber,
          email: email.trim(),
          phoneNumber: phoneNumber,
          address: address.trim(),
          zipCode: zipCode.trim(),
          endDate: Timestamp.fromDate(endDate),
          profilePicture: url ? url : profilePicture,
        })
        .then(() => {
          alert('Member Updated!');
          setEditing(false);
        });
    } catch (e: any) {
      const err = e as FirebaseError;
      //alert('Updating member failed: ' + err.message);
      console.log('Updating member failed: ' + err.message);
      setLoadingSave(false);
    } finally {
      setLoadingSave(false);
    }
  };

  const deleteMember = async () => {
    setLoadingDelete(true);

    await deletePicture();

    try {
      firestore()
        .collection('members')
        .doc(profileID)
        .delete()
        .then(() => {
          alert('Member Deleted!');
        });
    } catch (e: any) {
      const err = e as FirebaseError;
      //alert('Deleting member failed: ' + err.message);
      console.log('Deleting member failed: ' + err.message);
      setLoadingDelete(false);
    } finally {
      setLoadingDelete(false);
    }

    setLoadingDelete(false);
    setConfirmDeleteModal(false);
    router.replace('/(home)/searchMember');
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
      <Portal>
        <Modal
          visible={confirmDeleteModal}
          onDismiss={() => {
            setConfirmDeleteModal(false);
          }}
          style={styles.modalContainer}
          contentContainerStyle={[
            styles.modalContentContainer,
            { backgroundColor: theme.colors.primaryContainer },
          ]}
        >
          <Text
            style={[
              styles.buttonText,
              {
                paddingTop: 0,
                textAlign: 'center',
                color: theme.colors.onPrimaryContainer,
              },
            ]}
          >
            Are you sure you want to delete this member?
          </Text>
          <View
            style={[
              styles.buttonContainer,
              { flexDirection: 'row', justifyContent: 'space-between' },
            ]}
          >
            <Button
              style={[styles.button, { width: '45%', marginHorizontal: 8 }]}
              contentStyle={{ minHeight: 50 }}
              labelStyle={styles.buttonText}
              mode='elevated'
              onPress={() => {
                deleteMember();
              }}
            >
              Yes
            </Button>
            <Button
              style={[styles.button, { width: '45%', marginHorizontal: 8 }]}
              contentStyle={{ minHeight: 50 }}
              labelStyle={styles.buttonText}
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
      <View style={styles.container}>
        {loading || !profile ? (
          <ActivityIndicator size={'large'} style={{ margin: 28 }} />
        ) : editing ? (
          <KeyboardAvoidingView
            style={{ marginHorizontal: 20 }}
            behavior='padding'
          >
            <Pressable
              style={styles.pictureButton}
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
                if (text.length > 4 && !text.includes('-')) {
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
            <View style={styles.buttonContainer}>
              <Button
                style={styles.button}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonText}
                icon='content-save'
                mode='elevated'
                loading={loadingSave}
                onPress={saveMember}
              >
                Save
              </Button>
            </View>
          </KeyboardAvoidingView>
        ) : (
          <ScrollView style={{ paddingHorizontal: 10 }}>
            {profilePicture ? (
              <>
                <Avatar.Image
                  size={250}
                  style={{ alignSelf: 'center', marginBottom: 15 }}
                  source={{ uri: profilePicture }}
                />
              </>
            ) : null}
            <Text style={styles.title}>
              Name:{' '}
              <Text style={[styles.title, { fontWeight: 'normal' }]}>
                {profile.name}
              </Text>
            </Text>
            <Text style={styles.title}>
              Member Number:{' '}
              <Text style={[styles.title, { fontWeight: 'normal' }]}>
                {profile.memberNumber}
              </Text>
            </Text>
            <Text style={styles.title}>
              Email:{' '}
              <Text style={[styles.title, { fontWeight: 'normal' }]}>
                {profile.email}
              </Text>
            </Text>
            <Text style={styles.title}>
              Phone Number:{' '}
              <Text style={[styles.title, { fontWeight: 'normal' }]}>
                {profile.phoneNumber}
              </Text>
            </Text>
            <Text style={styles.title}>
              Address:{' '}
              <Text style={[styles.title, { fontWeight: 'normal' }]}>
                {profile.address}
              </Text>
            </Text>
            <Text style={styles.title}>
              Zip Code:{' '}
              <Text style={[styles.title, { fontWeight: 'normal' }]}>
                {profile.zipCode}
              </Text>
            </Text>
            <Text style={styles.title}>
              Added Date:{' '}
              <Text style={[styles.title, { fontWeight: 'normal' }]}>
                {new Date(profile.addedDate.toDate()).toLocaleDateString(
                  'pt-pt'
                )}
              </Text>
            </Text>
            <Text style={styles.title}>
              End Date:{' '}
              <Text style={[styles.title, { fontWeight: 'normal' }]}>
                {new Date(profile.endDate.toDate()).toLocaleDateString('pt-pt')}
              </Text>
            </Text>
            <View style={styles.buttonContainer}>
              <Button
                style={styles.button}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonText}
                icon='account-edit'
                mode='elevated'
                loading={loadingSave}
                onPress={() => {
                  setEditing(true);
                }}
              >
                Edit Member
              </Button>
              <Button
                style={styles.button}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonText}
                icon='account-remove'
                mode='elevated'
                loading={loadingDelete}
                onPress={() => {
                  setConfirmDeleteModal(true);
                }}
              >
                Delete Member
              </Button>
            </View>
          </ScrollView>
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
    marginHorizontal: 30,
    alignItems: 'center',
  },
  modalContentContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
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
  pictureButton: { padding: 15, alignSelf: 'center' },
  picture: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 3,
  },
});
