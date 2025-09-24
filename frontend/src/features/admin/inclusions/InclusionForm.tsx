import React, { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import FormInput from '../../../components/ui/FormInput';
import FormTextarea from '../../../components/ui/FormTextarea';
import FormCheckbox from '../../../components/ui/FormCheckbox';
import Button from '../../../components/ui/Button';

interface InclusionFormProps {
  initialData?: {
    id?: number;
    name: string;
    description: string;
    icon: string;
    category: string;
    is_active: boolean;
  };
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

const CATEGORY_OPTIONS = [
  'Accommodation',
  'Transportation',
  'Meals',
  'Activities',
  'Guide',
  'Equipment',
  'Insurance',
  'Other'
];

const ICON_OPTIONS = [
  'bed',
  'utensils',
  'car',
  'plane',
  'bus',
  'train',
  'hiking',
  'swimming',
  'biking',
  'user-tie',
  'map',
  'camera',
  'medkit',
  'wifi',
  'coffee',
  'glass-cheers'
];

const InclusionForm: React.FC<InclusionFormProps> = ({
  initialData = { name: '', description: '', icon: '', category: '', is_active: true },
  onSubmit,
  isSubmitting,
}) => {
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    // Load custom categories from localStorage if available
    const savedCategories = localStorage.getItem('customInclusionCategories');
    return savedCategories ? JSON.parse(savedCategories) : [];
  });
  
  // Save custom categories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('customInclusionCategories', JSON.stringify(customCategories));
  }, [customCategories]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch
  } = useForm({
    defaultValues: initialData,
  });
  
  // Watch the icon field to update the preview
  const selectedIcon = watch('icon');

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

      <div className="space-y-2">
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        {!showNewCategoryInput ? (
          <>
            <select
              id="category"
              className={`block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-teal transition duration-150 ease-in-out ${errors.category ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
              {...register('category')}
              onChange={(e) => {
                if (e.target.value === '__new__') {
                  setShowNewCategoryInput(true);
                  setValue('category', '');
                } else {
                  register('category').onChange(e);
                }
              }}
            >
              <option value="">Select a category</option>
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
              {customCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
              <option value="__new__">+ Add new category</option>
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message as string}</p>
            )}
          </>
        ) : (
          <div className="space-y-2">
            <div className="flex space-x-2">
              <input
                type="text"
                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-teal transition duration-150 ease-in-out"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter new category name"
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setShowNewCategoryInput(false)}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="primary" 
                size="sm"
                onClick={() => {
                  if (newCategory.trim()) {
                    setCustomCategories([...customCategories, newCategory.trim()]);
                    setValue('category', newCategory.trim());
                    setNewCategory('');
                    setShowNewCategoryInput(false);
                  }
                }}
              >
                Add
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="icon" className="block text-sm font-medium text-gray-700">
          Icon
        </label>
        <select
          id="icon"
          className={`block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-teal transition duration-150 ease-in-out ${errors.icon ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
          {...register('icon')}
        >
          <option value="">Select an icon</option>
          {ICON_OPTIONS.map((icon) => (
            <option key={icon} value={icon}>
              {icon}
            </option>
          ))}
        </select>
        {errors.icon && (
          <p className="mt-1 text-sm text-red-600">{errors.icon.message as string}</p>
        )}
        
        {/* Icon preview */}
        <div className="mt-3 flex items-center">
          <span className="text-sm text-gray-500 mr-2">Icon Preview:</span>
          <div className="p-3 border border-gray-200 rounded-md inline-block bg-gray-50">
            <i className={`fas fa-${selectedIcon || 'question'} text-xl text-charcoal`}></i>
          </div>
        </div>
      </div>

      <FormCheckbox
        id="is_active"
        label="Active"
        {...register('is_active')}
      />

      <div className="flex justify-end pt-4">
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

export default InclusionForm;
