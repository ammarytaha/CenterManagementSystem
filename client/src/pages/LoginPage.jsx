import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../auth/AuthContext.jsx';
import { Button, Card, Field, Input } from '../components/ui/index.js';
import { apiError } from '../api/client.js';
import { homeForRole } from '../lib/constants.js';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={homeForRole(user.role)} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const u = await login(email, password);
      toast.success(`أهلاً ${u.name}`);
      navigate(location.state?.from?.pathname || homeForRole(u.role), { replace: true });
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-secondary-soft p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-pill bg-brand text-2xl font-bold text-white">
            س
          </div>
          <h1 className="text-2xl font-semibold text-heading">نظام إدارة السنتر التعليمي</h1>
          <p className="mt-1 text-sm text-body">سجّل الدخول للمتابعة</p>
        </div>

        <Card className="p-6">
          <form onSubmit={submit} className="space-y-4">
            <Field label="البريد الإلكتروني" htmlFor="email">
              <Input
                id="email"
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@loop.eg"
                autoComplete="username"
                required
              />
            </Field>
            <Field label="كلمة المرور" htmlFor="password">
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </Field>
            {error && (
              <div className="rounded-pill border border-border-danger-subtle bg-danger-soft px-4 py-2.5 text-sm text-fg-danger-strong">
                {error}
              </div>
            )}
            <Button type="submit" variant="brand" size="lg" loading={loading} className="w-full">
              تسجيل الدخول
            </Button>
          </form>
        </Card>

        <p className="mt-4 text-center text-xs text-body-subtle">
          للتجربة: admin@loop.eg · assistant@loop.eg · teacher@loop.eg — كلمة المرور: password123
        </p>
      </div>
    </div>
  );
}
