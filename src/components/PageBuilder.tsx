import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import TourForm from "./TourForm";
import {
  LayoutDashboard, GripVertical, Plus, Trash2, ChevronUp, ChevronDown,
  Eye, Save, Globe, ArrowLeft, Type, Image, Star, Users, Phone,
  HelpCircle, Map, ArrowRight, Calendar, Play, Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Section Types ───
type SectionType = "hero" | "text" | "tourCards" | "stats" | "testimonials" | "faq" | "cta" | "destinations" | "spacer";

interface Section {
  id: string;
  type: SectionType;
  props: Record<string, any>;
}

interface PageConfig {
  id: string;
  name: string;
  sections: Section[];
}

const sectionTypeConfig: Record<SectionType, { label: string; icon: typeof Type; description: string; defaultProps: Record<string, any> }> = {
  hero: {
    label: "Hero Banner",
    icon: Image,
    description: "Full-width banner with title, subtitle, CTA",
    defaultProps: { title: "Discover Morocco", subtitle: "Unforgettable tours & Sahara adventures", buttonText: "Explore Tours", buttonLink: "/tours", bgImage: "/images/hero_sahara.jpg", overlayOpacity: 0.4, textColor: "#ffffff" },
  },
  text: {
    label: "Text Block",
    icon: Type,
    description: "Heading + rich text paragraph",
    defaultProps: { heading: "About Our Tours", headingLevel: "h2", body: "<p>We offer authentic Morocco experiences...</p>", alignment: "left", bgColor: "#ffffff" },
  },
  tourCards: {
    label: "Tour Cards",
    icon: Map,
    description: "Grid of tour cards",
    defaultProps: { title: "Popular Tours", count: 6, filter: "all", cardStyle: "vertical", columns: 3 },
  },
  stats: {
    label: "Stats Counter",
    icon: Users,
    description: "Animated number counters",
    defaultProps: { items: [{ number: "6000", label: "Happy Travelers", icon: "Users" }, { number: "33", label: "Curated Tours", icon: "Map" }, { number: "25", label: "Years Experience", icon: "Calendar" }, { number: "40", label: "Countries Served", icon: "Globe" }] },
  },
  testimonials: {
    label: "Testimonials",
    icon: Star,
    description: "Customer reviews slider",
    defaultProps: { title: "What Travelers Say", autoplay: true, count: 5 },
  },
  faq: {
    label: "FAQ Accordion",
    icon: HelpCircle,
    description: "Expandable Q&A section",
    defaultProps: { title: "Frequently Asked Questions", items: [{ q: "What is the best time to visit Morocco?", a: "Spring (March-May) and Autumn (September-November) are ideal." }, { q: "Is Morocco safe for tourists?", a: "Yes, Morocco is very safe for tourists with over 13 million visitors annually." }, { q: "What should I pack for a desert tour?", a: "Light clothing for daytime, warm layers for nights, sunglasses, sunscreen, and a camera." }] },
  },
  cta: {
    label: "CTA Banner",
    icon: ArrowRight,
    description: "Call-to-action strip",
    defaultProps: { text: "Ready for your Morocco adventure?", buttonText: "Book Now", buttonLink: "/tours", bgColor: "#2D1810", textColor: "#ffffff" },
  },
  destinations: {
    label: "Destinations",
    icon: Globe,
    description: "Grid of destination cards",
    defaultProps: { title: "Top Destinations", columns: 4 },
  },
  spacer: {
    label: "Spacer / Divider",
    icon: Settings,
    description: "Empty space or line",
    defaultProps: { height: 60, showDivider: false },
  },
};

const availablePages: PageConfig[] = [
  { id: "home", name: "Homepage", sections: [
    { id: "hero-1", type: "hero", props: sectionTypeConfig.hero.defaultProps },
    { id: "tours-1", type: "tourCards", props: sectionTypeConfig.tourCards.defaultProps },
    { id: "stats-1", type: "stats", props: sectionTypeConfig.stats.defaultProps },
    { id: "dest-1", type: "destinations", props: sectionTypeConfig.destinations.defaultProps },
    { id: "cta-1", type: "cta", props: sectionTypeConfig.cta.defaultProps },
  ]},
  { id: "tours", name: "Tours Listing", sections: [
    { id: "hero-tours", type: "hero", props: { ...sectionTypeConfig.hero.defaultProps, title: "All Morocco Tours", subtitle: "Sahara desert trips, imperial cities & more", bgImage: "/images/hero_marrakech.jpg" } },
    { id: "tours-all", type: "tourCards", props: { ...sectionTypeConfig.tourCards.defaultProps, title: "Browse All Tours", count: 27, filter: "all" } },
  ]},
  { id: "about", name: "About Page", sections: [
    { id: "about-hero", type: "hero", props: { ...sectionTypeConfig.hero.defaultProps, title: "About Best Travel Morocco", subtitle: "25+ years of authentic Moroccan experiences", bgImage: "/images/team_group.jpg" } },
    { id: "about-text", type: "text", props: { heading: "Our Story", headingLevel: "h2", body: "<p>Founded in 2012, Best Travel Morocco has been crafting unforgettable journeys...</p>", alignment: "left" } },
    { id: "about-stats", type: "stats", props: sectionTypeConfig.stats.defaultProps },
  ]},
  { id: "blog", name: "Blog Listing", sections: [
    { id: "blog-hero", type: "hero", props: { ...sectionTypeConfig.hero.defaultProps, title: "Morocco Travel Blog", subtitle: "Tips, guides & stories from 25+ years of experience", bgImage: "/images/blog_header.jpg" } },
    { id: "blog-text", type: "text", props: { heading: "Latest Articles", headingLevel: "h2", body: "<p>Discover insider tips and travel inspiration...</p>", alignment: "left" } },
  ]},
  { id: "faq", name: "FAQ Page", sections: [
    { id: "faq-hero", type: "hero", props: { ...sectionTypeConfig.hero.defaultProps, title: "Frequently Asked Questions", subtitle: "Everything you need to know about Morocco tours", bgImage: "/images/hero_marrakech.jpg" } },
    { id: "faq-section", type: "faq", props: sectionTypeConfig.faq.defaultProps },
    { id: "faq-cta", type: "cta", props: sectionTypeConfig.cta.defaultProps },
  ]},
  { id: "contact", name: "Contact Page", sections: [
    { id: "contact-hero", type: "hero", props: { ...sectionTypeConfig.hero.defaultProps, title: "Contact Us", subtitle: "Get in touch to plan your perfect Morocco trip", bgImage: "/images/hero_sahara.jpg" } },
    { id: "contact-text", type: "text", props: { heading: "Get in Touch", headingLevel: "h2", body: "<p>We'd love to hear from you. Reach out via phone, email, or WhatsApp...</p>", alignment: "left" } },
  ]},
];

// ─── Render Section Preview ───
function SectionPreview({ section, onEdit, onDelete, onMoveUp, onMoveDown, isFirst, isLast }: {
  section: Section; onEdit: () => void; onDelete: () => void; onMoveUp: () => void; onMoveDown: () => void; isFirst: boolean; isLast: boolean;
}) {
  const config = sectionTypeConfig[section.type];
  const Icon = config.icon;

  return (
    <Card className="group relative border-2 border-dashed border-stone-200 hover:border-[#D4A574] transition-all overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-stone-50 border-b border-stone-100">
        <GripVertical className="h-4 w-4 text-stone-400 cursor-grab" />
        <Icon className="h-4 w-4 text-[#D4A574]" />
        <span className="text-sm font-medium text-stone-700">{config.label}</span>
        <div className="flex-1" />
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isFirst && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onMoveUp}><ChevronUp className="h-4 w-4" /></Button>}
          {!isLast && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onMoveDown}><ChevronDown className="h-4 w-4" /></Button>}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}><Settings className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>
      <CardContent className="p-4">
        {/* Mini preview of the section */}
        {section.type === "hero" && (
          <div className="relative h-32 rounded-lg bg-stone-800 flex items-center justify-center overflow-hidden">
            {section.props.bgImage && <img src={section.props.bgImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />}
            <div className="relative text-center">
              <p className="text-white font-playfair text-lg font-bold">{section.props.title}</p>
              <p className="text-white/70 text-xs mt-1">{section.props.subtitle}</p>
            </div>
          </div>
        )}
        {section.type === "text" && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-stone-900">{section.props.heading}</p>
            <div className="text-xs text-stone-500 line-clamp-2" dangerouslySetInnerHTML={{ __html: section.props.body }} />
          </div>
        )}
        {section.type === "tourCards" && (
          <div className="flex items-center gap-2">
            <Map className="h-4 w-4 text-stone-400" />
            <span className="text-sm text-stone-600">{section.props.title} — showing {section.props.count} tours</span>
          </div>
        )}
        {section.type === "stats" && (
          <div className="flex gap-4">
            {section.props.items?.map((item: any, i: number) => (
              <div key={i} className="text-center"><p className="text-lg font-bold text-[#D4A574]">{item.number}</p><p className="text-xs text-stone-500">{item.label}</p></div>
            ))}
          </div>
        )}
        {section.type === "testimonials" && (
          <div className="flex items-center gap-2"><Star className="h-4 w-4 text-yellow-500" /><span className="text-sm text-stone-600">{section.props.title} — {section.props.count} reviews</span></div>
        )}
        {section.type === "faq" && (
          <div className="space-y-1">
            <p className="text-sm font-semibold text-stone-900">{section.props.title}</p>
            {section.props.items?.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-2 text-xs text-stone-500"><HelpCircle className="h-3 w-3" />{item.q}</div>
            ))}
          </div>
        )}
        {section.type === "cta" && (
          <div className="rounded-lg p-3 text-center" style={{ backgroundColor: section.props.bgColor }}>
            <p className="text-sm font-semibold" style={{ color: section.props.textColor }}>{section.props.text}</p>
            <p className="text-xs mt-1" style={{ color: section.props.textColor, opacity: 0.8 }}>{section.props.buttonText}</p>
          </div>
        )}
        {section.type === "destinations" && (
          <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-stone-400" /><span className="text-sm text-stone-600">{section.props.title} — {section.props.columns} columns</span></div>
        )}
        {section.type === "spacer" && (
          <div className="flex items-center gap-2"><Settings className="h-4 w-4 text-stone-400" /><span className="text-sm text-stone-600">{section.props.height}px height {section.props.showDivider && "+ divider"}</span></div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Section Editor Panel ───
function SectionEditor({ section, onUpdate, onClose }: { section: Section; onUpdate: (props: any) => void; onClose: () => void }) {
  const [props, setProps] = useState(section.props);
  const config = sectionTypeConfig[section.type];

  const update = (key: string, value: any) => {
    const newProps = { ...props, [key]: value };
    setProps(newProps);
    onUpdate(newProps);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Edit {config.label}</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>Done</Button>
      </div>

      {/* Hero editor */}
      {section.type === "hero" && (
        <div className="space-y-3">
          <div className="space-y-1"><Label>Title</Label><Input value={props.title} onChange={(e) => update("title", e.target.value)} /></div>
          <div className="space-y-1"><Label>Subtitle</Label><Input value={props.subtitle} onChange={(e) => update("subtitle", e.target.value)} /></div>
          <div className="space-y-1"><Label>Button Text</Label><Input value={props.buttonText} onChange={(e) => update("buttonText", e.target.value)} /></div>
          <div className="space-y-1"><Label>Button Link</Label><Input value={props.buttonLink} onChange={(e) => update("buttonLink", e.target.value)} /></div>
          <div className="space-y-1"><Label>Background Image</Label><Input value={props.bgImage} onChange={(e) => update("bgImage", e.target.value)} /></div>
          <div className="space-y-1"><Label>Overlay Opacity</Label><Input type="number" min={0} max={1} step={0.1} value={props.overlayOpacity} onChange={(e) => update("overlayOpacity", parseFloat(e.target.value))} /></div>
        </div>
      )}

      {/* Text editor */}
      {section.type === "text" && (
        <div className="space-y-3">
          <div className="space-y-1"><Label>Heading</Label><Input value={props.heading} onChange={(e) => update("heading", e.target.value)} /></div>
          <div className="space-y-1"><Label>Heading Level</Label>
            <select value={props.headingLevel} onChange={(e) => update("headingLevel", e.target.value)} className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm">
              <option value="h1">H1</option><option value="h2">H2</option><option value="h3">H3</option>
            </select>
          </div>
          <div className="space-y-1"><Label>Body HTML</Label><Textarea value={props.body} onChange={(e) => update("body", e.target.value)} rows={4} /></div>
        </div>
      )}

      {/* Tour cards editor */}
      {section.type === "tourCards" && (
        <div className="space-y-3">
          <div className="space-y-1"><Label>Section Title</Label><Input value={props.title} onChange={(e) => update("title", e.target.value)} /></div>
          <div className="space-y-1"><Label>Number of Tours</Label><Input type="number" value={props.count} onChange={(e) => update("count", parseInt(e.target.value))} /></div>
          <div className="space-y-1"><Label>Columns</Label>
            <select value={props.columns} onChange={(e) => update("columns", parseInt(e.target.value))} className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm">
              <option value={2}>2</option><option value={3}>3</option><option value={4}>4</option>
            </select>
          </div>
        </div>
      )}

      {/* Stats editor */}
      {section.type === "stats" && (
        <div className="space-y-3">
          {props.items?.map((item: any, i: number) => (
            <div key={i} className="flex gap-2">
              <Input value={item.number} onChange={(e) => { const items = [...props.items]; items[i] = { ...item, number: e.target.value }; update("items", items); }} className="w-20" />
              <Input value={item.label} onChange={(e) => { const items = [...props.items]; items[i] = { ...item, label: e.target.value }; update("items", items); }} className="flex-1" />
              <Button variant="ghost" size="icon" className="h-9 w-9 text-red-500" onClick={() => update("items", props.items.filter((_: any, j: number) => j !== i))}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="gap-1" onClick={() => update("items", [...props.items, { number: "0", label: "New Stat", icon: "Users" }])}><Plus className="h-4 w-4" /> Add Stat</Button>
        </div>
      )}

      {/* FAQ editor */}
      {section.type === "faq" && (
        <div className="space-y-3">
          <div className="space-y-1"><Label>Section Title</Label><Input value={props.title} onChange={(e) => update("title", e.target.value)} /></div>
          {props.items?.map((item: any, i: number) => (
            <div key={i} className="space-y-2 p-3 rounded-lg border border-stone-100">
              <Input value={item.q} onChange={(e) => { const items = [...props.items]; items[i] = { ...item, q: e.target.value }; update("items", items); }} placeholder="Question" />
              <Textarea value={item.a} onChange={(e) => { const items = [...props.items]; items[i] = { ...item, a: e.target.value }; update("items", items); }} placeholder="Answer" rows={2} />
              <Button variant="ghost" size="sm" className="text-red-500" onClick={() => update("items", props.items.filter((_: any, j: number) => j !== i))}><Trash2 className="h-4 w-4 mr-1" /> Remove</Button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="gap-1" onClick={() => update("items", [...props.items, { q: "", a: "" }])}><Plus className="h-4 w-4" /> Add FAQ</Button>
        </div>
      )}

      {/* CTA editor */}
      {section.type === "cta" && (
        <div className="space-y-3">
          <div className="space-y-1"><Label>Text</Label><Input value={props.text} onChange={(e) => update("text", e.target.value)} /></div>
          <div className="space-y-1"><Label>Button Text</Label><Input value={props.buttonText} onChange={(e) => update("buttonText", e.target.value)} /></div>
          <div className="space-y-1"><Label>Button Link</Label><Input value={props.buttonLink} onChange={(e) => update("buttonLink", e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>Background Color</Label><Input value={props.bgColor} onChange={(e) => update("bgColor", e.target.value)} /></div>
            <div className="space-y-1"><Label>Text Color</Label><Input value={props.textColor} onChange={(e) => update("textColor", e.target.value)} /></div>
          </div>
        </div>
      )}

      {/* Spacer editor */}
      {section.type === "spacer" && (
        <div className="space-y-3">
          <div className="space-y-1"><Label>Height (px)</Label><Input type="number" value={props.height} onChange={(e) => update("height", parseInt(e.target.value))} /></div>
          <label className="flex items-center gap-2"><input type="checkbox" checked={props.showDivider} onChange={(e) => update("showDivider", e.target.checked)} className="rounded" /><span className="text-sm">Show divider line</span></label>
        </div>
      )}
    </div>
  );
}

// ─── Main Page Builder ───
export default function PageBuilder() {
  const [activePageId, setActivePageId] = useState("home");
  const [pages, setPages] = useState<PageConfig[]>(availablePages);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [showSectionPicker, setShowSectionPicker] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const activePage = pages.find((p) => p.id === activePageId) ?? pages[0];

  const addSection = (type: SectionType) => {
    const config = sectionTypeConfig[type];
    const newSection: Section = {
      id: `${type}-${Date.now()}`,
      type,
      props: { ...config.defaultProps },
    };
    setPages((prev) => prev.map((p) => p.id === activePageId ? { ...p, sections: [...p.sections, newSection] } : p));
    setShowSectionPicker(false);
  };

  const updateSection = (sectionId: string, props: any) => {
    setPages((prev) => prev.map((p) => p.id === activePageId ? {
      ...p,
      sections: p.sections.map((s) => s.id === sectionId ? { ...s, props } : s),
    } : p));
  };

  const deleteSection = (sectionId: string) => {
    setPages((prev) => prev.map((p) => p.id === activePageId ? {
      ...p,
      sections: p.sections.filter((s) => s.id !== sectionId),
    } : p));
    if (editingSection === sectionId) setEditingSection(null);
  };

  const moveSection = (sectionId: string, direction: "up" | "down") => {
    setPages((prev) => prev.map((p) => {
      if (p.id !== activePageId) return p;
      const idx = p.sections.findIndex((s) => s.id === sectionId);
      if (idx === -1) return p;
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= p.sections.length) return p;
      const sections = [...p.sections];
      [sections[idx], sections[newIdx]] = [sections[newIdx], sections[idx]];
      return { ...p, sections };
    }));
  };

  const editingSectionData = activePage.sections.find((s) => s.id === editingSection);

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Left: Section Library or Editor */}
      <div className="w-80 shrink-0 flex flex-col">
        {editingSectionData ? (
          <div className="flex-1 overflow-auto rounded-lg border border-stone-200 bg-white p-4">
            <SectionEditor
              section={editingSectionData}
              onUpdate={(props) => updateSection(editingSection!, props)}
              onClose={() => setEditingSection(null)}
            />
          </div>
        ) : (
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardContent className="p-0 flex flex-col h-full">
              <div className="p-4 border-b border-stone-100">
                <h3 className="font-semibold text-stone-900">Add Sections</h3>
                <p className="text-xs text-stone-500">Click to add to page</p>
              </div>
              <div className="flex-1 overflow-auto p-3 space-y-2">
                {(Object.entries(sectionTypeConfig) as [SectionType, typeof sectionTypeConfig.hero][]).map(([type, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={type}
                      onClick={() => addSection(type)}
                      className="w-full flex items-center gap-3 rounded-lg border border-stone-200 p-3 text-left hover:border-[#D4A574] hover:bg-[#D4A574]/5 transition-all"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100">
                        <Icon className="h-4 w-4 text-stone-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-stone-900">{config.label}</p>
                        <p className="text-xs text-stone-500">{config.description}</p>
                      </div>
                      <Plus className="h-4 w-4 text-stone-400 ml-auto" />
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Center: Page Preview */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Select value={activePageId} onValueChange={setActivePageId}>
              <SelectTrigger className="w-48">
                <Globe className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pages.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="outline" className="text-xs">{activePage.sections.length} sections</Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1" onClick={() => setPreviewMode(!previewMode)}>
              <Eye className="h-4 w-4" /> {previewMode ? "Edit" : "Preview"}
            </Button>
            <Button size="sm" className="gap-1 bg-[#D4A574] hover:bg-[#c49668]">
              <Save className="h-4 w-4" /> Save
            </Button>
          </div>
        </div>

        {/* Sections Canvas */}
        <div className="flex-1 overflow-auto rounded-lg border border-stone-200 bg-white p-6 space-y-4">
          {activePage.sections.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-stone-400">
              <LayoutDashboard className="h-12 w-12 mb-3 opacity-30" />
              <p>This page is empty</p>
              <p className="text-xs mt-1">Add sections from the left panel</p>
            </div>
          ) : (
            activePage.sections.map((section, i) => (
              <SectionPreview
                key={section.id}
                section={section}
                onEdit={() => setEditingSection(section.id)}
                onDelete={() => deleteSection(section.id)}
                onMoveUp={() => moveSection(section.id, "up")}
                onMoveDown={() => moveSection(section.id, "down")}
                isFirst={i === 0}
                isLast={i === activePage.sections.length - 1}
              />
            ))
          )}
          {/* Add section button at bottom */}
          <Button variant="outline" className="w-full gap-2 py-6 border-dashed" onClick={() => setEditingSection(null)}>
            <Plus className="h-4 w-4" /> Add Section
          </Button>
        </div>
      </div>
    </div>
  );
}
