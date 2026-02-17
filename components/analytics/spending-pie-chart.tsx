import { View, Text, StyleSheet, useColorScheme, Dimensions } from 'react-native';
import { PolarChart, Pie } from 'victory-native';
import { CategoryAnalytics } from '@/types/api';
import { Colors } from '@/constants/theme';

interface SpendingPieChartProps {
  data: CategoryAnalytics[];
}

const SIZE = Math.min(Dimensions.get('window').width - 48, 240);

export function SpendingPieChart({ data }: SpendingPieChartProps) {
  const colors = Colors[useColorScheme() ?? 'light'];

  if (data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={{ color: colors.icon }}>Aucune donnée pour cette période</Text>
      </View>
    );
  }

  const chartData = data.map((item) => ({
    label: item.name,
    value: item.total,
    color: item.color,
  }));

  return (
    <View style={styles.container}>
      <PolarChart
        data={chartData}
        colorKey="color"
        labelKey="label"
        valueKey="value"
        style={{ height: SIZE, width: SIZE }}
      >
        <Pie.Chart innerRadius="40%" />
      </PolarChart>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginVertical: 8 },
  empty: { height: 120, alignItems: 'center', justifyContent: 'center' },
});
