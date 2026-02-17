import { View, StyleSheet, TouchableOpacity, Text, Alert, useColorScheme, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTransaction, useUpdateTransaction, useDeleteTransaction } from '@/hooks/use-transactions';
import { TransactionForm } from '@/components/transactions/transaction-form';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { EmptyState } from '@/components/common/empty-state';
import { Colors } from '@/constants/theme';
import { TransactionFormData } from '@/types/transaction';
import { confirmDialog } from '@/components/common/confirm-dialog';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const transactionId = parseInt(id, 10);
  const { data: transaction, isLoading } = useTransaction(transactionId);
  const updateMutation = useUpdateTransaction(transactionId);
  const deleteMutation = useDeleteTransaction();

  const handleUpdate = async (data: TransactionFormData) => {
    await updateMutation.mutateAsync(data);
    router.back();
  };

  const handleDelete = () => {
    confirmDialog(
      'Supprimer la transaction',
      'Cette action est irréversible.',
      async () => {
        await deleteMutation.mutateAsync(transactionId);
        router.back();
      }
    );
  };

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (!transaction) return <EmptyState icon="❓" title="Transaction introuvable" />;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Modifier',
          headerRight: () => (
            <TouchableOpacity onPress={handleDelete} style={{ padding: 8 }}>
              {deleteMutation.isPending ? (
                <ActivityIndicator color="#F44336" size="small" />
              ) : (
                <MaterialIcons name="delete-outline" size={24} color="#F44336" />
              )}
            </TouchableOpacity>
          ),
        }}
      />
      <TransactionForm
        defaultValues={{
          amount: String(transaction.amount),
          type: transaction.type,
          category_id: transaction.category_id,
          description: transaction.description ?? undefined,
          date: transaction.date,
        }}
        onSubmit={handleUpdate}
        submitLabel="Mettre à jour"
      />
    </>
  );
}
