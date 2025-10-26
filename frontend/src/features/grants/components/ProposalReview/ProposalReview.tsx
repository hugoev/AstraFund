import React, { useState } from 'react';
import styles from './ProposalReview.module.css';
import { apiService } from '/src/api';

interface ProposalReviewProps {
  grantId: number;
  grantName: string;
  onProposalReviewed: (result: any) => void;
}

const ProposalReview: React.FC<ProposalReviewProps> = ({
  grantId,
  grantName,
  onProposalReviewed
}) => {
  const [proposalText, setProposalText] = useState('');
  const [proposalAmount, setProposalAmount] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reviewResult, setReviewResult] = useState<any>(null);

  const handleReview = async () => {
    if (!proposalText.trim() || !proposalAmount.trim()) {
      return;
    }

    setIsAnalyzing(true);
    try {
      // This would call a new API endpoint for proposal review
      const result = await apiService.reviewGrantProposal(
        grantId,
        proposalText,
        parseFloat(proposalAmount)
      );
      setReviewResult(result);
      onProposalReviewed(result);
    } catch (error) {
      console.error('Proposal review failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getComplianceStatus = (result: any) => {
    if (result.compliance_score >= 0.8) return { status: 'COMPLIANT', color: 'compliant' };
    if (result.compliance_score >= 0.6) return { status: 'CONDITIONAL', color: 'conditional' };
    return { status: 'NON-COMPLIANT', color: 'nonCompliant' };
  };

  return (
    <div className={styles.proposalReviewContainer}>
      <div className={styles.header}>
        <div className={styles.icon}>📋</div>
        <h3>Grant Proposal Review</h3>
        <div className={styles.grantInfo}>
          <span>For: {grantName}</span>
        </div>
      </div>

      <div className={styles.form}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Proposal Description</label>
          <textarea
            value={proposalText}
            onChange={(e) => setProposalText(e.target.value)}
            placeholder="Describe the proposed work, deliverables, timeline, and budget breakdown..."
            className={styles.textarea}
            rows={6}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Total Amount ($)</label>
          <input
            type="number"
            value={proposalAmount}
            onChange={(e) => setProposalAmount(e.target.value)}
            placeholder="50000.00"
            step="0.01"
            min="0"
            className={styles.input}
          />
        </div>

        <button
          className={styles.reviewButton}
          onClick={handleReview}
          disabled={isAnalyzing || !proposalText.trim() || !proposalAmount.trim()}
        >
          {isAnalyzing ? 'Analyzing Proposal...' : 'Review Proposal'}
        </button>
      </div>

      {reviewResult && (
        <div className={styles.reviewResult}>
          <div className={styles.resultHeader}>
            <div className={`${styles.complianceStatus} ${styles[getComplianceStatus(reviewResult).color]}`}>
              {getComplianceStatus(reviewResult).status}
            </div>
            <div className={styles.confidenceScore}>
              {Math.round(reviewResult.compliance_score * 100)}% Confidence
            </div>
          </div>

          <div className={styles.analysis}>
            <h4>Co-Pilot Analysis:</h4>
            <p className={styles.analysisText}>{reviewResult.analysis_summary}</p>
          </div>

          {reviewResult.compliance_issues && reviewResult.compliance_issues.length > 0 && (
            <div className={styles.issues}>
              <h4>⚠️ Compliance Issues:</h4>
              <ul>
                {reviewResult.compliance_issues.map((issue: string, index: number) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {reviewResult.recommendations && reviewResult.recommendations.length > 0 && (
            <div className={styles.recommendations}>
              <h4>💡 Recommendations:</h4>
              <ul>
                {reviewResult.recommendations.map((rec: string, index: number) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}

          <div className={styles.actions}>
            {getComplianceStatus(reviewResult).status === 'COMPLIANT' && (
              <button className={styles.approveButton}>
                ✅ Approve Proposal
              </button>
            )}
            {getComplianceStatus(reviewResult).status === 'CONDITIONAL' && (
              <button className={styles.conditionalButton}>
                ⚠️ Request Modifications
              </button>
            )}
            {getComplianceStatus(reviewResult).status === 'NON-COMPLIANT' && (
              <button className={styles.rejectButton}>
                ❌ Reject Proposal
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalReview;
