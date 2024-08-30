import axios from 'axios';
import { Account } from '@/types/account';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Add request interceptor for authentication
apiClient.interceptors.request.use((config) => {
  // Add auth token from Firebase if available
  // const token = await firebase.auth().currentUser?.getIdToken();
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }
  return config;
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors (e.g., show toast notification)
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default apiClient;

// Mock data for accounts
const mockAccounts: Account[] = [
  {
    id: '1',
    name: 'Checking Account',
    type: 'depository',
    subtype: 'checking',
    balances: { current: 2500.75 }
  },
  {
    id: '2',
    name: 'Savings Account',
    type: 'depository',
    subtype: 'savings',
    balances: { current: 10000.00 }
  },
  {
    id: '3',
    name: 'Credit Card',
    type: 'credit',
    subtype: 'credit card',
    balances: { current: -450.25 }
  }
];

export const getAccounts = async (): Promise<Account[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // For now, return mock data
  // TODO: Replace with actual API call when endpoint is available
  return mockAccounts;
  
  // Commented out actual API call for now
  // const response = await axiosInstance.get('/v1/accounts');
  // return response.data;
};