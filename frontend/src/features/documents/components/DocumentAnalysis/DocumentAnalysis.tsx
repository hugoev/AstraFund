import React, { useState } from 'react';
import styles from './DocumentAnalysis.module.css';
import { apiService } from '/src/api';
import type { Document, DocumentAnalysisResponse } from '/src/types';

interface DocumentAnalysisProps {
  document: Document;
  onAnalysisComplete?: (analysis: DocumentAnalysisResponse) => void;
}

const DocumentAnalysis: React.FC<DocumentAnalysisProps> = ({
  document,
  onAnalysisComplete
}) => {
  const [analysis, setAnalysis] = useState<DocumentAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisType, setAnalysisType] = useState<'compliance' | 'contract' | 'risk'>('compliance');

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await apiService.analyzeDocument(document.id, analysisType);
      setAnalysis(result);
      onAnalysisComplete?.(result);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore < 0.3) return '#4CAF50'; // Low risk - Green
    if (riskScore < 0.7) return '#FF9800'; // Medium risk - Orange
    return '#F44336'; // High risk - Red
  };

  const getRiskLabel = (riskScore: number) => {
    if (riskScore < 0.3) return 'Low Risk';
    if (riskScore < 0.7) return 'Medium Risk';
    return 'High Risk';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return '#4CAF50';
    if (confidence > 0.6) return '#FF9800';
    return '#F44336';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.documentInfo}>
          <div className={styles.documentIcon}>
            {document.document_type === 'receipt' && '🧾'}
            {document.document_type === 'contract' && '📋'}
            {document.document_type === 'invoice' && '📊'}
            {document.document_type === 'general' && '📄'}
          </div>
          <div className={styles.documentDetails}>
            <h3 className={styles.documentName}>{document.filename}</h3>
            <div className={styles.documentMeta}>
              <span className={styles.documentType}>
                {document.document_type.charAt(0).toUpperCase() + document.document_type.slice(1)}
              </span>
              <span className={styles.confidence}>
                Confidence: <span style={{ color: getConfidenceColor(document.confidence_score) }}>
                  {(document.confidence_score * 100).toFixed(1)}%
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className={styles.analysisControls}>
          <select
            value={analysisType}
            onChange={(e) => setAnalysisType(e.target.value as any)}
            className={styles.analysisTypeSelect}
            disabled={isAnalyzing}
          >
            <option value="compliance">✅ Compliance Analysis</option>
            <option value="contract">📋 Contract Analysis</option>
            <option value="risk">⚠️ Risk Analysis</option>
          </select>

          <button
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className={styles.analyzeButton}
          >
            {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
          </button>
        </div>
      </div>

      {analysis && (
        <div className={styles.analysisResults}>
          <div className={styles.analysisHeader}>
            <h4 className={styles.analysisTitle}>
              🤖 AI Analysis Results
            </h4>
            <div className={styles.analysisMeta}>
              <span className={styles.analysisType}>
                {analysis.analysis_type.charAt(0).toUpperCase() + analysis.analysis_type.slice(1)} Analysis
              </span>
              <span 
                className={styles.riskScore}
                style={{ color: getRiskColor(analysis.risk_score) }}
              >
                Risk: {getRiskLabel(analysis.risk_score)}
              </span>
            </div>
          </div>

          <div className={styles.analysisSections}>
            {analysis.key_terms.length > 0 && (
              <div className={styles.analysisSection}>
                <h5 className={styles.sectionTitle}>🔍 Key Terms</h5>
                <div className={styles.termsList}>
                  {analysis.key_terms.map((term, index) => (
                    <span key={index} className={styles.term}>
                      {term}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {analysis.compliance_notes.length > 0 && (
              <div className={styles.analysisSection}>
                <h5 className={styles.sectionTitle}>📋 Compliance Notes</h5>
                <ul className={styles.notesList}>
                  {analysis.compliance_notes.map((note, index) => (
                    <li key={index} className={styles.note}>
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.recommendations.length > 0 && (
              <div className={styles.analysisSection}>
                <h5 className={styles.sectionTitle}>💡 Recommendations</h5>
                <ul className={styles.recommendationsList}>
                  {analysis.recommendations.map((recommendation, index) => (
                    <li key={index} className={styles.recommendation}>
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <div className={styles.extractedData}>
        <h5 className={styles.sectionTitle}>📊 Extracted Data</h5>
        <div className={styles.dataGrid}>
          {Object.entries(document.extracted_data).map(([key, value]) => (
            <div key={key} className={styles.dataItem}>
              <span className={styles.dataKey}>{key.replace(/_/g, ' ')}</span>
              <span className={styles.dataValue}>
                {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentAnalysis;
