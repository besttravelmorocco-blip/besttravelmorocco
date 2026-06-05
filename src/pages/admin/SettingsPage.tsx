import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Settings, Globe, Phone, MapPin, Mail, Save, Send,
  CheckCircle2, AlertCircle, Loader2, ExternalLink, Eye, EyeOff, ShieldCheck, Trash2,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/providers/trpc";
import { getPublishConfig, savePublishConfig, publishToWebsite } from "@/lib/publishService";
import { sendPasswordReset } from "@/lib/authStore";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Security tab state
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");

  const handleSendReset = async () => {
    setResetError("");
    setResetLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("No email found for current user");
      await sendPasswordReset(user.email);
      setResetSent(true);
    } catch (err: unknown) {
      setResetError(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setResetLoading(false);
    }
  };

  const [general, setGeneral] = useState({
    siteName: "Best Travel Morocco",
    tagline: "Authentic Morocco Tours Since 2012",
  });

  const [contact, setContact] = useState({
    phone: "+212 677 365 421",
    email: "besttravelmorocco@gmail.com",
    whatsapp: "+212677365421",
    address: "Angle bd Emile Zola et Rue Rethel, 7ème Étage N°20, Casablanca, Morocco",
  });

  const [social, setSocial] = useState({
    facebook: "https://www.facebook.com/besttravelmorocco",
    instagram: "https://www.instagram.com/besttravelmorocco",
    twitter: "https://twitter.com/besttravelmorocco",
    youtube: "https://www.youtube.com/@besttravelmorocco",
  });

  // Publish config
  const [pubCfg, setPubCfg] = useState(getPublishConfig);
  const [showToken, setShowToken] = useState(false);
  const [publishState, setPublishState] = useState<"idle" | "publishing" | "success" | "error">("idle");
  const [publishMsg, setPublishMsg] = useState("");
  const [publishedFiles, setPublishedFiles] = useState<string[]>([]);

  const queryClient = useQueryClient();
  const [cacheCleared, setCacheCleared] = useState(false);

  const handleClearCache = () => {
    // Clear all localStorage keys belonging to this app
    const keysToRemove = Object.keys(localStorage).filter(k =>
      k.startsWith("btm_") || k.startsWith("tourStore") || k.startsWith("blogStore") ||
      k.startsWith("inquiryStore") || k.startsWith("bookingStore") || k.startsWith("mediaStore") ||
      k.startsWith("settingsStore") || k.startsWith("testimonialStore") || k.startsWith("publishConfig")
    );
    keysToRemove.forEach(k => localStorage.removeItem(k));
    queryClient.clear();
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 3000);
  };

  const updateSetting = trpc.settings.update.useMutation();

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSetting.mutateAsync({
        siteName: general.siteName,
        tagline: general.tagline,
        phone: contact.phone,
        email: contact.email,
        whatsapp: contact.whatsapp,
        address: contact.address,
        facebook: social.facebook,
        instagram: social.instagram,
        twitter: social.twitter,
        youtube: social.youtube,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePublishConfig = () => {
    savePublishConfig(pubCfg);
    setPublishMsg("Configuration saved.");
    setTimeout(() => setPublishMsg(""), 2000);
  };

  const handlePublish = async () => {
    setPublishState("publishing");
    setPublishMsg("Connecting to GitHub…");
    setPublishedFiles([]);

    const result = await publishToWebsite((msg) => setPublishMsg(msg));

    if (result.success) {
      setPublishState("success");
      setPublishedFiles(result.files);
      setPublishMsg(result.deployTriggered ? "Published & deploy triggered!" : "Published to GitHub successfully.");
    } else {
      setPublishState("error");
      setPublishMsg(result.error ?? "Unknown error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Site Settings</h2>
          <p className="mt-1 text-stone-500">Configure your website settings and integrations</p>
        </div>
        <Button className="gap-2 bg-[#D4A574] hover:bg-[#c49668]" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-stone-100 h-9">
          <TabsTrigger value="general" className="gap-1.5 text-xs sm:text-sm">
            <Globe className="h-3.5 w-3.5" /> General
          </TabsTrigger>
          <TabsTrigger value="contact" className="gap-1.5 text-xs sm:text-sm">
            <Phone className="h-3.5 w-3.5" /> Contact
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-1.5 text-xs sm:text-sm">
            <Settings className="h-3.5 w-3.5" /> Social
          </TabsTrigger>
          <TabsTrigger value="publish" className="gap-1.5 text-xs sm:text-sm">
            <Send className="h-3.5 w-3.5" /> Publish
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5 text-xs sm:text-sm">
            <ShieldCheck className="h-3.5 w-3.5" /> Security
          </TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">General Information</CardTitle>
              <CardDescription>Basic details shown across your website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Site Name</Label>
                  <Input value={general.siteName} onChange={(e) => setGeneral({ ...general, siteName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Tagline</Label>
                  <Input value={general.tagline} onChange={(e) => setGeneral({ ...general, tagline: e.target.value })} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact */}
        <TabsContent value="contact" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
              <CardDescription>Displayed in the footer, contact page, and email signatures</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-stone-400" /> Phone</Label>
                  <Input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-stone-400" /> Email</Label>
                  <Input type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-stone-400 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.102.546 4.073 1.5 5.785L0 24l6.388-1.671A11.948 11.948 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.003-1.366l-.36-.213-3.714.972.994-3.625-.234-.373A9.818 9.818 0 012.182 12C2.182 6.572 6.572 2.182 12 2.182S21.818 6.572 21.818 12 17.428 21.818 12 21.818z"/></svg>
                    WhatsApp
                  </Label>
                  <Input value={contact.whatsapp} onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-stone-400" /> Address</Label>
                  <Input value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social */}
        <TabsContent value="social" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Social Media</CardTitle>
              <CardDescription>Links shown in the website footer and contact page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { key: "facebook", label: "Facebook" },
                  { key: "instagram", label: "Instagram" },
                  { key: "twitter", label: "Twitter / X" },
                  { key: "youtube", label: "YouTube" },
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-2">
                    <Label>{label}</Label>
                    <Input
                      value={(social as any)[key]}
                      onChange={(e) => setSocial({ ...social, [key]: e.target.value })}
                      placeholder={`https://...`}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Publish */}
        <TabsContent value="publish" className="mt-4 space-y-4">
          {/* How it works */}
          <Card className="border-stone-200 bg-stone-50">
            <CardContent className="pt-5 pb-4">
              <div className="flex gap-4">
                <div className="rounded-lg bg-[#D4A574]/10 p-2.5 shrink-0 self-start">
                  <Send className="h-5 w-5 text-[#C19A5B]" />
                </div>
                <div>
                  <p className="font-semibold text-stone-900 mb-1">Publish to besttravelmorocco.com</p>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    Clicking <strong>Publish</strong> pushes your tours, blog posts, testimonials, and settings
                    as JSON files to the GitHub repository. Vercel detects the commit and automatically rebuilds
                    your live website.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GitHub config */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                GitHub Integration
              </CardTitle>
              <CardDescription>
                Generate a token at{" "}
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo&description=BTM+Admin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#C19A5B] hover:underline inline-flex items-center gap-0.5"
                >
                  github.com/settings/tokens <ExternalLink className="h-3 w-3" />
                </a>{" "}
                with <code className="bg-stone-100 px-1 rounded text-xs">repo</code> scope.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Repository Owner</Label>
                  <Input
                    value={pubCfg.repoOwner}
                    onChange={(e) => setPubCfg({ ...pubCfg, repoOwner: e.target.value })}
                    placeholder="besttravelmorocco-blip"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Repository Name</Label>
                  <Input
                    value={pubCfg.repoName}
                    onChange={(e) => setPubCfg({ ...pubCfg, repoName: e.target.value })}
                    placeholder="btm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>GitHub Personal Access Token</Label>
                <div className="relative">
                  <Input
                    type={showToken ? "text" : "password"}
                    value={pubCfg.githubToken}
                    onChange={(e) => setPubCfg({ ...pubCfg, githubToken: e.target.value })}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>
                  Vercel Deploy Hook{" "}
                  <span className="text-stone-400 font-normal">(optional)</span>
                </Label>
                <Input
                  value={pubCfg.vercelHook ?? ""}
                  onChange={(e) => setPubCfg({ ...pubCfg, vercelHook: e.target.value })}
                  placeholder="https://api.vercel.com/v1/integrations/deploy/..."
                />
                <p className="text-xs text-stone-400">
                  Get this from Vercel → Project Settings → Git → Deploy Hooks
                </p>
              </div>

              <Button variant="outline" size="sm" onClick={handleSavePublishConfig}>
                Save Configuration
              </Button>
            </CardContent>
          </Card>

          {/* Publish button + status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Publish Website</CardTitle>
              <CardDescription>Push your latest content to the live website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="gap-2 bg-[#D4A574] hover:bg-[#c49668] min-w-[160px]"
                onClick={handlePublish}
                disabled={publishState === "publishing" || !pubCfg.githubToken}
              >
                {publishState === "publishing" ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Publishing…</>
                ) : (
                  <><Send className="h-4 w-4" /> Publish to Website</>
                )}
              </Button>

              {publishMsg && (
                <div
                  className={`flex items-start gap-3 rounded-lg p-3 text-sm ${
                    publishState === "error"
                      ? "bg-red-50 text-red-700"
                      : publishState === "success"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-stone-50 text-stone-600"
                  }`}
                >
                  {publishState === "error" ? (
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  ) : publishState === "success" ? (
                    <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                  ) : (
                    <Loader2 className="h-4 w-4 mt-0.5 shrink-0 animate-spin" />
                  )}
                  <div>
                    <p>{publishMsg}</p>
                    {publishedFiles.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {publishedFiles.map((f) => (
                          <Badge key={f} variant="outline" className="text-xs font-mono">
                            {f}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!pubCfg.githubToken && (
                <p className="text-xs text-stone-400">
                  Configure a GitHub token above to enable publishing.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-[#C19A5B]" /> Clear App Cache
              </CardTitle>
              <CardDescription>
                Remove all locally cached data and reset in-memory query cache. Use this if the
                admin shows stale content or behaves unexpectedly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cacheCleared ? (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Cache cleared. All data will reload fresh from Supabase.
                </div>
              ) : (
                <Button
                  onClick={handleClearCache}
                  variant="outline"
                  className="gap-2 border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" /> Clear All Cache
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#C19A5B]" /> Password
              </CardTitle>
              <CardDescription>
                Change your admin password. A reset link will be sent to your registered email.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {resetSent ? (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Reset link sent to your email. Check your inbox and follow the link to set a new password.
                </div>
              ) : (
                <>
                  {resetError && (
                    <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {resetError}
                    </div>
                  )}
                  <Button
                    onClick={handleSendReset}
                    disabled={resetLoading}
                    variant="outline"
                    className="gap-2 border-[#C19A5B] text-[#C19A5B] hover:bg-[#C19A5B]/10"
                  >
                    {resetLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                    {resetLoading ? "Sending…" : "Send Password Reset Email"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
