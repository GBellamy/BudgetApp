import { View, Text, StyleSheet, useColorScheme, Dimensions } from 'react-native';
import { Bar, CartesianChart } from 'victory-native';
import { MonthlyAnalytics } from '@/types/api';
import { Colors, BudgetColors } from '@/constants/theme';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MonthlyBarChartProps {
  data: MonthlyAnalytics[];
  highlightMonth?: string; // 'YYYY-MM' — reserved for future use
}

const WIDTH = Dimensions.get('window').width - 48;

export function MonthlyBarChart({ data }: MonthlyBarChartProps) {
  const colors = Colors[useColorScheme() ?? 'light'];

  if (data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={{ color: colors.icon }}>Aucune donnée pour cette année</Text>
      </View>
    );
  }

  // Format month labels
  const chartData = data.map((d) => {
    const label = (() => {
      try {
        return format(new Date(d.month + '-01'), 'MMM', { locale: fr });
      } catch {
        return d.month.slice(5);
      }
    })();
    return { month: label, income: d.income, expense: d.expense };
  });

  return (
    <View style={styles.container}>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: BudgetColors.income }]} />
          <Text style={{ color: colors.text, fontSize: 12 }}>Revenus</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: BudgetColors.expense }]} />
          <Text style={{ color: colors.text, fontSize: 12 }}>Dépenses</Text>
        </View>
      </View>
      <CartesianChart
        data={chartData}
        xKey="month"
        yKeys={['income', 'expense']}
        style={{ height: 200, width: WIDTH }}
        axisOptions={{ font: null }}
      >
        {({ points, chartBounds }) => (
          <>
            <Bar
              points={points.income}
              chartBounds={chartBounds}
              color={BudgetColors.income}
              roundedCorners={{ topLeft: 4, topRight: 4 }}
              barWidth={8}
            />
            <Bar
              points={points.expense}
              chartBounds={chartBounds}
              color={BudgetColors.expense}
              roundedCorners={{ topLeft: 4, topRight: 4 }}
              barWidth={8}
            />
          </>
        )}
      </CartesianChart>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  legend: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  empty: { height: 120, alignItems: 'center', justifyContent: 'center' },
});
