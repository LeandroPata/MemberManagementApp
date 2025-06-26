import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Button, Provider as PaperProvider } from 'react-native-paper';
import { DialogProvider, useDialog } from '@/context/DialogContext';

describe('Dialog', () => {
	const mockOnDismiss = jest.fn();
	const mockOnConfirmation = jest.fn();

	const defaultProps = {
		text: 'Are you sure?',
		onDismiss: mockOnDismiss,
		onConfirmation: mockOnConfirmation,
		onDismissText: 'No',
		onConfirmationText: 'Yes',
		testID: 'Dialog',
	};

	const DialogTrigger: React.FC = () => {
		const { showDialog, hideDialog } = useDialog();

		React.useEffect(() => {
			showDialog(defaultProps);
		}, []);

		return (
			<Button
				onPress={hideDialog}
				testID='HideDialogButton'
			>
				Hide Dialog
			</Button>
		);
	};

	const renderWithProviders = () =>
		render(
			<PaperProvider>
				<DialogProvider>
					<DialogTrigger />
				</DialogProvider>
			</PaperProvider>
		);

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('renders the dialog with text and buttons', async () => {
		const { findByText } = renderWithProviders();

		expect(await findByText(defaultProps.text)).toBeTruthy();
		expect(await findByText(defaultProps.onConfirmationText)).toBeTruthy();
		expect(await findByText(defaultProps.onDismissText)).toBeTruthy();
	});

	it('calls onConfirmation when "Yes" button is pressed', async () => {
		const { findByText } = renderWithProviders();
		const yesButton = await findByText(defaultProps.onConfirmationText);
		fireEvent.press(yesButton);

		await waitFor(() => {
			expect(mockOnConfirmation).toHaveBeenCalledTimes(1);
		});
	});

	it('calls onDismiss when "No" button is pressed', async () => {
		const { findByText } = renderWithProviders();
		const noButton = await findByText(defaultProps.onDismissText);
		fireEvent.press(noButton);

		await waitFor(() => {
			expect(mockOnDismiss).toHaveBeenCalledTimes(1);
		});
	});

	it('hides dialog when hideDialog is called', async () => {
		const { findByText, queryByText, findByTestId } = renderWithProviders();

		expect(await findByText(defaultProps.text)).toBeTruthy();

		fireEvent.press(await findByTestId('HideDialogButton'));

		await waitFor(() => {
			expect(queryByText(defaultProps.text)).toBeNull();
		});
	});
});
