import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HeartPulse, LogIn } from "lucide-react";
import Button from "../../components/ui/Button";
import { api } from "../../lib/api";
import { setToken, isAuthed } from "../../lib/auth";

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20";

export default function Login() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthed()) navigate("/admin", { replace: true });
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!values.username || !values.password) {
      setError("Please enter your username and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await api.post("/auth/login", values);
      setToken(data.token);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-soft p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-100">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-teal text-white">
            <HeartPulse className="h-7 w-7" />
          </span>
          <h1 className="mt-4 font-display text-xl font-bold text-navy">CareOne Admin</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to manage requests & gallery</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div>
            <label htmlFor="username" className="mb-1.5 block text-sm font-semibold text-navy">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              value={values.username}
              onChange={handleChange}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-navy">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={values.password}
              onChange={handleChange}
              className={inputCls}
            />
          </div>

          {error && (
            <p className="rounded-lg bg-maroon/10 px-4 py-2.5 text-sm font-medium text-maroon">{error}</p>
          )}

          <Button type="submit" disabled={loading} className="mt-2">
            <LogIn className="h-4 w-4" />
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
