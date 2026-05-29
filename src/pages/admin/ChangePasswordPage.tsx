import { useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      // Update password
      const { error: pwErr } = await supabase.auth.updateUser({ password });
      if (pwErr) throw pwErr;

      // Clear the forced-change flag
      await supabase.auth.updateUser({
        data: { must_change_password: false },
      });

      navigate("/");
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
          <div className="mx-auto flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1">
            <ShieldCheck className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-medium text-amber-700">Security step required</span>
          </div>
          <CardTitle className="text-2xl font-bold text-[#4A3C31]">
            Set Your Password
          </CardTitle>
          <CardDescription className="text-sm text-gray-500">
            For security, please choose a personal password before continuing.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
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
                  autoFocus
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
              {loading ? "Saving…" : "Set Password & Continue"}
            </Button>
          </form>

          <div className="mt-4 text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Best Travel Morocco
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
