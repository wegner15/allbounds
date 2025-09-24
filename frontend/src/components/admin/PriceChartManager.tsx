import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { 
  usePackagePriceCharts, 
  useCreatePriceChart, 
  useUpdatePriceChart, 
  useDeletePriceChart
} from '../../lib/hooks/usePackagePriceCharts';

const priceChartSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  price: z.number().min(0, 'Price must be a positive number'),
  is_active: z.boolean(),
});

type PriceChartFormData = z.infer<typeof priceChartSchema>;

interface PriceChartManagerProps {
  packageId: number;
}

const PriceChartManager: React.FC<PriceChartManagerProps> = ({ packageId }) => {
  const { data: priceCharts, isLoading } = usePackagePriceCharts(packageId);
  const createPriceChart = useCreatePriceChart();
  const deletePriceChart = useDeletePriceChart();
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentPriceChartId, setCurrentPriceChartId] = useState<number | null>(null);
  
  // Create an update mutation that will work with the current price chart ID
  const updatePriceChart = useUpdatePriceChart(currentPriceChartId || 0);
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<PriceChartFormData>({
    resolver: zodResolver(priceChartSchema),
    defaultValues: {
      title: '',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: format(new Date(new Date().setMonth(new Date().getMonth() + 1)), 'yyyy-MM-dd'),
      price: 0,
      is_active: true,
    }
  });
  
  const onSubmit = async (data: PriceChartFormData) => {
    try {
      if (isEditing && currentPriceChartId) {
        await updatePriceChart.mutateAsync({
          title: data.title,
          start_date: data.start_date,
          end_date: data.end_date,
          price: data.price,
          is_active: data.is_active
        });
      } else {
        await createPriceChart.mutateAsync({
          package_id: packageId,
          title: data.title,
          start_date: data.start_date,
          end_date: data.end_date,
          price: data.price,
          is_active: data.is_active
        });
      }
      reset();
      setIsEditing(false);
      setCurrentPriceChartId(null);
    } catch (error) {
      console.error('Error saving price chart:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h3>Price Charts</h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>Title</label>
          <input type="text" {...register('title')} />
        </div>
        <div>
          <label>Price (USD)</label>
          <input type="number" {...register('price', { valueAsNumber: true })} />
        </div>
        <div>
          <label>Start Date</label>
          <input type="date" {...register('start_date')} />
        </div>
        <div>
          <label>End Date</label>
          <input type="date" {...register('end_date')} />
        </div>
        <div>
          <label>
            <input type="checkbox" {...register('is_active')} />
            Active
          </label>
        </div>
        <button type="submit">Save</button>
      </form>
      
      {!isLoading && priceCharts && priceCharts.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {priceCharts.map(chart => (
              <tr key={chart.id}>
                <td>{chart.title}</td>
                <td>${chart.price}</td>
                <td>
                  <button onClick={() => {
                    setIsEditing(true);
                    setCurrentPriceChartId(chart.id);
                    setValue('title', chart.title);
                    setValue('start_date', format(new Date(chart.start_date), 'yyyy-MM-dd'));
                    setValue('end_date', format(new Date(chart.end_date), 'yyyy-MM-dd'));
                    setValue('price', chart.price);
                    setValue('is_active', chart.is_active);
                  }}>Edit</button>
                  <button onClick={async () => {
                    if (window.confirm('Delete this price chart?')) {
                      try {
                        await deletePriceChart.mutateAsync({ priceChartId: chart.id, packageId });
                      } catch (error) {
                        console.error('Error deleting price chart:', error);
                      }
                    }
                  }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PriceChartManager;