import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { updatePassword } from "@/lib/authStore";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Eye, EyeOff, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    // Supabase embeds the recovery token in the URL hash.
    // onAuthStateChange fires with event "PASSWORD_RECOVERY" once parsed.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await updatePassword(password);
      setDone(true);
      setTimeout(() => navigate("/"), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setLoading(false);
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
            Set New Password
          </CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Choose a strong password for your admin account
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          {done ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="font-semibold text-[#4A3C31]">Password updated!</p>
              <p className="text-sm text-gray-500">Redirecting you to the dashboard…</p>
            </div>
          ) : !sessionReady ? (
            <div className="py-6 text-center text-sm text-gray-500">
              <p>Verifying reset link…</p>
              <p className="mt-2 text-xs text-gray-400">
                If this takes more than a few seconds, the link may have expired.{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-[#C19A5B] hover:underline"
                >
                  Go back to login
                </button>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-[#4A3C31] font-medium">New password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
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

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-[#4A3C31] font-medium">Confirm password</Label>
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Repeat new password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="h-11 border-gray-200 focus:border-[#C19A5B] focus:ring-[#C19A5B]/20"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#C19A5B] hover:bg-[#A88347] text-white font-semibold"
              >
                {loading ? "Updating…" : "Update Password"}
              </Button>
            </form>
          )}

          <div className="mt-4 text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Best Travel Morocco
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
