import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useCountryVisitInfo, useUpdateCountryVisitInfo } from '../../../lib/hooks/useCountryVisitInfo';
import type { CountryVisitInfo, MonthlyVisitRating, VisitRating } from '../../../lib/types/country';

interface CountryVisitInfoEditorProps {
  countryId: number;
}

const CountryVisitInfoEditor: React.FC<CountryVisitInfoEditorProps> = ({ countryId }) => {
  const { data: visitInfo, isLoading } = useCountryVisitInfo(countryId);
  const updateVisitInfo = useUpdateCountryVisitInfo(countryId);
  const [isEditing, setIsEditing] = useState(false);
  
  const allMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const ratingOptions: VisitRating[] = ['excellent', 'good', 'fair', 'poor', 'discouraged'];
  
  const { control, handleSubmit, reset } = useForm<CountryVisitInfo>({
    defaultValues: visitInfo || {
      country_id: countryId,
      monthly_ratings: allMonths.map(month => ({
        month,
        rating: 'fair' as VisitRating,
        notes: '',
      })),
      general_notes: '',
    },
  });
  
  // Update form when data is loaded
  React.useEffect(() => {
    if (visitInfo) {
      // If some months are missing, add them with default values
      const existingMonths = new Set(visitInfo.monthly_ratings.map(r => r.month));
      const missingMonths = allMonths.filter(month => !existingMonths.has(month));
      
      const updatedRatings = [
        ...visitInfo.monthly_ratings,
        ...missingMonths.map(month => ({
          month,
          rating: 'fair' as VisitRating,
          notes: '',
        })),
      ];
      
      reset({
        ...visitInfo,
        monthly_ratings: updatedRatings,
      });
    }
  }, [visitInfo, reset, allMonths]);
  
  const onSubmit = (data: CountryVisitInfo) => {
    updateVisitInfo.mutate(data, {
      onSuccess: () => {
        setIsEditing(false);
      },
    });
  };
  
  if (isLoading) {
    return <div className="p-4">Loading visit information...</div>;
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Country Visit Information</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Edit
          </button>
        ) : (
          <div className="space-x-2">
            <button
              onClick={() => {
                reset();
                setIsEditing(false);
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit(onSubmit)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Save
            </button>
          </div>
        )}
      </div>
      
      <form>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            General Notes
          </label>
          <Controller
            name="general_notes"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                disabled={!isEditing}
                className="w-full p-2 border rounded-md"
                rows={4}
              />
            )}
          />
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Monthly Ratings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allMonths.map((month, index) => (
              <div key={month} className="border rounded-md p-4">
                <h4 className="font-medium mb-2">{month}</h4>
                <div className="mb-3">
                  <label className="block text-sm text-gray-600 mb-1">Rating</label>
                  <Controller
                    name={`monthly_ratings.${index}.rating`}
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        disabled={!isEditing}
                        className="w-full p-2 border rounded-md"
                      >
                        {ratingOptions.map(option => (
                          <option key={option} value={option}>
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Notes</label>
                  <Controller
                    name={`monthly_ratings.${index}.notes`}
                    control={control}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        disabled={!isEditing}
                        className="w-full p-2 border rounded-md"
                        rows={2}
                      />
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CountryVisitInfoEditor;
