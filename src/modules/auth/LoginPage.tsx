import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../app/ui/layout.css';
import { login, me } from '../../api/auth.service';
import { useAuth } from '../../app/providers/AuthProvider';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession, clear } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: Location })?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const tokens = await login({ email, password });
      // Tokens zuerst setzen, damit nachfolgende Calls (me) das Authorization-Header haben.
      setSession({
        user: { id: 'unknown', email, roles: [] },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
      let user = null;
      try {
        user = await me();
        setSession({
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        });
      } catch {
        // me() optional; wenn nicht erreichbar, Session bleibt mit Tokens bestehen
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError('Login fehlgeschlagen. Bitte Zugang prüfen.');
      clear();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 420, margin: '60px auto' }}>
      <h1>Anmeldung</h1>
      <p>Mit gültigen Zugangsdaten anmelden (Access/Refresh werden gesetzt).</p>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, marginTop: 16 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>E-Mail</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>Passwort</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <div style={{ color: '#f78c6c' }}>{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Anmelden…' : 'Anmelden'}
        </button>
      </form>
    </div>
  );
}
