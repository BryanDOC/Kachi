'use client';

import { useUI } from '@/lib/context/ui-context';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { NewTransactionForm } from '@/components/transactions/NewTransactionForm';

export function NewTransactionSheet() {
  const { txSheetOpen, txTripId, editTx, closeTxSheet, notifyTxCreated } = useUI();

  const handleSuccess = () => {
    notifyTxCreated();
    closeTxSheet();
  };

  return (
    <BottomSheet
      isOpen={txSheetOpen}
      onClose={closeTxSheet}
      title={editTx ? 'Editar transacción' : 'Nueva transacción'}
    >
      <NewTransactionForm
        onSuccess={handleSuccess}
        onCancel={closeTxSheet}
        defaultTripId={txTripId}
        initialData={editTx ?? undefined}
      />
    </BottomSheet>
  );
}
