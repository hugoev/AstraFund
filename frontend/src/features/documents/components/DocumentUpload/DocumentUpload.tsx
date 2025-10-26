import React, { useRef, useState } from 'react';
import styles from './DocumentUpload.module.css';
import { apiService } from '/src/api';
import type { DocumentUploadResponse } from '/src/types';

interface DocumentUploadProps {
  grantId?: number;
  onUploadComplete?: (response: DocumentUploadResponse) => void;
  onError?: (error: string) => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  grantId,
  onUploadComplete,
  onError
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<'receipt' | 'contract' | 'invoice' | 'general'>('receipt');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await apiService.uploadDocument(
        selectedFile,
        documentType,
        grantId
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      onUploadComplete?.(response);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>📄 Document Intelligence</h3>
        <p className={styles.subtitle}>
          Upload documents for AI-powered analysis and data extraction
        </p>
      </div>

      <div className={styles.uploadArea}>
        <div
          className={`${styles.dropZone} ${selectedFile ? styles.hasFile : ''}`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={handleFileSelect}
            className={styles.fileInput}
          />
          
          {selectedFile ? (
            <div className={styles.fileInfo}>
              <div className={styles.fileIcon}>📄</div>
              <div className={styles.fileDetails}>
                <div className={styles.fileName}>{selectedFile.name}</div>
                <div className={styles.fileSize}>
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.uploadPrompt}>
              <div className={styles.uploadIcon}>☁️</div>
              <div className={styles.uploadText}>
                <div className={styles.uploadTitle}>Drop files here or click to browse</div>
                <div className={styles.uploadSubtitle}>
                  Supports PDF, JPG, PNG, DOC, DOCX
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.controls}>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value as any)}
            className={styles.documentTypeSelect}
            disabled={isUploading}
          >
            <option value="receipt">🧾 Receipt</option>
            <option value="contract">📋 Contract</option>
            <option value="invoice">📊 Invoice</option>
            <option value="general">📄 General Document</option>
          </select>

          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className={styles.uploadButton}
          >
            {isUploading ? 'Processing...' : 'Upload & Analyze'}
          </button>
        </div>

        {isUploading && (
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className={styles.progressText}>
              AI is analyzing your document... {uploadProgress}%
            </div>
          </div>
        )}
      </div>

      <div className={styles.features}>
        <h4 className={styles.featuresTitle}>🤖 AI-Powered Features</h4>
        <div className={styles.featureList}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🔍</span>
            <span>OCR Text Extraction</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>📊</span>
            <span>Data Structure Analysis</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>✅</span>
            <span>Compliance Checking</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>⚠️</span>
            <span>Risk Assessment</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
