import { useState, useEffect } from 'react';

export function useErrorMessage(error: unknown): string | null {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else if (typeof error === 'string') {
        setErrorMessage(error);
      } else {
        setErrorMessage('An unknown error occurred');
      }
    } else {
      setErrorMessage(null);
    }
  }, [error]);

  return errorMessage;
}