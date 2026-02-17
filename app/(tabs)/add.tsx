import { router } from 'expo-router';
import { TransactionForm } from '@/components/transactions/transaction-form';
import { useCreateTransaction } from '@/hooks/use-transactions';
import { TransactionFormData } from '@/types/transaction';

export default function AddScreen() {
  const createMutation = useCreateTransaction();

  const handleSubmit = async (data: TransactionFormData) => {
    await createMutation.mutateAsync(data);
    router.replace('/(tabs)');
  };

  return <TransactionForm onSubmit={handleSubmit} submitLabel="Ajouter la transaction" />;
}
