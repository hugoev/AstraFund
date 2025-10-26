import React, { useState } from 'react';
import type { Grant } from '../../../../types';
import CoPilotAssistant from '../CoPilotAssistant';
import styles from './ExpenseForm.module.css';

interface ExpenseFormProps {
  grant: Grant;
  onSubmit: (expense: { description: string; amount: number; submitter_id: number }) => void;
  onComplianceCheck: (expense: { description: string; amount: number }) => Promise<{ is_compliant: boolean; justification: string }>;
  currentUserId: number;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ 
  grant, 
  onSubmit, 
  onComplianceCheck, 
  currentUserId 
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [complianceResult, setComplianceResult] = useState<{ is_compliant: boolean; justification: string } | null>(null);

  const handleComplianceCheck = async () => {
    if (!description.trim() || !amount.trim()) {
      alert('Please fill in both description and amount');
      return;
    }

    setIsLoading(true);
    try {
      const result = await onComplianceCheck({
        description: description.trim(),
        amount: parseFloat(amount)
      });
      setComplianceResult(result);
    } catch (error) {
      console.error('Compliance check failed:', error);
      alert('Compliance check failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!complianceResult) {
      alert('Please run compliance check first');
      return;
    }

    onSubmit({
      description: description.trim(),
      amount: parseFloat(amount),
      submitter_id: currentUserId
    });

    // Reset form
    setDescription('');
    setAmount('');
    setComplianceResult(null);
  };

  return (
    <div className={styles.form}>
      <h3 className={styles.title}>Submit New Expense</h3>
      <p className={styles.subtitle}>Grant: {grant.name}</p>
      
      <div className={styles.formGroup}>
        <label className={styles.label}>Expense Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., 10 Raspberry Pi computers for coding workshop"
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Amount ($)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="400.00"
          step="0.01"
          min="0"
          className={styles.input}
        />
      </div>

      {/* Co-Pilot Assistant - Primary Compliance Checker */}
      <CoPilotAssistant
        expenseDescription={description}
        expenseAmount={parseFloat(amount) || 0}
        onSuggestionReceived={(suggestion) => {
          console.log('Co-pilot suggestion:', suggestion);
          // Auto-populate compliance result from co-pilot
          if (suggestion.recommended_grant_id) {
            setComplianceResult({
              is_compliant: suggestion.confidence_score >= 0.6,
              justification: suggestion.compliance_notes
            });
          }
        }}
      />

      {complianceResult && (
        <div className={`${styles.complianceResult} ${complianceResult.is_compliant ? styles.compliant : styles.nonCompliant}`}>
          <div className={styles.status}>
            {complianceResult.is_compliant ? '✅ Compliant' : '❌ Non-Compliant'}
          </div>
          <p className={styles.justification}>{complianceResult.justification}</p>
          {complianceResult.is_compliant && (
            <button onClick={handleSubmit} className={styles.submitButton}>
              Submit for Approval
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpenseForm;
