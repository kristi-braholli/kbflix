import Input from "@/components/Input";
import {useCallback, useEffect, useState} from "react";
import axios from "axios";
import {signIn} from 'next-auth/react'
import {useRouter} from "next/router";
import {FcGoogle} from 'react-icons/fc';
import {FaGithub} from 'react-icons/fa';

const Auth = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [variant, setVariant] = useState<'login' | 'register'>('login');

    const callbackUrl = typeof router.query.callbackUrl === 'string'
        ? router.query.callbackUrl
        : '/';

    useEffect(() => {
        const authError = router.query.error;

        if (!authError || typeof authError !== 'string') {
            return;
        }

        if (authError === 'PendingApproval' || authError === 'AccessDenied') {
            setError('Your account has not been approved yet. Please wait for admin approval.');
            return;
        }

        if (authError === 'Configuration') {
            setError('Authentication is not configured correctly. Please contact support.');
            return;
        }

        setError('Sign in failed. Please try again.');
    }, [router.query.error]);

    const toggleVariant = useCallback(() => {
        setVariant(currVariant => currVariant === 'login' ? 'register' : 'login')
        setError('');
        setSuccess('');
    }, []);

    const login = useCallback(async () => {
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            const check = await axios.post('/api/auth/check-login', { email, password });

            if (check.data.status === 'pending_approval') {
                setError('Your account has not been approved yet. Please wait for admin approval.');
                return;
            }

            if (check.data.status === 'invalid_credentials') {
                setError('Invalid email or password.');
                return;
            }

            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                if (result.error === 'AccessDenied') {
                    setError('Your account has not been approved yet. Please wait for admin approval.');
                } else {
                    setError('Invalid email or password.');
                }
                return;
            }

            if (result?.ok) {
                window.location.replace(callbackUrl);
            }
        } catch (error) {
            console.log(error)
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [email, password, callbackUrl]);

    const register = useCallback(async () => {
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            const response = await axios.post('/api/register', {
                email,
                name,
                password
            })

            if (response.data.pendingApproval) {
                setSuccess('Account created successfully. Please wait for admin approval before signing in.');
                setVariant('login');
                setPassword('');
                return;
            }

            await login()
        } catch (error: any) {
            console.log(error)
            if (error?.response?.status === 422) {
                setError('This email is already in use.');
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [email, name, password, login]);

    return (
        <div className="relative min-h-screen w-full bg-[url('/images/hero.jpg')] bg-no-repeat bg-center bg-fixed bg-cover">
            <div className="bg-black min-h-screen w-full lg:bg-opacity-50">
                <nav className="px-12 py-5">
                    <img src="/images/logo.png" alt="Netflix Logo" className="h-12"/>
                </nav>
                <div className="flex justify-center">
                    <div
                        className="bg-black bg-opacity-70 px-16 py-16 self-center mt-2 lg:w-2/5 lg:max-w-md rounded-md w-full">
                        <h2 className="text-white text-4xl mb-8 font-semibold">
                            {variant === 'login' ? 'Sign in' : 'Create account'}
                        </h2>
                        {error && (
                            <p className="text-red-500 text-sm mb-4">{error}</p>
                        )}
                        {success && (
                            <p className="text-green-500 text-sm mb-4">{success}</p>
                        )}
                        <div className="flex flex-col gap-4">
                            {variant === 'register' && (
                                <Input
                                    label='Username'
                                    onChange={(evt: any) => setName(evt.target.value)}
                                    id='name'
                                    value={name}
                                />
                            )}
                            <Input
                                label='Email'
                                onChange={(evt: any) => setEmail(evt.target.value)}
                                id='email'
                                type='email'
                                value={email}
                            />
                            <Input
                                label='Password'
                                onChange={(evt: any) => setPassword(evt.target.value)}
                                id='password'
                                type='password'
                                value={password}
                            />
                        </div>
                        <button
                            onClick={variant === 'login' ? login : register}
                            disabled={isLoading}
                            className="bg-red-600 py-3 text-white rounded-md w-full mt-10 hover:bg-red-700 transition disabled:opacity-50">
                            {isLoading ? 'Loading...' : variant === 'login' ? 'Login' : 'Sign up'}
                        </button>
                        <p className="text-neutral-500 mt-12">
                            {variant === 'login' ? "Don't have an account?" : "Already have an account?"}
                            <span onClick={toggleVariant} className="text-white ml-1 hover:underline cursor-pointer">
                                {variant === 'login' ? "Sign up" : "Login"}
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Auth;
