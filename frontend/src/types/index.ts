export interface User {
  id: number;
  username: string;
  role: string;
  created_at?: string;
}

export interface Grant {
  id: number;
  name: string;
  total_amount: number;
  rules_text: string;
}

export interface GrantWithExpenses extends Grant {
  expenses: Expense[];
}

export interface Expense {
  id: number;
  description: string;
  amount: number;
  grant_id: number;
  submitter_id: number;
  status: string;
  created_at: string;
  ai_compliance_check?: {
    is_compliant: boolean;
    justification: string;
  };
  grant?: {
    id: number;
    name: string;
  };
  submitter?: {
    id: number;
    username: string;
  };
}

export interface Approval {
  id: number;
  expense_id: number;
  approver_id: number;
  timestamp: string;
}

export interface Payment {
  id: number;
  expense_id: number;
  amount: number;
  payment_method: string;
  payment_reference?: string;
  status: string;
  processed_at?: string;
  created_at: string;
}

export interface Document {
  id: string;
  filename: string;
  document_type: 'receipt' | 'contract' | 'invoice' | 'general';
  grant_id?: number;
  extracted_data: Record<string, any>;
  confidence_score: number;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

export interface DocumentUploadResponse {
  document_id: string;
  filename: string;
  document_type: string;
  extracted_data: Record<string, any>;
  confidence_score: number;
  processing_status: string;
}

export interface DocumentAnalysisResponse {
  document_id: string;
  analysis_type: string;
  key_terms: string[];
  compliance_notes: string[];
  risk_score: number;
  recommendations: string[];
}

export interface ComplianceDocumentResponse {
  document_id: string;
  grant_id: number;
  compliance_summary: string;
  key_requirements: string[];
  compliance_score: number;
  generated_at: string;
}

// Grant Proposal Types
export interface GrantProposal {
  id: number;
  title: string;
  description: string;
  requested_amount: number;
  organization_name: string;
  contact_email: string;
  proposal_type: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  ai_compliance_score: number;
  ai_compliance_notes?: string;
  reviewer_id?: number;
  reviewed_at?: string;
  created_at: string;
}

export interface ProposalAnalysisResponse {
  proposal_id: number;
  compliance_score: number;
  compliance_notes: string;
  recommendation: string;
  risk_factors: string[];
  strengths: string[];
}

export interface ComplianceCheckRequest {
  grant_rules: string;
  expense_description: string;
  expense_amount: number;
}

export interface ComplianceCheckResponse {
  is_compliant: boolean;
  justification: string;
}
