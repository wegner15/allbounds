import React from 'react';
import { useForm } from 'react-hook-form';
import FormInput from '../../../components/ui/FormInput';
import FormTextarea from '../../../components/ui/FormTextarea';
import FormCheckbox from '../../../components/ui/FormCheckbox';
import Button from '../../../components/ui/Button';

interface HotelTypeFormProps {
  initialData?: {
    id?: number;
    name: string;
    description: string;
    is_active: boolean;
  };
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

const HotelTypeForm: React.FC<HotelTypeFormProps> = ({
  initialData = { name: '', description: '', is_active: true },
  onSubmit,
  isSubmitting,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormInput
        id="name"
        label="Name"
        type="text"
        fullWidth
        error={errors.name}
        {...register('name', { required: 'Name is required' })}
      />

      <FormTextarea
        id="description"
        label="Description"
        rows={4}
        fullWidth
        error={errors.description}
        {...register('description')}
      />

      <FormCheckbox
        id="is_active"
        label="Active"
        {...register('is_active')}
      />

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          variant="primary"
          size="md"
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
};

export default HotelTypeForm;
