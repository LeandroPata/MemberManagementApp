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
import { useTranslation } from 'react-i18next';

export default function Profile() {
  const { profileID } = useLocalSearchParams();

  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t } = useTranslation();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [autoNumber, setAutoNumber] = useState(true);

  const [birthDateModal, setBirthDateModal] = useState(false);
  const [endDateModal, setEndDateModal] = useState(false);
  const [pictureModal, setPictureModal] = useState(false);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);

  const [name, setName] = useState('');
  const [memberNumber, setMemberNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhone] = useState('');
  const [occupation, setOccupation] = useState('');
  const [country, setCountry] = useState('');
  const [address, setAddress] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  let minNumber = 0;
  const reference = storage().ref('profilePicture/' + profileID + '.jpg');

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
      // Screen focused
      //console.log("Hello, I'm focused!");
      getMember(profileID);
      // Screen unfocused
      return () => {
        //console.log('This route is now unfocused.');
        //setProfile(null);
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
        setBirthDateModal(false);
        setEndDateModal(false);
      };
    }, [profileID])
  );

  const getMember = async (id) => {
    setLoading(true);
    try {
      await firestore()
        .collection('members')
        .doc(id)
        .get()
        .then((documentSnapshot) => {
          if (documentSnapshot && documentSnapshot.data()) {
            setProfile(documentSnapshot.data());
            setName(documentSnapshot.data().name);
            setMemberNumber(documentSnapshot.data().memberNumber.toString());
            setEmail(documentSnapshot.data().email);
            setPhone(documentSnapshot.data().phoneNumber);
            setOccupation(documentSnapshot.data().occupation);
            setCountry(documentSnapshot.data().country);
            setAddress(documentSnapshot.data().address);
            setZipCode(documentSnapshot.data().zipCode);
            setBirthDate(new Date(documentSnapshot.data().birthDate.toDate()));
            setEndDate(new Date(documentSnapshot.data().endDate.toDate()));
            setProfilePicture(documentSnapshot.data().profilePicture);
          }
        });
    } catch (e: any) {
      const err = e as FirebaseError;
      console.log('Getting profile failed: ' + err.message);
    }
    setLoading(false);
  };

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
      alert(t('profile.cameraPermission'));
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
      alert(t('profile.numberMandatory'));
      setLoading(false);
      return;
    } else {
      const numberAvailable = await checkNumber();
      if (numberAvailable > 1) {
        alert(t('profile.numberExists'));
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
          occupation: occupation.trim(),
          country: country.trim(),
          address: address.trim(),
          zipCode: zipCode.trim(),
          birthDate: Timestamp.fromDate(birthDate),
          endDate: Timestamp.fromDate(endDate),
          profilePicture: url ? url : profilePicture,
        })
        .then(() => {
          alert(t('profile.updatedMember'));
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
          alert(t('profile.deletedMember'));
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
            {t('profile.gallery')}
          </Button>
          <Button
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonText}
            icon='camera'
            mode='elevated'
            onPress={takePicture}
          >
            {t('profile.camera')}
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
            {t('profile.deleteConfirmation')}
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
              {t('profile.yes')}
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
              {t('profile.no')}
            </Button>
          </View>
        </Modal>
      </Portal>
      <View style={styles.container}>
        {loading || !profile ? (
          <ActivityIndicator size={'large'} style={{ margin: 28 }} />
        ) : (
          <>
            <ScrollView>
              <KeyboardAvoidingView
                style={{ marginHorizontal: 20 }}
                behavior='padding'
              >
                <Pressable
                  disabled={!editing}
                  style={styles.pictureButton}
                  onPress={() => {
                    setPictureModal(true);
                  }}
                >
                  <Avatar.Image
                    size={200}
                    style={{ alignSelf: 'center' }}
                    source={{
                      uri: profilePicture
                        ? profilePicture
                        : process.env.EXPO_PUBLIC_PLACEHOLDER_PICTURE_URL,
                    }}
                  />
                </Pressable>

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
                    <Text
                      style={[
                        styles.title,
                        { fontSize: 15, color: theme.colors.onBackground },
                      ]}
                    >
                      {t('profile.autoNumber')}
                    </Text>
                    <Switch
                      disabled={!editing}
                      value={autoNumber}
                      onValueChange={setAutoNumber}
                    />
                  </View>
                  <TextInput
                    disabled={autoNumber}
                    style={[styles.input, { flex: 3 }]}
                    value={memberNumber}
                    onChangeText={setMemberNumber}
                    autoCapitalize='none'
                    keyboardType='numeric'
                    label={t('profile.memberNumber')}
                  />
                </View>
                <TextInput
                  disabled={!editing}
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize='words'
                  keyboardType='default'
                  label={t('profile.name')}
                />
                <TextInput
                  disabled={!editing}
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize='none'
                  keyboardType='email-address'
                  label={t('profile.email')}
                />
                <TextInput
                  disabled={!editing}
                  style={styles.input}
                  value={phoneNumber}
                  onChangeText={setPhone}
                  autoCapitalize='none'
                  inputMode='tel'
                  keyboardType='phone-pad'
                  label={t('profile.phoneNumber')}
                />
                <TextInput
                  disabled={!editing}
                  style={styles.input}
                  value={occupation}
                  onChangeText={setOccupation}
                  autoCapitalize='sentences'
                  inputMode='text'
                  keyboardType='default'
                  label={t('profile.occupation')}
                />
                <TextInput
                  disabled={!editing}
                  style={styles.input}
                  value={country}
                  onChangeText={setCountry}
                  autoCapitalize='sentences'
                  inputMode='text'
                  keyboardType='default'
                  label={t('profile.country')}
                />
                <TextInput
                  disabled={!editing}
                  style={styles.input}
                  value={address}
                  onChangeText={setAddress}
                  autoCapitalize='sentences'
                  inputMode='text'
                  keyboardType='default'
                  label={t('profile.address')}
                />
                <TextInput
                  disabled={!editing}
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
                  label={t('profile.zipCode')}
                />
                <Button
                  disabled={!editing}
                  style={{ marginVertical: 5 }}
                  labelStyle={styles.dateText}
                  onPress={() => setBirthDateModal(true)}
                >
                  {t('profile.birthDate') +
                    ': ' +
                    birthDate.toLocaleDateString('pt-pt')}
                </Button>
                <DatePicker
                  modal
                  mode='date'
                  locale='pt-pt'
                  open={birthDateModal}
                  date={birthDate}
                  maximumDate={new Date()}
                  minimumDate={new Date('1900-01-01')}
                  theme={theme.dark ? 'dark' : 'light'}
                  onConfirm={(birthDate) => {
                    setBirthDateModal(false);
                    setBirthDate(birthDate);
                  }}
                  onCancel={() => {
                    setBirthDateModal(false);
                  }}
                />
                <Button
                  disabled={!editing}
                  style={{ marginVertical: 5 }}
                  labelStyle={styles.dateText}
                  onPress={() => setEndDateModal(true)}
                >
                  {t('profile.endDate') +
                    ': ' +
                    endDate.toLocaleDateString('pt-pt')}
                </Button>
                <DatePicker
                  modal
                  mode='date'
                  locale='pt-pt'
                  open={endDateModal}
                  date={endDate}
                  minimumDate={new Date()}
                  theme={theme.dark ? 'dark' : 'light'}
                  onConfirm={(endDate) => {
                    setEndDateModal(false);
                    setEndDate(endDate);
                  }}
                  onCancel={() => {
                    setEndDateModal(false);
                  }}
                />
              </KeyboardAvoidingView>
            </ScrollView>
            <View style={styles.buttonContainer}>
              {editing ? (
                <Button
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonText}
                  icon='content-save'
                  mode='elevated'
                  loading={loadingSave}
                  onPress={saveMember}
                >
                  {t('profile.saveMember')}
                </Button>
              ) : (
                <>
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
                    {t('profile.editMember')}
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
                    {t('profile.deleteMember')}
                  </Button>
                </>
              )}
            </View>
          </>
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
    marginVertical: 5,
    justifyContent: 'center',
  },
  buttonContent: {
    minWidth: 280,
    minHeight: 80,
  },
  buttonText: {
    fontSize: 25,
    fontWeight: 'bold',
    overflow: 'visible',
    paddingTop: 10,
  },
  input: {
    marginVertical: 2,
  },
  pictureButton: {
    padding: 15,
    alignSelf: 'center',
  },
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
  dateText: {
    fontWeight: 'bold',
    textAlignVertical: 'center',
    fontSize: 20,
  },
});
