import React, { useState } from 'react';
import { useLoginMutation, useAuth } from '../hooks/useAuth';
import { Button, Input } from '../components/ui';
import { ShieldAlert, KeyRound, User as UserIcon } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('emilys');
  const [password, setPassword] = useState('emilyspass');
  const [validationError, setValidationError] = useState<string | null>(null);

  const loginMutation = useLoginMutation();
  const { error: globalError, isSimulatedExpired, toggleSimulatedExpired } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!username.trim()) {
      setValidationError('Please enter your username.');
      return;
    }

    if (!password) {
      setValidationError('Please enter your password.');
      return;
    }

    loginMutation.mutate({ username: username.trim(), password });
  };

  const handleFillPreset = (presetUser: string, presetPass: string) => {
    setUsername(presetUser);
    setPassword(presetPass);
    setValidationError(null);
  };

  const errorMessage = validationError || loginMutation.error?.message || globalError;

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-xs">
            S
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            SprintDesk
          </span>
        </div>
        <h1 className="mt-4 text-center text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Sign in to your team workspace
        </h1>
        <p className="mt-1 text-center text-sm text-slate-500 dark:text-slate-400">
          Single-page sprint management for software development teams
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-sm border border-slate-200 dark:border-slate-800 rounded-xl sm:px-10">
          {/* Error Banner */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-6 p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start gap-3"
            >
              <ShieldAlert className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs font-medium text-rose-800 dark:text-rose-200">
                {errorMessage}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Input
              id="username"
              name="username"
              type="text"
              label="Username"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              leftIcon={<UserIcon className="h-4 w-4" />}
            />

            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<KeyRound className="h-4 w-4" />}
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loginMutation.isPending}
              className="w-full mt-2"
            >
              Sign In
            </Button>
          </form>

          {/* Preset Helper for Reviewer Testing */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Demo Preset Credentials
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFillPreset('emilys', 'emilyspass')}
              >
                emilys / emilyspass
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFillPreset('kminchelle', '0lelR')}
              >
                kminchelle / 0lelR
              </Button>
            </div>
          </div>

          {/* Dev Interceptor Simulation Controls */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Token Expiration Simulation
            </span>
            <Button
              variant={isSimulatedExpired ? 'destructive' : 'ghost'}
              size="sm"
              onClick={toggleSimulatedExpired}
            >
              {isSimulatedExpired ? 'Simulating 401 Expiry' : 'Normal Token'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
