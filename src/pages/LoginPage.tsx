import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ercmLogo from '@/assets/ercm-logo.png';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, User } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(username, password)) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen industrial-gradient flex items-center justify-center p-4">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-md p-8 animate-fade-in">
        <div className="flex justify-center mb-6">
          <img src={ercmLogo} alt="ERCM SA" className="h-20 object-contain" />
        </div>
        <h1 className="text-2xl font-bold text-center text-foreground mb-1">Steel Scrap Management</h1>
        <p className="text-center text-muted-foreground mb-8">Sign in to continue</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Username"
              value={username}
              onChange={e => { setUsername(e.target.value); setError(''); }}
              className="pl-11 h-12 text-base"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              className="pl-11 h-12 text-base"
            />
          </div>
          {error && <p className="text-destructive text-sm font-medium">{error}</p>}
          <Button type="submit" className="w-full btn-industrial red-gradient">
            Sign In
          </Button>
        </form>

        <div className="mt-6 p-4 rounded-lg bg-muted text-xs text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground">Demo Accounts:</p>
          <p>admin / admin123 — Store Manager</p>
          <p>engineer1 / eng123 — Engineer</p>
          <p>unit1mgr / unit1 — Unit 1 Manager</p>
        </div>
      </div>
    </div>
  );
}
