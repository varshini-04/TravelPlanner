'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../services/api';
import { Compass, LogOut, Plus, Trash2, Calendar, MapPin, DollarSign, Tag, Navigation, Loader2, ArrowRight } from 'lucide-react';

interface Trip {
  _id: string;
  destination: string;
  duration: number;
  budgetLevel: string;
  interests: string[];
  createdAt: string;
}

interface DashboardProps {
  onSelectTrip: (tripId: string) => void;
  onCreateNewTrip: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectTrip, onCreateNewTrip }) => {
  const { user, logout } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTrips = async () => {
    try {
      const data = await fetchApi('/api/trips');
      setTrips(data.trips || []);
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleDelete = async (e: React.MouseEvent, tripId: string) => {
    e.stopPropagation(); // prevent card click
    if (!confirm('Are you sure you want to delete this trip itinerary?')) return;

    setDeletingId(tripId);
    try {
      await fetchApi(`/api/trips/${tripId}`, { method: 'DELETE' });
      setTrips(trips.filter(t => t._id !== tripId));
    } catch (err) {
      alert('Failed to delete trip');
    } finally {
      setDeletingId(null);
    }
  };

  const getBudgetBadgeColor = (level: string) => {
    switch (level) {
      case 'Low': return 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40';
      case 'Medium': return 'bg-amber-950/40 text-amber-400 border-amber-800/40';
      case 'High': return 'bg-rose-950/40 text-rose-400 border-rose-800/40';
      default: return 'bg-slate-900 text-slate-400 border-slate-800';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Navbar */}
      <header className="border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-3xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white transition-all">
              <Compass className="h-5 w-5 text-black group-hover:rotate-45 transition-transform duration-500" />
            </div>
            <span className="font-extrabold text-xl bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">Antigravity Travel</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-zinc-500 hidden sm:inline">{user?.email}</span>
            <button
              onClick={logout}
              className="flex items-center space-x-2 text-sm text-zinc-400 hover:text-white border border-transparent hover:border-white/10 hover:bg-white/5 px-3.5 py-2 rounded-xl transition duration-150"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Your Travel Dashboard</h1>
            <p className="text-zinc-400 mt-1">Design, customize, and review your AI-generated travel plans.</p>
          </div>
          <button
            onClick={onCreateNewTrip}
            className="flex items-center justify-center space-x-2 px-6 py-3.5 border border-transparent text-sm font-semibold rounded-full text-black bg-white hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shrink-0"
          >
            <Plus className="h-5 w-5" />
            <span>Create New Plan</span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 h-56 animate-pulse flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="h-6 w-2/3 bg-slate-800 rounded-lg" />
                  <div className="h-4 w-1/3 bg-slate-800 rounded-lg" />
                </div>
                <div className="h-10 w-full bg-slate-800 rounded-xl" />
              </div>
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-900/20 border border-dashed border-slate-900 rounded-3xl text-center px-4">
            <div className="h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center text-indigo-400 mb-4 border border-slate-800">
              <Navigation className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold text-white">No plans generated yet</h3>
            <p className="text-slate-400 mt-2 max-w-sm">Use our AI agent engine to generate your first custom travel plan in seconds.</p>
            <button
              onClick={onCreateNewTrip}
              className="mt-6 px-5 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-sm font-semibold text-white transition duration-150"
            >
              Start Planning
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map(trip => (
              <div
                key={trip._id}
                onClick={() => onSelectTrip(trip._id)}
                className="group relative bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/20 rounded-[2rem] p-6 flex flex-col justify-between h-64 cursor-pointer active:scale-95 transition-all duration-300 overflow-hidden"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-bold text-zinc-100 group-hover:text-white transition-colors line-clamp-1">
                      {trip.destination}
                    </h3>
                    <button
                      onClick={(e) => handleDelete(e, trip._id)}
                      disabled={deletingId === trip._id}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition duration-150"
                      title="Delete Trip"
                    >
                      {deletingId === trip._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-zinc-500 mt-2">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{trip.duration} Days</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{new Date(trip.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Interests */}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {trip.interests.slice(0, 3).map((interest, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-transparent border border-white/10 text-zinc-400 px-2 py-0.5 rounded-full"
                      >
                        {interest}
                      </span>
                    ))}
                    {trip.interests.length > 3 && (
                      <span className="text-[10px] text-zinc-500 px-1 self-center">
                        +{trip.interests.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-4">
                  <span className={`text-xs px-3 py-1 rounded-full border font-bold ${getBudgetBadgeColor(trip.budgetLevel)}`}>
                    {trip.budgetLevel} Budget
                  </span>
                  <span className="text-sm text-zinc-100 font-semibold group-hover:translate-x-2 transition-transform flex items-center space-x-1">
                    <span>View Itinerary</span>
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
