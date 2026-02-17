import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, BudgetColors } from '@/constants/theme';
import { AmountInput } from './amount-input';
import { CategoryPicker } from './category-picker';
import { TransactionType } from '@/types/transaction';
import { TextInput } from 'react-native';

const schema = z.object({
  amount: z.string().min(1, 'Montant requis').refine(
    (v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0,
    'Le montant doit être un nombre positif'
  ),
  type: z.enum(['income', 'expense'] as const),
  category_id: z.number({ required_error: 'Catégorie requise' }).positive('Catégorie requise'),
  description: z.string().max(255).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide'),
});

type FormData = z.infer<typeof schema>;

interface TransactionFormProps {
  defaultValues?: Partial<FormData>;
  onSubmit: (data: { amount: number; type: TransactionType; category_id: number; description?: string; date: string }) => Promise<void>;
  submitLabel?: string;
}

export function TransactionForm({ defaultValues, onSubmit, submitLabel = 'Enregistrer' }: TransactionFormProps) {
  const colors = Colors[useColorScheme() ?? 'light'];

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
        render={({ field }) => (
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Date</Text>
            <TextInput
              style={[styles.dateInput, { color: colors.text, borderColor: errors.date ? '#F44336' : colors.border, backgroundColor: colors.card }]}
              value={field.value}
              onChangeText={field.onChange}
              placeholder="AAAA-MM-JJ"
              placeholderTextColor={colors.placeholder}
              keyboardType="numeric"
              maxLength={10}
            />
            {errors.date && <Text style={styles.error}>{errors.date.message}</Text>}
          </View>
        )}
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
  dateInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
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
