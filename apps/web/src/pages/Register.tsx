import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../lib/api';
import { useAuthStore } from '../stores/authStore';

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { user, accessToken, refreshToken } = await authApi.register(email, password, displayName);
      localStorage.setItem('feo_access_token', accessToken);
      localStorage.setItem('feo_refresh_token', refreshToken);
      setUser(user);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="brutal-border bg-[#1e1e1e] p-10 brutal-shadow-pink">
          <h1 className="text-5xl font-black tracking-tighter mb-1">
            <span className="text-brutal-yellow">F</span>
            <span className="text-brutal-pink">E</span>
            <span className="text-brutal-blue">O</span>
            <span className="text-brutal-red">.</span>
          </h1>
          <p className="text-sm font-mono mb-10 opacity-50">Create your account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-black uppercase tracking-wider block mb-2">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="brutal-input w-full px-5 py-4 text-sm"
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-wider block mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="brutal-input w-full px-5 py-4 text-sm"
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-wider block mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="brutal-input w-full px-5 py-4 text-sm"
                placeholder="At least 6 characters"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="brutal-border-thin bg-brutal-red/10 p-4">
                <p className="text-sm font-bold text-brutal-red">{error}</p>
              </div>
            )}

            <button type="submit" className="brutal-btn w-full py-4 text-sm font-black bg-brutal-blue text-white tracking-wider hover:scale-[1.02] transition-transform">
              Create Account
            </button>
          </form>

          <p className="text-xs text-center mt-8 font-mono opacity-60">
            Already have an account?{' '}
            <Link to="/login" className="font-bold underline opacity-100 hover:text-brutal-blue transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}