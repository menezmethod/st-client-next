import axios from 'axios';

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