
import React from 'react';
import { ThemeType } from './types';

export const THEMES: Record<ThemeType, { bg: string, glow: string, text: string }> = {
  MINT: {
    bg: 'radial-gradient(circle at 50% 120%, rgba(204, 251, 241, 0.8) 0%, rgba(255, 255, 255, 0) 70%)',
    glow: 'rgba(204, 251, 241, 0.3)',
    text: 'text-teal-900'
  },
  LAVENDER: {
    bg: 'radial-gradient(circle at 50% 120%, rgba(237, 233, 254, 0.8) 0%, rgba(255, 255, 255, 0) 70%)',
    glow: 'rgba(237, 233, 254, 0.3)',
    text: 'text-indigo-900'
  },
  APRICOT: {
    bg: 'radial-gradient(circle at 50% 120%, rgba(254, 215, 170, 0.8) 0%, rgba(255, 255, 255, 0) 70%)',
    glow: 'rgba(254, 215, 170, 0.3)',
    text: 'text-orange-900'
  }
};

export const MOCK_WEEKLY_DATA = [
  { day: 'M', stress: 30, focus: 80 },
  { day: 'T', stress: 45, focus: 75 },
  { day: 'W', stress: 65, focus: 60 },
  { day: 'T', stress: 25, focus: 90 },
  { day: 'F', stress: 55, focus: 70 },
  { day: 'S', stress: 20, focus: 40 },
  { day: 'S', stress: 15, focus: 30 },
];
