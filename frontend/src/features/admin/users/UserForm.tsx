import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useCreateUser, useUpdateUser } from '../../../lib/hooks/useUsers';
import type { User } from '../../../lib/types/api';
import FormInput from '../../../components/ui/FormInput';
import FormCheckbox from '../../../components/ui/FormCheckbox';
import Button from '../../../components/ui/Button';

// Form validation schemas
const createUserSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string().min(8, 'Please confirm your password'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters').optional().or(z.literal('')),
  is_active: z.boolean(),
  is_superuser: z.boolean(),
}).refine(data => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
});

const updateUserSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
  confirm_password: z.string().min(8, 'Please confirm your password').optional().or(z.literal('')),
  full_name: z.string().min(2, 'Full name must be at least 2 characters').optional().or(z.literal('')),
  is_active: z.boolean(),
  is_superuser: z.boolean(),
}).refine(data => !data.password || data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
});

type CreateUserFormData = z.infer<typeof createUserSchema>;
type UpdateUserFormData = z.infer<typeof updateUserSchema>;

interface UserFormProps {
  userData?: User;
  isEdit?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ userData, isEdit = false }) => {
  const navigate = useNavigate();
  
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser(userData?.id);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  
  // Initialize form with default values or existing user data
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserFormData | UpdateUserFormData>({
    resolver: zodResolver(isEdit ? updateUserSchema : createUserSchema),
    defaultValues: isEdit && userData
      ? {
          email: userData.email,
          password: '',
          confirm_password: '',
          full_name: userData.full_name || '',
          is_active: userData.is_active,
          is_superuser: userData.is_superuser,
        }
      : {
          email: '',
          password: '',
          confirm_password: '',
          full_name: '',
          is_active: true,
          is_superuser: false,
        },
  });
  
  const onSubmit = async (data: CreateUserFormData | UpdateUserFormData) => {
    setIsSubmitting(true);
    setServerError(null);
    
    try {
      if (isEdit) {
        // Remove confirm_password before sending to API
        const { confirm_password, ...updateData } = data;
        // Only include password if it was provided
        if (!updateData.password) {
          delete updateData.password;
        }
        await updateUserMutation.mutateAsync(updateData);
      } else {
        // Remove confirm_password before sending to API
        const { confirm_password, ...createData } = data;
        await createUserMutation.mutateAsync(createData as CreateUserFormData);
      }
      
      navigate('/admin/users');
    } catch (error) {
      console.error('Error saving user:', error);
      setServerError('An error occurred while saving the user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Type-safe form submission handler
  const handleFormSubmit = handleSubmit(onSubmit);
  
  return (
    <form 
      onSubmit={handleFormSubmit} 
      className="space-y-6"
    >
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {serverError}
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          {/* Email */}
          <div className="sm:col-span-4">
            <FormInput
              id="email"
              type="email"
              label="Email Address"
              autoComplete="email"
              error={errors.email}
              fullWidth
              variant="filled"
              {...register('email')}
            />
          </div>
          
          {/* Full Name */}
          <div className="sm:col-span-4">
            <FormInput
              id="full_name"
              type="text"
              label="Full Name"
              autoComplete="name"
              error={errors.full_name}
              fullWidth
              variant="filled"
              {...register('full_name')}
            />
          </div>
          
          {/* Password */}
          <div className="sm:col-span-4">
            <FormInput
              id="password"
              type="password"
              label={isEdit ? 'New Password (leave blank to keep current)' : 'Password'}
              autoComplete={isEdit ? 'new-password' : 'current-password'}
              error={errors.password}
              fullWidth
              variant="filled"
              {...register('password')}
            />
          </div>
          
          {/* Confirm Password */}
          <div className="sm:col-span-4">
            <FormInput
              id="confirm_password"
              type="password"
              label="Confirm Password"
              autoComplete={isEdit ? 'new-password' : 'current-password'}
              error={errors.confirm_password}
              fullWidth
              variant="filled"
              {...register('confirm_password')}
            />
          </div>
          
          {/* User Role */}
          <div className="sm:col-span-6">
            <fieldset>
              <legend className="text-sm font-medium text-gray-700">User Role</legend>
              <div className="mt-2 space-y-4">
                <FormCheckbox
                  id="is_superuser"
                  label="Admin (can access admin panel and manage all content)"
                  {...register('is_superuser')}
                />
              </div>
            </fieldset>
          </div>
          
          {/* Status */}
          <div className="sm:col-span-6">
            <FormCheckbox
              id="is_active"
              label="Active (user can log in)"
              {...register('is_active')}
            />
          </div>
        </div>
      </div>
      
      {/* Form actions */}
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => navigate('/admin/users')}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          ) : isEdit ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
