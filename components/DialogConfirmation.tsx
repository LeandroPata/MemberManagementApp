import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dialog, Portal, Text } from 'react-native-paper';
import { globalStyles } from '@/styles/global';

/* // All the logic to implement DialogConfirmation
  const [dialogConfirmationVisible, setDialogConfirmationVisible] =
    useState(false);
  const onDismissDialogConfirmation = () => setDialogConfirmationVisible(false); */

type DialogConfirmationProps = {
	text: string;
	visible: boolean;
	onDismiss: () => void;
	onConfirmation: () => void;
	onDismissText?: string;
	onConfirmationText?: string;
	testID?: string;
};

const DialogConfirmation = (props: DialogConfirmationProps) => {
	const { t } = useTranslation();
	return (
		<Portal>
			<Dialog
				visible={props.visible}
				onDismiss={props.onDismiss}
				testID={props.testID || 'DialogConfirmation'}
			>
				<Dialog.Content>
					<Text style={globalStyles.text.dialog}>{props.text}</Text>
				</Dialog.Content>
				<Dialog.Actions>
					<Button
						onPress={props.onConfirmation}
						testID='DialogConfirmationYes'
					>
						{props.onConfirmationText || t('profile.yes')}
					</Button>
					<Button
						onPress={props.onDismiss}
						testID='DialogConfirmationNo'
					>
						{props.onDismissText || t('profile.no')}
					</Button>
				</Dialog.Actions>
			</Dialog>
		</Portal>
	);
};

export default DialogConfirmation;
