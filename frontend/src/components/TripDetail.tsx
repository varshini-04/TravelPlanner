'use client';

import React, { useState } from 'react';
import { fetchApi } from '../services/api';
import { 
  ArrowLeft, Calendar, Tag, CheckSquare, Square, CloudSun, CloudRain, 
  Sun, Snowflake, Cloud, Sparkles, DollarSign, Hotel, Clock, 
  MapPin, Settings, Loader2, Edit3, Trash2, Plus, Check 
} from 'lucide-react';

interface Activity {
  time: string;
  description: string;
  type: string;
}

interface DayItinerary {
  dayNumber: number;
  activities: Activity[];
}

interface EstimatedBudget {
  flights: number;
  accommodation: number;
  food: number;
  activities: number;
  total: number;
}

interface RecommendedHotel {
  name: string;
  tier: string;
  description: string;
}

interface WeatherForecast {
  temperature: string;
  condition: string;
  description: string;
}

interface Trip {
  _id: string;
  destination: string;
  duration: number;
  budgetLevel: string;
  interests: string[];
  itinerary: DayItinerary[];
  estimatedBudget: EstimatedBudget;
  recommendedHotels: RecommendedHotel[];
  packingList: string[];
  weatherForecast?: WeatherForecast;
}

interface TripDetailProps {
  tripId: string;
  onBack: () => void;
}

export const TripDetail: React.FC<TripDetailProps> = ({ tripId, onBack }) => {
  const [trip, setTrip] = React.useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState<number>(1);
  const [packingListChecked, setPackingListChecked] = useState<Record<string, boolean>>({});
  
  // Day editing / regeneration states
  const [showTweakModal, setShowTweakModal] = useState(false);
  const [tweakRequest, setTweakRequest] = useState('');
  const [tweakLoading, setTweakLoading] = useState(false);

  const [showManualEditModal, setShowManualEditModal] = useState(false);
  const [editActivities, setEditActivities] = useState<Activity[]>([]);
  const [saveLoading, setSaveLoading] = useState(false);

  const fetchTripDetails = async () => {
    try {
      const data = await fetchApi(`/api/trips/${tripId}`);
      setTrip(data.trip);
      
      // Initialize checking states
      if (data.trip?.packingList) {
        const initialChecks: Record<string, boolean> = {};
        data.trip.packingList.forEach((item: string) => {
          initialChecks[item] = false;
        });
        setPackingListChecked(initialChecks);
      }
    } catch (err) {
      console.error('Failed to load trip details:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTripDetails();
  }, [tripId]);

  const togglePackingItem = (item: string) => {
    setPackingListChecked(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const handleAITweak = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tweakRequest.trim() || !trip) return;

    setTweakLoading(true);
    try {
      const data = await fetchApi(`/api/trips/${trip._id}/day/${activeDay}`, {
        method: 'PUT',
        body: JSON.stringify({ tweakRequest: tweakRequest.trim() })
      });
      
      setTrip(data.trip);
      setShowTweakModal(false);
      setTweakRequest('');
    } catch (err) {
      alert('Failed to regenerate day. Please try again.');
    } finally {
      setTweakLoading(false);
    }
  };

  const openManualEdit = () => {
    if (!trip) return;
    const currentDay = trip.itinerary.find(d => d.dayNumber === activeDay);
    if (currentDay) {
      setEditActivities(currentDay.activities.map(a => ({ ...a })));
      setShowManualEditModal(true);
    }
  };

  const handleActivityChange = (index: number, key: keyof Activity, value: string) => {
    setEditActivities(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };

  const handleAddActivity = () => {
    setEditActivities(prev => [
      ...prev,
      { time: '12:00 PM', description: 'New custom activity', type: 'sightseeing' }
    ]);
  };

  const handleRemoveActivity = (index: number) => {
    setEditActivities(prev => prev.filter((_, i) => i !== index));
  };

  const handleManualSave = async () => {
    if (!trip) return;
    
    setSaveLoading(true);
    try {
      const data = await fetchApi(`/api/trips/${trip._id}/day/${activeDay}`, {
        method: 'PUT',
        body: JSON.stringify({ activities: editActivities })
      });
      
      setTrip(data.trip);
      setShowManualEditModal(false);
    } catch (err) {
      alert('Failed to save itinerary day. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Weather widget styling selector
  const getWeatherStyles = (condition: string) => {
    const cond = condition.toLowerCase();
    if (cond.includes('sun') || cond.includes('clear')) {
      return {
        bg: 'from-amber-950/30 to-slate-900/60 border-amber-900/20',
        icon: Sun,
        iconColor: 'text-amber-400'
      };
    } else if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('shower')) {
      return {
        bg: 'from-blue-950/30 to-slate-900/60 border-blue-900/20',
        icon: CloudRain,
        iconColor: 'text-blue-400'
      };
    } else if (cond.includes('snow') || cond.includes('frost')) {
      return {
        bg: 'from-sky-900/20 to-slate-900/60 border-sky-800/20',
        icon: Snowflake,
        iconColor: 'text-sky-300'
      };
    } else if (cond.includes('cloud') || cond.includes('overcast')) {
      return {
        bg: 'from-slate-800/30 to-slate-900/60 border-slate-700/20',
        icon: Cloud,
        iconColor: 'text-slate-400'
      };
    }
    return {
      bg: 'from-indigo-950/20 to-slate-900/60 border-indigo-950',
      icon: CloudSun,
      iconColor: 'text-indigo-400'
    };
  };

  const getActivityTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'food': return 'bg-orange-950/40 text-orange-400 border-orange-900/40';
      case 'sightseeing': return 'bg-blue-950/40 text-blue-400 border-blue-900/40';
      case 'adventure': return 'bg-purple-950/40 text-purple-400 border-purple-900/40';
      case 'relaxation': return 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40';
      case 'transit': return 'bg-slate-800/60 text-slate-300 border-slate-700/60';
      default: return 'bg-slate-900 text-slate-400 border-slate-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-zinc-300 animate-spin" />
        <span className="text-zinc-500 text-sm mt-4">Loading your itinerary...</span>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-center p-4">
        <h3 className="text-xl font-bold text-white">Trip plan not found</h3>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] transition-colors rounded-xl text-sm border border-white/10 text-white">
          Go Back
        </button>
      </div>
    );
  }

  const currentDayPlan = trip.itinerary.find(d => d.dayNumber === activeDay);
  const weather = trip.weatherForecast || { temperature: 'N/A', condition: 'Unknown', description: 'No simulated forecast data.' };
  const wStyles = getWeatherStyles(weather.condition);
  const WeatherIcon = wStyles.icon;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col">
      {/* Navbar */}
      <header className="border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-3xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-sm text-zinc-400 hover:text-white transition duration-150"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Dashboard</span>
          </button>
          
          <span className="font-semibold text-base bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent hidden sm:inline">{trip.destination} Planner</span>
        </div>
      </header>

      {/* Main Grid */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        
        {/* Trip Header Banner */}
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-[2rem] p-8 mb-8 relative overflow-hidden shadow-2xl backdrop-blur-3xl">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3">
              <span className="text-xs font-bold text-zinc-100 uppercase tracking-widest bg-white/[0.05] px-3 py-1 rounded-full border border-white/10 shadow-lg">
                Itinerary
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">{trip.destination}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
                <div className="flex items-center space-x-1.5">
                  <Calendar className="h-4 w-4 text-zinc-300" />
                  <span>{trip.duration} Days</span>
                </div>
                <div className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
                <div className="flex items-center space-x-1.5">
                  <DollarSign className="h-4 w-4 text-zinc-300" />
                  <span>{trip.budgetLevel} Budget</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 max-w-md">
              {trip.interests.map((interest, idx) => (
                <div key={idx} className="flex items-center space-x-1 text-xs bg-white/[0.03] border border-white/10 text-zinc-300 px-3 py-1.5 rounded-xl shadow-lg">
                  <Tag className="h-3 w-3 text-zinc-400" />
                  <span>{interest}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT AREA: Itinerary timeline and day selector */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Day horizontal selector */}
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-[2rem] p-2.5 flex items-center overflow-x-auto space-x-2 scrollbar-none">
              {trip.itinerary.map(day => (
                <button
                  key={day.dayNumber}
                  onClick={() => setActiveDay(day.dayNumber)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 ${activeDay === day.dayNumber ? 'bg-white text-black shadow-lg scale-[1.02]' : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'}`}
                >
                  Day {day.dayNumber}
                </button>
              ))}
            </div>

            {/* Day Itinerary Body */}
            <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.05] rounded-[2rem] p-8 relative shadow-2xl">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                <h3 className="text-xl font-bold text-white">Day {activeDay} Schedule</h3>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={openManualEdit}
                    className="flex items-center space-x-1.5 text-xs text-zinc-400 hover:text-black hover:bg-white border border-white/10 hover:border-transparent px-3.5 py-2 rounded-xl transition"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Edit Day</span>
                  </button>
                  <button
                    onClick={() => setShowTweakModal(true)}
                    className="flex items-center space-x-1.5 text-xs text-white hover:text-black bg-white/10 hover:bg-white border border-white/20 hover:border-transparent px-3.5 py-2 rounded-xl transition"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>AI Tweak</span>
                  </button>
                </div>
              </div>

              {/* Activities timeline */}
              {currentDayPlan && currentDayPlan.activities.length > 0 ? (
                <div className="relative pl-6 border-l border-white/5 space-y-8">
                  {currentDayPlan.activities.map((act, idx) => (
                    <div key={idx} className="relative group">
                      {/* Timeline point bullet */}
                      <div className="absolute -left-[31px] top-1 h-4.5 w-4.5 rounded-full bg-[#0a0a0a] border-2 border-zinc-600 group-hover:border-white group-hover:scale-125 transition-all" />
                      
                      <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-5 hover:border-white/20 transition-all hover:bg-white/[0.04]">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2.5">
                          <div className="flex items-center space-x-2.5 text-zinc-100 font-bold text-sm">
                            <Clock className="h-4.5 w-4.5 text-zinc-400" />
                            <span>{act.time}</span>
                          </div>
                          <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border self-start sm:self-center ${getActivityTypeColor(act.type)}`}>
                            {act.type}
                          </span>
                        </div>
                        <p className="text-zinc-400 text-sm leading-relaxed">{act.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500 text-sm">
                  No activities scheduled for this day yet.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT AREA: widgets */}
          <div className="space-y-8">
            
            {/* Weather Simulator Widget */}
            <div className={`bg-gradient-to-br ${wStyles.bg} border ${wStyles.bg} rounded-3xl p-6 shadow-xl`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-slate-300">Weather Simulator</h4>
                <WeatherIcon className={`h-6 w-6 ${wStyles.iconColor}`} />
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-extrabold text-white">{weather.temperature}</div>
                <div className="text-sm font-bold text-white">{weather.condition}</div>
                <p className="text-xs text-slate-400 leading-relaxed mt-2">{weather.description}</p>
              </div>
            </div>

            {/* Smart Packing Checklist */}
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-[2rem] p-6 shadow-2xl backdrop-blur-3xl">
              <h4 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center space-x-1.5">
                <span>Smart Packing List</span>
              </h4>
              
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {trip.packingList.map((item, idx) => {
                  const isChecked = !!packingListChecked[item];
                  return (
                    <button
                      key={idx}
                      onClick={() => togglePackingItem(item)}
                      className="w-full flex items-center space-x-3 text-left p-2.5 hover:bg-white/[0.04] rounded-xl transition text-xs"
                    >
                      {isChecked ? (
                        <CheckSquare className="h-4.5 w-4.5 text-zinc-300 shrink-0" />
                      ) : (
                        <Square className="h-4.5 w-4.5 text-zinc-600 shrink-0" />
                      )}
                      <span className={`${isChecked ? 'line-through text-zinc-600' : 'text-zinc-300'}`}>{item}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Budget Estimator Widget */}
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-[2rem] p-6 shadow-2xl backdrop-blur-3xl">
              <h4 className="text-sm font-semibold text-zinc-300 mb-4">Estimated Budget</h4>
              
              <div className="space-y-3.5">
                {[
                  { name: 'Flights', value: trip.estimatedBudget.flights },
                  { name: 'Accommodation', value: trip.estimatedBudget.accommodation },
                  { name: 'Food & Dining', value: trip.estimatedBudget.food },
                  { name: 'Activities', value: trip.estimatedBudget.activities }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">{item.name}</span>
                    <span className="font-semibold text-zinc-200">{trip.estimatedBudget.currency || '$'}{item.value}</span>
                  </div>
                ))}
                
                <div className="border-t border-white/5 pt-3.5 flex items-center justify-between text-sm font-extrabold text-white">
                  <span>Total Estimate</span>
                  <span className="text-zinc-100">{trip.estimatedBudget.currency || '$'}{trip.estimatedBudget.total}</span>
                </div>
              </div>
            </div>

            {/* Recommended Hotels */}
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-[2rem] p-6 shadow-2xl backdrop-blur-3xl">
              <h4 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center space-x-2">
                <Hotel className="h-4.5 w-4.5 text-zinc-400" />
                <span>Recommended Stays</span>
              </h4>
              
              <div className="space-y-4">
                {trip.recommendedHotels.map((hotel, idx) => (
                  <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-100 line-clamp-1">{hotel.name}</span>
                      <span className="text-[9px] bg-transparent border border-white/10 text-zinc-400 px-2 py-0.5 rounded-full font-bold">
                        {hotel.tier}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">{hotel.description}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* AI TWEAK MODAL */}
      {showTweakModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h4 className="text-lg font-bold text-white flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              <span>Regenerate Day {activeDay}</span>
            </h4>
            <p className="text-xs text-slate-400">
              Provide instructions to our AI agent. Specify what changes you would like to apply to this day's schedule.
            </p>
            
            <form onSubmit={handleAITweak} className="space-y-4">
              <textarea
                required
                maxLength={300}
                value={tweakRequest}
                onChange={(e) => setTweakRequest(e.target.value)}
                placeholder="e.g., Focus more on outdoor activities. Swap the afternoon museum trip for hiking."
                className="w-full h-28 p-3 bg-[#0a0a0a] border border-white/10 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white focus:border-white text-sm resize-none"
              />
              
              <div className="flex justify-end space-x-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowTweakModal(false)}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-400 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={tweakLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold flex items-center space-x-2 disabled:opacity-50 transition shadow-lg shadow-indigo-600/20"
                >
                  {tweakLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Regenerating...</span>
                    </>
                  ) : (
                    <span>Regenerate</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANUAL EDIT MODAL */}
      {showManualEditModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-lg font-bold text-white flex items-center space-x-2">
                <Edit3 className="h-5 w-5 text-indigo-400" />
                <span>Edit Day {activeDay} Schedule</span>
              </h4>
              <button 
                onClick={handleAddActivity}
                className="flex items-center space-x-1 text-xs text-indigo-400 hover:text-white bg-indigo-950/40 px-3 py-1.5 rounded-xl border border-indigo-900/30"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Activity</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {editActivities.map((act, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 relative">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      required
                      maxLength={50}
                      value={act.time}
                      onChange={(e) => handleActivityChange(idx, 'time', e.target.value)}
                      placeholder="Time (e.g. 09:00 AM)"
                      className="w-28 px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-lg text-xs text-white focus:ring-1 focus:ring-white focus:outline-none"
                    />
                    <select
                      value={act.type}
                      onChange={(e) => handleActivityChange(idx, 'type', e.target.value)}
                      className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="sightseeing">Sightseeing</option>
                      <option value="food">Food</option>
                      <option value="adventure">Adventure</option>
                      <option value="relaxation">Relaxation</option>
                      <option value="transit">Transit</option>
                    </select>
                    
                    <button
                      type="button"
                      onClick={() => handleRemoveActivity(idx)}
                      className="ml-auto p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition"
                      title="Remove Activity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <textarea
                    required
                    maxLength={500}
                    value={act.description}
                    onChange={(e) => handleActivityChange(idx, 'description', e.target.value)}
                    placeholder="Activity details & descriptions..."
                    className="w-full h-16 p-2.5 bg-[#0a0a0a] border border-white/10 rounded-lg text-xs text-white placeholder-zinc-600 focus:ring-1 focus:ring-white focus:outline-none resize-none"
                  />
                </div>
              ))}
              
              {editActivities.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm">
                  Click 'Add Activity' to start adding items to this day.
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 text-xs pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowManualEditModal(false)}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-400 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleManualSave}
                disabled={saveLoading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold flex items-center space-x-2 disabled:opacity-50 transition"
              >
                {saveLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
