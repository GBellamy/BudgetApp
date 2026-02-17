import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface AmountInputProps extends Omit<TextInputProps, 'onChangeText'> {
  value: string;
  onChangeText: (value: string) => void;
  label?: string;
  error?: string;
}

export function AmountInput({ value, onChangeText, label, error, ...props }: AmountInputProps) {
  const colors = Colors[useColorScheme() ?? 'light'];

  const handleChange = (text: string) => {
    // Allow digits, one comma or dot as decimal separator
    const cleaned = text.replace(/[^0-9.,]/g, '').replace(',', '.');
    // Prevent multiple dots
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    onChangeText(cleaned);
  };

  return (
    <View>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
      <View style={[styles.inputWrapper, { borderColor: error ? '#F44336' : colors.border, backgroundColor: colors.card }]}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={value}
          onChangeText={handleChange}
          keyboardType="decimal-pad"
          placeholder="0,00"
          placeholderTextColor={colors.placeholder}
          {...props}
        />
        <Text style={[styles.currency, { color: colors.icon }]}>€</Text>
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  input: { flex: 1, fontSize: 20, fontWeight: '600', paddingVertical: 14 },
  currency: { fontSize: 18, fontWeight: '600', marginLeft: 8 },
  error: { color: '#F44336', fontSize: 12, marginTop: 4 },
});
