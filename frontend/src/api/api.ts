import { config } from '../config';
import type {
  Approval,
  ComplianceCheckRequest,
  ComplianceCheckResponse,
  Expense,
  Grant,
  GrantWithExpenses,
  Payment,
  User,
} from '../types';
import { mockApiService } from './services/mockApi';

// Real API Service (for when backend is ready)
class RealApiService {
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
    return this.request<User[]>('/users');
  }

  // Grant endpoints
  async createGrant(grant: Omit<Grant, 'id'>): Promise<Grant> {
    return this.request<Grant>('/grants', {
      method: 'POST',
      body: JSON.stringify(grant),
    });
  }

  async getGrants(): Promise<Grant[]> {
    return this.request<Grant[]>('/grants');
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
    return this.request<Expense[]>('/expenses/queue');
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
    return this.request<Payment[]>('/payments');
  }

  async getExpensePayments(expenseId: number): Promise<Payment[]> {
    return this.request<Payment[]>(`/payments/expense/${expenseId}`);
  }

  async getPendingPayments(): Promise<Payment[]> {
    return this.request<Payment[]>('/payments/pending');
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
}

// Export the appropriate service based on configuration
// Toggle in config.ts: USE_MOCK_API = true/false
const realApiService = new RealApiService();
export const apiService = config.USE_MOCK_API ? mockApiService : realApiService;
