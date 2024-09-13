import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Center, Container, Divider, Paper, PasswordInput, Text, TextInput, Title, Loader } from '@mantine/core';
import { GoogleButton } from '@/components/GoogleButton';
import { googleSignInFn, loginFn } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

export default function LoginPage() {
    console.log('[LoginPage] Component rendered');
    const router = useRouter();
    const { user, loading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        console.log('[LoginPage] useEffect called with dependencies:', { user, loading });
        if (user && !loading) {
            console.log('[LoginPage] User authenticated, redirecting to dashboard');
            router.push('/dashboard').catch(err => console.error('Navigation failed:', err));
        }
    }, [user, loading, router]);

    const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
        console.log('[handleEmailPasswordSubmit] Function called with event:', e);
        console.time('EmailPasswordLogin');
        e.preventDefault();
        setError('');
        console.log('[handleEmailPasswordSubmit] Attempting login with email:', email);
        try {
            await loginFn({ email, password });
            console.log('[handleEmailPasswordSubmit] Login successful, redirecting to dashboard');
            // Trigger data sync
            await axios.post('/api/plaid/sync_data');
            await router.push('/dashboard');
        } catch (error) {
            console.error('[handleEmailPasswordSubmit] Login failed:', error);
            setError('Failed to log in with email and password');
        }
        console.timeEnd('EmailPasswordLogin');
    };

    const handleGoogleSignIn = async () => {
        console.log('[handleGoogleSignIn] Function called');
        console.time('GoogleSignIn');
        try {
            console.log('[handleGoogleSignIn] Attempting Google sign-in');
            await googleSignInFn();
            console.log('[handleGoogleSignIn] Google sign-in successful, redirecting to dashboard');
            await router.push('/dashboard');
        } catch (error: unknown) {
            console.error('[handleGoogleSignIn] Google sign-in failed:', error instanceof Error ? error.message : 'Unknown error');
            setError('Failed to log in with Google');
        }
        console.timeEnd('GoogleSignIn');
    };

    if (loading) {
        return (
            <Center style={{ width: '100%', height: '100vh' }}>
                <Loader type="bars" />
            </Center>
        );
    }

    if (user) {
        return null;
    }

    console.log('[LoginPage] Rendering login form');
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
                            onChange={(event) => {
                                console.log('[EmailInput] Email changed:', event.currentTarget.value);
                                setEmail(event.currentTarget.value);
                            }}
                            required
                        />
                        <PasswordInput
                            label="Password"
                            placeholder="Your password"
                            value={password}
                            onChange={(event) => {
                                console.log('[PasswordInput] Password changed');
                                setPassword(event.currentTarget.value);
                            }}
                            required
                            mt="md"
                        />
                        <Button type="submit" fullWidth mt="xl">
                            Sign in
                        </Button>
                    </form>

                    {error && <Text c="red" size="sm" mt="sm">{error}</Text>}
                </Paper>
            </Container>
        </Center>
    );
}