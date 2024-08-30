import { ReactNode } from 'react';
import { AuthLoader } from '../lib/auth';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <AuthLoader
      renderLoading={() => <div>Loading...</div>}
      renderUnauthenticated={() => <div>Please log in</div>}
    >
      {children}
    </AuthLoader>
  );
}