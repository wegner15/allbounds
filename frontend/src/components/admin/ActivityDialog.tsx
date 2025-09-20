import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import Input from '../ui/Input';
import Textarea from '../ui/FormTextarea';
import Button from '../ui/Button';
import FormCheckbox from '../ui/FormCheckbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useCreateActivity, useUpdateActivity, useDeleteActivity } from '../../lib/hooks/useItinerary';
import { useAttractions } from '../../lib/hooks/useAttractions';
import { ItineraryActivity } from '../../lib/hooks/useItinerary';

const activitySchema = z.object({
  time: z.string().optional(),
  activity_title: z.string().min(1, 'Activity title is required'),
  activity_description: z.string().optional(),
  location: z.string().optional(),
  attraction_id: z.string().optional(),
  duration_hours: z.string().optional(),
  is_meal: z.boolean().default(false),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner']).optional(),
  order_index: z.number().default(0),
});

type ActivityFormData = z.infer<typeof activitySchema>;

interface ActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity?: ItineraryActivity | null;
  itemId?: number | null;
  onClose: () => void;
}

export const ActivityDialog: React.FC<ActivityDialogProps> = ({
  open,
  onOpenChange,
  activity,
  itemId,
  onClose,
}) => {
  const { data: attractions } = useAttractions();
  const createActivity = useCreateActivity();
  const updateActivity = useUpdateActivity();
  const deleteActivity = useDeleteActivity();

  const form = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      time: activity?.time || '',
      activity_title: activity?.title || '',
      activity_description: activity?.description || '',
      location: activity?.location || '',
      attraction_id: activity?.attraction?.id?.toString() || '',
      duration_hours: activity?.duration_hours?.toString() || '',
      is_meal: activity?.is_meal || false,
      meal_type: activity?.meal_type || undefined,
      order_index: activity?.order_index || 0,
    },
  });

  const isMeal = form.watch('is_meal');

  React.useEffect(() => {
    if (open) {
      form.reset({
        time: activity?.time || '',
        activity_title: activity?.title || '',
        activity_description: activity?.description || '',
        location: activity?.location || '',
        attraction_id: activity?.attraction?.id?.toString() || '',
        duration_hours: activity?.duration_hours?.toString() || '',
        is_meal: activity?.is_meal || false,
        meal_type: activity?.meal_type || undefined,
        order_index: activity?.order_index || 0,
      });
    }
  }, [open, activity, form]);

  const onSubmit = async (data: ActivityFormData) => {
    try {
      const formattedData = {
        time: data.time || undefined,
        activity_title: data.activity_title,
        activity_description: data.activity_description || undefined,
        location: data.location || undefined,
        attraction_id: data.attraction_id ? parseInt(data.attraction_id) : undefined,
        duration_hours: data.duration_hours ? parseFloat(data.duration_hours) : undefined,
        is_meal: data.is_meal,
        meal_type: data.is_meal ? data.meal_type : undefined,
        order_index: data.order_index,
      };

      if (activity) {
        await updateActivity.mutateAsync({
          activityId: activity.id,
          data: formattedData,
        });
      } else if (itemId) {
        await createActivity.mutateAsync({
          itemId,
          data: formattedData,
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving activity:', error);
    }
  };

  const handleDelete = async () => {
    if (!activity) return;
    
    if (confirm('Are you sure you want to delete this activity?')) {
      try {
        await deleteActivity.mutateAsync(activity.id);
        onClose();
      } catch (error) {
        console.error('Error deleting activity:', error);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {activity ? 'Edit Activity' : 'Add Activity'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time (Optional)</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (Hours)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.5"
                        min="0"
                        max="24"
                        placeholder="2.5"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="activity_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Visit Eiffel Tower" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="activity_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detailed description of the activity..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Champ de Mars, Paris" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="attraction_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Linked Attraction (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an attraction" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">No attraction selected</SelectItem>
                      {attractions?.map((attraction) => (
                        <SelectItem key={attraction.id} value={attraction.id.toString()}>
                          {attraction.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="is_meal"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FormCheckbox
                        label="This is a meal"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isMeal && (
                <FormField
                  control={form.control}
                  name="meal_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meal Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select meal type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="breakfast">Breakfast</SelectItem>
                          <SelectItem value="lunch">Lunch</SelectItem>
                          <SelectItem value="dinner">Dinner</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="order_index"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order Index</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between pt-4">
              <div>
                {activity && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleteActivity.isPending}
                  >
                    Delete Activity
                  </Button>
                )}
              </div>
              
              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createActivity.isPending || updateActivity.isPending}
                >
                  {activity ? 'Update' : 'Create'} Activity
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
