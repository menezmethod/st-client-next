import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useUser } from '../lib/auth';

export function useRequireAuth(redirectUrl = '/login') {
  const { data: user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(redirectUrl);
    }
  }, [user, isLoading, redirectUrl, router]);

  return { user, isLoading };
}