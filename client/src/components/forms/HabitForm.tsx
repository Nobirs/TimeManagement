import React, { useState, useCallback } from 'react';
import { type Habit, Frequency, TimeOfDay } from '@time-management/shared-types';



interface HabitFormProps {
    habit?: Habit;
    onSubmit: (habit: Habit) => void;
    onCancel: () => void;
}

const HabitForm: React.FC<HabitFormProps> = ({ habit, onSubmit, onCancel }) => {
    const defaultHabit: Habit = {
        id: '',
        title: '',
        description: '',
        frequency: Frequency.Daily,
        timeOfDay: TimeOfDay.Anytime,
        streak: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: '1',
    }
    
    const [formData, setFormData] = useState<Habit>(habit || defaultHabit);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    }, [FormData, onSubmit]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">
                {habit ? 'Edit Habit' : 'Create New Habit'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                        type="text"
                        name="title"
                        aria-label="Habit Title"
                        value={formData.title}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        name="description"
                        aria-label="Habit Description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={2}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Frequency</label>
                        <select
                            name="frequency"
                            aria-label="Habit Frequency"
                            value={formData.frequency}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        >
                            {Object.entries(Frequency).map(([key, value]) => (
                                <option key={value} value={value}>{key}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Time of Day</label>
                        <select
                            name="timeOfDay"
                            aria-label="Habit Time of Day"
                            value={formData.timeOfDay}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        >
                            {Object.entries(TimeOfDay).map(([key, value]) => (
                                <option key={value} value={value}>{key}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                    >
                        {habit ? 'Update Habit' : 'Create Habit'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default HabitForm;