import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePlaidLink as usePlaidLinkOriginal } from 'react-plaid-link';
import { createLinkToken, exchangePublicToken } from '@/lib/plaid';
import { getAuth } from 'firebase/auth';

interface PlaidContextType {
  linkToken: string | null;
  accessToken: string | null;
  ready: boolean;
  initiatePlaidLink: () => void;
  isLoading: boolean;
  error: string | null;
}

const PlaidContext = createContext<PlaidContextType | undefined>(undefined);

export const PlaidProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [initCalled, setInitCalled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isPlaidLoading, setIsPlaidLoading] = useState(true);
  const [hasAccessToken, setHasAccessToken] = useState(false);

  const { data: linkTokenData, refetch: refetchLinkToken } = useQuery({
    queryKey: ['linkToken'],
    queryFn: createLinkToken,
    enabled: false,
  });

  const { data: accessTokenData } = useQuery<string | null>({
    queryKey: ['accessToken'],
    initialData: null,
  });

  const exchangeTokenMutation = useMutation({
    mutationFn: exchangePublicToken,
    onSuccess: () => {
      console.log('PlaidContext: Exchange public token successful');
      queryClient.invalidateQueries({ queryKey: ['accessToken'] });
      queryClient.invalidateQueries({ queryKey: ['accounts', 'transactions', 'investments'] });
      setError(null);
    },
    onError: (error: Error) => {
      console.error('PlaidContext: Error exchanging public token:', error);
      setError(`Failed to exchange public token: ${error.message}`);
    },
  });

  const handleOnSuccess = useCallback(async (public_token: string, metadata: any) => {
    console.log('PlaidContext: Public token received:', public_token);
    console.log('PlaidContext: Metadata received:', metadata);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      const idToken = await user.getIdToken();
      
      const accessToken = await exchangeTokenMutation.mutateAsync({ public_token, idToken });
      console.log('PlaidContext: Exchange public token successful');
      
      queryClient.setQueryData(['accessToken'], accessToken);
      
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['investments'] });
    } catch (error) {
      console.error('PlaidContext: Error exchanging public token:', error);
      setError('Failed to link account. Please try again.');
    }
  }, [exchangeTokenMutation, queryClient]);

  const config = {
    token: linkTokenData ?? null,
    onSuccess: handleOnSuccess,
    onExit: (err: any) => {
      console.log('PlaidContext: Plaid Link exited.');
      if (err != null) {
        console.error('PlaidContext: Exit error:', err);
        setError(`Link exit error: ${err.error_message}`);
      }
    },
  };

  const { open, ready } = usePlaidLinkOriginal(config);

  useEffect(() => {
    if (!linkTokenData && !initCalled) {
      console.log('PlaidContext: Fetching link token...');
      refetchLinkToken().catch((err) => {
        console.error('PlaidContext: Error fetching link token:', err);
        setError(`Failed to fetch link token: ${err.message}`);
      });
      setInitCalled(true);
    }
  }, [initCalled, linkTokenData, refetchLinkToken]);

  const initiatePlaidLink = useCallback(() => {
    console.log('PlaidContext: Initiating Plaid Link...');
    if (ready && linkTokenData) {
      open();
      console.log('PlaidContext: Plaid Link opened.');
    } else {
      console.warn('PlaidContext: Cannot open Plaid Link. Ready:', ready, 'Link Token:', linkTokenData);
      setError('Unable to open Plaid Link. Please try again later.');
    }
  }, [ready, linkTokenData, open]);

  const value: PlaidContextType = {
    linkToken: linkTokenData ?? null,
    accessToken: accessTokenData,
    ready,
    initiatePlaidLink,
    isLoading: exchangeTokenMutation.isPending || !linkTokenData,
    error,
  };

  return <PlaidContext.Provider value={value}>{children}</PlaidContext.Provider>;
};

export const usePlaid = () => {
  const context = useContext(PlaidContext);
  if (context === undefined) {
    throw new Error('usePlaid must be used within a PlaidProvider');
  }
  return context;
}