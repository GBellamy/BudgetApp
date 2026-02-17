import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useCategories } from '@/hooks/use-categories';
import { Category, TransactionType } from '@/types/transaction';
import { useState } from 'react';

interface CategoryPickerProps {
  value: number | null;
  onChange: (id: number) => void;
  type: TransactionType;
  error?: string;
  label?: string;
}

export function CategoryPicker({ value, onChange, type, error, label }: CategoryPickerProps) {
  const [open, setOpen] = useState(false);
  const colors = Colors[useColorScheme() ?? 'light'];
  const { data: categories = [] } = useCategories();

  const filtered = categories.filter((c) => c.type === type || c.type === 'both');
  const selected = categories.find((c) => c.id === value);

  return (
    <View>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
      <TouchableOpacity
        style={[styles.trigger, { borderColor: error ? '#F44336' : colors.border, backgroundColor: colors.card }]}
        onPress={() => setOpen(true)}
      >
        {selected ? (
          <View style={styles.selectedRow}>
            <View style={[styles.iconBadge, { backgroundColor: selected.color + '30' }]}>
              <MaterialIcons name={selected.icon as any} size={20} color={selected.color} />
            </View>
            <Text style={[styles.selectedText, { color: colors.text }]}>{selected.name}</Text>
          </View>
        ) : (
          <Text style={[styles.placeholder, { color: colors.placeholder }]}>Choisir une catégorie</Text>
        )}
        <MaterialIcons name="expand-more" size={20} color={colors.icon} />
      </TouchableOpacity>
      {error && <Text style={styles.error}>{error}</Text>}

      <Modal visible={open} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Catégorie</Text>
            <TouchableOpacity onPress={() => setOpen(false)}>
              <MaterialIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={filtered}
            keyExtractor={(c) => String(c.id)}
            numColumns={3}
            contentContainerStyle={styles.grid}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryItem,
                  { backgroundColor: colors.card },
                  value === item.id && { borderColor: item.color, borderWidth: 2 },
                ]}
                onPress={() => { onChange(item.id); setOpen(false); }}
              >
                <View style={[styles.iconBadge, { backgroundColor: item.color + '30' }]}>
                  <MaterialIcons name={item.icon as any} size={24} color={item.color} />
                </View>
                <Text style={[styles.categoryName, { color: colors.text }]} numberOfLines={2}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  selectedRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBadge: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  selectedText: { fontSize: 15 },
  placeholder: { fontSize: 15 },
  error: { color: '#F44336', fontSize: 12, marginTop: 4 },
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  grid: { padding: 16, gap: 12 },
  categoryItem: {
    flex: 1,
    margin: 4,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryName: { fontSize: 11, textAlign: 'center' },
});
