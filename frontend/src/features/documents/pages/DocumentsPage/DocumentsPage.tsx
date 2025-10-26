import React, { useEffect, useState } from 'react';
import ComplianceGenerator from '../../components/ComplianceGenerator';
import DocumentAnalysis from '../../components/DocumentAnalysis';
import DocumentUpload from '../../components/DocumentUpload';
import styles from './DocumentsPage.module.css';
import { apiService } from '/src/api';
import { ErrorMessage, LoadingSpinner } from '/src/components/common';
import type { Document, DocumentAnalysisResponse, DocumentUploadResponse } from '/src/types';

interface DocumentsPageProps {
  grantId?: number;
  grantName?: string;
}

const DocumentsPage: React.FC<DocumentsPageProps> = ({
  grantId,
  grantName = 'Selected Grant'
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [_analysis, _setAnalysis] = useState<DocumentAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'analysis' | 'compliance'>('upload');

  useEffect(() => {
    if (grantId) {
      loadDocuments();
    }
  }, [grantId]);

  const loadDocuments = async () => {
    if (!grantId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const docs = await apiService.getGrantDocuments(grantId);
      setDocuments(docs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadComplete = (response: DocumentUploadResponse) => {
    // Add the new document to the list
    const newDocument: Document = {
      id: response.document_id,
      filename: response.filename,
      document_type: response.document_type as any,
      grant_id: grantId,
      extracted_data: response.extracted_data,
      confidence_score: response.confidence_score,
      processing_status: response.processing_status as 'pending' | 'processing' | 'completed' | 'failed',
      created_at: new Date().toISOString()
    };
    
    setDocuments(prev => [newDocument, ...prev]);
    setSelectedDocument(newDocument);
    setActiveTab('analysis');
  };

  const handleAnalysisComplete = (analysisResult: DocumentAnalysisResponse) => {
    _setAnalysis(analysisResult);
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'receipt': return '🧾';
      case 'contract': return '📋';
      case 'invoice': return '📊';
      default: return '📄';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'processing': return '#FF9800';
      case 'failed': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>📄 Document Intelligence</h1>
          <p className={styles.subtitle}>
            AI-powered document analysis and compliance reporting
            {grantId && ` for ${grantName}`}
          </p>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'upload' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          📤 Upload Documents
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'analysis' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('analysis')}
          disabled={!selectedDocument}
        >
          🔍 Analyze Documents
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'compliance' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('compliance')}
          disabled={!grantId}
        >
          📋 Generate Reports
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'upload' && (
          <div className={styles.tabContent}>
            <DocumentUpload
              grantId={grantId}
              onUploadComplete={handleUploadComplete}
              onError={setError}
            />
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className={styles.tabContent}>
            {isLoading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : documents.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📄</div>
                <h3 className={styles.emptyTitle}>No Documents Found</h3>
                <p className={styles.emptySubtitle}>
                  Upload documents to get started with AI analysis
                </p>
              </div>
            ) : (
              <div className={styles.analysisContainer}>
                <div className={styles.documentList}>
                  <h3 className={styles.sectionTitle}>📁 Available Documents</h3>
                  <div className={styles.documents}>
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className={`${styles.documentCard} ${
                          selectedDocument?.id === doc.id ? styles.selectedDocument : ''
                        }`}
                        onClick={() => setSelectedDocument(doc)}
                      >
                        <div className={styles.documentIcon}>
                          {getDocumentIcon(doc.document_type)}
                        </div>
                        <div className={styles.documentInfo}>
                          <div className={styles.documentName}>{doc.filename}</div>
                          <div className={styles.documentMeta}>
                            <span className={styles.documentType}>
                              {doc.document_type.charAt(0).toUpperCase() + doc.document_type.slice(1)}
                            </span>
                            <span 
                              className={styles.status}
                              style={{ color: getStatusColor(doc.processing_status) }}
                            >
                              {doc.processing_status}
                            </span>
                            <span className={styles.confidence}>
                              {(doc.confidence_score * 100).toFixed(1)}% confidence
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedDocument && (
                  <div className={styles.analysisPanel}>
                    <DocumentAnalysis
                      document={selectedDocument}
                      onAnalysisComplete={handleAnalysisComplete}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'compliance' && grantId && (
          <div className={styles.tabContent}>
            <ComplianceGenerator
              grantId={grantId}
              grantName={grantName}
              onGenerateComplete={(doc) => {
                console.log('Compliance document generated:', doc);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsPage;
