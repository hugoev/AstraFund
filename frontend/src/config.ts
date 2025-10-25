// Configuration for API endpoints
// Toggle USE_MOCK_API to switch between mock and real backend

export const config = {
  // Set to false when backend is ready
  USE_MOCK_API: true,
  
  // Backend API URL
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  
  // Mock data delay (ms) - simulates network latency
  MOCK_DELAY: 500,
} as const;

