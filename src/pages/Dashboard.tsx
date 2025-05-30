import React, { useMemo } from 'react';
import { format, isToday, parseISO } from 'date-fns';
import { useApp } from '../context/AppContext';
import TaskCheckbox from '../components/TaskCheckbox';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard: React.FC = () => {
  const { tasks, events, isLoading, error, updateTask } = useApp();
  const today = new Date();

  // Memoize computed data to prevent unnecessary recalculations
  const {
    todaysTasks,
    todaysEvents,
    tasksByStatus,
    tasksByPriority,
    eventsByType,
  } = useMemo(() => {
    return {
      todaysTasks: tasks.filter(task => isToday(parseISO(task.dueDate))),
      todaysEvents: events.filter(event => isToday(parseISO(event.date))),
      tasksByStatus: {
        todo: tasks.filter(task => task.status === 'todo').length,
        inProgress: tasks.filter(task => task.status === 'in-progress').length,
        completed: tasks.filter(task => task.status === 'completed').length,
      },
      tasksByPriority: {
        high: tasks.filter(task => task.priority === 'high').length,
        medium: tasks.filter(task => task.priority === 'medium').length,
        low: tasks.filter(task => task.priority === 'low').length,
      },
      eventsByType: {
        meeting: events.filter(event => event.type === 'meeting').length,
        task: events.filter(event => event.type === 'task').length,
        reminder: events.filter(event => event.type === 'reminder').length,
      },
    };
  }, [tasks, events]);

  const handleTaskStatusChange = (taskId: string, currentStatus: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newStatus = currentStatus === 'todo' 
      ? 'in-progress' 
      : currentStatus === 'in-progress' 
        ? 'completed' 
        : 'todo';

    updateTask({ ...task, status: newStatus });
  };

  // Chart data
  const taskProgressData = {
    labels: ['To Do', 'In Progress', 'Completed'],
    datasets: [
      {
        label: 'Tasks by Status',
        data: [tasksByStatus.todo, tasksByStatus.inProgress, tasksByStatus.completed],
        backgroundColor: ['#fecaca', '#bfdbfe', '#bbf7d0'],
        borderColor: ['#ef4444', '#3b82f6', '#22c55e'],
        borderWidth: 1,
      },
    ],
  };

  const taskPriorityData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [
      {
        data: [tasksByPriority.high, tasksByPriority.medium, tasksByPriority.low],
        backgroundColor: ['#fecaca', '#fef08a', '#bbf7d0'],
        borderColor: ['#ef4444', '#eab308', '#22c55e'],
        borderWidth: 1,
      },
    ],
  };

  const eventTypeData = {
    labels: ['Meetings', 'Tasks', 'Reminders'],
    datasets: [
      {
        label: 'Events by Type',
        data: [eventsByType.meeting, eventsByType.task, eventsByType.reminder],
        backgroundColor: ['#bfdbfe', '#bbf7d0', '#fef08a'],
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-error-color p-4 rounded-lg bg-red-50 border border-red-200">
        {error}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          {format(today, 'EEEE, MMMM do, yyyy')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 min-h-0">
        {/* Today's Tasks */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 overflow-auto">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Today's Tasks</h2>
          <div className="space-y-3">
            {todaysTasks.length === 0 && (
              <p className="text-gray-500">No tasks scheduled for today</p>
            )}
            {todaysTasks.map(task => (
              <div key={task.id} className="flex items-center space-x-3">
                <TaskCheckbox
                  status={task.status}
                  onChange={() => handleTaskStatusChange(task.id, task.status)}
                  size="md"
                />
                <div>
                  <span className="text-sm text-gray-700">{task.title}</span>
                  <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Calendar Events */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 overflow-auto">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Today's Events</h2>
          <div className="space-y-3">
            {todaysEvents.length === 0 && (
              <p className="text-gray-500">No events scheduled for today</p>
            )}
            {todaysEvents.map(event => (
              <div key={event.id} className="flex items-center space-x-3">
                <div className={`h-4 w-4 rounded-full ${
                  event.type === 'meeting' ? 'bg-blue-500' :
                  event.type === 'task' ? 'bg-green-500' :
                  'bg-yellow-500'
                }`} />
                <span className="text-sm text-gray-700">
                  {event.time} - {event.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Task Progress */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Task Progress</h2>
          <div className="flex-1 flex items-center justify-center">
            <Bar
              data={taskProgressData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Task Priority Distribution */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Task Priority</h2>
          <div className="flex-1 flex items-center justify-center">
            <Doughnut
              data={taskPriorityData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Event Distribution */}
        <div className="col-span-2 bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Event Distribution</h2>
          <div className="flex-1 flex items-center justify-center">
            <Bar
              data={eventTypeData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 