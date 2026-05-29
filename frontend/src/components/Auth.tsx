'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Compass, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export const Auth: React.FC = () => {
  const { login, register, error, clearError } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    if (!email || !password) {
      setValidationError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
    } catch (err) {
      // Error is stored in AuthContext and handled visually
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setValidationError(null);
    clearError();
    setPassword('');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle minimalist ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-8 z-10">
        <div className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-[1rem] bg-white shadow-xl">
            <Compass className="h-9 w-9 text-black" />
          </div>
          <h2 className="mt-6 text-center text-4xl font-extrabold tracking-tight bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
            {isLogin ? 'Welcome back' : 'Start your journey'}
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-400">
            {isLogin ? "Unlock your personal AI travel planner" : "Create an account to start planning trips"}
          </p>
        </div>

        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.05] rounded-[2rem] p-8 shadow-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {(error || validationError) && (
              <div className="rounded-xl bg-red-950/50 border border-red-800/60 p-4 text-sm text-red-400">
                {validationError || error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-zinc-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-transparent border-b border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-white text-sm transition duration-200 rounded-none"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-zinc-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-transparent border-b border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-white text-sm transition duration-200 rounded-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-4 px-4 text-base font-semibold rounded-full text-black bg-white hover:bg-zinc-200 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 transition-all duration-300"
              >
                {loading ? (
                  <Loader2 className="animate-spin h-6 w-6 text-black" />
                ) : (
                  <>
                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="ml-2 h-6 w-6 text-black" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 flex justify-center text-sm">
            <button
              onClick={toggleMode}
              className="font-medium text-zinc-400 hover:text-white transition duration-150"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
