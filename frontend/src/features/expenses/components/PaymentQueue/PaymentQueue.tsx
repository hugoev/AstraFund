import React, { useState } from 'react';
import { ConfirmDialog } from '../../../../components/common';
import type { Payment } from '../../../../types';
import styles from './PaymentQueue.module.css';

interface PaymentQueueProps {
  payments: Payment[];
  onProcessPayment: (paymentId: number) => void;
  onCancelPayment: (paymentId: number) => void;
}

const PaymentQueue: React.FC<PaymentQueueProps> = ({ payments, onProcessPayment, onCancelPayment }) => {
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'process' | 'cancel';
    paymentId: number | null;
    paymentReference: string;
  }>({
    isOpen: false,
    type: 'process',
    paymentId: null,
    paymentReference: '',
  });

  const handleProcessClick = (payment: Payment) => {
    setConfirmDialog({
      isOpen: true,
      type: 'process',
      paymentId: payment.id,
      paymentReference: payment.payment_reference || '',
    });
  };

  const handleCancelClick = (payment: Payment) => {
    setConfirmDialog({
      isOpen: true,
      type: 'cancel',
      paymentId: payment.id,
      paymentReference: payment.payment_reference || '',
    });
  };

  const handleConfirm = () => {
    if (confirmDialog.paymentId) {
      if (confirmDialog.type === 'process') {
        onProcessPayment(confirmDialog.paymentId);
      } else {
        onCancelPayment(confirmDialog.paymentId);
      }
    }
    setConfirmDialog({ isOpen: false, type: 'process', paymentId: null, paymentReference: '' });
  };

  const handleCancel = () => {
    setConfirmDialog({ isOpen: false, type: 'process', paymentId: null, paymentReference: '' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return styles.completed;
      case 'failed':
        return styles.failed;
      case 'cancelled':
        return styles.cancelled;
      case 'pending':
        return styles.pending;
      default:
        return styles.pending;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'failed':
        return '❌';
      case 'cancelled':
        return '🚫';
      case 'pending':
        return '⏳';
      default:
        return '⏳';
    }
  };

  if (payments.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>💳</div>
        <h3 className={styles.emptyTitle}>No Payments</h3>
        <p className={styles.emptyText}>No payments have been created yet.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Payment Queue</h2>
      <div className={styles.paymentsList}>
        {payments.map((payment) => (
          <div key={payment.id} className={styles.paymentCard}>
            <div className={styles.header}>
              <div className={styles.paymentInfo}>
                <h4 className={styles.paymentReference}>
                  {payment.payment_reference || `Payment #${payment.id}`}
                </h4>
                <div className={styles.amount}>${payment.amount.toLocaleString()}</div>
              </div>
              <div className={`${styles.status} ${getStatusColor(payment.status)}`}>
                <span className={styles.statusIcon}>{getStatusIcon(payment.status)}</span>
                <span className={styles.statusText}>{payment.status}</span>
              </div>
            </div>

            <div className={styles.details}>
              <div className={styles.detail}>
                <span className={styles.detailLabel}>Method:</span>
                <span className={styles.detailValue}>{payment.payment_method}</span>
              </div>
              <div className={styles.detail}>
                <span className={styles.detailLabel}>Created:</span>
                <span className={styles.detailValue}>
                  {new Date(payment.created_at).toLocaleDateString()}
                </span>
              </div>
              {payment.processed_at && (
                <div className={styles.detail}>
                  <span className={styles.detailLabel}>Processed:</span>
                  <span className={styles.detailValue}>
                    {new Date(payment.processed_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {payment.status === 'pending' && (
              <div className={styles.actions}>
                <button
                  onClick={() => handleProcessClick(payment)}
                  className={styles.processButton}
                >
                  Process Payment
                </button>
                <button
                  onClick={() => handleCancelClick(payment)}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        title={`${confirmDialog.type === 'process' ? 'Process' : 'Cancel'} Payment`}
        message={`Are you sure you want to ${confirmDialog.type} payment ${confirmDialog.paymentReference}?`}
        confirmText={confirmDialog.type === 'process' ? 'Process' : 'Cancel'}
        cancelText="Cancel"
        confirmButtonClass={confirmDialog.type === 'process' ? styles.confirmProcess : styles.confirmCancel}
      />
    </div>
  );
};

export default PaymentQueue;
