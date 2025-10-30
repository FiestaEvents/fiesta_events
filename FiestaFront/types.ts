// FIX: Import ComponentType to resolve React namespace error.
import type { ComponentType } from 'react';

export interface Stat {
  title: string;
  value: string;
  change: string;
  icon: ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  guests: number;
  status: 'confirmed' | 'pending';
  description: string;
  attendees: string[];
  notes: string;
}

export interface RecentActivity {
  id: string;
  clientName: string;
  amount: number;
  status: 'paid' | 'pending';
  timestamp: string;
}

export interface DashboardData {
  stats: Stat[];
  upcomingEvents: UpcomingEvent[];
  recentActivity: RecentActivity[];
}