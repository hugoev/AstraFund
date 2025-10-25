export interface User {
  id: number;
  username: string;
  role: string;
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
  ai_compliance_check?: {
    is_compliant: boolean;
    justification: string;
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

export interface ComplianceCheckRequest {
  grant_rules: string;
  expense_description: string;
  expense_amount: number;
}

export interface ComplianceCheckResponse {
  is_compliant: boolean;
  justification: string;
}
