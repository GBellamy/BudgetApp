import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Colors, BudgetColors } from '@/constants/theme';
import { Summary } from '@/types/api';

interface BalanceSummaryProps {
  summary: Summary;
}

function fmt(amount: number) {
  return amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function BalanceSummary({ summary }: BalanceSummaryProps) {
  const colors = Colors[useColorScheme() ?? 'light'];

  return (
    <View style={styles.row}>
      <View style={[styles.card, { backgroundColor: BudgetColors.incomeLight }]}>
        <Text style={styles.cardLabel}>Revenus</Text>
        <Text style={[styles.cardAmount, { color: BudgetColors.income }]}>+{fmt(summary.income)} €</Text>
      </View>
      <View style={[styles.card, { backgroundColor: BudgetColors.expenseLight }]}>
        <Text style={styles.cardLabel}>Dépenses</Text>
        <Text style={[styles.cardAmount, { color: BudgetColors.expense }]}>-{fmt(summary.expense)} €</Text>
      </View>
      <View style={[styles.card, { backgroundColor: colors.card, flex: 1.2 }]}>
        <Text style={styles.cardLabel}>Solde</Text>
        <Text style={[styles.cardAmount, { color: summary.balance >= 0 ? BudgetColors.income : BudgetColors.expense }]}>
          {summary.balance >= 0 ? '+' : ''}{fmt(summary.balance)} €
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  card: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center' },
  cardLabel: { fontSize: 11, color: '#666', marginBottom: 4, fontWeight: '500' },
  cardAmount: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
});
