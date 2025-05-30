import React, { useState, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  parseISO,
  addMinutes,
  eachDayOfInterval
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useApp } from '../context/AppContext';
import type { Event } from '../context/AppContext';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';

const Calendar: React.FC = () => {
  const { events, addEvent, updateEvent, deleteEvent } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id'>>({
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    type: 'meeting'
  });

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { locale: ru });
    const calendarEnd = endOfWeek(monthEnd, { locale: ru });
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const getEventsForDay = (date: Date) => {
    return events
      .filter(event => event.date === format(date, 'yyyy-MM-dd'))
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  const onDragStart = () => {
    if (window.navigator.vibrate) {
      window.navigator.vibrate(100);
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // Если нет места назначения, прекращаем выполнение
    if (!destination) {
      return;
    }

    // Если место назначения то же самое, что и источник, и индекс тот же
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const eventToMove = events.find(event => event.id === draggableId);
    if (!eventToMove) {
      return;
    }

    // Получаем события для дня источника и дня назначения
    const sourceEvents = getEventsForDay(parseISO(source.droppableId));
    const destinationEvents = source.droppableId === destination.droppableId
      ? sourceEvents
      : getEventsForDay(parseISO(destination.droppableId));

    // Создаем копию массива событий дня назначения
    const newDestinationEvents = Array.from(destinationEvents);

    // Если перемещение между разными днями
    if (source.droppableId !== destination.droppableId) {
      // Обновляем событие с новой датой и временем
      const updatedEvent = {
        ...eventToMove,
        date: destination.droppableId,
        time: format(
          addMinutes(parseISO(`${destination.droppableId}T09:00:00`), destination.index * 30),
          'HH:mm'
        )
      };

      // Вставляем событие в новую позицию
      newDestinationEvents.splice(destination.index, 0, updatedEvent);

      // Обновляем времена всех событий в дне назначения
      newDestinationEvents.forEach((event, index) => {
        const newTime = format(
          addMinutes(parseISO(`${destination.droppableId}T09:00:00`), index * 30),
          'HH:mm'
        );
        if (event.id === draggableId) {
          updateEvent({ ...event, date: destination.droppableId, time: newTime });
        } else {
          updateEvent({ ...event, time: newTime });
        }
      });
    } else {
      // Если перемещение в пределах одного дня
      // Удаляем событие с исходной позиции
      newDestinationEvents.splice(source.index, 1);
      // Вставляем событие в новую позицию
      newDestinationEvents.splice(destination.index, 0, eventToMove);

      // Обновляем времена всех событий
      newDestinationEvents.forEach((event, index) => {
        const newTime = format(
          addMinutes(parseISO(source.droppableId + 'T09:00:00'), index * 30),
          'HH:mm'
        );
        updateEvent({ ...event, time: newTime });
      });
    }
  };

  const handleAddEvent = () => {
    if (editingEvent) {
      updateEvent({
        ...editingEvent,
        ...newEvent
      });
      setEditingEvent(null);
    } else {
      addEvent(newEvent);
    }
    setShowAddEvent(false);
    setNewEvent({
      title: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '09:00',
      type: 'meeting'
    });
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      date: event.date,
      time: event.time,
      type: event.type
    });
    setShowAddEvent(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    deleteEvent(eventId);
  };

  const getEventTypeColor = (type: Event['type']) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-100 text-blue-800';
      case 'task':
        return 'bg-green-100 text-green-800';
      case 'reminder':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddEventForDate = (date: Date) => {
    setEditingEvent(null);
    setNewEvent({
      title: '',
      date: format(date, 'yyyy-MM-dd'),
      time: '09:00',
      type: 'meeting'
    });
    setShowAddEvent(true);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-none flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <h1 className="text-lg font-bold text-gray-900">Calendar</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-base font-semibold">
              {format(currentDate, 'LLLL yyyy', { locale: ru })}
            </span>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        <div className="text-base text-gray-500">
          {format(currentDate, 'EEEE, MMMM do, yyyy')}
        </div>
      </div>

      <div className="flex-1">
        <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div className="h-full">
            {/* Calendar Grid */}
            <div className="h-[calc(100%-3.5rem)] grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
              {weekDays.map((day) => (
                <div key={day} className="bg-white p-0.5 text-center text-xs font-medium text-gray-500">
                  {day}
                </div>
              ))}
              {calendarDays.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const dayEvents = getEventsForDay(day);
                return (
                  <Droppable droppableId={dateStr} key={dateStr}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`h-full bg-white p-0.5 relative group ${
                          !isSameMonth(day, currentDate) ? 'bg-gray-50 text-gray-400' : ''
                        } ${isToday(day) ? 'bg-blue-50' : ''} ${
                          snapshot.isDraggingOver ? 'bg-primary-50' : ''
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="font-semibold text-xs select-none">
                            {format(day, 'd')}
                          </div>
                          {isSameMonth(day, currentDate) && (
                            <button
                              onClick={() => handleAddEventForDate(day)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-gray-100 rounded-full"
                            >
                              <PlusIcon className="w-2.5 h-2.5 text-gray-600" />
                            </button>
                          )}
                        </div>
                        <div className="mt-0.5 space-y-0.5 overflow-y-auto h-[calc(100%-1.25rem)]">
                          {dayEvents.map((event, index) => (
                            <Draggable
                              key={event.id}
                              draggableId={event.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{
                                    ...provided.draggableProps.style,
                                    cursor: snapshot.isDragging ? 'grabbing' : 'grab'
                                  }}
                                  className={`
                                    group relative px-0.5 py-0.5 text-xs rounded-full select-none
                                    ${snapshot.isDragging ? 'opacity-75 shadow-lg' : ''}
                                    ${getEventTypeColor(event.type)}
                                    transition-all duration-200
                                  `}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="select-none truncate">
                                      {event.time} - {event.title}
                                    </span>
                                    <div className="hidden group-hover:flex items-center space-x-0.5">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditEvent(event);
                                        }}
                                        className="p-0.5 hover:bg-white rounded-full select-none"
                                      >
                                        <PencilIcon className="w-2 h-2" />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteEvent(event.id);
                                        }}
                                        className="p-0.5 hover:bg-white rounded-full select-none"
                                      >
                                        <TrashIcon className="w-2 h-2" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </div>

            {/* Add/Edit Event Modal */}
            {showAddEvent && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h2 className="text-lg font-semibold mb-4">
                    {editingEvent ? 'Edit Event' : 'Add New Event'}
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Title</label>
                      <input
                        type="text"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date</label>
                      <input
                        type="date"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Time</label>
                      <input
                        type="time"
                        value={newEvent.time}
                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Type</label>
                      <select
                        value={newEvent.type}
                        onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as Event['type'] })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      >
                        <option value="meeting">Meeting</option>
                        <option value="task">Task</option>
                        <option value="reminder">Reminder</option>
                      </select>
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => {
                          setShowAddEvent(false);
                          setEditingEvent(null);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddEvent}
                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                      >
                        {editingEvent ? 'Update Event' : 'Add Event'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default Calendar;