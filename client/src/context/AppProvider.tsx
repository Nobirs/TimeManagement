import type { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { TaskProvider } from './TaskContext';
import { EventProvider } from './EventContext';
import { ProjectProvider } from './ProjectContext';
import { SettingsProvider } from './SettingsContext';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <SettingsProvider>
        <ProjectProvider>
          <TaskProvider>
            <EventProvider>
              {children}
            </EventProvider>
          </TaskProvider>
        </ProjectProvider>
      </SettingsProvider>
    </AuthProvider>
  );
};
