'use client';

import { ReactNode } from 'react';
import { LocaleProvider } from './LocaleProvider';
import { ToastProvider } from './ToastProvider';

interface AppProviderProps {
  children: ReactNode;
  locale: string;
}

export function AppProvider({ children, locale }: AppProviderProps) {
  return (
    <LocaleProvider locale={locale}>
      <ToastProvider />
      {children}
    </LocaleProvider>
  );
}
