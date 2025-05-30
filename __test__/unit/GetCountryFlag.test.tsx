import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { getFlagEmoji } from '@/utils/GetCountryFlag';

afterEach(() => {
	jest.clearAllMocks();
});

it('Renders the correct flag and text', () => {
	expect(getFlagEmoji('GB')).toBe('🇬🇧');
	expect(getFlagEmoji('PT')).toBe('🇵🇹');
});
