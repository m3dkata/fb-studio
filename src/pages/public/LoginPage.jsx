import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { USER_TYPES } from '../../constants/userTypes';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card, { CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';

const LoginPage = () => {
    const { login, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const from = location.state?.from?.pathname;
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError('');

        try {
            const user = await login(data.email, data.password);

            
            let redirectPath = from || '/dashboard';

            if (user.user_type === USER_TYPES.ADMIN) {
                redirectPath = '/admin';
            }

            navigate(redirectPath, { replace: true });
        } catch (err) {
            setError('Invalid email or password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            { }
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-float" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <Card className="border-0 shadow-2xl bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border-white/20 dark:border-gray-700/50">
                    <CardHeader className="pb-2 text-center">
                        <CardTitle className="text-3xl font-bold">
                            <span className="text-gradient">Welcome Back</span>
                        </CardTitle>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Sign in to manage your bookings
                        </p>
                    </CardHeader>

                    <CardContent>
                        {error && (
                            <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 border border-red-200 rounded-md dark:bg-red-900/30 dark:border-red-800 dark:text-red-300">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <Input
                                label="Email Address"
                                id="email"
                                type="email"
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address'
                                    }
                                })}
                                error={errors.email?.message}
                                autoComplete="email"
                                className="px-4 py-3 text-base border-2 rounded-xl bg-white/50 dark:bg-gray-800/50"
                            />

                            <Input
                                label="Password"
                                id="password"
                                type="password"
                                {...register('password', { required: 'Password is required' })}
                                error={errors.password?.message}
                                autoComplete="current-password"
                                className="px-4 py-3 text-base border-2 rounded-xl bg-white/50 dark:bg-gray-800/50"
                            />

                            <div className="flex items-center justify-between">
                                <div className="text-sm">
                                    <a href="#" className="font-medium transition-colors text-primary hover:text-primary-dark">
                                        Forgot your password?
                                    </a>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-primary/40"
                                isLoading={isLoading}
                                size="lg"
                            >
                                Sign In
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="pt-2 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-medium transition-colors text-primary hover:text-primary-dark">
                                Sign up
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default LoginPage;
