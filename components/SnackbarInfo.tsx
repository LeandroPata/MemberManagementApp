import React from 'react';
import { StyleSheet } from 'react-native';
import { Portal, Snackbar } from 'react-native-paper';

/* // All the logic to implement the snackbar
const [snackbarVisible, setSnackbarVisible] = useState(false);
const [snackbarText, setSnackbarText] = useState('');

const showSnackbar = (text: string) => {
  setSnackbarText(text);
  setSnackbarVisible(true);
};
const onDismissSnackbar = () => setSnackbarVisible(false);

<SnackbarInfo
  text={snackbarText}
  visible={snackbarVisible}
  onDismiss={onDismissSnackbar}
/> */

type SnackbarInfoProps = {
  text: string;
  visible: boolean;
  onDismiss: () => void;
};

const SnackbarInfo = (props: SnackbarInfoProps) => {
  return (
    <Portal>
      <Snackbar
        visible={props.visible}
        onDismiss={props.onDismiss}
        onIconPress={props.onDismiss}
        duration={5000}
      >
        {props.text}
      </Snackbar>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
});

export default SnackbarInfo;
