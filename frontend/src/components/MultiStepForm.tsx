'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2, Compass, AlertCircle } from 'lucide-react';

interface MultiStepFormProps {
  onSubmit: (tripData: { destination: string; duration: number; budgetLevel: 'Low' | 'Medium' | 'High'; interests: string[] }) => void;
  loading: boolean;
  error?: string | null;
}

const INTEREST_OPTIONS = [
  { id: 'Food & Dining', label: '🍕 Food & Dining' },
  { id: 'Culture & History', label: '🎨 Culture & History' },
  { id: 'Adventure', label: '🏄 Adventure' },
  { id: 'Nature & Outdoors', label: '🌲 Nature & Outdoors' },
  { id: 'Shopping', label: '🛍️ Shopping' },
  { id: 'Relaxation & Spa', label: '💆 Relaxation' },
  { id: 'Nightlife', label: '🍸 Nightlife' },
  { id: 'Photography', label: '📸 Photography' },
];

const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

export const MultiStepForm: React.FC<MultiStepFormProps> = ({ onSubmit, loading, error }) => {
  const [step, setStep] = useState(1);
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState(3);
  const [budgetLevel, setBudgetLevel] = useState<'Low' | 'Medium' | 'High' | null>(null);
  const [interests, setInterests] = useState<string[]>([]);

  const totalSteps = 4;

  // Jump to step 1 if there's a destination validation error
  React.useEffect(() => {
    if (error && (error.toLowerCase().includes('destination') || error.toLowerCase().includes('city') || error.toLowerCase().includes('country'))) {
      setStep(1);
    }
  }, [error]);

  const nextStep = () => {
    if (step === 1 && !destination.trim()) return;
    if (step === 2 && (duration < 1 || duration > 14)) return;
    if (step === 3 && !budgetLevel) return;
    if (step === 4 && interests.length === 0) return;
    
    if (step < totalSteps) {
      setStep(step + 1);
    } else if (step === totalSteps) {
      onSubmit({ destination: destination.trim(), duration, budgetLevel: budgetLevel!, interests });
    }
  };

  const toggleInterest = (id: string) => {
    setInterests(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      nextStep();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col justify-center items-center relative min-h-[400px] bg-white/[0.02] backdrop-blur-3xl border border-white/[0.05] rounded-[2rem] shadow-2xl p-8 md:p-12 z-10 overflow-hidden">
      {/* Animated Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-900 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-white"
          initial={{ width: '25%' }}
          animate={{ width: `${(step / totalSteps) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />
      </div>

      <div className="w-full relative mt-8 flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={springTransition}
              className="w-full text-center space-y-8"
            >
              <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent mb-6 tracking-tight">
                Where are we flying to?
              </h2>
              <input
                type="text"
                autoFocus
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Tokyo, Paris, Bali"
                maxLength={80}
                className="w-full bg-transparent border-b border-white/10 text-white text-2xl md:text-4xl placeholder:text-zinc-700 focus:outline-none focus:border-white transition-colors py-4 rounded-none text-center block mx-auto"
              />
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center space-x-2 mt-6 text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-2.5 rounded-full inline-flex mx-auto backdrop-blur-sm"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">{error}</span>
                </motion.div>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={springTransition}
              className="w-full text-center space-y-10"
            >
              <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent mb-6 tracking-tight">
                How many days?
              </h2>
              <div className="flex items-center justify-center space-x-6">
                <button 
                  onClick={() => setDuration(Math.max(1, duration - 1))}
                  className="w-16 h-16 flex items-center justify-center rounded-full bg-transparent border border-white/10 text-3xl text-zinc-400 hover:text-white hover:border-white/30 transition-all duration-300"
                >
                  -
                </button>
                <div className="w-32 text-center">
                  <span className="text-6xl font-extrabold text-white">
                    {duration}
                  </span>
                  <span className="block text-zinc-500 mt-2 font-medium">Days</span>
                </div>
                <button 
                  onClick={() => setDuration(Math.min(14, duration + 1))}
                  className="w-16 h-16 flex items-center justify-center rounded-full bg-transparent border border-white/10 text-3xl text-zinc-400 hover:text-white hover:border-white/30 transition-all duration-300"
                >
                  +
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={springTransition}
              className="w-full text-center space-y-8"
            >
              <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent mb-6 tracking-tight">
                What's your vibe?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                {(['Low', 'Medium', 'High'] as const).map((level) => {
                  const labels = {
                    Low: 'Backpacker',
                    Medium: 'Standard',
                    High: 'Luxury'
                  };
                  const isSelected = budgetLevel === level;
                  return (
                    <div 
                      key={level}
                      onClick={() => setBudgetLevel(level)}
                      className={isSelected ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] rounded-3xl px-6 py-6 transition-all duration-300 cursor-pointer font-medium scale-[1.02]" : "bg-transparent border border-white/10 text-zinc-400 hover:text-white hover:border-white/30 rounded-3xl px-6 py-6 transition-all duration-300 cursor-pointer"}
                    >
                      <h3 className="text-2xl font-bold">{labels[level]}</h3>
                      <p className={isSelected ? "text-zinc-600 text-sm mt-2" : "text-zinc-500 text-sm mt-2"}>{level} Budget</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={springTransition}
              className="w-full text-center space-y-8"
            >
              <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent mb-6 tracking-tight">
                Select your interests
              </h2>
              <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
                {INTEREST_OPTIONS.map((interest) => {
                  const isSelected = interests.includes(interest.id);
                  return (
                    <button
                      key={interest.id}
                      onClick={() => toggleInterest(interest.id)}
                      className={isSelected ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] rounded-full px-6 py-3 transition-all duration-300 cursor-pointer font-medium scale-[1.02]" : "bg-transparent border border-white/10 text-zinc-400 hover:text-white hover:border-white/30 rounded-full px-6 py-3 transition-all duration-300 cursor-pointer"}
                    >
                      {interest.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="mt-12 w-full flex justify-center gap-4">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            disabled={loading}
            className="bg-transparent border border-white/20 text-white font-semibold rounded-full px-8 py-4 hover:bg-white/5 active:scale-[0.98] transition-all duration-300 flex items-center justify-center w-full md:w-auto disabled:opacity-50"
          >
            Back
          </button>
        )}
        
        {step < totalSteps ? (
          <button
            onClick={nextStep}
            className="bg-white text-black font-semibold rounded-full px-8 py-4 hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 w-full md:w-auto"
          >
            <span>Next</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={nextStep}
            disabled={interests.length === 0 || loading}
            className="bg-white text-black font-semibold rounded-full px-8 py-4 hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 w-full md:w-auto disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-black" />
            ) : (
              <>
                <Compass className="w-6 h-6" />
                <span>Generate Itinerary</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
