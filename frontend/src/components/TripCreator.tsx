'use client';

import React, { useState } from 'react';
import { fetchApi } from '../services/api';
import { Compass, ArrowLeft, Loader2, Sparkles, Plane, Landmark, Hotel, BaggageClaim } from 'lucide-react';
import { MultiStepForm } from './MultiStepForm';

interface TripCreatorProps {
  onBack: () => void;
  onTripCreated: (tripId: string) => void;
}

const INTEREST_OPTIONS = [
  'Adventure', 'Food & Dining', 'Culture & History', 'Nature & Outdoors',
  'Shopping', 'Relaxation & Spa', 'Arts & Museums', 'Nightlife',
  'Family Friendly', 'Beaches', 'Hiking & Trekking', 'Photography'
];

const LOADING_STEPS = [
  { icon: Plane, text: 'Consulting AI Travel Agent...' },
  { icon: Landmark, text: 'Mapping local sightseeing routes...' },
  { icon: Hotel, text: 'Selecting best budget accommodation...' },
  { icon: BaggageClaim, text: 'Simulating weather & assembling smart packing list...' }
];

export const TripCreator: React.FC<TripCreatorProps> = ({ onBack, onTripCreated }) => {
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (tripData: { destination: string; duration: number; budgetLevel: 'Low' | 'Medium' | 'High'; interests: string[] }) => {
    setError(null);
    setLoading(true);
    setLoadingStep(0);

    // Handle component unmount cleanly
    const abortController = new AbortController();
    
    // Simulate stepping through progress phases to show dynamic loading state
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 2500);

    try {
      const data = await fetchApi('/api/trips', {
        method: 'POST',
        body: JSON.stringify(tripData),
        signal: abortController.signal
      });
      
      clearInterval(interval);
      if (data.trip && data.trip._id) {
        onTripCreated(data.trip._id);
      } else {
        throw new Error('Trip created, but no ID returned');
      }
    } catch (err: any) {
      clearInterval(interval);
      if (err.name === 'AbortError') return; // Component unmounted
      setError(err.message || 'Generation failed. Please try again.');
      setLoading(false);
    }
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      // Any ongoing intervals are cleared in the catch block if aborted
    };
  }, []);

  const CurrentLoadingStepIcon = LOADING_STEPS[loadingStep].icon;

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-[100] bg-[#0a0a0a] flex flex-col items-center justify-center px-4 overflow-hidden">
          {/* Minimalist ambient glow instead of loud orbs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-md w-full text-center space-y-8 z-10">
            <div className="relative inline-flex items-center justify-center">
              <div className="h-24 w-24 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] flex items-center justify-center shadow-2xl backdrop-blur-xl">
                <CurrentLoadingStepIcon className="h-10 w-10 text-zinc-300 animate-bounce" />
              </div>
              <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-white flex items-center justify-center text-[10px] font-extrabold text-black shadow-lg">
                AI
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">Drafting Your Travel Adventure</h2>
              <p className="text-zinc-500 text-sm max-w-xs mx-auto">
                Our AI travel planner is organizing your itinerary details. This may take 15-20 seconds.
              </p>
            </div>

            {/* Steps checklist visual */}
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-[2rem] p-8 text-left space-y-5 shadow-2xl backdrop-blur-xl">
              {LOADING_STEPS.map((step, idx) => {
                const StepIcon = step.icon;
                const isPast = idx < loadingStep;
                const isCurrent = idx === loadingStep;
                return (
                  <div key={idx} className={`flex items-center space-x-4 transition-all duration-500 ${isPast || isCurrent ? 'opacity-100 translate-x-0' : 'opacity-20 -translate-x-2'}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center border transition-colors duration-500 ${isPast ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : isCurrent ? 'bg-white border-white text-black' : 'bg-transparent border-zinc-800 text-zinc-700'}`}>
                      {isPast ? '✓' : isCurrent ? <Loader2 className="h-4 w-4 animate-spin text-black" /> : idx + 1}
                    </div>
                    <span className={`text-sm transition-colors duration-500 ${isCurrent ? 'font-semibold text-zinc-100' : 'text-zinc-500'}`}>{step.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className={`min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col relative overflow-hidden transition-opacity duration-300 ${loading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      {/* Absolute minimalist canvas, no massive glowing orbs. */}
      
      {/* Header */}
      <header className="border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-3xl sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-sm text-zinc-500 hover:text-zinc-100 transition duration-300"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center space-x-2">
            <Compass className="h-5 w-5 text-zinc-300" />
            <span className="font-semibold text-sm text-zinc-400">New Itinerary</span>
          </div>
        </div>
      </header>

      {/* Form Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-12 z-10 flex flex-col items-center justify-center">
        <MultiStepForm onSubmit={handleSubmit} loading={loading} error={error} />
      </main>
    </div>
    </>
  );
};
