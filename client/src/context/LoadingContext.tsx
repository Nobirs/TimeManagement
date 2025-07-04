import { createContext, useContext, useState, type ReactNode } from 'react';

interface LoadingContextType {
  isGlobalLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loadingCount, setLoadingCount] = useState(0);

  const startLoading = () => setLoadingCount((prev) => prev + 1);
  const stopLoading = () => setLoadingCount((prev) => Math.max(0, prev - 1));

  const value = {
    isGlobalLoading: loadingCount > 0,
    startLoading,
    stopLoading,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
