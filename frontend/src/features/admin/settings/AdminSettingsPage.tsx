import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import useAuthHook from '../../../lib/hooks/useAuthHook';
import { apiClient } from '../../../lib/api';

const AdminSettingsPage: React.FC = () => {
    const { user } = useAuthHook();
    const queryClient = useQueryClient();

    const [email, setEmail] = useState(user?.email || '');
    const [firstName, setFirstName] = useState(user?.first_name || '');
    const [lastName, setLastName] = useState(user?.last_name || '');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const updateProfileMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await apiClient.put('/api/v1/users/me', data);
            return response;
        },
        onSuccess: () => {
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setPassword('');
            setConfirmPassword('');
            // Invalidate the 'user' query if one exists, or reload page to get fresh token scope if needed
            queryClient.invalidateQueries();
            setTimeout(() => setMessage(null), 5000);
        },
        onError: (error: any) => {
            setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to update profile.' });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        const updateData: any = {
            email,
            first_name: firstName,
            last_name: lastName,
        };

        if (password) {
            if (password !== confirmPassword) {
                setMessage({ type: 'error', text: 'Passwords do not match.' });
                return;
            }
            if (password.length < 8) {
                setMessage({ type: 'error', text: 'Password must be at least 8 characters long.' });
                return;
            }
            updateData.password = password;
        }

        updateProfileMutation.mutate(updateData);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Helmet>
                <title>Account Settings | AllBounds Admin</title>
            </Helmet>

            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Update your personal information and security settings.
                </p>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">

                    <div className="space-y-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 border-b pb-3">
                            Profile Information
                        </h3>

                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">First Name</label>
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="shadow-sm focus:ring-teal focus:border-teal block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="shadow-sm focus:ring-teal focus:border-teal block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Email Address (Login ID)</label>
                                <div className="mt-1">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="shadow-sm focus:ring-teal focus:border-teal block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 border-b pb-3">
                            Security
                        </h3>
                        <p className="text-sm text-gray-500">Leave the password fields blank if you do not wish to change your password.</p>

                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">New Password</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="focus:ring-teal focus:border-teal block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                                        ) : (
                                            <EyeIcon className="h-5 w-5" aria-hidden="true" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="focus:ring-teal focus:border-teal block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-5 flex justify-end">
                        <button
                            type="submit"
                            disabled={updateProfileMutation.isPending}
                            className={`inline-flex justify-center rounded-md border border-transparent bg-teal py-2 px-6 text-sm font-medium text-white shadow-sm hover:bg-teal focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 ${updateProfileMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminSettingsPage;
