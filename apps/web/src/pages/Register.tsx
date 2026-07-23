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
    <div className="min-h-screen flex items-center justify-center p-8 bg-background dot-grid">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border-2 border-foreground bg-card p-10 brutal-shadow-blush-lg rotate-[0.5deg]">
          <div className="flex items-center gap-4 mb-2">
            <div className="size-12 rounded-full border-2 border-foreground bg-gradient-to-br from-saffron via-blush to-mint flex items-center justify-center rotate-3">
              <span className="text-xl font-display font-extrabold text-black">F</span>
            </div>
            <h1 className="font-display text-4xl font-extrabold tracking-[-0.03em] leading-none">
              <span className="text-saffron">F</span>
              <span className="text-blush">E</span>
              <span className="text-mint">O</span>
              <span className="text-foreground">.</span>
            </h1>
          </div>
          <p className="eyebrow mb-8">Create your account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="eyebrow block mb-2">Display Name</label>
              <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="brutal-input w-full text-sm" placeholder="Your name" required />
            </div>
            <div>
              <label className="eyebrow block mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="brutal-input w-full text-sm" placeholder="your@email.com" required />
            </div>
            <div>
              <label className="eyebrow block mb-2">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="brutal-input w-full text-sm" placeholder="At least 6 characters" required minLength={6} />
            </div>

            {error && (
              <div className="rounded-xl border-2 border-blush bg-blush/10 p-4">
                <p className="text-sm font-bold text-blush">{error}</p>
              </div>
            )}

            <button type="submit" className="w-full rounded-full border-2 border-foreground bg-saffron text-black px-8 py-4 font-display font-bold text-sm tracking-wide transition-all hover:bg-saffron/90 active:translate-y-[1px] brutal-shadow-ink">
              Create Account
            </button>
          </form>

          <p className="text-xs text-center mt-8 font-mono text-foreground/50 tracking-wide">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-foreground hover:text-saffron transition-colors underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
