import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Globe, Mail, Phone, MapPin, Save, Facebook, Instagram } from "lucide-react";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Site Settings</h2>
          <p className="mt-1 text-stone-500">Configure your website settings and integrations</p>
        </div>
        <Button className="gap-2 bg-[#D4A574] hover:bg-[#c49668]" onClick={handleSave}>
          <Save className="h-4 w-4" /> {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-stone-100">
          <TabsTrigger value="general" className="gap-1"><Globe className="h-4 w-4" /> General</TabsTrigger>
          <TabsTrigger value="contact" className="gap-1"><Phone className="h-4 w-4" /> Contact</TabsTrigger>
          <TabsTrigger value="social" className="gap-1"><Instagram className="h-4 w-4" /> Social</TabsTrigger>
          <TabsTrigger value="seo" className="gap-1"><Settings className="h-4 w-4" /> SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">General Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Site Name</Label>
                  <Input defaultValue="Best Travel Morocco" />
                </div>
                <div className="space-y-2">
                  <Label>Tagline</Label>
                  <Input defaultValue="Authentic Morocco Tours Since 2012" />
                </div>
                <div className="space-y-2">
                  <Label>Default Language</Label>
                  <Input defaultValue="en" />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Input defaultValue="EUR" />
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
                  <Input defaultValue="+212-677-365-421" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> Email</Label>
                  <Input defaultValue="hello@besttravelmorocco.com" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Address</Label>
                  <Input defaultValue="Angle bd Emile Zola et Rue Rethel, 7eme Etage N20, Casablanca, Morocco" />
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
                  <Label className="flex items-center gap-1"><Facebook className="h-3.5 w-3.5" /> Facebook</Label>
                  <Input defaultValue="https://www.facebook.com/besttravelmorocco" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Instagram className="h-3.5 w-3.5" /> Instagram</Label>
                  <Input defaultValue="https://www.instagram.com/besttravelmorocco" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">SEO Integrations</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Google Analytics ID (G-XXXXXXXXXX)</Label>
                  <Input placeholder="G-XXXXXXXXXX" />
                </div>
                <div className="space-y-2">
                  <Label>Google Search Console Verification</Label>
                  <Input placeholder="YOUR_GSC_CODE_HERE" />
                </div>
                <div className="space-y-2">
                  <Label>Facebook Pixel ID</Label>
                  <Input placeholder="Optional" />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp Business Number</Label>
                  <Input defaultValue="+212677365421" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
