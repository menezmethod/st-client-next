import { useEffect } from 'react';
import { useRouter } from 'next/router';

console.log('[AppStart] Home component initialized');
console.log('[AppStart] Environment:', process.env.NODE_ENV);

export default function Home() {
  console.log('[Home] Function called');
  
  const router = useRouter();
  console.log('[Home] Router initialized:', router.pathname);

  useEffect(() => {
    console.log('[Home] useEffect triggered');
    console.time('Navigation Duration');
    console.log('[Home] Initiating navigation to /login');
    
    router.push('/login')
      .then(() => {
        console.timeEnd('Navigation Duration');
        console.log('[Home] Navigation to /login completed');
      })
      .catch((error) => {
        console.timeEnd('Navigation Duration');
        console.error('[Home] Error during navigation:', error.message, error.stack);
      });

    return () => {
      console.log('[Home] Component will unmount');
    };
  }, [router]);

  console.log('[Home] Rendering null');
  return null;
}