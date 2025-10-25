import React, { useState } from 'react';
import type { Payment } from '../../../../types';
import styles from './PaymentForm.module.css';

interface PaymentFormProps {
  expenseId: number;
  amount: number;
  onSubmit: (payment: Omit<Payment, 'id' | 'status' | 'created_at'>) => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ expenseId, amount, onSubmit, onCancel }) => {
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit({
        expense_id: expenseId,
        amount,
        payment_method: paymentMethod,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>Process Payment</h3>
          <button className={styles.closeButton} onClick={onCancel}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.content}>
            <div className={styles.amountDisplay}>
              <span className={styles.label}>Amount:</span>
              <span className={styles.amount}>${amount.toLocaleString()}</span>
            </div>

            <div className={styles.field}>
              <label htmlFor="paymentMethod" className={styles.label}>
                Payment Method
              </label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className={styles.select}
                required
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="paypal">PayPal</option>
                <option value="check">Check</option>
              </select>
            </div>

            <div className={styles.note}>
              <p className={styles.noteText}>
                This is a mock payment system. No real money will be processed.
              </p>
            </div>
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              onClick={onCancel}
              className={styles.cancelButton}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Process Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;
