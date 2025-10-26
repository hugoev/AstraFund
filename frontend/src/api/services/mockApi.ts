import { config } from '../../config';
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
} from '../../types';

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

let mockPayments: Payment[] = [
  {
    id: 1,
    expense_id: 3,
    amount: 1200,
    payment_method: 'bank_transfer',
    payment_reference: 'PAY-ABC12345',
    status: 'completed',
    processed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
];

let nextExpenseId = 4;
let nextApprovalId = 2;
let nextUserId = 4;
let nextGrantId = 4;
let nextPaymentId = 2;

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

  async rejectExpense(expenseId: number, approverId: number): Promise<Approval> {
    await this.simulateDelay();
    const expense = mockExpenses.find((e) => e.id === expenseId);
    if (!expense) {
      throw new Error(`Expense with id ${expenseId} not found`);
    }
    
    expense.status = 'rejected';
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

  // Payment endpoints
  async createPayment(payment: Omit<Payment, 'id' | 'status' | 'created_at'>): Promise<Payment> {
    await this.simulateDelay();
    
    // Verify expense exists and is approved
    const expense = mockExpenses.find((e) => e.id === payment.expense_id);
    if (!expense) {
      throw new Error(`Expense with id ${payment.expense_id} not found`);
    }
    
    if (expense.status !== 'approved') {
      throw new Error('Expense must be approved before payment');
    }
    
    const newPayment: Payment = {
      ...payment,
      id: nextPaymentId++,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    mockPayments.push(newPayment);
    return newPayment;
  }

  async getPayments(): Promise<Payment[]> {
    await this.simulateDelay();
    return [...mockPayments];
  }

  async getExpensePayments(expenseId: number): Promise<Payment[]> {
    await this.simulateDelay();
    return mockPayments.filter((p) => p.expense_id === expenseId);
  }

  async getPendingPayments(): Promise<Payment[]> {
    await this.simulateDelay();
    return mockPayments.filter((p) => p.status === 'pending');
  }

  async processPayment(paymentId: number): Promise<{ message: string; status: string; payment_reference: string }> {
    await this.simulateDelay();
    
    const payment = mockPayments.find((p) => p.id === paymentId);
    if (!payment) {
      throw new Error(`Payment with id ${paymentId} not found`);
    }
    
    if (payment.status !== 'pending') {
      throw new Error('Payment is not in pending status');
    }
    
    // Mock payment processing - simulate success/failure
    const success = Math.random() > 0.1; // 90% success rate
    
    if (success) {
      payment.status = 'completed';
      payment.processed_at = new Date().toISOString();
      payment.payment_reference = `PAY-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
      
      // Update expense status to paid
      const expense = mockExpenses.find((e) => e.id === payment.expense_id);
      if (expense) {
        expense.status = 'paid';
      }
    } else {
      payment.status = 'failed';
      payment.processed_at = new Date().toISOString();
    }
    
    return {
      message: `Payment ${success ? 'completed' : 'failed'} successfully`,
      status: payment.status,
      payment_reference: payment.payment_reference || '',
    };
  }

  async cancelPayment(paymentId: number): Promise<{ message: string }> {
    await this.simulateDelay();
    
    const payment = mockPayments.find((p) => p.id === paymentId);
    if (!payment) {
      throw new Error(`Payment with id ${paymentId} not found`);
    }
    
    if (payment.status !== 'pending') {
      throw new Error('Only pending payments can be cancelled');
    }
    
    payment.status = 'cancelled';
    payment.processed_at = new Date().toISOString();
    
    return { message: 'Payment cancelled successfully' };
  }

  // Approval endpoints
  async createApproval(approval: Omit<Approval, 'id'>): Promise<Approval> {
    await this.simulateDelay();
    const newApproval: Approval = {
      ...approval,
      id: mockApprovals.length + 1,
    };
    mockApprovals.push(newApproval);
    return newApproval;
  }

  async getApprovals(): Promise<Approval[]> {
    await this.simulateDelay();
    return [...mockApprovals];
  }

  async getExpenseApprovals(expenseId: number): Promise<Approval[]> {
    await this.simulateDelay();
    return mockApprovals.filter((a) => a.expense_id === expenseId);
  }

  async chatWithAnalytics(message: string, _context: any): Promise<any> {
    await this.simulateDelay();
    return {
      response: `Mock AI response to: "${message}". Based on the analytics context, here are some insights...`,
      suggestions: [
        "View expense trends",
        "Check compliance rates",
        "Review pending approvals"
      ]
    };
  }

  // Document Intelligence Mock API methods
  async uploadDocument(
    file: File,
    documentType: string,
    _grantId?: number
  ): Promise<DocumentUploadResponse> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockExtractedData = {
      merchant_name: "Sample Store",
      date: "2024-01-15",
      total_amount: 150.00,
      items: [
        { description: "Office Supplies", amount: 100.00 },
        { description: "Software License", amount: 50.00 }
      ],
      tax_amount: 12.00,
      payment_method: "Credit Card",
      receipt_number: "RCP-001"
    };

    return {
      document_id: `doc_${Date.now()}`,
      filename: file.name,
      document_type: documentType,
      extracted_data: mockExtractedData,
      confidence_score: 0.95,
      processing_status: "completed"
    };
  }

  async analyzeDocument(
    documentId: string,
    analysisType: string = 'compliance'
  ): Promise<DocumentAnalysisResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      document_id: documentId,
      analysis_type: analysisType,
      key_terms: ["Office supplies", "Software", "Business expense"],
      compliance_notes: ["Expense appears compliant with grant requirements"],
      risk_score: 0.2,
      recommendations: ["Keep detailed receipts", "Ensure proper categorization"]
    };
  }

  async generateComplianceDocument(grantId: number): Promise<ComplianceDocumentResponse> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      document_id: `compliance_${Date.now()}`,
      grant_id: grantId,
      compliance_summary: "Grant compliance analysis shows 95% compliance rate with all expenses properly categorized and documented.",
      key_requirements: [
        "All expenses must be directly related to grant objectives",
        "Proper documentation required for all purchases",
        "Expenses must be within approved budget categories"
      ],
      compliance_score: 0.95,
      generated_at: new Date().toISOString()
    };
  }

  async getDocument(documentId: string): Promise<Document> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      id: documentId,
      filename: "sample_receipt.pdf",
      document_type: "receipt",
      grant_id: 1,
      extracted_data: {
        merchant_name: "Sample Store",
        total_amount: 150.00
      },
      confidence_score: 0.95,
      processing_status: "completed",
      created_at: new Date().toISOString()
    };
  }

  async getGrantDocuments(grantId: number): Promise<Document[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        id: "doc_1",
        filename: "receipt_1.pdf",
        document_type: "receipt",
        grant_id: grantId,
        extracted_data: { total_amount: 150.00 },
        confidence_score: 0.95,
        processing_status: "completed",
        created_at: new Date().toISOString()
      },
      {
        id: "doc_2",
        filename: "contract_1.pdf",
        document_type: "contract",
        grant_id: grantId,
        extracted_data: { contract_title: "Service Agreement" },
        confidence_score: 0.88,
        processing_status: "completed",
        created_at: new Date().toISOString()
      }
    ];
  }

  // Analytics API methods
  async getAnalyticsOverview(): Promise<any> {
    await this.simulateDelay();
    return {
      totalGrants: 5,
      totalExpenses: 25,
      totalAmount: 125000,
      complianceRate: 0.95,
      pendingApprovals: 3,
      recentActivity: [
        { type: 'expense_approved', description: 'Office supplies approved', amount: 150, date: '2024-01-15' },
        { type: 'grant_created', description: 'New STEM grant created', amount: 50000, date: '2024-01-14' }
      ]
    };
  }

  async getAnalyticsTrends(_days: number = 30): Promise<any> {
    await this.simulateDelay();
    return {
      expenseTrends: [
        { date: '2024-01-01', amount: 1000 },
        { date: '2024-01-02', amount: 1500 },
        { date: '2024-01-03', amount: 800 }
      ],
      complianceTrends: [
        { date: '2024-01-01', rate: 0.95 },
        { date: '2024-01-02', rate: 0.98 },
        { date: '2024-01-03', rate: 0.92 }
      ]
    };
  }
}

export const mockApiService = new MockApiService();

