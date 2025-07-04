import type { ReactNode } from "react";
import { AuthProvider } from "./AuthContext";
import { TaskProvider } from "./TaskContext";
import { EventProvider } from "./EventContext";
import { ProjectProvider } from "./ProjectContext";
import { SettingsProvider } from "./SettingsContext";
import { LoadingProvider } from "./LoadingContext";

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <LoadingProvider>
      <AuthProvider>
        <SettingsProvider>
          <ProjectProvider>
            <TaskProvider>
              <EventProvider>{children}</EventProvider>
            </TaskProvider>
          </ProjectProvider>
        </SettingsProvider>
      </AuthProvider>
    </LoadingProvider>
  );
};
