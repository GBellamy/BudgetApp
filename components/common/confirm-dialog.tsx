import { Alert } from 'react-native';

export function confirmDialog(
  title: string,
  message: string,
  onConfirm: () => void,
  confirmText = 'Supprimer',
  destructive = true
) {
  Alert.alert(title, message, [
    { text: 'Annuler', style: 'cancel' },
    {
      text: confirmText,
      style: destructive ? 'destructive' : 'default',
      onPress: onConfirm,
    },
  ]);
}
