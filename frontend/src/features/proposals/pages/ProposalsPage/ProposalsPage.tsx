import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import ProposalCard from '../../components/ProposalCard';
import styles from './ProposalsPage.module.css';
import { apiService } from '/src/api';
import { useAuth } from '/src/contexts/AuthContext';
import type { GrantProposal, ProposalAnalysisResponse } from '/src/types';

const ProposalsPage: React.FC = () => {
  const [proposals, setProposals] = useState<GrantProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [analysis, setAnalysis] = useState<ProposalAnalysisResponse | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadProposals();
  }, [selectedStatus]);

  const loadProposals = async () => {
    try {
      setLoading(true);
      const status = selectedStatus === 'all' ? undefined : selectedStatus;
      const data = await apiService.getProposals(status);
      setProposals(data);
    } catch (error) {
      console.error('Error loading proposals:', error);
      toast.error('Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeProposal = async (proposalId: number) => {
    try {
      toast.loading('Analyzing proposal with AI...', { id: 'analyze' });
      const analysisResult = await apiService.analyzeProposal(proposalId);
      setAnalysis(analysisResult);
      toast.success('Analysis complete!', { id: 'analyze' });
      
      // Reload proposals to get updated AI scores
      await loadProposals();
    } catch (error) {
      console.error('Error analyzing proposal:', error);
      toast.error('Failed to analyze proposal', { id: 'analyze' });
    }
  };

  const handleReviewProposal = async (proposalId: number, decision: string) => {
    try {
      if (!user) return;
      
      toast.loading(`${decision === 'approved' ? 'Approving' : 'Rejecting'} proposal...`, { id: 'review' });
      await apiService.reviewProposal(proposalId, user.id, decision);
      toast.success(`Proposal ${decision} successfully!`, { id: 'review' });
      
      // Reload proposals to get updated status
      await loadProposals();
    } catch (error) {
      console.error('Error reviewing proposal:', error);
      toast.error(`Failed to ${decision} proposal`, { id: 'review' });
    }
  };

  const getStatusCounts = () => {
    const counts = {
      all: proposals.length,
      pending: proposals.filter(p => p.status === 'pending').length,
      under_review: proposals.filter(p => p.status === 'under_review').length,
      approved: proposals.filter(p => p.status === 'approved').length,
      rejected: proposals.filter(p => p.status === 'rejected').length
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading proposals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Grant Proposals</h1>
          <p className={styles.subtitle}>
            Review and analyze incoming grant proposals with AI assistance
          </p>
        </div>
        
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{statusCounts.pending}</div>
            <div className={styles.statLabel}>Pending</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{statusCounts.under_review}</div>
            <div className={styles.statLabel}>Under Review</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{statusCounts.approved}</div>
            <div className={styles.statLabel}>Approved</div>
          </div>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterTabs}>
          {[
            { key: 'all', label: 'All Proposals', count: statusCounts.all },
            { key: 'pending', label: 'Pending', count: statusCounts.pending },
            { key: 'under_review', label: 'Under Review', count: statusCounts.under_review },
            { key: 'approved', label: 'Approved', count: statusCounts.approved },
            { key: 'rejected', label: 'Rejected', count: statusCounts.rejected }
          ].map(tab => (
            <button
              key={tab.key}
              className={`${styles.filterTab} ${selectedStatus === tab.key ? styles.active : ''}`}
              onClick={() => setSelectedStatus(tab.key)}
            >
              {tab.label}
              <span className={styles.count}>({tab.count})</span>
            </button>
          ))}
        </div>
      </div>

      {analysis && (
        <div className={styles.analysisCard}>
          <h3>🤖 AI Analysis Results</h3>
          <div className={styles.analysisContent}>
            <div className={styles.scoreSection}>
              <span className={styles.scoreLabel}>Compliance Score:</span>
              <span className={styles.score}>
                {(analysis.compliance_score * 100).toFixed(0)}%
              </span>
            </div>
            <p className={styles.notes}>{analysis.compliance_notes}</p>
            <div className={styles.recommendation}>
              <strong>Recommendation:</strong> {analysis.recommendation}
            </div>
            {analysis.strengths.length > 0 && (
              <div className={styles.strengths}>
                <strong>Strengths:</strong>
                <ul>
                  {analysis.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.risk_factors.length > 0 && (
              <div className={styles.risks}>
                <strong>Risk Factors:</strong>
                <ul>
                  {analysis.risk_factors.map((risk, index) => (
                    <li key={index}>{risk}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <div className={styles.proposalsList}>
        {proposals.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            <h3>No proposals found</h3>
            <p>No proposals match the current filter criteria.</p>
          </div>
        ) : (
          proposals.map(proposal => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              onAnalyze={handleAnalyzeProposal}
              onReview={handleReviewProposal}
              showActions={user?.role === 'Executive Director' || user?.role === 'Administrator'}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ProposalsPage;
