// src/pages/PomodoroTimer.tsx
import React, {useEffect, useRef, useState} from 'react';
import {useApp} from '../contexts/AppContext';
import type {Task} from '@time-management/shared-types';
import {PauseIcon, PlayIcon, PlusIcon, StopIcon, XMarkIcon} from '@heroicons/react/24/outline';

const PomodoroTimer: React.FC = () => {
    const {tasks} = useApp();
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [customTask, setCustomTask] = useState('');
    const [timerMode, setTimerMode] = useState<'work' | 'break'>('work');
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [pomodoroCount, setPomodoroCount] = useState(0);
    const [showTaskSelector, setShowTaskSelector] = useState(false);
    const [workDuration, setWorkDuration] = useState(25);
    const [breakDuration] = useState(5);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio('/sounds/alert.mp3');
        }
    }, []);

    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (isRunning && timeLeft > 0) {
            timer = setTimeout(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
        } else if (isRunning && timeLeft === 0) {
            // Timer completed
            audioRef.current?.play();
            setIsRunning(false);

            if (timerMode === 'work') {
                setPomodoroCount(pomodoroCount + 1);
                setTimerMode('break');
                setTimeLeft(breakDuration * 60);
            } else {
                setTimerMode('work');
                setTimeLeft(workDuration * 60);
            }
        }

        return () => clearTimeout(timer);
    }, [isRunning, timeLeft, timerMode, pomodoroCount, workDuration, breakDuration]);

    const startTimer = () => {
        setIsRunning(true);
    };

    const pauseTimer = () => {
        setIsRunning(false);
    };

    const resetTimer = () => {
        setIsRunning(false);
        setTimerMode('work');
        setTimeLeft(workDuration * 60);
    };

    const toggleTimer = () => {
        if (isRunning) {
            pauseTimer();
        } else {
            startTimer();
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const calculateProgress = () => {
        const totalSeconds = timerMode === 'work' ? workDuration * 60 : breakDuration * 60;
        return (timeLeft / totalSeconds) * 100;
    };

    const handleTaskSelect = (task: Task) => {
        setSelectedTask(task);
        setShowTaskSelector(false);
    };

    const handleCustomTask = () => {
        if (customTask.trim()) {
            setSelectedTask({
                id: 'custom',
                title: customTask,
                description: '',
                dueDate: new Date().toISOString(),
                priority: 'medium',
                status: 'todo',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            setCustomTask('');
            setShowTaskSelector(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-5 to-purple-10 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-indigo-900 mb-2">Pomodoro Timer</h1>
                    <p className="text-gray-600">
                        Focus on your task, take breaks, and boost productivity
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Timer Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center">
                                  <span className={`text-lg font-semibold ${
                                      timerMode === 'work' ? 'text-red-500' : 'text-green-500'
                                  }`}>
                                    {timerMode === 'work' ? 'Focus Time' : 'Break Time'}
                                  </span>
                                                    <span className="ml-4 px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                                    {pomodoroCount} 🍅
                                  </span>
                                </div>

                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setWorkDuration(25)}
                                        className={`px-3 py-1 rounded-lg ${
                                            workDuration === 25
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-200 text-gray-700'
                                        }`}
                                    >
                                        25
                                    </button>
                                    <button
                                        onClick={() => setWorkDuration(50)}
                                        className={`px-3 py-1 rounded-lg ${
                                            workDuration === 50
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-200 text-gray-700'
                                        }`}
                                    >
                                        50
                                    </button>
                                    <span className="px-2 text-gray-500">min work</span>
                                </div>
                            </div>

                            {/* Visual Timer */}
                            <div className="relative flex justify-center items-center mb-8">
                                <div className="relative w-64 h-64">
                                    {/* Progress Circle */}
                                    <svg className="w-full h-full" viewBox="0 0 100 100">
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="45"
                                            fill="none"
                                            stroke="#e0e0e0"
                                            strokeWidth="8"
                                        />
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="45"
                                            fill="none"
                                            stroke={timerMode === 'work' ? "#ef4444" : "#10b981"}
                                            strokeWidth="8"
                                            strokeLinecap="round"
                                            strokeDasharray="283"
                                            strokeDashoffset={283 - (283 * calculateProgress()) / 100}
                                            transform="rotate(-90 50 50)"
                                        />
                                    </svg>

                                    {/* Timer Display */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <div className="text-4xl font-bold text-gray-800">
                                            {formatTime(timeLeft)}
                                        </div>
                                        <div className="text-gray-500 mt-1">
                                            {timerMode === 'work' ? 'Stay focused!' : 'Relax a bit'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={toggleTimer}
                                    className={`flex items-center justify-center w-16 h-16 rounded-full ${
                                        isRunning
                                            ? 'bg-yellow-500 hover:bg-yellow-600'
                                            : 'bg-green-500 hover:bg-green-600'
                                    } text-white shadow-lg transition-all`}
                                >
                                    {isRunning ? (
                                        <PauseIcon className="w-8 h-8"/>
                                    ) : (
                                        <PlayIcon className="w-8 h-8"/>
                                    )}
                                </button>

                                <button
                                    onClick={resetTimer}
                                    className="flex items-center justify-center w-16 h-16 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transition-all"
                                >
                                    <StopIcon className="w-8 h-8"/>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Task Section */}
                    <div className="">
                        <div className="bg-white rounded-2xl shadow-xl p-6 max-h-[62vh]">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Current Task</h2>
                                <button
                                    onClick={() => setShowTaskSelector(true)}
                                    className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
                                >
                                    <PlusIcon className="w-4 h-4 mr-1"/> Task
                                </button>
                            </div>

                            {selectedTask ? (
                                <div className="bg-indigo-50 rounded-xl p-4 border-2 border-indigo-200 mb-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-lg text-gray-800">
                                                {selectedTask.title}
                                            </h3>
                                            {selectedTask.description && (
                                                <p className="text-gray-600 mt-2">{selectedTask.description}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setSelectedTask(null)}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            <XMarkIcon className="w-5 h-5"/>
                                        </button>
                                    </div>
                                    <div className="mt-3 flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                        selectedTask.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : selectedTask.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedTask.priority}
                    </span>
                                        {selectedTask.id !== 'custom' && (
                                            <span className="ml-2 text-sm text-gray-500">
                        Due: {new Date(selectedTask.dueDate).toLocaleDateString()}
                      </span>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-2">
                                    <div
                                        className="bg-gray-100 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center hover:bg-indigo-700">

                                        <button
                                            onClick={() => setShowTaskSelector(true)}
                                            className="px-4 py-2 text-white rounded-lg"
                                        >
                                            <PlusIcon className="w-8 h-8 text-gray-400"/>
                                        </button>

                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-1">No task selected</h3>
                                    <p className="text-gray-500 mb-2">
                                        Select a task to focus on during your Pomodoro session
                                    </p>

                                </div>
                            )}
                            {/* TODO: some problems with seemed part of rules(and task selection element themself)*/}
                            <div className="mt-2">
                                <h3 className="font-semibold text-gray-800">Pomodoro Technique</h3>
                                <ol className="list-decimal pl-5 space-y-2 text-gray-600 overflow-y-auto max-h-[15vh]">
                                    <li>Choose a task to focus on</li>
                                    <li>Work for {workDuration} minutes without distractions</li>
                                    <li>Take a {breakDuration} minute break</li>
                                    <li>After 4 pomodoros, take a longer break (15-30 min)</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Task Selector Modal */}
            {showTaskSelector && (
                <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Select Task</h2>
                            <button
                                onClick={() => setShowTaskSelector(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <XMarkIcon className="w-6 h-6"/>
                            </button>
                        </div>

                        <div className="mb-4">
                            <h3 className="font-medium mb-2">Existing Tasks</h3>
                            <div className="max-h-60 overflow-y-auto border rounded-lg">
                                {tasks.length > 0 ? (
                                    tasks.map(task => (
                                        <div
                                            key={task.id}
                                            className="p-3 border-b hover:bg-indigo-50 cursor-pointer"
                                            onClick={() => handleTaskSelect(task)}
                                        >
                                            <div className="font-medium">{task.title}</div>
                                            <div className="text-sm text-gray-500">{task.description}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-gray-500">
                                        No tasks available
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="font-medium mb-2">Or create a custom task</h3>
                            <div className="flex">
                                <input
                                    type="text"
                                    value={customTask}
                                    onChange={(e) => setCustomTask(e.target.value)}
                                    placeholder="What are you working on?"
                                    className="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <button
                                    onClick={handleCustomTask}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden audio element for alerts */}
            <audio ref={audioRef}>
                <source src="/sounds/alert.mp3" type="audio/mpeg"/>
            </audio>
        </div>
    );
};

export default PomodoroTimer;