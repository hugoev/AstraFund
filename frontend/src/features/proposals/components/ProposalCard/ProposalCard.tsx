import React from 'react';
import styles from './ProposalCard.module.css';
import type { GrantProposal } from '/src/types';

interface ProposalCardProps {
  proposal: GrantProposal;
  onAnalyze?: (proposalId: number) => void;
  onReview?: (proposalId: number, decision: string) => void;
  showActions?: boolean;
}

const ProposalCard: React.FC<ProposalCardProps> = ({
  proposal,
  onAnalyze,
  onReview,
  showActions = true
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return styles.approved;
      case 'rejected': return styles.rejected;
      case 'under_review': return styles.underReview;
      default: return styles.pending;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return '✅';
      case 'rejected': return '❌';
      case 'under_review': return '🔍';
      default: return '⏳';
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>{proposal.title}</h3>
          <div className={styles.meta}>
            <span className={styles.organization}>{proposal.organization_name}</span>
            <span className={styles.type}>{proposal.proposal_type}</span>
          </div>
        </div>
        <div className={styles.amountSection}>
          <div className={styles.amount}>{formatAmount(proposal.requested_amount)}</div>
          <div className={`${styles.status} ${getStatusColor(proposal.status)}`}>
            {getStatusIcon(proposal.status)} {proposal.status.replace('_', ' ')}
          </div>
        </div>
      </div>

      <div className={styles.description}>
        <p>{proposal.description}</p>
      </div>

      {proposal.ai_compliance_score > 0 && (
        <div className={styles.aiAnalysis}>
          <div className={styles.scoreSection}>
            <span className={styles.scoreLabel}>AI Compliance Score:</span>
            <span className={styles.score}>
              {(proposal.ai_compliance_score * 100).toFixed(0)}%
            </span>
          </div>
          {proposal.ai_compliance_notes && (
            <div className={styles.notes}>
              <strong>AI Notes:</strong> {proposal.ai_compliance_notes}
            </div>
          )}
        </div>
      )}

      <div className={styles.footer}>
        <div className={styles.contact}>
          <span className={styles.email}>{proposal.contact_email}</span>
          <span className={styles.date}>
            Submitted: {new Date(proposal.created_at).toLocaleDateString()}
          </span>
        </div>

        {showActions && (
          <div className={styles.actions}>
            {proposal.status === 'pending' && onAnalyze && (
              <button
                className={styles.analyzeButton}
                onClick={() => onAnalyze(proposal.id)}
              >
                🤖 Analyze with AI
              </button>
            )}
            
            {proposal.status === 'under_review' && onReview && (
              <div className={styles.reviewActions}>
                <button
                  className={styles.approveButton}
                  onClick={() => onReview(proposal.id, 'approved')}
                >
                  ✅ Approve
                </button>
                <button
                  className={styles.rejectButton}
                  onClick={() => onReview(proposal.id, 'rejected')}
                >
                  ❌ Reject
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalCard;

