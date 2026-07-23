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
        <div className="brutal-border bg-white dark:bg-[#1a1a1a] p-8">
          <h1 className="text-4xl font-black tracking-tighter mb-1">FEO.</h1>
          <p className="text-sm font-mono mb-8 opacity-60">create your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase block mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="brutal-input w-full px-4 py-3 text-sm bg-offwhite dark:bg-[#333]"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="brutal-input w-full px-4 py-3 text-sm bg-offwhite dark:bg-[#333]"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="brutal-input w-full px-4 py-3 text-sm bg-offwhite dark:bg-[#333]"
                required
                minLength={6}
              />
            </div>

            {error && <p className="text-sm font-bold text-brutal-red">{error}</p>}

            <button type="submit" className="brutal-btn w-full py-3 text-sm font-bold bg-brutal-yellow">
              Create Account
            </button>
          </form>

          <p className="text-xs text-center mt-6 font-mono">
            Already have an account?{' '}
            <Link to="/login" className="font-bold underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}