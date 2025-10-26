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
  const [activeMode, setActiveMode] = useState<'upload' | 'text'>('upload');
  const [textInput, setTextInput] = useState('');
  const [selectedGrant, setSelectedGrant] = useState<number | ''>('');
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

  const handleTextSubmit = async () => {
    if (!textInput.trim() || !selectedGrant) {
      toast.error('Please enter expense description and select a grant');
      return;
    }

    setIsProcessing(true);
    try {
      // AI analyzes the text input for compliance
      const aiAnalysis = await apiService.checkCompliance(
        grants.find(g => g.id === selectedGrant)?.rules_text || '',
        textInput,
        0 // Amount will be extracted by AI
      );

      // Create expense with AI analysis
      await apiService.createExpense(selectedGrant, {
        description: textInput,
        amount: 0, // Will be updated after AI analysis
        submitter_id: 1, // Current user
        ai_compliance_check: aiAnalysis
      });

      toast.success('✅ Expense created from text input');
      setTextInput('');
      setSelectedGrant('');
      onExpenseCreated();
    } catch (error) {
      console.error('Error processing text input:', error);
      toast.error('Failed to process text input');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Smart Expense Capture</h3>
        <p>Upload documents or type expenses - AI will handle the rest!</p>
      </div>

      <div className={styles.modeSelector}>
        <button 
          className={`${styles.modeButton} ${activeMode === 'upload' ? styles.active : ''}`}
          onClick={() => setActiveMode('upload')}
        >
          📄 Upload Documents
        </button>
        <button 
          className={`${styles.modeButton} ${activeMode === 'text' ? styles.active : ''}`}
          onClick={() => setActiveMode('text')}
        >
          ✏️ Type Expense
        </button>
      </div>

      {activeMode === 'upload' ? (
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
                <span className={styles.feature}>Auto-extract data</span>
                <span className={styles.feature}>Smart grant allocation</span>
                <span className={styles.feature}>Auto-compliance check</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.textInputArea}>
          <div className={styles.inputGroup}>
            <label htmlFor="grant-select">Select Grant:</label>
            <select 
              id="grant-select"
              value={selectedGrant}
              onChange={(e) => setSelectedGrant(Number(e.target.value))}
              className={styles.grantSelect}
            >
              <option value="">Choose a grant...</option>
              {grants.map(grant => (
                <option key={grant.id} value={grant.id}>
                  {grant.name} (${grant.total_amount.toLocaleString()})
                </option>
              ))}
            </select>
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="expense-description">Expense Description:</label>
            <textarea
              id="expense-description"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Describe your expense (e.g., 'Office supplies for STEM program - $150')"
              className={styles.textArea}
              rows={4}
            />
          </div>
          
          <button 
            onClick={handleTextSubmit}
            disabled={isProcessing || !textInput.trim() || !selectedGrant}
            className={styles.submitButton}
          >
            {isProcessing ? 'Processing...' : 'Create Expense'}
          </button>
        </div>
      )}

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

