import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
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
import DatePicker from 'react-native-date-picker';
import * as ImagePicker from 'expo-image-picker';
import { FirebaseError } from 'firebase/app';
import firestore, { Timestamp } from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { useTranslation } from 'react-i18next';

export default function AddMember() {
  const theme = useTheme();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [autoNumber, setAutoNumber] = useState(true);

  const [birthDateModal, setBirthDateModal] = useState(false);
  const [endDateModal, setEndDateModal] = useState(false);
  const [pictureModal, setPictureModal] = useState(false);

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
  const [profilePicture, setProfilePicture] = useState(
    process.env.EXPO_PUBLIC_PLACEHOLDER_PICTURE_URL
  );

  let minNumber = 0;

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
    await firestore()
      .collection('members')
      .orderBy('memberNumber', 'asc')
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((documentSnapshot) => {
          if (memberNumber == documentSnapshot.data().memberNumber) {
            numberAvailable++;
            console.log(t('addMember.numberUnavailable'));
          }
        });
      });
    //console.log('Result: ' + numberAvailable);
    return numberAvailable;
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
      alert(t('addMember.cameraPermission'));
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

  const uploadPicture = async (docID) => {
    if (
      profilePicture &&
      profilePicture != process.env.EXPO_PUBLIC_PLACEHOLDER_PICTURE_URL
    ) {
      // Upload picture to Firebase if it is different from the placeholder

      const reference = storage().ref('profilePicture/' + docID + '.jpg');

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
      alert(t('addMember.nameMandatory'));
      setLoading(false);
      return;
    }

    if (
      email &&
      email.trim() &&
      (!email.includes('@') || !email.includes('.'))
    ) {
      alert(t('addMember.emailFormat'));
      setLoading(false);
      return;
    }

    if (autoNumber) {
      await assignMemberNumber();
    } else if (!memberNumber.trim()) {
      alert(t('addMember.numberMandatory'));
      setLoading(false);
      return;
    } else {
      const numberAvailable = await checkNumber();
      if (numberAvailable > 1) {
        alert(t('addMember.numberExists'));
        setLoading(false);
        return;
      }
      minNumber = parseInt(memberNumber);
      setMemberNumber(minNumber.toString());
    }

    const docRef = firestore().collection('members').doc();

    const url = await uploadPicture(docRef.id);

    try {
      docRef
        .set({
          name: name.trim(),
          memberNumber: minNumber,
          email: email.trim(),
          phoneNumber: phoneNumber,
          occupation: occupation.trim(),
          country: country.trim(),
          address: address.trim(),
          zipCode: zipCode.trim(),
          birthDate: Timestamp.fromDate(birthDate),
          addedDate: Timestamp.fromDate(new Date()),
          endDate: Timestamp.fromDate(endDate),
          profilePicture: url ? url : profilePicture,
        })
        .then(() => {
          console.log('Added');
          setName('');
          setMemberNumber('');
          setEmail('');
          setPhone('');
          setOccupation('');
          setCountry('');
          setAddress('');
          setZipCode('');
          setBirthDate(new Date());
          setEndDate(new Date());
          setProfilePicture(process.env.EXPO_PUBLIC_PLACEHOLDER_PICTURE_URL);
        });
    } catch (e: any) {
      const err = e as FirebaseError;
      console.log('Adding member failed: ' + err.message);
      //alert('Adding member failed: ' + err.message);
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
            {t('addMember.gallery')}
          </Button>
          <Button
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonText}
            icon='camera'
            mode='elevated'
            onPress={takePicture}
          >
            {t('addMember.camera')}
          </Button>
        </Modal>
      </Portal>

      <View style={styles.container}>
        <ScrollView>
          <KeyboardAvoidingView
            style={{ paddingHorizontal: 10 }}
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
                  {t('addMember.autoNumber')}
                </Text>
                <Switch value={autoNumber} onValueChange={setAutoNumber} />
              </View>
              <TextInput
                disabled={autoNumber}
                style={[styles.input, { flex: 3 }]}
                value={memberNumber}
                onChangeText={setMemberNumber}
                autoCapitalize='none'
                keyboardType='numeric'
                label={t('addMember.memberNumber')}
              />
            </View>

            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              autoCapitalize='words'
              keyboardType='default'
              label={t('addMember.name')}
            />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize='none'
              keyboardType='email-address'
              label={t('addMember.email')}
            />
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhone}
              autoCapitalize='none'
              inputMode='tel'
              keyboardType='phone-pad'
              label={t('addMember.phoneNumber')}
            />
            <TextInput
              style={styles.input}
              value={occupation}
              onChangeText={setOccupation}
              autoCapitalize='sentences'
              inputMode='text'
              keyboardType='default'
              label={t('addMember.occupation')}
            />
            <TextInput
              style={styles.input}
              value={country}
              onChangeText={setCountry}
              autoCapitalize='sentences'
              inputMode='text'
              keyboardType='default'
              label={t('addMember.country')}
            />
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              autoCapitalize='sentences'
              inputMode='text'
              keyboardType='default'
              label={t('addMember.address')}
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
              label={t('addMember.zipCode')}
            />

            <>
              <Button
                style={{ marginVertical: 5 }}
                labelStyle={styles.dateText}
                onPress={() => setBirthDateModal(true)}
              >
                {t('addMember.birthDate') +
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
            </>

            <>
              <Button
                style={{ marginVertical: 5 }}
                labelStyle={styles.dateText}
                onPress={() => setEndDateModal(true)}
              >
                {t('addMember.endDate') +
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
            </>
          </KeyboardAvoidingView>
        </ScrollView>

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
            {t('addMember.addMember')}
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
