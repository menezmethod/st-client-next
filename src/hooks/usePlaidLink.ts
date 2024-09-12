import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePlaidLink as usePlaidLinkOriginal } from 'react-plaid-link';
import { createLinkToken, exchangePublicToken } from '../lib/plaid';

export function usePlaidLink() {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { refetch: refetchLinkToken } = useQuery({
    queryKey: ['linkToken'],
    queryFn: createLinkToken,
    enabled: false,
  });

  const exchangeTokenMutation = useMutation({
    mutationFn: exchangePublicToken,
    onSuccess: (token: string) => {
      console.log('Access token received:', token);
      queryClient.setQueryData(['accessToken'], token);
      queryClient.invalidateQueries({ queryKey: ['accounts', 'transactions', 'investments'] });
    },
    onError: (err: unknown) => {
      console.error('Failed to exchange public token:', err);
    },
  });

  const onSuccess = useCallback((public_token: string, metadata: any) => {
    console.log('Link successful', metadata);
    exchangeTokenMutation.mutate(public_token);
  }, [exchangeTokenMutation]);

  const onExit = useCallback((err: any, metadata: any) => {
    console.log('Link exit', err, metadata);
  }, []);

  const config = {
    token: linkToken,
    onSuccess,
    onExit,
  };

  const { open, ready } = usePlaidLinkOriginal(config);

  const initiatePlaidLink = useCallback(async () => {
    if (!linkToken) {
      const result = await refetchLinkToken();
      if (result.isSuccess && result.data) {
        setLinkToken(result.data);
      }
    }
    if (ready && linkToken) {
      open();
    }
  }, [linkToken, ready, open, refetchLinkToken]);

  return {
    initiatePlaidLink,
    isLoading: exchangeTokenMutation.isPending,
  };
}