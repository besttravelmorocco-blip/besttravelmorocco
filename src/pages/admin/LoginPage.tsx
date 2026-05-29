import { useState } from "react";
import { useNavigate } from "react-router";
import { login, sendPasswordReset } from "@/lib/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";

const MAX_ATTEMPTS = 3;
const LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes

type View = "login" | "forgot";

export default function LoginPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("login");

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  // Forgot password state
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;
  const lockMinsLeft = lockedUntil
    ? Math.ceil((lockedUntil - Date.now()) / 60000)
    : 0;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    setLoginError("");
    setLoginLoading(true);
    try {
      await login(email, password);
      setAttempts(0);
      navigate("/");
    } catch (err: unknown) {
      const next = attempts + 1;
      setAttempts(next);
      if (next >= MAX_ATTEMPTS) {
        setLockedUntil(Date.now() + LOCKOUT_MS);
        setLoginError(`Too many failed attempts. Try again in 5 minutes or use "Forgot password?".`);
      } else {
        setLoginError(
          `Invalid email or password. ${MAX_ATTEMPTS - next} attempt${MAX_ATTEMPTS - next === 1 ? "" : "s"} remaining.`
        );
      }
      void err;
    } finally {
      setLoginLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    setResetLoading(true);
    try {
      await sendPasswordReset(resetEmail);
      setResetSent(true);
    } catch (err: unknown) {
      setResetError(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1489493887464-892be6d1daae?w=1920&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="fixed inset-0 bg-black/50" />

      <Card className="relative z-10 w-full max-w-md border-0 shadow-2xl" style={{ background: "rgba(255,255,255,0.95)" }}>
        <CardHeader className="space-y-3 text-center pb-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#C19A5B]">
            <Globe className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-[#4A3C31]">
            Best Travel Morocco
          </CardTitle>
          <CardDescription className="text-sm text-gray-500">
            {view === "login"
              ? "Admin Dashboard — Sign in to manage your website"
              : "Enter your email to receive a password reset link"}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          {/* ── LOGIN FORM ── */}
          {view === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#4A3C31] font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 border-gray-200 focus:border-[#C19A5B] focus:ring-[#C19A5B]/20"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[#4A3C31] font-medium">Password</Label>
                  <button
                    type="button"
                    onClick={() => { setView("forgot"); setResetEmail(email); }}
                    className="text-xs text-[#C19A5B] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pr-10 border-gray-200 focus:border-[#C19A5B] focus:ring-[#C19A5B]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {isLocked ? (
                <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700 flex items-center gap-2">
                  <Lock className="h-4 w-4 shrink-0" />
                  Account locked. Try again in {lockMinsLeft} minute{lockMinsLeft === 1 ? "" : "s"}, or{" "}
                  <button type="button" onClick={() => { setView("forgot"); setResetEmail(email); }} className="underline font-medium">
                    reset your password
                  </button>.
                </div>
              ) : loginError ? (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 flex items-center gap-2">
                  <Lock className="h-4 w-4 shrink-0" />
                  {loginError}
                </div>
              ) : null}

              <Button
                type="submit"
                disabled={loginLoading || isLocked}
                className="w-full h-11 bg-[#C19A5B] hover:bg-[#A88347] text-white font-semibold disabled:opacity-50"
              >
                {loginLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          )}

          {/* ── FORGOT PASSWORD FORM ── */}
          {view === "forgot" && (
            <div className="space-y-4">
              {resetSent ? (
                <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700 text-center space-y-2">
                  <p className="font-semibold">Reset link sent!</p>
                  <p>Check <strong>{resetEmail}</strong> for a password reset link. It may take a minute to arrive.</p>
                </div>
              ) : (
                <form onSubmit={handleForgot} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email" className="text-[#4A3C31] font-medium">Email address</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="admin@example.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      className="h-11 border-gray-200 focus:border-[#C19A5B] focus:ring-[#C19A5B]/20"
                    />
                  </div>

                  {resetError && (
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                      {resetError}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full h-11 bg-[#C19A5B] hover:bg-[#A88347] text-white font-semibold"
                  >
                    {resetLoading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>
              )}

              <button
                type="button"
                onClick={() => { setView("login"); setResetSent(false); setResetError(""); }}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#4A3C31] mx-auto"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </button>
            </div>
          )}

          <div className="mt-4 text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Best Travel Morocco
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
