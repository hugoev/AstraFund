import React, { useState } from 'react';
import styles from './GrantForm.module.css';
import { ConfirmDialog } from '/src/components/common';

interface GrantFormProps {
  onSubmit: (grant: { name: string; total_amount: number; rules_text: string }) => void;
  onCancel: () => void;
}

const GrantForm: React.FC<GrantFormProps> = ({ onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [rulesText, setRulesText] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && totalAmount && rulesText.trim()) {
      setShowConfirm(true);
    }
  };

  const handleConfirm = () => {
    onSubmit({
      name: name.trim(),
      total_amount: parseFloat(totalAmount),
      rules_text: rulesText.trim()
    });
    setShowConfirm(false);
  };

  const isFormValid = name.trim() && totalAmount && rulesText.trim();

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Create New Grant</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Grant Name
            </label>
            <input
              id="name"
              type="text"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter grant name"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="totalAmount" className={styles.label}>
              Total Amount ($)
            </label>
            <input
              id="totalAmount"
              type="number"
              className={styles.input}
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="Enter total amount"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="rulesText" className={styles.label}>
              Grant Rules & Guidelines
            </label>
            <textarea
              id="rulesText"
              className={styles.textarea}
              value={rulesText}
              onChange={(e) => setRulesText(e.target.value)}
              placeholder="Enter detailed grant rules and guidelines..."
              rows={6}
              required
            />
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={onCancel}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={!isFormValid}
            >
              Create Grant
            </button>
          </div>
        </form>

        <ConfirmDialog
          isOpen={showConfirm}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
          title="Create Grant"
          message={`Are you sure you want to create grant "${name}" with a total amount of $${parseFloat(totalAmount).toLocaleString()}?`}
          confirmText="Create"
          cancelText="Back"
          confirmButtonClass={styles.confirmCreate}
        />
      </div>
    </div>
  );
};

export default GrantForm;
