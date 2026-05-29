'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Auth } from '@/components/Auth';
import { Dashboard } from '@/components/Dashboard';
import { TripCreator } from '@/components/TripCreator';
import { TripDetail } from '@/components/TripDetail';
import { Loader2 } from 'lucide-react';

type ViewState = 'dashboard' | 'create' | 'detail';

export default function Home() {
  const { user, isLoading } = useAuth();
  const [view, setView] = useState<ViewState>('dashboard');
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-indigo-400 animate-spin" />
        <span className="text-slate-400 text-sm mt-4">Connecting to travel agent server...</span>
      </div>
    );
  }

  // If user is not authenticated, display the login/register screen
  if (!user) {
    return <Auth />;
  }

  // Client-side view routing based on workspace state
  switch (view) {
    case 'create':
      return (
        <TripCreator
          onBack={() => setView('dashboard')}
          onTripCreated={(tripId) => {
            setSelectedTripId(tripId);
            setView('detail');
          }}
        />
      );
    
    case 'detail':
      return selectedTripId ? (
        <TripDetail
          tripId={selectedTripId}
          onBack={() => setView('dashboard')}
        />
      ) : (
        <Dashboard
          onSelectTrip={(tripId) => {
            setSelectedTripId(tripId);
            setView('detail');
          }}
          onCreateNewTrip={() => setView('create')}
        />
      );

    case 'dashboard':
    default:
      return (
        <Dashboard
          onSelectTrip={(tripId) => {
            setSelectedTripId(tripId);
            setView('detail');
          }}
          onCreateNewTrip={() => setView('create')}
        />
      );
  }
}
