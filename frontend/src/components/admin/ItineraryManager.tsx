import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, GripVertical, Edit2, Trash2, Clock, MapPin, Utensils, Camera } from 'lucide-react';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { useItinerary, useReorderItineraryItems, useReorderActivities } from '../../lib/hooks/useItinerary';
import { ItineraryItem, ItineraryActivity } from '../../lib/hooks/useItinerary';
import { ItineraryItemDialog } from './ItineraryItemDialog';
import { ActivityDialog } from './ActivityDialog';

interface ItineraryManagerProps {
  entityType: 'package' | 'group_trip';
  entityId: number;
  readonly?: boolean;
}

export const ItineraryManager: React.FC<ItineraryManagerProps> = ({
  entityType,
  entityId,
  readonly = false
}) => {
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);
  const [editingActivity, setEditingActivity] = useState<ItineraryActivity | null>(null);
  const [addingItemToDay, setAddingItemToDay] = useState<number | null>(null);
  const [addingActivityToItem, setAddingActivityToItem] = useState<number | null>(null);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);

  const { data: itinerary, isLoading } = useItinerary(entityType, entityId);
  const reorderItems = useReorderItineraryItems();
  const reorderActivities = useReorderActivities();

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || readonly) return;

    const { source, destination, type } = result;

    if (type === 'itinerary-item') {
      // Reorder itinerary items
      if (!itinerary) return;
      
      const items = Array.from(itinerary.items);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);
      
      const itemIds = items.map(item => item.id);
      reorderItems.mutate({ entityType, entityId, itemIds });
    } else if (type === 'activity') {
      // Reorder activities within an item
      const itemId = parseInt(source.droppableId.replace('activities-', ''));
      const item = itinerary?.items.find(i => i.id === itemId);
      if (!item) return;
      
      const activities = Array.from(item.activities);
      const [reorderedActivity] = activities.splice(source.index, 1);
      activities.splice(destination.index, 0, reorderedActivity);
      
      const activityIds = activities.map(activity => activity.id);
      reorderActivities.mutate({ itemId, activityIds });
    }
  };

  const openItemDialog = (item?: ItineraryItem, dayNumber?: number) => {
    setEditingItem(item || null);
    setAddingItemToDay(dayNumber || null);
    setIsItemDialogOpen(true);
  };

  const openActivityDialog = (activity?: ItineraryActivity, itemId?: number) => {
    setEditingActivity(activity || null);
    setAddingActivityToItem(itemId || null);
    setIsActivityDialogOpen(true);
  };

  const closeDialogs = () => {
    setIsItemDialogOpen(false);
    setIsActivityDialogOpen(false);
    setEditingItem(null);
    setEditingActivity(null);
    setAddingItemToDay(null);
    setAddingActivityToItem(null);
  };

  const formatTime = (time?: string) => {
    if (!time) return '';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMealIcon = (mealType?: string) => {
    return <Utensils className="h-4 w-4" />;
  };

  if (isLoading) {
    return <div className="p-4">Loading itinerary...</div>;
  }

  if (!itinerary || itinerary.items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Itinerary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No itinerary items yet</p>
            {!readonly && (
              <Button onClick={() => openItemDialog(undefined, 1)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Day
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Itinerary ({itinerary.total_days} days)</h3>
        {!readonly && (
          <Button onClick={() => openItemDialog(undefined, itinerary.total_days + 1)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Day
          </Button>
        )}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="itinerary" type="itinerary-item">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {itinerary.items.map((item, index) => (
                <Draggable
                  key={item.id}
                  draggableId={`item-${item.id}`}
                  index={index}
                  isDragDisabled={readonly}
                >
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`${snapshot.isDragging ? 'shadow-lg' : ''}`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {!readonly && (
                              <div {...provided.dragHandleProps}>
                                <GripVertical className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <CardTitle className="text-lg">
                                Day {item.day_number}: {item.title}
                              </CardTitle>
                              {item.date && (
                                <p className="text-sm text-muted-foreground">
                                  {new Date(item.date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                          {!readonly && (
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openActivityDialog(undefined, item.id)}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Activity
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openItemDialog(item)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        {item.description && (
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        )}
                        
                        {item.location && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-1" />
                            {item.location}
                          </div>
                        )}
                        
                        {item.accommodation && (
                          <div className="mt-2 p-3 bg-muted rounded-lg">
                            <h4 className="font-medium text-sm mb-1">Accommodation</h4>
                            {item.accommodation.type === 'hotel' && item.accommodation.hotel ? (
                              <div>
                                <p className="text-sm">{item.accommodation.hotel.name}</p>
                                {item.accommodation.hotel.stars && (
                                  <p className="text-xs text-muted-foreground">
                                    {item.accommodation.hotel.stars} stars
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm">{item.accommodation.notes}</p>
                            )}
                          </div>
                        )}
                      </CardHeader>
                      
                      <CardContent>
                        <Droppable droppableId={`activities-${item.id}`} type="activity">
                          {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef}>
                              {item.activities.length > 0 ? (
                                <div className="space-y-2">
                                  {item.activities.map((activity, activityIndex) => (
                                    <Draggable
                                      key={activity.id}
                                      draggableId={`activity-${activity.id}`}
                                      index={activityIndex}
                                      isDragDisabled={readonly}
                                    >
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          className={`p-3 border rounded-lg bg-background ${
                                            snapshot.isDragging ? 'shadow-md' : ''
                                          }`}
                                        >
                                          <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-3 flex-1">
                                              {!readonly && (
                                                <div {...provided.dragHandleProps} className="mt-1">
                                                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                              )}
                                              <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-1">
                                                  {activity.time && (
                                                    <Badge variant="outline" className="text-xs">
                                                      <Clock className="h-3 w-3 mr-1" />
                                                      {formatTime(activity.time)}
                                                    </Badge>
                                                  )}
                                                  {activity.is_meal && (
                                                    <Badge variant="secondary" className="text-xs">
                                                      {getMealIcon(activity.meal_type)}
                                                      <span className="ml-1 capitalize">
                                                        {activity.meal_type || 'Meal'}
                                                      </span>
                                                    </Badge>
                                                  )}
                                                  {activity.attraction && (
                                                    <Badge variant="outline" className="text-xs">
                                                      <Camera className="h-3 w-3 mr-1" />
                                                      Attraction
                                                    </Badge>
                                                  )}
                                                </div>
                                                <h5 className="font-medium">{activity.title}</h5>
                                                {activity.description && (
                                                  <p className="text-sm text-muted-foreground mt-1">
                                                    {activity.description}
                                                  </p>
                                                )}
                                                {activity.location && (
                                                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                                                    <MapPin className="h-3 w-3 mr-1" />
                                                    {activity.location}
                                                  </div>
                                                )}
                                                {activity.duration_hours && (
                                                  <p className="text-xs text-muted-foreground mt-1">
                                                    Duration: {activity.duration_hours} hours
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                            {!readonly && (
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openActivityDialog(activity)}
                                              >
                                                <Edit2 className="h-4 w-4" />
                                              </Button>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-4 text-muted-foreground">
                                  <p className="text-sm">No activities scheduled</p>
                                  {!readonly && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="mt-2"
                                      onClick={() => openActivityDialog(undefined, item.id)}
                                    >
                                      <Plus className="h-4 w-4 mr-1" />
                                      Add Activity
                                    </Button>
                                  )}
                                </div>
                              )}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <ItineraryItemDialog
        open={isItemDialogOpen}
        onOpenChange={setIsItemDialogOpen}
        item={editingItem}
        entityType={entityType}
        entityId={entityId}
        dayNumber={addingItemToDay}
        onClose={closeDialogs}
      />

      <ActivityDialog
        open={isActivityDialogOpen}
        onOpenChange={setIsActivityDialogOpen}
        activity={editingActivity}
        itemId={addingActivityToItem}
        onClose={closeDialogs}
      />
    </div>
  );
};
