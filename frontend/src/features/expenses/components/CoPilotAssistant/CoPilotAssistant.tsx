import React, { useState } from 'react';
import styles from './CoPilotAssistant.module.css';
import { apiService } from '/src/api';

interface CoPilotAssistantProps {
  expenseDescription: string;
  expenseAmount: number;
  onSuggestionReceived: (suggestion: any) => void;
}

const CoPilotAssistant: React.FC<CoPilotAssistantProps> = ({
  expenseDescription,
  expenseAmount,
  onSuggestionReceived
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestion, setSuggestion] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleAnalyze = async () => {
    if (!expenseDescription.trim() || expenseAmount <= 0) {
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysis = await apiService.suggestExpenseAllocation(
        expenseDescription,
        expenseAmount
      );
      setSuggestion(analysis);
      onSuggestionReceived(analysis);
    } catch (error) {
      console.error('Co-pilot analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return styles.highConfidence;
    if (score >= 0.6) return styles.mediumConfidence;
    return styles.lowConfidence;
  };

  const getConfidenceText = (score: number) => {
    if (score >= 0.8) return 'High Confidence';
    if (score >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <div className={styles.copilotContainer}>
      <div className={styles.header}>
        <div className={styles.icon}>🤖</div>
        <h3>AstraFund Co-Pilot</h3>
        <button
          className={styles.analyzeButton}
          onClick={handleAnalyze}
          disabled={isAnalyzing || !expenseDescription.trim() || expenseAmount <= 0}
        >
          {isAnalyzing ? 'Analyzing...' : 'Check Compliance'}
        </button>
      </div>

      {suggestion && (
        <div className={styles.suggestionCard}>
          <div className={styles.suggestionHeader}>
            <div className={styles.confidence}>
              <span className={`${styles.confidenceBadge} ${getConfidenceColor(suggestion.confidence_score)}`}>
                {getConfidenceText(suggestion.confidence_score)}
              </span>
              <span className={styles.confidenceScore}>
                {Math.round(suggestion.confidence_score * 100)}%
              </span>
            </div>
            <button
              className={styles.toggleButton}
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>

          <div className={styles.mainSuggestion}>
            <div className={styles.complianceStatus}>
              {suggestion.confidence_score >= 0.6 ? (
                <span className={styles.compliant}>✅ COMPLIANT</span>
              ) : (
                <span className={styles.nonCompliant}>❌ NON-COMPLIANT</span>
              )}
            </div>
            <div className={styles.recommendation}>
              <strong>Recommended Grant:</strong> Grant #{suggestion.recommended_grant_id}
            </div>
            <div className={styles.complianceNotes}>
              {suggestion.compliance_notes}
            </div>
          </div>

          {showDetails && (
            <div className={styles.details}>
              {suggestion.alternatives && suggestion.alternatives.length > 0 && (
                <div className={styles.alternatives}>
                  <h4>Alternative Approaches:</h4>
                  <ul>
                    {suggestion.alternatives.map((alt: string, index: number) => (
                      <li key={index}>{alt}</li>
                    ))}
                  </ul>
                </div>
              )}

              {suggestion.warnings && suggestion.warnings.length > 0 && (
                <div className={styles.warnings}>
                  <h4>⚠️ Warnings:</h4>
                  <ul>
                    {suggestion.warnings.map((warning: string, index: number) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CoPilotAssistant;
