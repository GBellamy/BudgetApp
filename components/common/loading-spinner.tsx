import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export function LoadingSpinner({ fullScreen = false }: { fullScreen?: boolean }) {
  const colors = Colors[useColorScheme() ?? 'light'];
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size="large" color={colors.tint} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 32, alignItems: 'center', justifyContent: 'center' },
  fullScreen: { flex: 1 },
});
