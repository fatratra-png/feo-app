import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { DotGrid } from '../components/ui/DotGrid';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { user, accessToken, refreshToken } = await authApi.login(email, password);
      localStorage.setItem('feo_access_token', accessToken);
      localStorage.setItem('feo_refresh_token', refreshToken);
      setUser(user);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background dot-grid">
      <DotGrid />
      <div className="w-full max-w-md space-y-6">
        <div className="rounded-2xl border-2 border-foreground bg-card p-10 brutal-shadow-ink -rotate-[0.5deg]">
          <div className="text-center mb-8">
            <h1 className="font-body font-black text-5xl tracking-[-0.08em] leading-[0.85] text-white">
              F<span className="text-white/80">E</span><span className="text-white/60">O</span><span className="text-white/40">.</span>
            </h1>
            <p className="eyebrow mt-4">Sign in to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="eyebrow block mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="brutal-input w-full text-sm" placeholder="your@email.com" required />
            </div>
            <div>
              <label className="eyebrow block mb-2">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="brutal-input w-full text-sm" placeholder="Enter your password" required />
            </div>

            {error && (
              <div className="rounded-xl border-2 border-blush bg-blush/10 p-4">
                <p className="text-sm font-bold text-blush">{error}</p>
              </div>
            )}

            <button type="submit" className="w-full rounded-full border-2 border-foreground bg-saffron text-black px-8 py-4 font-body font-black text-sm tracking-wider uppercase transition-all hover:bg-saffron/90 active:translate-y-[1px] brutal-shadow-ink">
              Sign In
            </button>
          </form>

          <p className="text-xs text-center mt-8 font-mono text-foreground/50 tracking-wide">
            No account?{' '}
            <Link to="/register" className="font-bold text-foreground hover:text-blush transition-colors underline">Register</Link>
          </p>
        </div>

        <div className="rounded-2xl border-2 border-blush bg-blush p-5 brutal-shadow-blush rotate-[0.5deg]">
          <p className="text-[9px] font-mono font-bold text-center uppercase tracking-widest text-black">
            Demo: test@gmail.com / passtestuser21
          </p>
        </div>
      </div>
    </div>
  );
}
