import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const ProfilePage = () => {
    const { user, updateProfile } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: {
            name: user.name,
            email: user.email,
            phone: user.phone,
        }
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        setSuccessMessage('');
        setErrorMessage('');

        try {
            await updateProfile({
                name: data.name,
                phone: data.phone,
                avatar: data.avatar && data.avatar[0] ? data.avatar[0] : undefined,
                // Email update usually requires verification, keeping it simple for now
            });
            setSuccessMessage('Profile updated successfully!');
        } catch (error) {
            setErrorMessage(error.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Profile</h1>

            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {successMessage && (
                            <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded-md text-sm">
                                {successMessage}
                            </div>
                        )}
                        {errorMessage && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md text-sm">
                                {errorMessage}
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Avatar Upload */}
                            <div className="flex flex-col items-center mb-6">
                                <div className="relative w-32 h-32 mb-3">
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                        {/* Priority: New Preview > Existing Avatar > Placeholder */}
                                        {watch('avatar') && watch('avatar')[0] ? (
                                            <img
                                                src={URL.createObjectURL(watch('avatar')[0])}
                                                alt="New avatar preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : user.avatar ? (
                                            <img
                                                src={`${import.meta.env.VITE_POCKETBASE_URL}/api/files/users/${user.id}/${user.avatar}`}
                                                alt="Current avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        )}
                                    </div>
                                    <label
                                        htmlFor="avatar-upload"
                                        className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-primary-dark transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {user.avatar ? 'Change Profile Photo' : 'Upload Profile Photo'}
                                </span>
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
                                disabled // Email change often requires re-verification
                                className="py-3 px-4 rounded-xl border-2 bg-gray-100 dark:bg-gray-800/50 text-base cursor-not-allowed opacity-75"
                                {...register('email')}
                                error={errors.email?.message}
                            />
                            <p className="text-xs text-gray-500 mt-1">Email cannot be changed directly.</p>

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

                            <div className="pt-4">
                                <Button type="submit" isLoading={isLoading}>
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ProfilePage;
