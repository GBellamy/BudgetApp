import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, BudgetColors } from '@/constants/theme';
import { Transaction } from '@/types/transaction';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TransactionCardProps {
  transaction: Transaction;
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const colors = Colors[useColorScheme() ?? 'light'];
  const amountColor = transaction.type === 'income' ? BudgetColors.income : BudgetColors.expense;
  const sign = transaction.type === 'income' ? '+' : '-';

  const dateStr = (() => {
    try {
      return format(new Date(transaction.date), 'd MMM', { locale: fr });
    } catch {
      return transaction.date;
    }
  })();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/transaction/${transaction.id}` as any)}
    >
      <View style={[styles.iconBadge, { backgroundColor: (transaction.category_color || '#999') + '25' }]}>
        <MaterialIcons
          name={(transaction.category_icon || 'more-horiz') as any}
          size={22}
          color={transaction.category_color || '#999'}
        />
      </View>
      <View style={styles.middle}>
        <View style={styles.titleRow}>
          <Text style={[styles.categoryName, { color: colors.text }]}>
            {transaction.category_name || 'Sans catégorie'}
          </Text>
          {transaction.user_display_name ? (
            <View style={[styles.userBadge, { backgroundColor: colors.tint + '20' }]}>
              <Text style={[styles.userBadgeText, { color: colors.tint }]}>
                {transaction.user_display_name}
              </Text>
            </View>
          ) : null}
        </View>
        {transaction.description ? (
          <Text style={[styles.description, { color: colors.icon }]} numberOfLines={1}>
            {transaction.description}
          </Text>
        ) : null}
        <Text style={[styles.date, { color: colors.icon }]}>{dateStr}</Text>
      </View>
      <Text style={[styles.amount, { color: amountColor }]}>
        {sign}{transaction.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  iconBadge: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  middle: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' },
  categoryName: { fontSize: 15, fontWeight: '600' },
  userBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  userBadgeText: { fontSize: 11, fontWeight: '600' },
  description: { fontSize: 13, marginBottom: 2 },
  date: { fontSize: 12 },
  amount: { fontSize: 15, fontWeight: '700' },
});
