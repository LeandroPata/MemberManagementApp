import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { router } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import { FirebaseError } from 'firebase/app';
import { utils } from '@react-native-firebase/app';
import firestore, { Timestamp } from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';

export default function importExport() {
  const [importLoading, setImportLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const reference = storage().ref('membersData.csv');

  const formatDataOrder = (data, readableDate: boolean) => {
    const orderedKeys = [
      'name',
      'memberNumber',
      'email',
      'phoneNumber',
      'address',
      'zipCode',
      'addedDate',
      'endDate',
    ];

    return data.map((doc) => {
      const orderedDoc = {};
      orderedKeys.forEach((key) => {
        if (key == 'addedDate' || key == 'endDate') {
          if (readableDate) {
            const timestamp = new Date(doc[key].toDate()).toLocaleDateString(
              'pt-pt'
            );
            orderedDoc[key] = timestamp || '';
          } else {
            const timestamp = convertDate(doc[key]);
            orderedDoc[key] = timestamp || '';
          }
        } else if (key == 'memberNumber' && !readableDate) {
          orderedDoc[key] = Number(doc[key]) || '';
        } else {
          orderedDoc[key] = doc[key] || '';
        }
      });
      Object.keys(doc).forEach((key) => {
        if (!orderedKeys.includes(key) && key != 'profilePicture') {
          orderedDoc[key] = doc[key];
        }
      });
      //console.log(orderedDoc);
      return orderedDoc;
    });
  };

  // converts date format from pt-PT locale (23/01/2024) to ISO date format (2024-01-23T00:00:00.000Z)
  // and then converts to Firestore Timestamp format
  const convertDate = (date) => {
    const [day, month, year] = date.split('/').map(Number);
    const convertedDate = new Date(year, month - 1, day);
    /* console.log(
      date + ' : ' + Timestamp.fromDate(new Date(convertedDate.toISOString()))
    ); */
    return Timestamp.fromDate(new Date(convertedDate.toISOString()));
  };

  const convertCSVtoJSON = (fileContent) => {
    const rows = fileContent.split('\n').filter((row) => row.trim() !== '');
    //console.log(rows);
    const headers = rows[0].split(',').map((header) => header.trim());
    //console.log(headers);

    const data = rows.slice(1).map((row) => {
      const values = row.split(',').map((value) => value.trim());
      const doc = {};
      headers.forEach((header, index) => {
        doc[header] = values[index];
      });
      //console.log(doc);
      return doc;
    });
    return data;
  };

  const convertJSONToCSV = (data) => {
    const headers = Object.keys(data[0]).join(',');
    const rows = data
      .map((row) =>
        Object.values(row)
          .map((value) => `${value}`)
          .join(',')
      )
      .join('\n');
    return `${headers}\n${rows}`;
  };

  const uploadFile = async (filePath) => {
    const task = reference.putFile(filePath);

    task.on('state_changed', (taskSnapshot) => {
      console.log(
        `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`
      );
    });

    await task
      .then(() => {
        console.log('Data uploaded to the bucket!');
        alert('Data uploaded to the bucket!');
      })
      .catch((e: any) => {
        const err = e as FirebaseError;
        alert('File upload failed: ' + err.message);
        console.log('File upload failed: ' + err.message);
        setExportLoading(false);
      });
  };

  const pickFile = async () => {
    let doc = null;
    try {
      doc = await DocumentPicker.pickSingle({
        type: DocumentPicker.types.csv,
      });
    } catch (e: any) {
      const err = e as FirebaseError;
      alert('File not chosen: ' + err.message);
      console.log('File not chosen: ' + err.message);
    } finally {
      return doc;
    }
  };

  const readFile = async (fileUri) => {
    try {
      const fileContent = await RNFS.readFile(fileUri, 'utf8');
      return fileContent;
    } catch (e: any) {
      const err = e as FirebaseError;
      alert("Couldn't read file: " + err.message);
      console.log("Couldn't read file: " + err.message);
      return null;
    }
  };

  const checkMember = async (memberData) => {
    let check = 0;
    await firestore()
      .collection('members')
      .where('memberNumber', '==', memberData.memberNumber)
      .get()
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          check = 1;
        }
      });
    return check;
  };

  const importMembers = async () => {
    const file = await pickFile();
    if (!file) {
      return;
    }
    //console.log(file);

    const fileContent = await readFile(file.uri);
    //console.log(fileContent);

    const data = await convertCSVtoJSON(fileContent);
    //console.log(data);

    //false so that the dates are exported in the Firestore Timestamp format
    const membersData = await formatDataOrder(data, false);
    //console.log(membersData);

    const batch = firestore().batch();

    try {
      for (let member of membersData) {
        const check = await checkMember(member);
        if (!check) {
          console.log('check');
          const memberRef = firestore().collection('members').doc();

          //set profilePicture to field to an existing picture if it exists
          //or the default one if it doesn't
          //which I now realize it will never happen,
          //because the document ID is completely new, oh well
          /* const url = await storage()
            .ref('profilePicture/' + memberRef + '.jpg')
            .getDownloadURL();
          console.log(url); */

          member['profilePicture'] =
            process.env.EXPO_PUBLIC_PLACEHOLDER_PICTURE_URL;

          batch.set(memberRef, member);
        }
      }
    } catch (e: any) {
      const err = e as FirebaseError;
      alert('Error importing: ' + err.message);
      console.log('Error importing: ' + err.message);
    } finally {
      await batch.commit();
      console.log('Importing Successfull');
    }
  };

  const exportMembers = async () => {
    setExportLoading(true);

    try {
      const snapshot = await firestore()
        .collection('members')
        .orderBy('name', 'asc')
        .get();

      const rawData = snapshot.docs.map((doc) => doc.data());
      //console.log(rawData);

      //true so that the dates are exported in a readable state
      const membersData = formatDataOrder(rawData, true);

      const file = convertJSONToCSV(membersData);
      console.log(file);

      const filePath = FileSystem.cacheDirectory + 'membersData.csv';
      //console.log(filePath);

      await FileSystem.writeAsStringAsync(filePath, file);

      alert('Exporting successfull!');
      console.log('Exporting successfull!');

      await uploadFile(filePath);

      const task = reference.writeToFile(
        utils.FilePath.EXTERNAL_STORAGE_DIRECTORY + '/Documents/membersData.csv'
      );

      task.on('state_changed', (taskSnapshot) => {
        console.log(
          `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`
        );
      });

      await task
        .then(() => {
          console.log('Data downloaded!');
          alert('Data downloaded!');
        })
        .catch((e: any) => {
          const err = e as FirebaseError;
          alert('Data download failed: ' + err.message);
          console.log('Data download failed: ' + err.message);
          setExportLoading(false);
        });
    } catch (e: any) {
      const err = e as FirebaseError;
      console.log('Exporting members failed: ' + err.message);
      alert('Exporting members failed: ' + err.message);
      setExportLoading(false);
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonText}
          icon='database-import'
          mode='elevated'
          loading={importLoading}
          onPress={importMembers}
        >
          Import Members
        </Button>
        <Button
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonText}
          icon='database-export'
          mode='elevated'
          loading={exportLoading}
          onPress={exportMembers}
        >
          Export Members
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  buttonContainer: {
    marginHorizontal: 20,
    alignItems: 'center',
  },
  input: {
    marginVertical: 4,
    height: 50,
    borderWidth: 1,
    borderRadius: 1,
    padding: 5,
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
});
