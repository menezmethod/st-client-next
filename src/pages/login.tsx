import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { TextInput, PasswordInput, Button, Box, Title, Text, Divider, Paper, Container, Center } from '@mantine/core';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { GoogleButton } from '../components/GoogleButton';
import { useUser } from '../lib/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (user && !isLoading) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The user object will be updated automatically by the useUser hook
    } catch (error) {
      setError('Failed to log in with email and password');
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // The user object will be updated automatically by the useUser hook
    } catch (error) {
      setError('Failed to log in with Google');
    }
  };

  return (
    <Center style={{ width: '100vw', height: '100vh' }}>
      <Container size={420}>
        <Title ta="center" fw={900}>
          Welcome back!
        </Title>
        <Text c="dimmed" size="sm" ta="center" mt={5}>
          Do not have an account yet?{' '}
          <Text component="a" href="/signup" size="sm" c="blue">
            Create account
          </Text>
        </Text>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <GoogleButton onClick={handleGoogleSignIn} fullWidth>
            Sign in with Google
          </GoogleButton>

          <Divider label="Or continue with email" labelPosition="center" my="lg" />

          <form onSubmit={handleEmailPasswordSubmit}>
            <TextInput
              label="Email"
              placeholder="hello@example.com"
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
              required
            />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
              required
              mt="md"
            />
            <Button type="submit" fullWidth mt="xl">
              Sign in
            </Button>
          </form>

          {error && <Text color="red" size="sm" mt="sm">{error}</Text>}
        </Paper>
      </Container>
    </Center>
  );
}