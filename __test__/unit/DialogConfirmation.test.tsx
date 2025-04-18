import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import DialogConfirmation from '@/components/DialogConfirmation';

jest.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => {
			const translations: Record<string, string> = {
				'profile.yes': 'Yes',
				'profile.no': 'No',
			};
			return translations[key] || key;
		},
	}),
}));

describe('DialogConfirmation', () => {
	const mockOnDismiss = jest.fn();
	const mockOnConfirmation = jest.fn();

	const defaultProps = {
		text: 'Are you sure?',
		visible: true,
		onDismiss: mockOnDismiss,
		onConfirmation: mockOnConfirmation,
	};

	afterEach(() => {
		jest.clearAllMocks();
	});

	const renderWithProviders = (ui: React.ReactElement) =>
		render(<PaperProvider>{ui}</PaperProvider>);

	it('Renders the dialog with text and buttons', async () => {
		const { findByText } = renderWithProviders(
			<DialogConfirmation {...defaultProps} />
		);
		expect(await findByText('Are you sure?')).toBeTruthy();
		expect(await findByText('Yes')).toBeTruthy();
		expect(await findByText('No')).toBeTruthy();
	});

	it('Calls onConfirmation when "Yes" button is pressed', async () => {
		const { findByText } = renderWithProviders(
			<DialogConfirmation {...defaultProps} />
		);
		fireEvent.press(await findByText('Yes'));
		expect(mockOnConfirmation).toHaveBeenCalledTimes(1);
	});

	it('Calls onDismiss when "No" button is pressed', async () => {
		const { findByText } = renderWithProviders(
			<DialogConfirmation {...defaultProps} />
		);
		fireEvent.press(await findByText('No'));
		expect(mockOnDismiss).toHaveBeenCalledTimes(1);
	});
});
