import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { PaymentQueue } from '../../components';
import { usePayments } from '../../hooks';
import styles from './PaymentsPage.module.css';

const PaymentsPage: React.FC = () => {
  const [currentUserId] = useState(1); // Mock user ID
  const { payments, processPayment, cancelPayment, refetch } = usePayments();

  const handleProcessPayment = async (paymentId: number) => {
    const result = await processPayment(paymentId);
    if (result.success) {
      toast.success('Payment processed successfully!');
      await refetch();
    } else {
      toast.error(`Failed to process payment: ${result.error}`);
    }
  };

  const handleCancelPayment = async (paymentId: number) => {
    const result = await cancelPayment(paymentId);
    if (result.success) {
      toast.success('Payment cancelled successfully!');
      await refetch();
    } else {
      toast.error(`Failed to cancel payment: ${result.error}`);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Payment Management</h1>
        <p className={styles.subtitle}>
          Process and manage expense payments
        </p>
      </div>

      <PaymentQueue
        payments={payments}
        onProcessPayment={handleProcessPayment}
        onCancelPayment={handleCancelPayment}
      />
    </div>
  );
};

export default PaymentsPage;
