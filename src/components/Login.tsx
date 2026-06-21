import React, { useState } from 'react';
import { GraduationCap, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulate a brief loading state for a more premium/realistic feel
    setTimeout(() => {
      if (username === 'dashboardiqbal1108' && password === 'DIqb@l1108') {
        onLoginSuccess();
      } else {
        setError('Username atau password salah. Silakan coba kembali.');
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4 font-sans text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
      <div className="w-full max-w-md">
        
        {/* Logo and Branding Header */}
        <div className="text-center mb-8 select-none">
          <div className="h-16 w-16 bg-white/10 text-white rounded-2xl flex items-center justify-center mx-auto shadow-2xl border border-white/20 backdrop-blur-md mb-4 transition-transform hover:scale-105 duration-300">
            <GraduationCap className="h-9 w-9 text-blue-400" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white uppercase">
            UTB BANJAR NIHONGO
          </h1>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1.5">
            Japanese Trainee Academic & Performance
          </p>
        </div>

        {/* Login Form Container */}
        <div className="bg-white/10 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-md p-8 relative overflow-hidden">
          
          {/* Subtle decorative background glow */}
          <div className="absolute -top-12 -right-12 h-24 w-24 bg-blue-500/25 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-12 -left-12 h-24 w-24 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>

          <h2 className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-3">
            Sign In to Dashboard
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Error Message Display */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-xs px-4 py-3 rounded-lg flex items-start gap-2.5 animate-shake">
                <AlertCircle className="h-4.5 w-4.5 text-red-400 shrink-0 mt-0.5" />
                <span className="font-semibold leading-relaxed">{error}</span>
              </div>
            )}

            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="block text-[10.5px] font-bold text-slate-300 uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  disabled={isLoading}
                  placeholder="Masukkan username..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/45 border border-white/10 rounded-xl text-xs font-semibold text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition duration-200 disabled:opacity-50"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-[10.5px] font-bold text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLoading}
                  placeholder="Masukkan password..."
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-950/45 border border-white/10 rounded-xl text-xs font-semibold text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition duration-200 disabled:opacity-50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-extrabold text-xs rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {isLoading ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <span>Masuk Sekarang</span>
              )}
            </button>
          </form>

        </div>

        {/* Footer Note */}
        <p className="text-[10px] text-slate-500 font-medium text-center mt-6 select-none leading-relaxed">
          Dashboard ini terproteksi keamanan internal. <br />
          Siswa tidak diperkenankan mengakses tanpa izin pengajar.
        </p>

      </div>
    </div>
  );
}
