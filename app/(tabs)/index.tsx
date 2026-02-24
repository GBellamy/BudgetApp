import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useSummary, useRecentActivity } from '@/hooks/use-analytics';
import { BalanceSummary } from '@/components/analytics/balance-summary';
import { TransactionCard } from '@/components/transactions/transaction-card';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { EmptyState } from '@/components/common/empty-state';
import { Colors } from '@/constants/theme';
import { useAuthStore } from '@/store/auth-store';

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const user = useAuthStore((s) => s.user);

  const now = new Date();
  const dateFrom = format(startOfMonth(now), 'yyyy-MM-dd');
  const dateTo = format(endOfMonth(now), 'yyyy-MM-dd');
  const monthLabel = format(now, 'MMMM yyyy', { locale: fr });

  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = useSummary(dateFrom, dateTo);
  const { data: recent, isLoading: recentLoading, refetch: refetchRecent } = useRecentActivity(5);

  const isLoading = summaryLoading || recentLoading;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={() => { refetchSummary(); refetchRecent(); }}
          tintColor={colors.tint}
        />
      }
    >
      <Text style={[styles.welcome, { color: colors.icon }]}>
        Bonjour, {user?.display_name ?? 'utilisateur'} 👋
      </Text>
      <Text style={[styles.period, { color: colors.text }]}>{monthLabel}</Text>

      {summaryLoading ? (
        <LoadingSpinner />
      ) : summary ? (
        <BalanceSummary summary={summary} />
      ) : null}

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Transactions récentes</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/transactions' as any)}>
          <Text style={[styles.seeAll, { color: colors.tint }]}>Voir tout</Text>
        </TouchableOpacity>
      </View>

      {recentLoading ? (
        <LoadingSpinner />
      ) : (recent as any[])?.length > 0 ? (
        (recent as any[]).map((t: any) => <TransactionCard key={t.id} transaction={t} />)
      ) : (
        <EmptyState icon="💰" title="Aucune transaction" subtitle="Commencez à suivre votre budget" />
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  welcome: { fontSize: 14, marginBottom: 2 },
  period: { fontSize: 22, fontWeight: '700', marginBottom: 16, textTransform: 'capitalize' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  seeAll: { fontSize: 14, fontWeight: '500' },
});
