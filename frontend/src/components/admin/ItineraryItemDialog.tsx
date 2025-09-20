import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/DialogComponent';
// Form components
// Create simple form components since they don't exist
const Form = ({ children, ...props }: { children: React.ReactNode } & React.FormHTMLAttributes<HTMLFormElement>) => <form {...props}>{children}</form>;
const FormControl = ({ children }: { children: React.ReactNode }) => <div className="mt-1">{children}</div>;
const FormField = ({ name, children, control, render, ...props }: { name: string; children?: any; control?: any; render?: any; [key: string]: any }) => <div>{render ? render({ field: { onChange: () => {}, value: '', ref: null } }) : children}</div>;
const FormItem = ({ children }: { children: React.ReactNode }) => <div className="mb-4">{children}</div>;
const FormLabel = ({ children }: { children: React.ReactNode }) => <label className="block text-sm font-medium text-gray-700 mb-1">{children}</label>;
const FormMessage = ({ children }: { children?: React.ReactNode }) => <p className="mt-1 text-sm text-red-600">{children}</p>;
import Input from '../ui/Input';
import Textarea from '../ui/FormTextarea';
import Button from '../ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/SelectComponent';
// Import hooks
import { useCreateItineraryItem, useUpdateItineraryItem, useDeleteItineraryItem } from '../../lib/hooks/useItinerary';
import { useHotels } from '../../lib/hooks/useHotels';
import type { ItineraryItem } from '../../lib/types/itinerary';

const itineraryItemSchema = z.object({
  day_number: z.number().min(1),
  date: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  location: z.string().optional(),
  accommodation_hotel_id: z.string().optional(),
  accommodation_notes: z.string().optional(),
});

type ItineraryItemFormData = z.infer<typeof itineraryItemSchema>;

interface ItineraryItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: ItineraryItem | null;
  entityType: 'package' | 'group_trip';
  entityId: number;
  dayNumber?: number | null;
  onClose: () => void;
}

export const ItineraryItemDialog: React.FC<ItineraryItemDialogProps> = ({
  open,
  onOpenChange,
  item,
  entityType,
  entityId,
  dayNumber,
  onClose,
}) => {
  const { data: hotels } = useHotels();
  const createItem = useCreateItineraryItem();
  const updateItem = useUpdateItineraryItem();
  const deleteItem = useDeleteItineraryItem();

  const form = useForm<ItineraryItemFormData>({
    resolver: zodResolver(itineraryItemSchema),
    defaultValues: {
      day_number: item?.day_number || dayNumber || 1,
      date: item?.date || '',
      title: item?.title || '',
      description: item?.description || '',
      location: item?.location || '',
      accommodation_hotel_id: item?.accommodation?.hotel?.id?.toString() || '',
      accommodation_notes: item?.accommodation?.notes || '',
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        day_number: item?.day_number || dayNumber || 1,
        date: item?.date || '',
        title: item?.title || '',
        description: item?.description || '',
        location: item?.location || '',
        accommodation_hotel_id: item?.accommodation?.hotel?.id?.toString() || '',
        accommodation_notes: item?.accommodation?.notes || '',
      });
    }
  }, [open, item, dayNumber, form]);

  const onSubmit = async (data: ItineraryItemFormData) => {
    try {
      const formattedData = {
        ...data,
        accommodation_hotel_id: data.accommodation_hotel_id ? parseInt(data.accommodation_hotel_id) : undefined,
        date: data.date || undefined,
      };

      if (item) {
        await updateItem.mutateAsync({
          itemId: item.id,
          data: formattedData,
        });
      } else {
        await createItem.mutateAsync({
          entity_type: entityType,
          entity_id: entityId,
          ...formattedData,
          // Add required properties
          hotel_ids: [],
          attraction_ids: [],
          custom_activities: [],
          activities: [],
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving itinerary item:', error);
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    
    if (confirm('Are you sure you want to delete this itinerary item? This will also delete all associated activities.')) {
      try {
        await deleteItem.mutateAsync(item.id);
        onClose();
      } catch (error) {
        console.error('Error deleting itinerary item:', error);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {item ? 'Edit Itinerary Day' : 'Add Itinerary Day'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="day_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day Number</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Arrival in Paris" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the day's highlights..."
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
                    <Input placeholder="e.g., Paris, France" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h4 className="font-medium">Accommodation</h4>
              
              <FormField
                control={form.control}
                name="accommodation_hotel_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hotel (Optional)</FormLabel>
                    <select onChange={field.onChange} value={field.value || ''} className="w-full p-2 border rounded">
                      <option value="">Select a hotel</option>
                      {hotels?.map((hotel) => (
                        <option key={hotel.id} value={hotel.id.toString()}>
                          {hotel.name} {hotel.stars && `(${hotel.stars}★)`}
                        </option>
                      ))}
                    </select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accommodation_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accommodation Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Alternative accommodation details or special notes..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-between pt-4">
              <div>
                {item && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleteItem.isPending}
                  >
                    Delete Day
                  </Button>
                )}
              </div>
              
              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createItem.isPending || updateItem.isPending}
                >
                  {item ? 'Update' : 'Create'} Day
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
