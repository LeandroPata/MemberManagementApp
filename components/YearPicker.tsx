import { useState } from 'react';
import { Button, Modal, Portal, useTheme } from 'react-native-paper';
import WheelPicker from 'react-native-wheely';
import { globalStyles } from '@/styles/global';

type YearPickerProps = {
	visible: boolean;
	onDismiss: () => void;
	onConfirm: (year: number) => void;
	testID?: string;
};

// Custom Component to have a pick a single year with a regular wheel picker,
// as all date pickers include day and month as well

const YearPicker = (props: YearPickerProps) => {
	const theme = useTheme();

	const [selectedIndex, setSelectedIndex] = useState(0);
	const minimumYear = new Date().getFullYear();
	const maximumYear = new Date().getFullYear() + 50;
	const [yearOptions, setYearOptions] = useState([]);

	if (!yearOptions[0]) {
		const years = [];
		for (let i = minimumYear; i <= maximumYear; i++) {
			years.push(i.toString());
		}
		setYearOptions(years);
	}

	const onConfirm = () => {
		props.onConfirm(Number(yearOptions[selectedIndex]));
		props.onDismiss();
	};

	return (
		<Portal>
			<Modal
				visible={props.visible}
				onDismiss={props.onDismiss}
				style={globalStyles.modalContainer.global}
				contentContainerStyle={[
					globalStyles.modalContentContainer.yearPicker,
					{ backgroundColor: theme.colors.elevation.level4 },
				]}
				testID={props.testID || 'YearPicker'}
			>
				<WheelPicker
					containerStyle={globalStyles.wheelPickerContainer}
					itemTextStyle={[
						globalStyles.wheelPickerText,
						{ color: theme.colors.onSurface },
					]}
					selectedIndicatorStyle={{
						backgroundColor: theme.colors.elevation.level1,
					}}
					selectedIndex={selectedIndex}
					options={yearOptions}
					onChange={(index) => setSelectedIndex(index)}
				/>
				<Button onPress={() => onConfirm()}>OK</Button>
			</Modal>
		</Portal>
	);
};

export default YearPicker;
