import auth from '@react-native-firebase/auth';
import type { FirebaseError } from 'firebase/app';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Keyboard, KeyboardAvoidingView, View } from 'react-native';
import {
	Button,
	HelperText,
	Modal,
	Portal,
	TextInput,
	useTheme,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSnackbar } from '@/context/SnackbarContext';
import { globalStyles } from '@/styles/global';

export default function Index() {
	const insets = useSafeAreaInsets();
	const theme = useTheme();
	const { t } = useTranslation();

	const [loginLoading, setLoginLoading] = useState(false);
	const [signupLoading, setSignupLoading] = useState(false);
	const [confirmSignupLoading, setConfirmSignupLoading] = useState(false);

	const [showModal, setShowModal] = useState(false);

	const [emailError, setEmailError] = useState(false);
	const [passwordError, setPasswordError] = useState(false);
	const [confirmPasswordError, setConfirmPasswordError] = useState(false);

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	// All the logic to implement the snackbar
	const { showSnackbar } = useSnackbar();

	const emailRegex = /.+@.+\..+/g;

	const signUp = async () => {
		setSignupLoading(true);
		Keyboard.dismiss();

		if (!email.trim() && !password.trim()) {
			showSnackbar(t('account.emailPasswordEmpty'));
			setSignupLoading(false);
			setEmailError(true);
			setPasswordError(true);
			return;
		} else if (!email.trim()) {
			showSnackbar(t('account.emailEmpty'));
			setSignupLoading(false);
			setEmailError(true);
			return;
		} else if (!password.trim()) {
			showSnackbar(t('account.passwordEmpty'));
			setSignupLoading(false);
			return;
		} else if (!email.match(emailRegex)) {
			showSnackbar(t('account.emailError'));
			setSignupLoading(false);
			setEmailError(true);
			return;
		} else if (password.length < 6) {
			showSnackbar(t('account.passwordError'));
			setSignupLoading(false);
			setPasswordError(true);
			return;
		}
		setEmailError(false);
		setPasswordError(false);
		setShowModal(true);
	};

	const confirmSignUp = async () => {
		setConfirmSignupLoading(true);
		Keyboard.dismiss();
		if (!confirmPassword.trim()) {
			showSnackbar(t('account.passwordEmpty'));
			setConfirmSignupLoading(false);
			setConfirmPasswordError(true);
			return;
		} else if (password !== confirmPassword) {
			showSnackbar(t('account.passwordNotMatch'));
			setConfirmSignupLoading(false);
			setConfirmPassword('');
			setConfirmPasswordError(true);
			return;
		}

		try {
			await auth().createUserWithEmailAndPassword(email, password);
		} catch (e: any) {
			const err = e as FirebaseError;
			//showSnackbar('Registration failed: ' + err.message);
			console.log(`Registration failed: ${err.message}`);
		} finally {
			setSignupLoading(false);
			setConfirmSignupLoading(false);
			setShowModal(false);
		}
	};

	const logIn = async () => {
		setLoginLoading(true);
		Keyboard.dismiss();

		if (!email.trim() && !password.trim()) {
			showSnackbar(t('account.emailPasswordEmpty'));
			setLoginLoading(false);
			setEmailError(true);
			setPasswordError(true);
			return;
		} else {
			if (!email.trim()) {
				showSnackbar(t('account.emailEmpty'));
				setLoginLoading(false);
				setEmailError(true);
				return;
			} else if (!email.match(emailRegex)) {
				showSnackbar(t('account.emailError'));
				setLoginLoading(false);
				setEmailError(true);
				return;
			}

			if (!password.trim()) {
				showSnackbar(t('account.passwordEmpty'));
				setLoginLoading(false);
				setPasswordError(true);
				return;
			} else if (password.length < 6) {
				showSnackbar(t('account.passwordError'));
				setLoginLoading(false);
				setPasswordError(true);
				return;
			}
		}
		setEmailError(false);
		setPasswordError(false);

		try {
			await auth().signInWithEmailAndPassword(email, password);
		} catch (e: any) {
			const err = e as FirebaseError;
			if (err.code === 'auth/invalid-credential') {
				showSnackbar(t('account.emailPasswordWrong'));
				setLoginLoading(false);
				setPassword('');
			} else {
				//showSnackbar('Sign in failed: ' + err.message);
				console.log(`Sign in failed: ${err.message}`);
			}
		} finally {
			setLoginLoading(false);
		}
	};

	return (
		<>
			<Portal>
				<Modal
					visible={showModal}
					onDismiss={() => {
						setSignupLoading(false);
						setLoginLoading(false);
						setShowModal(false);
					}}
					style={globalStyles.modalContainer.drawer}
					contentContainerStyle={[
						globalStyles.modalContentContainer.drawer,
						{ backgroundColor: theme.colors.primaryContainer },
					]}
					testID='ConfirmPasswordModal'
				>
					<TextInput
						style={globalStyles.input}
						value={confirmPassword}
						onChangeText={setConfirmPassword}
						onEndEditing={() => {
							if (password !== confirmPassword) {
								setConfirmPasswordError(true);
							} else setConfirmPasswordError(false);
							setConfirmPassword(confirmPassword.trim());
						}}
						error={confirmPasswordError}
						autoCapitalize='none'
						label={t('account.confirmPassword')}
						secureTextEntry
						testID='ConfirmPasswordInput'
					/>
					{confirmPasswordError ? (
						<HelperText
							type='error'
							visible={confirmPasswordError}
							style={globalStyles.text.errorHelper}
							testID='ConfirmPasswordError'
						>
							{t('account.confirmPasswordError')}
						</HelperText>
					) : null}

					<View style={[globalStyles.container.button, { marginTop: 15 }]}>
						<Button
							style={globalStyles.button.global}
							contentStyle={globalStyles.buttonContent.modal}
							labelStyle={globalStyles.buttonText.modal}
							icon='check'
							mode='elevated'
							loading={confirmSignupLoading}
							onPress={confirmSignUp}
							testID='ConfirmSignUp'
						>
							{t('account.confirmPassword')}
						</Button>
					</View>
				</Modal>
			</Portal>

			<View style={[globalStyles.container.home, { paddingTop: insets.top }]}>
				<KeyboardAvoidingView
					style={{ flex: 1, marginHorizontal: 20 }}
					behavior='padding'
				>
					<View style={globalStyles.container.image}>
						<Image
							style={globalStyles.image.global}
							source={require('@/assets/images/logoReact.png')}
							testID='LoginLogo'
						/>
					</View>
					<View
						style={{
							flex: 1,
						}}
						testID='LoginPage'
					>
						<TextInput
							style={globalStyles.input}
							value={email}
							onChangeText={setEmail}
							onEndEditing={() => {
								if (!email.match(emailRegex)) {
									setEmailError(true);
								} else setEmailError(false);
								setEmail(email.trim());
							}}
							error={emailError}
							autoCapitalize='none'
							keyboardType='email-address'
							label={t('account.email')}
							testID='EmailInput'
						/>
						{emailError ? (
							<HelperText
								type='error'
								visible={emailError}
								style={globalStyles.text.errorHelper}
								testID='EmailError'
							>
								{t('account.emailError')}
							</HelperText>
						) : null}
						<TextInput
							style={globalStyles.input}
							value={password}
							onChangeText={setPassword}
							onEndEditing={() => {
								if (password.length < 6) {
									setPasswordError(true);
								} else setPasswordError(false);
								setPassword(password.trim());
							}}
							error={passwordError}
							autoCapitalize='none'
							keyboardType='default'
							label={t('account.password')}
							secureTextEntry
							testID='PasswordInput'
						/>
						{passwordError ? (
							<HelperText
								type='error'
								visible={passwordError}
								style={globalStyles.text.errorHelper}
								testID='PasswordError'
							>
								{t('account.passwordError')}
							</HelperText>
						) : null}
					</View>
				</KeyboardAvoidingView>

				<View style={globalStyles.container.button}>
					<Button
						style={globalStyles.button.global}
						contentStyle={globalStyles.buttonContent.global}
						labelStyle={globalStyles.buttonText.global}
						icon='login'
						mode='elevated'
						loading={loginLoading}
						onPress={() => {
							logIn();
						}}
						testID='LoginButton'
					>
						{t('button.login')}
					</Button>
					<Button
						style={globalStyles.button.global}
						contentStyle={globalStyles.buttonContent.global}
						labelStyle={globalStyles.buttonText.global}
						icon='briefcase-plus'
						mode='elevated'
						loading={signupLoading}
						onPress={signUp}
						testID='CreateAccountButton'
					>
						{t('button.createAccount')}
					</Button>
				</View>
			</View>
		</>
	);
}
