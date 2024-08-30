import { useState } from 'react';
import { useRouter } from 'next/router';
import { TextInput, PasswordInput, Button, Box, Title, Text, Divider, Paper, Container, Center } from '@mantine/core';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { GoogleButton } from '../components/GoogleButton';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (error) {
      setError('Failed to create an account. Please try again.');
    }
  };

  const handleGoogleSignup = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error) {
      setError('Failed to sign up with Google.');
    }
  };

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
              Sign up
            </Button>
          </form>

          {error && <Text color="red" size="sm" mt="sm">{error}</Text>}
        </Paper>
      </Container>
    </Center>
  );
}