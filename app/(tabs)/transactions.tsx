import { useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  useColorScheme,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTransactions } from '@/hooks/use-transactions';
import { TransactionCard } from '@/components/transactions/transaction-card';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { EmptyState } from '@/components/common/empty-state';
import { Colors, BudgetColors } from '@/constants/theme';

type FilterType = 'all' | 'income' | 'expense';

export default function TransactionsScreen() {
  const [filter, setFilter] = useState<FilterType>('all');
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { data, isLoading, refetch } = useTransactions({
    limit: 50,
    type: filter === 'all' ? undefined : filter,
  });

  const filterBtns: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'Tous' },
    { key: 'expense', label: 'Dépenses' },
    { key: 'income', label: 'Revenus' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.filterBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {filterBtns.map((btn) => (
          <TouchableOpacity
            key={btn.key}
            style={[
              styles.filterBtn,
              filter === btn.key && {
                backgroundColor:
                  btn.key === 'income'
                    ? BudgetColors.income
                    : btn.key === 'expense'
                    ? BudgetColors.expense
                    : colors.tint,
              },
            ]}
            onPress={() => setFilter(btn.key)}
          >
            <Text
              style={[
                styles.filterBtnText,
                { color: filter === btn.key ? '#fff' : colors.icon },
              ]}
            >
              {btn.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <LoadingSpinner fullScreen />
      ) : (
        <FlatList
          data={data?.data ?? []}
          keyExtractor={(t) => String(t.id)}
          renderItem={({ item }) => <TransactionCard transaction={item} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              icon="💸"
              title="Aucune transaction"
              subtitle="Ajoutez votre première transaction avec le bouton +"
            />
          }
          onRefresh={refetch}
          refreshing={isLoading}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterBar: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  filterBtnText: { fontSize: 13, fontWeight: '600' },
  list: { padding: 16, flexGrow: 1 },
});
