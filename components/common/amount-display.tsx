import { Text, StyleSheet, TextStyle } from 'react-native';
import { BudgetColors } from '@/constants/theme';

interface AmountDisplayProps {
  amount: number;
  type: 'income' | 'expense';
  style?: TextStyle;
  size?: 'sm' | 'md' | 'lg';
}

export function AmountDisplay({ amount, type, style, size = 'md' }: AmountDisplayProps) {
  const color = type === 'income' ? BudgetColors.income : BudgetColors.expense;
  const sign = type === 'income' ? '+' : '-';
  const fontSize = size === 'sm' ? 14 : size === 'lg' ? 22 : 16;

  return (
    <Text style={[{ color, fontWeight: '700', fontSize }, style]}>
      {sign}
      {amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
    </Text>
  );
}
