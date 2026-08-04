import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, User, KeyRound } from 'lucide-react';
import logoImg from '../Kevalon_Technology_Logo_Transparent.png';

export const Login = () => {
  const { login, loading } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(username, password);
    if (!res.success) {
      setError(res.message || 'Login failed. Please check credentials.');
    }
  };

  const setFastCredentials = (userVal, passVal) => {
    setUsername(userVal);
    setPassword(passVal);
  };

  return (
    <div className="min-h-screen bg-erp-bg flex flex-col justify-center items-center p-4">
      {/* Container */}
      <div className="w-full max-w-md bg-white border border-erp-border shadow-lg rounded-xs overflow-hidden">
        {/* Header Banner */}
        <div className="bg-erp-primary text-white p-6 text-center border-b-4 border-erp-primaryHover flex flex-col items-center">
          <img src={logoImg} alt="Kevalon Technology Logo" className="h-12 w-auto object-contain mb-2 drop-shadow-sm" />
          <h2 className="text-xl font-bold uppercase tracking-wider">Kevalon Technology</h2>
          <p className="text-xs text-gray-200 uppercase tracking-widest font-semibold mt-1">
            Recruitment CRM Enterprise Portal
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-800 text-xs font-semibold rounded-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1 flex items-center gap-1">
              <User size={13} /> Username or Email
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              className="erp-input"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1 flex items-center gap-1">
              <Lock size={13} /> Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="erp-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-erp-primary py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 mt-2"
          >
            <KeyRound size={15} />
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

        {/* Quick Demo Role Selector */}
        <div className="p-4 bg-erp-bg border-t border-erp-border text-center">
          <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-2">
            Quick Sign-In Presets:
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-[11px]">
            <button
              onClick={() => setFastCredentials('admin', 'Admin@123')}
              className="px-2.5 py-1 bg-erp-primary text-white rounded-xs font-semibold hover:opacity-90"
            >
              Super Admin
            </button>
            <button
              onClick={() => setFastCredentials('vikram.tech', 'Tech@123')}
              className="px-2.5 py-1 bg-blue-700 text-white rounded-xs font-semibold hover:opacity-90"
            >
              Technical Panel
            </button>
            <button
              onClick={() => setFastCredentials('pooja.reception', 'Pooja@123')}
              className="px-2.5 py-1 bg-emerald-700 text-white rounded-xs font-semibold hover:opacity-90"
            >
              Receptionist
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} Kevalon Technology Enterprise Systems. All rights reserved.
      </div>
    </div>
  );
};
