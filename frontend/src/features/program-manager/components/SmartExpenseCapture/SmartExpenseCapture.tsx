import React, { useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import styles from './SmartExpenseCapture.module.css';
import { apiService } from '/src/api';
import type { Grant } from '/src/types';

interface SmartExpenseCaptureProps {
  grants: Grant[];
  onExpenseCreated: () => void;
}

const SmartExpenseCapture: React.FC<SmartExpenseCaptureProps> = ({
  grants,
  onExpenseCreated
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList) => {
    if (files.length === 0) return;

    setIsProcessing(true);
    try {
      for (const file of Array.from(files)) {
        // AI processes the receipt/document
        const aiAnalysis = await apiService.analyzeDocument(file, 'receipt');
        
        // AI suggests the best grant allocation
        const grantSuggestion = await apiService.suggestExpenseAllocation(
          aiAnalysis.extracted_data.description || file.name,
          aiAnalysis.extracted_data.total_amount || 0
        );

        // Auto-create expense with AI suggestions
        if (grantSuggestion.recommended_grant_id) {
          await apiService.createExpense(grantSuggestion.recommended_grant_id, {
            description: aiAnalysis.extracted_data.description || file.name,
            amount: aiAnalysis.extracted_data.total_amount || 0,
            submitter_id: 1, // Current user
            ai_compliance_check: {
              is_compliant: grantSuggestion.confidence_score >= 0.6,
              justification: grantSuggestion.compliance_notes
            }
          });

          toast.success(`✅ Auto-created expense: ${aiAnalysis.extracted_data.description}`);
        }
      }
      
      onExpenseCreated();
    } catch (error) {
      console.error('Error processing files:', error);
      toast.error('Failed to process documents');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>🤖 Smart Expense Capture</h3>
        <p>Drop receipts, invoices, or documents - AI will handle the rest!</p>
      </div>

      <div
        className={`${styles.dropZone} ${dragActive ? styles.dragActive : ''} ${isProcessing ? styles.processing : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
        
        {isProcessing ? (
          <div className={styles.processingContent}>
            <div className={styles.spinner}></div>
            <p>AI is processing your documents...</p>
          </div>
        ) : (
          <div className={styles.dropContent}>
            <div className={styles.icon}>📄</div>
            <h4>Drop files here or click to upload</h4>
            <p>Supports: PDF, JPG, PNG, DOC, DOCX</p>
            <div className={styles.features}>
              <span className={styles.feature}>✨ Auto-extract data</span>
              <span className={styles.feature}>🎯 Smart grant allocation</span>
              <span className={styles.feature}>✅ Auto-compliance check</span>
            </div>
          </div>
        )}
      </div>

      <div className={styles.quickActions}>
        <h4>Quick Actions</h4>
        <div className={styles.actionButtons}>
          <button 
            className={styles.actionButton}
            onClick={() => handleFileInput({ target: { files: null } } as any)}
          >
            📷 Take Photo
          </button>
          <button 
            className={styles.actionButton}
            onClick={() => handleFileInput({ target: { files: null } } as any)}
          >
            📧 Email Import
          </button>
          <button 
            className={styles.actionButton}
            onClick={() => handleFileInput({ target: { files: null } } as any)}
          >
            🔗 Link Import
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartExpenseCapture;
