'use client';

import { createContext, useContext, ReactNode } from 'react';

interface LocaleContextType {
  locale: string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

interface LocaleProviderProps {
  children: ReactNode;
  locale: string;
}

export function LocaleProvider({ children, locale }: LocaleProviderProps) {
  return (
    <LocaleContext.Provider value={{ locale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
