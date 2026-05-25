import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Globe, Phone, MapPin, Mail, Save } from "lucide-react";
import { trpc } from "@/providers/trpc";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [general, setGeneral] = useState({
    siteName: "Best Travel Morocco",
    tagline: "Authentic Morocco Tours Since 2012",
  });

  const [contact, setContact] = useState({
    phone: "+212-677-365-421",
    email: "hello@besttravelmorocco.com",
    whatsapp: "+212677365421",
    address: "Angle bd Emile Zola et Rue Rethel, 7eme Etage N20, Casablanca, Morocco",
  });

  const [social, setSocial] = useState({
    facebook: "https://www.facebook.com/besttravelmorocco",
    instagram: "https://www.instagram.com/besttravelmorocco",
    twitter: "https://twitter.com/besttravelmorocco",
    youtube: "https://www.youtube.com/@besttravelmorocco",
  });

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
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
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
          <Save className="h-4 w-4" />
          {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-stone-100">
          <TabsTrigger value="general" className="gap-1"><Globe className="h-4 w-4" /> General</TabsTrigger>
          <TabsTrigger value="contact" className="gap-1"><Phone className="h-4 w-4" /> Contact</TabsTrigger>
          <TabsTrigger value="social" className="gap-1"><Settings className="h-4 w-4" /> Social</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">General Settings</CardTitle></CardHeader>
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

        <TabsContent value="contact" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Contact Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> Phone</Label>
                  <Input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> Email</Label>
                  <Input value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp Number</Label>
                  <Input value={contact.whatsapp} onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Address</Label>
                  <Input value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Social Media Links</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Facebook URL</Label>
                  <Input value={social.facebook} onChange={(e) => setSocial({ ...social, facebook: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Instagram URL</Label>
                  <Input value={social.instagram} onChange={(e) => setSocial({ ...social, instagram: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Twitter / X URL</Label>
                  <Input value={social.twitter} onChange={(e) => setSocial({ ...social, twitter: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>YouTube URL</Label>
                  <Input value={social.youtube} onChange={(e) => setSocial({ ...social, youtube: e.target.value })} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
