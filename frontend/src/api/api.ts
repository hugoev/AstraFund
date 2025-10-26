import { config } from '../config';
import type {
  Approval,
  ComplianceCheckRequest,
  ComplianceCheckResponse,
  ComplianceDocumentResponse,
  Document,
  DocumentAnalysisResponse,
  DocumentUploadResponse,
  Expense,
  Grant,
  GrantWithExpenses,
  Payment,
  User,
} from '../types';
import { mockApiService } from './services/mockApi';

// Real API Service (for when backend is ready)
class RealApiService {
  public baseUrl: string;

  constructor() {
    this.baseUrl = config.API_BASE_URL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${config.API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // User endpoints
  async createUser(user: Omit<User, 'id'>): Promise<User> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users/');
  }

  async getUser(userId: number): Promise<User> {
    return this.request<User>(`/users/${userId}`);
  }

  // Grant endpoints
  async createGrant(grant: Omit<Grant, 'id'>): Promise<Grant> {
    return this.request<Grant>('/grants', {
      method: 'POST',
      body: JSON.stringify(grant),
    });
  }

  async getGrants(): Promise<Grant[]> {
    return this.request<Grant[]>('/grants/');
  }

  async getGrant(grantId: number): Promise<GrantWithExpenses> {
    return this.request<GrantWithExpenses>(`/grants/${grantId}`);
  }

  async createExpense(
    grantId: number,
    expense: Omit<Expense, 'id' | 'status'>
  ): Promise<Expense> {
    return this.request<Expense>(`/grants/${grantId}/expenses`, {
      method: 'POST',
      body: JSON.stringify(expense),
    });
  }

  // Expense endpoints
  async getPendingExpenses(): Promise<Expense[]> {
    return this.request<Expense[]>('/expenses/queue/');
  }

  async approveExpense(expenseId: number, approverId: number): Promise<Approval> {
    return this.request<Approval>(`/expenses/${expenseId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ approver_id: approverId }),
    });
  }

  async rejectExpense(expenseId: number, approverId: number): Promise<Approval> {
    return this.request<Approval>(`/expenses/${expenseId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ approver_id: approverId }),
    });
  }

  // Compliance check
  async checkCompliance(request: ComplianceCheckRequest): Promise<ComplianceCheckResponse> {
    return this.request<ComplianceCheckResponse>('/check_compliance', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Payment endpoints
  async createPayment(payment: Omit<Payment, 'id' | 'status' | 'created_at'>): Promise<Payment> {
    return this.request<Payment>('/payments', {
      method: 'POST',
      body: JSON.stringify(payment),
    });
  }

  async getPayments(): Promise<Payment[]> {
    return this.request<Payment[]>('/payments/');
  }

  async getExpensePayments(expenseId: number): Promise<Payment[]> {
    return this.request<Payment[]>(`/payments/expense/${expenseId}`);
  }

  async getPendingPayments(): Promise<Payment[]> {
    return this.request<Payment[]>('/payments/pending/');
  }

  async processPayment(paymentId: number): Promise<{ message: string; status: string; payment_reference: string }> {
    return this.request<{ message: string; status: string; payment_reference: string }>(`/payments/${paymentId}/process`, {
      method: 'POST',
    });
  }

  async cancelPayment(paymentId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/payments/${paymentId}/cancel`, {
      method: 'POST',
    });
  }

  // Approval endpoints
  async createApproval(approval: Omit<Approval, 'id'>): Promise<Approval> {
    return this.request<Approval>('/approvals', {
      method: 'POST',
      body: JSON.stringify(approval),
    });
  }

  async getApprovals(): Promise<Approval[]> {
    return this.request<Approval[]>('/approvals/');
  }

  async getExpenseApprovals(expenseId: number): Promise<Approval[]> {
    return this.request<Approval[]>(`/approvals/expense/${expenseId}`);
  }

  // Analytics methods
  async getAnalyticsOverview(): Promise<any> {
    const response = await this.request<any>('/analytics/overview');
    return response;
  }

  async getAnalyticsTrends(days: number = 30): Promise<any> {
    const response = await this.request<any>(`/analytics/trends?days=${days}`);
    return response;
  }

  async getGrantAnalytics(grantId: number): Promise<any> {
    const response = await this.request<any>(`/analytics/grants/${grantId}/analytics`);
    return response;
  }

  async getUserAnalytics(userId: number): Promise<any> {
    const response = await this.request<any>(`/analytics/users/${userId}/analytics`);
    return response;
  }

  // Chatbot methods
  async chatWithAnalytics(message: string, context?: any): Promise<any> {
    const response = await this.request<any>('/chatbot/chat', {
      method: 'POST',
      body: JSON.stringify({ message, context }),
    });
    return response;
  }

  async getAIInsights(): Promise<any> {
    const response = await this.request<any>('/chatbot/insights');
    return response;
  }

  // Document Intelligence API methods
  async uploadDocument(
    file: File,
    documentType: string,
    grantId?: number
  ): Promise<DocumentUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    if (grantId) {
      formData.append('grant_id', grantId.toString());
    }

    const response = await fetch(`${this.baseUrl}/documents/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async analyzeDocument(
    documentId: string,
    analysisType: string = 'compliance'
  ): Promise<DocumentAnalysisResponse> {
    const response = await this.request<DocumentAnalysisResponse>(`/documents/analyze/${documentId}?analysis_type=${analysisType}`);
    return response;
  }

  async generateComplianceDocument(grantId: number): Promise<ComplianceDocumentResponse> {
    const response = await this.request<ComplianceDocumentResponse>(`/documents/generate-compliance/${grantId}`, {
      method: 'POST',
    });
    return response;
  }

  async getDocument(documentId: string): Promise<Document> {
    const response = await this.request<Document>(`/documents/${documentId}`);
    return response;
  }

  async getGrantDocuments(grantId: number): Promise<Document[]> {
    const response = await this.request<Document[]>(`/documents/grant/${grantId}`);
    return response;
  }

  // Co-Pilot API methods
  async suggestExpenseAllocation(description: string, amount: number): Promise<any> {
    const response = await this.request('/expenses/copilot/suggest-allocation', {
      method: 'POST',
      body: JSON.stringify({
        expense_description: description,
        expense_amount: amount
      })
    });
    return response;
  }

  async reviewGrantProposal(grantId: number, proposalText: string, proposalAmount: number): Promise<any> {
    const response = await this.request(`/grants/${grantId}/review-proposal`, {
      method: 'POST',
      body: JSON.stringify({
        proposal_text: proposalText,
        proposal_amount: proposalAmount
      })
    });
    return response;
  }
}

// Export the appropriate service based on configuration
// Toggle in config.ts: USE_MOCK_API = true/false
const realApiService = new RealApiService();
export const apiService = config.USE_MOCK_API ? mockApiService : realApiService;
