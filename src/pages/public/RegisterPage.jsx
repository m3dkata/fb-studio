import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card, { CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';

const RegisterPage = () => {
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const password = watch('password');

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError('');

        try {
            await registerUser({
                email: data.email,
                password: data.password,
                passwordConfirm: data.passwordConfirm,
                name: data.name,
                phone: data.phone,
                avatar: data.avatar && data.avatar[0] ? data.avatar[0] : null,
            });
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-float" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
            </div>

            <div className="w-full max-w-md relative z-10">
                <Card className="border-0 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl shadow-2xl border-white/20 dark:border-gray-700/50">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-3xl font-bold">
                            <span className="text-gradient">Create Account</span>
                        </CardTitle>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Join FB Studio to book your appointments
                        </p>
                    </CardHeader>

                    <CardContent>
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {/* Avatar Upload */}
                            <div className="flex flex-col items-center mb-4">
                                <div className="relative w-24 h-24 mb-2">
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                        {watch('avatar') && watch('avatar')[0] ? (
                                            <img
                                                src={URL.createObjectURL(watch('avatar')[0])}
                                                alt="Avatar preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        )}
                                    </div>
                                    <label
                                        htmlFor="avatar-upload"
                                        className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full shadow-lg cursor-pointer hover:bg-primary-dark transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </label>
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        {...register('avatar')}
                                    />
                                </div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Upload Profile Photo</span>
                            </div>

                            <Input
                                label="Full Name"
                                id="name"
                                {...register('name', {
                                    required: 'Name is required',
                                    minLength: { value: 2, message: 'Name must be at least 2 characters' }
                                })}
                                error={errors.name?.message}
                                className="py-3 px-4 rounded-xl border-2 bg-white/50 dark:bg-gray-800/50 text-base"
                            />

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
                                className="py-3 px-4 rounded-xl border-2 bg-white/50 dark:bg-gray-800/50 text-base"
                            />

                            <Input
                                label="Phone Number"
                                id="phone"
                                type="tel"
                                {...register('phone', {
                                    required: 'Phone number is required',
                                    pattern: {
                                        value: /^\+?[0-9]{10,15}$/,
                                        message: 'Invalid phone number'
                                    }
                                })}
                                error={errors.phone?.message}
                                className="py-3 px-4 rounded-xl border-2 bg-white/50 dark:bg-gray-800/50 text-base"
                            />

                            <Input
                                label="Password"
                                id="password"
                                type="password"
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: { value: 8, message: 'Password must be at least 8 characters' }
                                })}
                                error={errors.password?.message}
                                className="py-3 px-4 rounded-xl border-2 bg-white/50 dark:bg-gray-800/50 text-base"
                            />

                            <Input
                                label="Confirm Password"
                                id="passwordConfirm"
                                type="password"
                                {...register('passwordConfirm', {
                                    required: 'Please confirm your password',
                                    validate: value => value === password || 'Passwords do not match'
                                })}
                                error={errors.passwordConfirm?.message}
                                className="py-3 px-4 rounded-xl border-2 bg-white/50 dark:bg-gray-800/50 text-base"
                            />

                            <Button
                                type="submit"
                                className="w-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 mt-2"
                                isLoading={isLoading}
                                size="lg"
                            >
                                Create Account
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="text-center pt-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Already have an account?{' '}
                            <Link to="/login" className="font-medium text-primary hover:text-primary-dark transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default RegisterPage;
