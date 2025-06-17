// src/pages/Habits.tsx
import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, isToday } from 'date-fns';
import {
    PlusIcon,
    TrashIcon,
    PencilIcon,
    ArrowLeftIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';
import HabitForm from '../components/HabitForm';

type HabitFrequency = 'daily' | 'weekly' | 'monthly';
type HabitTime = 'morning' | 'afternoon' | 'evening' | 'anytime';

interface Habit {
    id: string;
    title: string;
    description: string;
    frequency: HabitFrequency;
    timeOfDay: HabitTime;
    streak: number;
    createdAt: string;
    updatedAt: string;
    completions: string[]; // Dates when habit was completed (ISO strings)
}

const Habits: React.FC = () => {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [currentWeek, setCurrentWeek] = useState(new Date());

    // Load habits from localStorage
    useEffect(() => {
        try {
            const savedHabits = localStorage.getItem('habits');
            if (savedHabits) {
                setHabits(JSON.parse(savedHabits));
            }
            setLoading(false);
        } catch (err) {
            setError('Failed to load habits');
            setLoading(false);
        }
    }, []);

    // Save habits to localStorage
    useEffect(() => {
        localStorage.setItem('habits', JSON.stringify(habits));
    }, [habits]);

    const handleCreateHabit = (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'completions' | 'streak'>) => {
        const newHabit: Habit = {
            ...habit,
            id: `habit-${Date.now()}`,
            streak: 0,
            completions: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setHabits([...habits, newHabit]);
        setShowForm(false);
    };

    const handleUpdateHabit = (updatedHabit: Habit) => {
        setHabits(habits.map(h => h.id === updatedHabit.id ? {
            ...updatedHabit,
            updatedAt: new Date().toISOString()
        } : h));
        setEditingHabit(null);
    };

    const handleDeleteHabit = (id: string) => {
        setHabits(habits.filter(h => h.id !== id));
    };

    const toggleHabitCompletion = (habitId: string, date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');

        setHabits(habits.map(habit => {
            if (habit.id !== habitId) return habit;

            const isCompleted = habit.completions.includes(dateStr);
            let newStreak = habit.streak;

            if (isCompleted) {
                // Remove completion
                return {
                    ...habit,
                    streak: newStreak > 0 ? newStreak - 1 : 0,
                    completions: habit.completions.filter(d => d !== dateStr)
                };
            } else {
                // Add completion
                const yesterday = new Date(date);
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = format(yesterday, 'yyyy-MM-dd');

                // Check if completed yesterday to continue streak
                if (habit.completions.includes(yesterdayStr)) {
                    newStreak = habit.streak + 1;
                } else if (isToday(date)) {
                    // If it's today and no completion yesterday, start new streak
                    newStreak = 1;
                }

                return {
                    ...habit,
                    streak: newStreak,
                    completions: [...habit.completions, dateStr]
                };
            }
        }));
    };

    const getTimeOfDayColor = (time: HabitTime) => {
        switch (time) {
            case 'morning': return 'bg-blue-100 text-blue-800';
            case 'afternoon': return 'bg-yellow-100 text-yellow-800';
            case 'evening': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getFrequencyColor = (frequency: HabitFrequency) => {
        switch (frequency) {
            case 'daily': return 'bg-green-100 text-green-800';
            case 'weekly': return 'bg-orange-100 text-orange-800';
            case 'monthly': return 'bg-pink-100 text-pink-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Generate week days for the tracker
    const weekDays = Array.from({ length: 7 }).map((_, index) => {
        const day = addDays(startOfWeek(currentWeek), index);
        return {
            date: day,
            dayName: format(day, 'EEE'),
            dateNum: format(day, 'd'),
            isToday: isToday(day)
        };
    });

    const prevWeek = () => {
        setCurrentWeek(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() - 7);
            return newDate;
        });
    };

    const nextWeek = () => {
        setCurrentWeek(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + 7);
            return newDate;
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Habits</h1>
                <button
                    onClick={() => {
                        setEditingHabit(null);
                        setShowForm(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>New Habit</span>
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                        <HabitForm
                            habit={editingHabit}
                            onSubmit={editingHabit ? handleUpdateHabit : handleCreateHabit}
                            onCancel={() => {
                                setShowForm(false);
                                setEditingHabit(null);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Week Navigation */}
            <div className="mb-6 flex items-center justify-between">
                <button
                    onClick={prevWeek}
                    className="p-2 rounded-full hover:bg-gray-100"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-semibold">
                    {format(startOfWeek(currentWeek), 'MMM d')} - {format(addDays(startOfWeek(currentWeek), 6), 'MMM d, yyyy')}
                </h2>

                <button
                    onClick={nextWeek}
                    className="p-2 rounded-full hover:bg-gray-100"
                >
                    <ArrowRightIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Habit Tracker */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                    <tr>
                        <th className="p-3 text-left sticky left-0 bg-white z-10 min-w-[250px]">Habit</th>
                        {weekDays.map((day, index) => (
                            <th
                                key={index}
                                className={`p-3 text-center ${day.isToday ? 'bg-blue-50' : ''}`}
                            >
                                <div className="flex flex-col items-center">
                                    <span className="text-sm font-medium">{day.dayName}</span>
                                    <span className={`text-xs ${day.isToday ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
                      {day.dateNum}
                    </span>
                                </div>
                            </th>
                        ))}
                        <th className="p-3 text-center">Streak</th>
                    </tr>
                    </thead>
                    <tbody>
                    {habits.map(habit => (
                        <tr key={habit.id} className="border-t border-gray-200 hover:bg-gray-50">
                            <td className="p-3 sticky left-0 bg-white z-10">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="font-medium">{habit.title}</div>
                                        <div className="flex gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${getTimeOfDayColor(habit.timeOfDay)}`}>
                          {habit.timeOfDay}
                        </span>
                                            <span className={`text-xs px-2 py-1 rounded-full ${getFrequencyColor(habit.frequency)}`}>
                          {habit.frequency}
                        </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => setEditingHabit(habit)}
                                            className="text-gray-500 hover:text-blue-600"
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteHabit(habit.id)}
                                            className="text-gray-500 hover:text-red-600"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </td>

                            {weekDays.map((day, dayIndex) => {
                                const dateStr = format(day.date, 'yyyy-MM-dd');
                                const isCompleted = habit.completions.includes(dateStr);

                                return (
                                    <td
                                        key={dayIndex}
                                        className={`p-3 text-center ${day.isToday ? 'bg-blue-50' : ''}`}
                                    >
                                        <button
                                            onClick={() => toggleHabitCompletion(habit.id, day.date)}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                isCompleted
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-gray-200 hover:bg-gray-300'
                                            }`}
                                        >
                                            {isCompleted ? '✓' : ''}
                                        </button>
                                    </td>
                                );
                            })}

                            <td className="p-3 text-center">
                                <div className="flex items-center justify-center">
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                        habit.streak > 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                    }`}>
                      {habit.streak} 🔥
                    </span>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {habits.length === 0 && (
                <div className="text-center py-12">
                    <div className="bg-gray-100 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <PlusIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No habits yet</h3>
                    <p className="text-gray-500 mb-4">
                        Start building good habits to improve your productivity
                    </p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                    >
                        Create Habit
                    </button>
                </div>
            )}
        </div>
    );
};

export default Habits;