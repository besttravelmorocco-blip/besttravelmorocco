import { useState } from "react";
import { useNavigate } from "react-router";
import { login } from "@/lib/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const user = login(username, password);
      if (user) {
        navigate("/");
        window.location.reload();
      } else {
        setError("Invalid username or password");
        setLoading(false);
      }
    }, 500);
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
      {/* Overlay */}
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
            Admin Dashboard — Sign in to manage your website
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-[#4A3C31] font-medium">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-11 border-gray-200 focus:border-[#C19A5B] focus:ring-[#C19A5B]/20"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#4A3C31] font-medium">Password</Label>
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

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 flex items-center gap-2">
                <Lock className="h-4 w-4" />
                {error}
              </div>
            )}

            {/* Default credentials hint */}
            <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
              <strong>Default login:</strong><br />
              Username: <code>admin</code><br />
              Password: <code>besttravel2026</code>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#C19A5B] hover:bg-[#A88347] text-white font-semibold"
            >
              {loading ? "Signing in..." : "Sign In"}
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
