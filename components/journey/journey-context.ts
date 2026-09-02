'use client';

import { createContext, useContext } from 'react';

export const JourneyProgressContext = createContext(0);

export function useJourneyProgress(): number {
  return useContext(JourneyProgressContext);
}
