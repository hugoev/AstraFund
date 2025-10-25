import type {
  User,
  Grant,
  GrantWithExpenses,
  Expense,
  Approval,
  ComplianceCheckRequest,
  ComplianceCheckResponse,
} from '../types';
import { config } from '../config';

// Mock database
let mockUsers: User[] = [
  { id: 1, username: 'alice', role: 'admin' },
  { id: 2, username: 'bob', role: 'manager' },
  { id: 3, username: 'charlie', role: 'user' },
];

let mockGrants: Grant[] = [
  {
    id: 1,
    name: 'Research Development Grant',
    total_amount: 50000,
    rules_text:
      'This grant supports research and development activities. Eligible expenses include laboratory equipment, research materials, and related personnel costs. Each expense must be directly related to the research project.',
  },
  {
    id: 2,
    name: 'Community Outreach Program',
    total_amount: 25000,
    rules_text:
      'Funds allocated for community engagement and educational programs. Approved expenses include event costs, educational materials, and community space rentals. Marketing expenses limited to 10% of total.',
  },
  {
    id: 3,
    name: 'Technology Innovation Fund',
    total_amount: 75000,
    rules_text:
      'Technology infrastructure and innovation projects. Covers software licenses, hardware purchases, cloud services, and technical training. Must align with digital transformation goals.',
  },
];

let mockExpenses: Expense[] = [
  {
    id: 1,
    description: 'Laboratory microscope for cell analysis',
    amount: 3500,
    grant_id: 1,
    submitter_id: 2,
    status: 'pending',
  },
  {
    id: 2,
    description: 'Community workshop venue rental',
    amount: 800,
    grant_id: 2,
    submitter_id: 3,
    status: 'pending',
  },
  {
    id: 3,
    description: 'Cloud computing services (AWS)',
    amount: 1200,
    grant_id: 3,
    submitter_id: 2,
    status: 'approved',
    ai_compliance_check: {
      is_compliant: true,
      justification: 'Cloud services align with technology infrastructure goals.',
    },
  },
];

let mockApprovals: Approval[] = [
  {
    id: 1,
    expense_id: 3,
    approver_id: 1,
    timestamp: new Date().toISOString(),
  },
];

let nextExpenseId = 4;
let nextApprovalId = 2;
let nextUserId = 4;
let nextGrantId = 4;

// Simulated delay for realistic UX
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock API Service
export class MockApiService {
  private async simulateDelay() {
    await delay(config.MOCK_DELAY);
  }

  // User endpoints
  async createUser(user: Omit<User, 'id'>): Promise<User> {
    await this.simulateDelay();
    const newUser: User = { ...user, id: nextUserId++ };
    mockUsers.push(newUser);
    return newUser;
  }

  async getUsers(): Promise<User[]> {
    await this.simulateDelay();
    return [...mockUsers];
  }

  // Grant endpoints
  async createGrant(grant: Omit<Grant, 'id'>): Promise<Grant> {
    await this.simulateDelay();
    const newGrant: Grant = { ...grant, id: nextGrantId++ };
    mockGrants.push(newGrant);
    return newGrant;
  }

  async getGrants(): Promise<Grant[]> {
    await this.simulateDelay();
    return [...mockGrants];
  }

  async getGrant(grantId: number): Promise<GrantWithExpenses> {
    await this.simulateDelay();
    const grant = mockGrants.find((g) => g.id === grantId);
    if (!grant) {
      throw new Error(`Grant with id ${grantId} not found`);
    }
    const expenses = mockExpenses.filter((e) => e.grant_id === grantId);
    return { ...grant, expenses };
  }

  async createExpense(
    grantId: number,
    expense: Omit<Expense, 'id' | 'status'>
  ): Promise<Expense> {
    await this.simulateDelay();
    
    // Simulate AI compliance check
    const grant = mockGrants.find((g) => g.id === grantId);
    const isCompliant = Math.random() > 0.3; // 70% compliant
    
    const newExpense: Expense = {
      ...expense,
      id: nextExpenseId++,
      grant_id: grantId,
      status: 'pending',
      ai_compliance_check: {
        is_compliant: isCompliant,
        justification: isCompliant
          ? `This expense appears to align with the grant requirements. The ${expense.description.toLowerCase()} is consistent with the stated goals of ${grant?.name || 'the grant'}.`
          : `This expense may not fully comply with grant requirements. Please review the grant rules carefully. The ${expense.description.toLowerCase()} should be evaluated against specific eligibility criteria.`,
      },
    };
    mockExpenses.push(newExpense);
    return newExpense;
  }

  // Expense endpoints
  async getPendingExpenses(): Promise<Expense[]> {
    await this.simulateDelay();
    return mockExpenses.filter((e) => e.status === 'pending');
  }

  async approveExpense(expenseId: number, approverId: number): Promise<Approval> {
    await this.simulateDelay();
    const expense = mockExpenses.find((e) => e.id === expenseId);
    if (!expense) {
      throw new Error(`Expense with id ${expenseId} not found`);
    }
    
    expense.status = 'approved';
    const newApproval: Approval = {
      id: nextApprovalId++,
      expense_id: expenseId,
      approver_id: approverId,
      timestamp: new Date().toISOString(),
    };
    mockApprovals.push(newApproval);
    return newApproval;
  }

  // Compliance check
  async checkCompliance(
    request: ComplianceCheckRequest
  ): Promise<ComplianceCheckResponse> {
    await this.simulateDelay();
    
    // Simple mock logic - in reality, this would call AI service
    const isCompliant = Math.random() > 0.3;
    
    return {
      is_compliant: isCompliant,
      justification: isCompliant
        ? `Based on the grant rules, the expense "${request.expense_description}" for $${request.expense_amount} appears to be compliant. The expense aligns with the stated objectives and falls within acceptable parameters.`
        : `The expense "${request.expense_description}" for $${request.expense_amount} may not fully comply with the grant rules. Further review is recommended to ensure alignment with grant objectives.`,
    };
  }
}

export const mockApiService = new MockApiService();

