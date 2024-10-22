import React, { useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    TextInput,
    Button,
    ActivityIndicator
} from 'react-native'

export default function AddUser() {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    //const [addedDate, setAddedDate] = useState('');

    const addMember = async () => {
        setLoading(true);
        try {
            console.log('Added');
        } catch {
            console.log('Error')
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView behavior='padding'>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize='words'
                    keyboardType='default'
                    placeholder="Name"
                />
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize='none'
                    keyboardType='email-address'
                    placeholder="Email"
                />
                <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    autoCapitalize='none'
                    inputMode='tel'
                    keyboardType='phone-pad'
                    placeholder="Phone Number"
                />
                {loading ? (
                < ActivityIndicator size={'small'} style = {{ margin: 28 }}/>
                ) : (
                <>
                <Button onPress={addMember} title="Add Member" />
                </>
                )}
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    flex: 1,
    justifyContent: 'center'
  },
  input: {
    marginVertical: 4,
    height: 50,
    borderWidth: 1,
    borderRadius: 1,
    padding: 10,
    backgroundColor: '#ffffff'
  }
})