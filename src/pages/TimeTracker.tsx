import React, { useState, useEffect } from 'react';
import { PlayIcon, PauseIcon, StopIcon } from '@heroicons/react/24/outline';

const TimeTracker: React.FC = () => {
    const [isTracking, setIsTracking] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [currentTask, setCurrentTask] = useState('');
    const [tasks, setTasks] = useState<Array<{name: string, time: number}>>([]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isTracking) {
            interval = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isTracking]);

    const startTracking = () => {
        setIsTracking(true);
    };

    const pauseTracking = () => {
        setIsTracking(false);
    };

    const stopTracking = () => {
        setIsTracking(false);
        if (currentTask && elapsedTime > 0) {
            setTasks([...tasks, { name: currentTask, time: elapsedTime }]);
            setCurrentTask('');
            setElapsedTime(0);
        }
    };

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Time Tracker</h1>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-center mb-4">
                    <input
                        type="text"
                        value={currentTask}
                        onChange={(e) => setCurrentTask(e.target.value)}
                        placeholder="What are you working on?"
                        className="flex-1 p-3 border rounded-l-lg focus:outline-none"
                        disabled={isTracking}
                    />
                    <div className="bg-gray-100 px-4 py-3 border-t border-b border-r rounded-r-lg">
                        {formatTime(elapsedTime)}
                    </div>
                </div>

                <div className="flex space-x-3">
                    {!isTracking ? (
                        <button
                            onClick={startTracking}
                            disabled={!currentTask}
                            className="flex items-center bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
                        >
                            <PlayIcon className="w-5 h-5 mr-1" /> Start
                        </button>
                    ) : (
                        <button
                            onClick={pauseTracking}
                            className="flex items-center bg-yellow-500 text-white px-4 py-2 rounded"
                        >
                            <PauseIcon className="w-5 h-5 mr-1" /> Pause
                        </button>
                    )}

                    <button
                        onClick={stopTracking}
                        disabled={!isTracking && elapsedTime === 0}
                        className="flex items-center bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50"
                    >
                        <StopIcon className="w-5 h-5 mr-1" /> Stop
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Today's Sessions</h2>
                {tasks.length > 0 ? (
                    <ul className="space-y-3">
                        {tasks.map((task, index) => (
                            <li key={index} className="flex justify-between p-3 border-b">
                                <span>{task.name}</span>
                                <span className="font-mono">{formatTime(task.time)}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">No tracked time yet</p>
                )}
            </div>
        </div>
    );
};

export default TimeTracker;