import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import styles from './BudgetOptimizer.module.css';
import { apiService } from '/src/api';
import type { Grant } from '/src/types';

interface BudgetOptimizerProps {
  grants: Grant[];
  onOptimizationApplied: () => void;
}

interface OptimizationSuggestion {
  grant_id: number;
  grant_name: string;
  current_spent: number;
  total_budget: number;
  remaining: number;
  suggestions: {
    type: 'increase' | 'decrease' | 'reallocate';
    amount: number;
    reason: string;
    impact: string;
  }[];
  risk_level: 'low' | 'medium' | 'high';
  confidence_score: number;
}

const BudgetOptimizer: React.FC<BudgetOptimizerProps> = ({
  grants,
  onOptimizationApplied
}) => {
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedGrant, setSelectedGrant] = useState<number | null>(null);

  useEffect(() => {
    analyzeBudgets();
  }, [grants]);

  const analyzeBudgets = async () => {
    setIsAnalyzing(true);
    try {
      // Get AI budget optimization suggestions
      const optimizationData = await apiService.getBudgetOptimization();
      setSuggestions(optimizationData);
    } catch (error) {
      console.error('Error analyzing budgets:', error);
      toast.error('Failed to analyze budgets');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyOptimization = async (grantId: number, suggestion: any) => {
    try {
      await apiService.applyBudgetOptimization(grantId, suggestion);
      toast.success('Budget optimization applied!');
      onOptimizationApplied();
      await analyzeBudgets(); // Refresh suggestions
    } catch (error) {
      console.error('Error applying optimization:', error);
      toast.error('Failed to apply optimization');
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return styles.highRisk;
      case 'medium': return styles.mediumRisk;
      default: return styles.lowRisk;
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      default: return '🟢';
    }
  };

  if (isAnalyzing) {
    return (
      <div className={styles.container}>
        <div className={styles.analyzing}>
          <div className={styles.spinner}></div>
          <p>AI is analyzing your budgets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>🎯 AI Budget Optimizer</h3>
        <p>Smart recommendations to maximize your grant impact</p>
        <button 
          className={styles.refreshButton}
          onClick={analyzeBudgets}
        >
          🔄 Refresh Analysis
        </button>
      </div>

      <div className={styles.suggestions}>
        {suggestions.map((suggestion) => (
          <div key={suggestion.grant_id} className={styles.suggestionCard}>
            <div className={styles.cardHeader}>
              <div className={styles.grantInfo}>
                <h4>{suggestion.grant_name}</h4>
                <div className={styles.budgetInfo}>
                  <span className={styles.spent}>
                    Spent: ${suggestion.current_spent.toLocaleString()}
                  </span>
                  <span className={styles.remaining}>
                    Remaining: ${suggestion.remaining.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className={styles.riskIndicator}>
                <span className={`${styles.riskBadge} ${getRiskColor(suggestion.risk_level)}`}>
                  {getRiskIcon(suggestion.risk_level)} {suggestion.risk_level.toUpperCase()} RISK
                </span>
                <span className={styles.confidence}>
                  {(suggestion.confidence_score * 100).toFixed(0)}% confidence
                </span>
              </div>
            </div>

            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ 
                  width: `${(suggestion.current_spent / suggestion.total_budget) * 100}%` 
                }}
              ></div>
            </div>

            <div className={styles.suggestionsList}>
              {suggestion.suggestions.map((s, index) => (
                <div key={index} className={styles.suggestionItem}>
                  <div className={styles.suggestionHeader}>
                    <span className={styles.suggestionType}>
                      {s.type === 'increase' ? '📈' : s.type === 'decrease' ? '📉' : '🔄'} 
                      {s.type.toUpperCase()}
                    </span>
                    <span className={styles.suggestionAmount}>
                      ${Math.abs(s.amount).toLocaleString()}
                    </span>
                  </div>
                  <p className={styles.suggestionReason}>{s.reason}</p>
                  <p className={styles.suggestionImpact}>{s.impact}</p>
                  
                  <div className={styles.suggestionActions}>
                    <button 
                      className={styles.applyButton}
                      onClick={() => applyOptimization(suggestion.grant_id, s)}
                    >
                      ✅ Apply
                    </button>
                    <button 
                      className={styles.dismissButton}
                      onClick={() => {/* Dismiss suggestion */}}
                    >
                      ❌ Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {suggestions.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🎯</div>
          <h4>No optimizations needed</h4>
          <p>Your budgets are well-balanced! AI will monitor for new opportunities.</p>
        </div>
      )}
    </div>
  );
};

export default BudgetOptimizer;

