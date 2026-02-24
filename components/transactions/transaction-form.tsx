import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, TextInput, Platform, Modal } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, parse, isValid } from 'date-fns';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, BudgetColors } from '@/constants/theme';
import { AmountInput } from './amount-input';
import { CategoryPicker } from './category-picker';
import { TransactionType } from '@/types/transaction';

const schema = z.object({
  amount: z.string().min(1, 'Montant requis').refine(
    (v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0,
    'Le montant doit être un nombre positif'
  ),
  type: z.enum(['income', 'expense'] as const),
  category_id: z.number({ required_error: 'Catégorie requise' }).positive('Catégorie requise'),
  description: z.string().max(255).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (JJ/MM/AAAA)'),
});

// Helpers: iso (yyyy-MM-dd) ↔ display (dd/MM/yyyy)
function isoToDisplay(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function displayToIso(display: string): string | null {
  try {
    const parsed = parse(display, 'dd/MM/yyyy', new Date());
    if (!isValid(parsed)) return null;
    return format(parsed, 'yyyy-MM-dd');
  } catch {
    return null;
  }
}

type FormData = z.infer<typeof schema>;

interface TransactionFormProps {
  defaultValues?: Partial<FormData>;
  onSubmit: (data: { amount: number; type: TransactionType; category_id: number; description?: string; date: string }) => Promise<void>;
  submitLabel?: string;
}

export function TransactionForm({ defaultValues, onSubmit, submitLabel = 'Enregistrer' }: TransactionFormProps) {
  const colors = Colors[useColorScheme() ?? 'light'];
  const [showPicker, setShowPicker] = useState(false);

  const { control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'expense',
      date: format(new Date(), 'yyyy-MM-dd'),
      amount: '',
      ...defaultValues,
      amount: defaultValues?.amount ? String(defaultValues.amount) : '',
    },
  });

  const type = watch('type');

  const handleFormSubmit = async (data: FormData) => {
    try {
      await onSubmit({
        amount: parseFloat(data.amount),
        type: data.type,
        category_id: data.category_id,
        description: data.description || undefined,
        date: data.date,
      });
    } catch (err: any) {
      Alert.alert('Erreur', err?.response?.data?.error || 'Une erreur est survenue');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {/* Type toggle */}
      <View style={[styles.typeToggle, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.typeBtn, type === 'expense' && { backgroundColor: BudgetColors.expense }]}
          onPress={() => { setValue('type', 'expense'); setValue('category_id', 0 as any); }}
        >
          <Text style={[styles.typeBtnText, type === 'expense' && styles.typeBtnActive]}>Dépense</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeBtn, type === 'income' && { backgroundColor: BudgetColors.income }]}
          onPress={() => { setValue('type', 'income'); setValue('category_id', 0 as any); }}
        >
          <Text style={[styles.typeBtnText, type === 'income' && styles.typeBtnActive]}>Revenu</Text>
        </TouchableOpacity>
      </View>

      {/* Amount */}
      <Controller
        control={control}
        name="amount"
        render={({ field }) => (
          <AmountInput
            label="Montant"
            value={field.value}
            onChangeText={field.onChange}
            error={errors.amount?.message}
          />
        )}
      />

      {/* Category */}
      <Controller
        control={control}
        name="category_id"
        render={({ field }) => (
          <View style={styles.field}>
            <CategoryPicker
              label="Catégorie"
              value={field.value || null}
              onChange={field.onChange}
              type={type}
              error={errors.category_id?.message}
            />
          </View>
        )}
      />

      {/* Date */}
      <Controller
        control={control}
        name="date"
        render={({ field }) => {
          const displayValue = field.value.match(/^\d{4}-\d{2}-\d{2}$/)
            ? isoToDisplay(field.value)
            : field.value;

          const handleTextChange = (text: string) => {
            // Auto-insert slashes: 2 → 2/, 5 → 5/
            let v = text.replace(/[^\d/]/g, '');
            if (v.length === 2 && !v.includes('/')) v = v + '/';
            if (v.length === 5 && v.split('/').length === 2) v = v + '/';
            const iso = displayToIso(v);
            field.onChange(iso ?? v); // store iso if valid, else raw for UX
          };

          const handlePickerChange = (_: DateTimePickerEvent, date?: Date) => {
            if (Platform.OS === 'android') setShowPicker(false);
            if (date) field.onChange(format(date, 'yyyy-MM-dd'));
          };

          const pickerDate = (() => {
            try {
              const d = new Date(field.value);
              return isNaN(d.getTime()) ? new Date() : d;
            } catch { return new Date(); }
          })();

          return (
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.text }]}>Date</Text>
              <View style={[styles.dateRow, { borderColor: errors.date ? '#F44336' : colors.border, backgroundColor: colors.card }]}>
                <TextInput
                  style={[styles.dateTextInput, { color: colors.text }]}
                  value={displayValue}
                  onChangeText={handleTextChange}
                  placeholder="JJ/MM/AAAA"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="numeric"
                  maxLength={10}
                />
                <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.calendarBtn}>
                  <MaterialIcons name="calendar-today" size={20} color={colors.tint} />
                </TouchableOpacity>
              </View>
              {errors.date && <Text style={styles.error}>{errors.date.message}</Text>}

              {/* Android: native dialog */}
              {showPicker && Platform.OS === 'android' && (
                <DateTimePicker
                  value={pickerDate}
                  mode="date"
                  display="calendar"
                  maximumDate={new Date()}
                  onChange={handlePickerChange}
                />
              )}

              {/* iOS: modal with inline picker */}
              {Platform.OS === 'ios' && (
                <Modal visible={showPicker} transparent animationType="slide" onRequestClose={() => setShowPicker(false)}>
                  <View style={styles.modalOverlay}>
                    <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      <DateTimePicker
                        value={pickerDate}
                        mode="date"
                        display="inline"
                        maximumDate={new Date()}
                        onChange={handlePickerChange}
                        locale="fr-FR"
                      />
                      <TouchableOpacity
                        style={[styles.modalDone, { backgroundColor: colors.tint }]}
                        onPress={() => setShowPicker(false)}
                      >
                        <Text style={styles.modalDoneText}>Confirmer</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>
              )}
            </View>
          );
        }}
      />

      {/* Description */}
      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Description (optionnel)</Text>
            <TextInput
              style={[styles.descInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
              value={field.value || ''}
              onChangeText={field.onChange}
              placeholder="Ex: Courses Lidl"
              placeholderTextColor={colors.placeholder}
              multiline
              maxLength={255}
            />
          </View>
        )}
      />

      <TouchableOpacity
        style={[
          styles.submitBtn,
          { backgroundColor: type === 'income' ? BudgetColors.income : BudgetColors.expense },
          isSubmitting && styles.disabled,
        ]}
        onPress={handleSubmit(handleFormSubmit)}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>{submitLabel}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  typeToggle: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  typeBtnText: { fontSize: 15, fontWeight: '600', color: '#666' },
  typeBtnActive: { color: '#fff' },
  field: {},
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  dateTextInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
  },
  calendarBtn: {
    padding: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    padding: 16,
    paddingBottom: 32,
  },
  modalDone: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  modalDoneText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  descInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  error: { color: '#F44336', fontSize: 12, marginTop: 4 },
  submitBtn: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  disabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
