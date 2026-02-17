import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { CategoryAnalytics } from '@/types/api';

interface CategoryBreakdownProps {
  data: CategoryAnalytics[];
  total: number;
}

export function CategoryBreakdown({ data, total }: CategoryBreakdownProps) {
  const colors = Colors[useColorScheme() ?? 'light'];

  return (
    <View style={styles.container}>
      {data.map((item) => {
        const pct = total > 0 ? (item.total / total) * 100 : 0;
        return (
          <View key={item.id} style={styles.row}>
            <View style={[styles.iconBadge, { backgroundColor: item.color + '25' }]}>
              <MaterialIcons name={item.icon as any} size={18} color={item.color} />
            </View>
            <View style={styles.middle}>
              <View style={styles.topRow}>
                <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.amount, { color: colors.text }]}>
                  {item.total.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </Text>
              </View>
              <View style={[styles.barBg, { backgroundColor: colors.border }]}>
                <View style={[styles.barFill, { width: `${pct}%` as any, backgroundColor: item.color }]} />
              </View>
              <Text style={[styles.pct, { color: colors.icon }]}>{pct.toFixed(1)}%</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  row: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  iconBadge: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  middle: { flex: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  name: { fontSize: 14, fontWeight: '500' },
  amount: { fontSize: 14, fontWeight: '600' },
  barBg: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 2 },
  barFill: { height: '100%', borderRadius: 3 },
  pct: { fontSize: 11 },
});
