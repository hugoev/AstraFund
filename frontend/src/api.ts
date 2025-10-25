import {
    Approval,
    ComplianceCheckRequest,
    ComplianceCheckResponse,
    Expense,
    Grant,
    GrantWithExpenses,
    User
} from './types';

const API_BASE_URL = 'http://localhost:8000';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
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

  async createExpense(grantId: number, expense: Omit<Expense, 'id' | 'status'>): Promise<Expense> {
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

  // Compliance check
  async checkCompliance(request: ComplianceCheckRequest): Promise<ComplianceCheckResponse> {
    return this.request<ComplianceCheckResponse>('/check_compliance', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}

export const apiService = new ApiService();
