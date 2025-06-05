import NfcManager, {
	Ndef,
	NfcTech,
	type TagEvent,
} from 'react-native-nfc-manager';

// To decode the payload into plain text
const decodePayload = (tag: TagEvent) => {
	const payload = Ndef.text.decodePayload(tag?.ndefMessage[0].payload);
	console.log(payload);
	return payload;
};

// To take the user to the settings to enable NFC if not enabled
export const goToNFCSettings = () => {
	NfcManager.goToNfcSetting();
};

// Check if NFC is supported and is currently enabled
export const checkNFC = async () => {
	const supported = await NfcManager.isSupported();
	console.log(`NFC Supported: ${supported}`);
	const enabled = await NfcManager.isEnabled();
	console.log(`NFC Enabled: ${enabled}`);

	if (supported && enabled) return true;
	else {
		return false;
	}
};

// Try to read payload from NFC
export const readNFC = async () => {
	let payload = '';

	try {
		const check = await checkNFC();
		if (!check) {
			return payload;
		}

		await NfcManager.requestTechnology(NfcTech.Ndef);

		const tag = await NfcManager.getTag();
		console.log(tag);
		if (tag) payload = decodePayload(tag);

		return payload;
	} catch (e: any) {
		console.log(`Error: ${e.message}`);
	} finally {
		NfcManager.cancelTechnologyRequest();
	}
};

// Im aware that, as is, anyone with an external NFC tool can
// get the plain text from the card, possibly resulting in their duplication
// A solution would be to pass the id through a cypher first and then encoding it
export const writeNFC = async (id: string) => {
	//setLoadingWrite(true);
	let result = false;

	try {
		const check = await checkNFC();
		if (!check || !id) {
			//setLoadingWrite(false);
			return false;
		}

		await NfcManager.requestTechnology(NfcTech.Ndef);

		const payload = Ndef.encodeMessage([Ndef.textRecord(id)]);
		console.log(payload);

		if (payload) {
			await NfcManager.ndefHandler.writeNdefMessage(payload);
			result = true;
		}
	} catch (e: any) {
		console.log(`Error: ${e.message}`);
		//setLoadingWrite(false);
	} finally {
		NfcManager.cancelTechnologyRequest();
		//setLoadingWrite(false);
	}
	return result;
};
