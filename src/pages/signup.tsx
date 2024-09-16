import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { TextInput, PasswordInput, Button, Title, Text, Divider, Paper, Container, Center } from '@mantine/core';
import { GoogleButton } from '@/components/GoogleButton';
import { useUser, registerFn, googleSignInFn } from '@/lib/auth';  // Import registerFn

console.log(`[${new Date().toISOString()}] [AppStart] SignupPage component initialized`);
console.log(`[${new Date().toISOString()}] [AppStart] Environment:`, process.env.NODE_ENV);

export default function SignupPage() {
  console.log(`[${new Date().toISOString()}] [SignupPage] Function called`);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { user, isLoading } = useUser();

  console.log(`[${new Date().toISOString()}] [SignupPage] Initial state:`, { email, password, error, isLoading });

  useEffect(() => {
    console.log(`[${new Date().toISOString()}] [SignupPage] useEffect called with dependencies:`, { user, isLoading });
    if (user && !isLoading) {
      console.log(`[${new Date().toISOString()}] [SignupPage] User authenticated, redirecting to dashboard`);
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  const handleEmailSignup = async (e: React.FormEvent) => {
    console.log(`[${new Date().toISOString()}] [handleEmailSignup] Function called with event:`, e);
    console.time('EmailSignup');
    e.preventDefault();
    setError('');
    try {
      console.log(`[${new Date().toISOString()}] [handleEmailSignup] Attempting to create user with email:`, email);
      await registerFn({ email, password });  // Use registerFn directly
      console.log(`[${new Date().toISOString()}] [handleEmailSignup] User created successfully`);
      router.push('/dashboard');
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] [handleEmailSignup] Error creating account:`, error.message, error.stack);
      setError('Failed to create an account. Please try again.');
    }
    console.timeEnd('EmailSignup');
  };

  const handleGoogleSignup = async () => {
    console.log(`[${new Date().toISOString()}] [handleGoogleSignup] Function called`);
    console.time('GoogleSignup');
    try {
      console.log(`[${new Date().toISOString()}] [handleGoogleSignup] Attempting Google sign-up`);
      await googleSignInFn();
      console.log(`[${new Date().toISOString()}] [handleGoogleSignup] Google sign-up successful`);
      router.push('/dashboard');
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] [handleGoogleSignup] Error during Google sign-up:`, error.message, error.stack);
      setError('Failed to sign up with Google.');
    }
    console.timeEnd('GoogleSignup');
  };

  console.log(`[${new Date().toISOString()}] [SignupPage] Rendering component`);

  return (
    <Center style={{ width: '100vw', height: '100vh' }}>
      <Container size={420}>
        <Title ta="center" fw={900}>
          Create a New Account
        </Title>
        <Text c="dimmed" size="sm" ta="center" mt={5}>
          Already have an account?{' '}
          <Text component="a" href="/login" size="sm" c="blue">
            Log In
          </Text>
        </Text>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <GoogleButton onClick={handleGoogleSignup} fullWidth>
            Sign up with Google
          </GoogleButton>

          <Divider label="Or continue with email" labelPosition="center" my="lg" />

          <form onSubmit={handleEmailSignup}>
            <TextInput
              label="Email"
              placeholder="hello@example.com"
              value={email}
              onChange={(event) => {
                console.log(`[${new Date().toISOString()}] [EmailInput] Email changed:`, event.currentTarget.value);
                setEmail(event.currentTarget.value);
              }}
              required
            />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              value={password}
              onChange={(event) => {
                console.log(`[${new Date().toISOString()}] [PasswordInput] Password changed`);
                setPassword(event.currentTarget.value);
              }}
              required
              mt="md"
            />
            <Button type="submit" fullWidth mt="xl">
              Sign up
            </Button>
          </form>

          {error && <Text c="red" size="sm" mt="sm">{error}</Text>}
        </Paper>
      </Container>
    </Center>
  );
}

console.log(`[${new Date().toISOString()}] [AppExport] SignupPage component exported`);