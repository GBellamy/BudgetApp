import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSummary, useCategoryAnalytics, useMonthlyAnalytics } from '@/hooks/use-analytics';
import { BalanceSummary } from '@/components/analytics/balance-summary';
import { SpendingPieChart } from '@/components/analytics/spending-pie-chart';
import { MonthlyBarChart } from '@/components/analytics/monthly-bar-chart';
import { CategoryBreakdown } from '@/components/analytics/category-breakdown';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { Colors } from '@/constants/theme';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AnalyticsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [year, setYear] = useState(new Date().getFullYear());
  const [categoryType, setCategoryType] = useState<'income' | 'expense'>('expense');

  const now = new Date();
  const dateFrom = format(startOfMonth(now), 'yyyy-MM-dd');
  const dateTo = format(endOfMonth(now), 'yyyy-MM-dd');

  const { data: summary, isLoading: summaryLoading } = useSummary(dateFrom, dateTo);
  const { data: categories, isLoading: catLoading } = useCategoryAnalytics(categoryType, `${year}-01-01`, `${year}-12-31`);
  const { data: monthly, isLoading: monthlyLoading } = useMonthlyAnalytics(year);

  const catTotal = (categories ?? []).reduce((s, c) => s + c.total, 0);

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      {/* Month summary */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Ce mois-ci</Text>
      {summaryLoading ? <LoadingSpinner /> : summary ? <BalanceSummary summary={summary} /> : null}

      {/* Year selector */}
      <View style={styles.yearSelector}>
        <TouchableOpacity onPress={() => setYear((y) => y - 1)}>
          <MaterialIcons name="chevron-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.yearLabel, { color: colors.text }]}>{year}</Text>
        <TouchableOpacity onPress={() => setYear((y) => y + 1)} disabled={year >= new Date().getFullYear()}>
          <MaterialIcons name="chevron-right" size={28} color={year >= new Date().getFullYear() ? colors.icon : colors.text} />
        </TouchableOpacity>
      </View>

      {/* Monthly bar chart */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Revenus vs Dépenses</Text>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        {monthlyLoading ? <LoadingSpinner /> : <MonthlyBarChart data={monthly ?? []} />}
      </View>

      {/* Category pie chart */}
      <View style={styles.typeToggleRow}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Par catégorie</Text>
        <View style={[styles.toggle, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            style={[styles.toggleBtn, categoryType === 'expense' && { backgroundColor: '#F44336' }]}
            onPress={() => setCategoryType('expense')}
          >
            <Text style={[styles.toggleText, categoryType === 'expense' && { color: '#fff' }]}>Dépenses</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, categoryType === 'income' && { backgroundColor: '#4CAF50' }]}
            onPress={() => setCategoryType('income')}
          >
            <Text style={[styles.toggleText, categoryType === 'income' && { color: '#fff' }]}>Revenus</Text>
          </TouchableOpacity>
        </View>
      </View>

      {catLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <SpendingPieChart data={categories ?? []} />
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <CategoryBreakdown data={categories ?? []} total={catTotal} />
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12, paddingBottom: 32 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginTop: 4 },
  card: { borderRadius: 16, padding: 16 },
  yearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginVertical: 4,
  },
  yearLabel: { fontSize: 20, fontWeight: '700', minWidth: 60, textAlign: 'center' },
  typeToggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggle: { flexDirection: 'row', borderRadius: 8, overflow: 'hidden' },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  toggleText: { fontSize: 13, fontWeight: '600', color: '#666' },
});
