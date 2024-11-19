import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { router } from 'expo-router';
import { File, Paths } from 'expo-file-system/next';
import * as Sharing from 'expo-sharing';
import { FirebaseError } from 'firebase/app';
import firestore from '@react-native-firebase/firestore';
import * as XLSX from 'xlsx';

export default function importExport() {
  const [importLoading, setImportLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const importMembers = () => {};

  const exportMembers = async () => {
    setExportLoading(true);

    try {
      /* const snapshot = await firestore()
        .collection('users')
        .orderBy('name', 'asc')
        .get();

      const membersData = snapshot.docs.map((doc) => doc.data());
      console.log(membersData);

      const worksheet = XLSX.utils.json_to_sheet(membersData);
      console.log(worksheet);
      const workbook = XLSX.utils.book_new();
      console.log(workbook);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Members');

      const xlsxFile = XLSX.write(workbook, {
        type: 'base64',
        bookType: 'xlsx',
      });

      const filePath = FileSystem.documentDirectory + 'membersData.xlsx';
      console.log(filePath);

      await FileSystem.writeAsStringAsync(filePath, xlsxFile, {
        encoding: FileSystem.EncodingType.Base64,
      });

      alert('Exporting successfull!');
      console.log('Exporting successfull!'); */

      const file = new File(Paths.document, 'test.txt');
      if (file.exists) {
        file.delete();
      }
      file.create();
      file.write('Testing');
      console.log(file.exists + ' : ' + file.text());
      console.log(file.uri);

      console.log(await Sharing.isAvailableAsync());
      if (await Sharing.isAvailableAsync()) {
        Sharing.shareAsync(file.uri);
      }
      console.log('Test successfull!');
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
          onPress={() => {}}
        >
          Import Members
        </Button>
        <Button
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonText}
          icon='database-export'
          mode='elevated'
          onPress={() => exportMembers()}
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
