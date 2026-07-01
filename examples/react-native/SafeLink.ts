import { Linking, Alert } from 'react-native';
import { verifyLink } from 'safe-link-checker';

export async function openSafeUrl(url: string) {
  try {
    const result = await verifyLink(url);

    if (result.decision === 'BLOCK') {
      Alert.alert(
        'Dangerous Link Blocked',
        result.summary || 'This link has been blocked for your safety.'
      );
      return false;
    }

    if (result.decision === 'WARN') {
      return new Promise((resolve) => {
        Alert.alert(
          'Suspicious Link',
          result.summary || 'This link looks suspicious. Are you sure you want to proceed?',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Open Anyway', style: 'destructive', onPress: () => {
              Linking.openURL(result.normalizedUrl);
              resolve(true);
            }}
          ]
        );
      });
    }

    await Linking.openURL(result.normalizedUrl);
    return true;
  } catch (error) {
    console.error('Failed to verify or open URL:', error);
    return false;
  }
}
