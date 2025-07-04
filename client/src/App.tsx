import { AppProvider } from './contexts/AppProvider';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Tasks from './pages/Tasks';
import Projects from './pages/Projects';
import Notes from './pages/Notes';
import TimeTracker from "./pages/TimeTracker";
import Goals from "./pages/Goals";
import Habits from "./pages/Habits";
import PomodoroTimer from "./pages/PomodoroTimer";
import RoadmapPage from "./pages/RoadmapPage";
import Layout from './components/Layout/Layout';
import { createBrowserRouter, RouterProvider, Outlet, useLocation, Navigate } from 'react-router-dom';

const AuthCheck = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // if (!isAuthenticated && location.pathname !== '/login' && location.pathname !== '/register') {
  //   return <Navigate to="/login" state={{ from: location }} replace />;
  // }

  return <Outlet />;
};

const LayoutWrapper = () => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

const router = createBrowserRouter([
  {
    element: <AuthCheck />,
    children: [
      {
        element: <LayoutWrapper />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "calendar", element: <Calendar /> },
          { path: "tasks", element: <Tasks /> },
          { path: "projects", element: <Projects /> },
          { path: "notes", element: <Notes /> },
          { path: "tracker", element: <TimeTracker /> },
          { path: "goals", element: <Goals /> },
          { path: "habits", element: <Habits /> },
          { path: "pomodoro", element: <PomodoroTimer /> },
          { path: "roadmap", element: <RoadmapPage /> },
        ]
      },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
    ]
  }
]);

const App = () => {
  return (
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
  );
};

export default App;