'use client';

import { useUI } from '@/lib/context/ui-context';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { NewTransactionForm } from '@/components/transactions/NewTransactionForm';

export function NewTransactionSheet() {
  const { txSheetOpen, txTripId, closeTxSheet } = useUI();

  return (
    <BottomSheet
      isOpen={txSheetOpen}
      onClose={closeTxSheet}
      title="Nueva transacción"
    >
      <NewTransactionForm
        onSuccess={closeTxSheet}
        onCancel={closeTxSheet}
        defaultTripId={txTripId}
      />
    </BottomSheet>
  );
}
