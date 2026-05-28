import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Calculator,
  Plus,
  Trash2,
  Pencil,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const ruleTypeLabels: Record<string, string> = {
  base: "Base Price",
  season: "Season",
  group: "Group Size",
  accommodation: "Accommodation",
  earlybird: "Early Bird",
  lastminute: "Last Minute",
};

const ruleSchema = z.object({
  name: z.string().min(1, "Name required"),
  ruleType: z.enum(["base", "season", "group", "accommodation", "earlybird", "lastminute"]),
  modifier: z.string().min(1, "Modifier required"),
  modifierType: z.enum(["percent", "fixed"]).default("percent"),
  validFrom: z.string().optional(),
  validTo: z.string().optional(),
  priority: z.coerce.number().default(0),
});

type RuleForm = z.infer<typeof ruleSchema>;

const calcSchema = z.object({
  basePrice: z.coerce.number().min(0),
  adults: z.coerce.number().min(1).default(1),
  children: z.coerce.number().min(0).default(0),
  accommodation: z.enum(["shared", "private", "luxury"]).default("shared"),
  departureDate: z.string().optional(),
});

type CalcForm = z.infer<typeof calcSchema>;

export default function PricingPage() {
  const [createOpen, setCreateOpen] = useState(false);

  const utils = trpc.useContext();

  const rulesQuery = trpc.pricing.list.useQuery({});

  const createMutation = trpc.pricing.create.useMutation({
    onSuccess: () => {
      utils.pricing.list.invalidate();
      setCreateOpen(false);
      ruleForm.reset();
    },
  });

  const deleteMutation = trpc.pricing.delete.useMutation({
    onSuccess: () => utils.pricing.list.invalidate(),
  });

  const toggleMutation = trpc.pricing.update.useMutation({
    onSuccess: () => utils.pricing.list.invalidate(),
  });

  const [calcInput, setCalcInput] = useState<CalcForm>({
    basePrice: 500,
    adults: 2,
    children: 0,
    accommodation: "shared",
    departureDate: "",
  });

  const calcQuery = trpc.pricing.calculate.useQuery(
    {
      basePrice: calcInput.basePrice,
      adults: calcInput.adults,
      children: calcInput.children,
      accommodation: calcInput.accommodation,
      departureDate: calcInput.departureDate || undefined,
    },
    { enabled: calcInput.basePrice > 0 }
  );

  const ruleForm = useForm<RuleForm>({
    resolver: zodResolver(ruleSchema),
    defaultValues: { ruleType: "season", modifierType: "percent", priority: 0 },
  });

  const rules = rulesQuery.data ?? [];
  const calc = calcQuery.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Pricing Engine</h2>
          <p className="mt-1 text-stone-500">
            Manage dynamic pricing rules and calculate live quotes
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#D4A574] hover:bg-[#c49668]">
              <Plus className="mr-2 h-4 w-4" /> Add Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>New Pricing Rule</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={ruleForm.handleSubmit((data) => createMutation.mutate(data))}
              className="space-y-4 pt-2"
            >
              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-600">Rule Name *</label>
                <Input {...ruleForm.register("name")} placeholder="e.g. Peak Season +25%" />
                {ruleForm.formState.errors.name && (
                  <p className="text-xs text-red-500">{ruleForm.formState.errors.name.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-600">Type</label>
                  <Select
                    defaultValue="season"
                    onValueChange={(v) =>
                      ruleForm.setValue("ruleType", v as RuleForm["ruleType"])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ruleTypeLabels).map(([v, l]) => (
                        <SelectItem key={v} value={v}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-600">Modifier Type</label>
                  <Select
                    defaultValue="percent"
                    onValueChange={(v) =>
                      ruleForm.setValue("modifierType", v as "percent" | "fixed")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Percent (%)</SelectItem>
                      <SelectItem value="fixed">Fixed ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-600">
                    Modifier (e.g. 25 or -15)
                  </label>
                  <Input {...ruleForm.register("modifier")} placeholder="25" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-600">Priority</label>
                  <Input {...ruleForm.register("priority")} type="number" placeholder="0" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-600">Valid From</label>
                  <Input {...ruleForm.register("validFrom")} type="date" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-600">Valid To</label>
                  <Input {...ruleForm.register("validTo")} type="date" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#D4A574] hover:bg-[#c49668]"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Saving..." : "Save Rule"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Rules List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pricing Rules</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {rules.length === 0 ? (
              <div className="py-10 text-center text-stone-400">
                <Calculator className="mx-auto h-8 w-8 mb-2 opacity-30" />
                <p className="text-sm">No rules yet. Add your first rule.</p>
              </div>
            ) : (
              <div className="divide-y">
                {rules.map((rule) => {
                  const mod = parseFloat(rule.modifier);
                  const isPositive = mod >= 0;
                  return (
                    <div key={rule.id} className="flex items-center gap-3 px-4 py-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isPositive ? "bg-amber-50" : "bg-emerald-50"}`}>
                        {isPositive ? (
                          <TrendingUp className="h-4 w-4 text-amber-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-emerald-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-900 truncate">{rule.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge className="bg-stone-100 text-stone-600 text-xs">
                            {ruleTypeLabels[rule.ruleType] ?? rule.ruleType}
                          </Badge>
                          <span className={`text-xs font-mono font-semibold ${isPositive ? "text-amber-600" : "text-emerald-600"}`}>
                            {isPositive ? "+" : ""}{rule.modifier}{rule.modifierType === "percent" ? "%" : "$"}
                          </span>
                          {rule.validFrom && (
                            <span className="text-xs text-stone-400">
                              {rule.validFrom} – {rule.validTo ?? "∞"}
                            </span>
                          )}
                        </div>
                      </div>
                      <Switch
                        checked={rule.active ?? true}
                        onCheckedChange={(checked) =>
                          toggleMutation.mutate({ id: rule.id, active: checked })
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-400 hover:text-red-600 shrink-0"
                        onClick={() => {
                          if (confirm("Delete this rule?"))
                            deleteMutation.mutate({ id: rule.id });
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live Calculator */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="h-4 w-4" /> Live Price Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-600">Base Price ($)</label>
                <Input
                  type="number"
                  value={calcInput.basePrice}
                  onChange={(e) =>
                    setCalcInput((p) => ({ ...p, basePrice: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-600">Accommodation</label>
                <Select
                  value={calcInput.accommodation}
                  onValueChange={(v) =>
                    setCalcInput((p) => ({ ...p, accommodation: v as CalcForm["accommodation"] }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shared">Shared (×1.0)</SelectItem>
                    <SelectItem value="private">Private (×1.35)</SelectItem>
                    <SelectItem value="luxury">Luxury (×1.75)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-600">Adults</label>
                <Input
                  type="number"
                  min={1}
                  value={calcInput.adults}
                  onChange={(e) =>
                    setCalcInput((p) => ({ ...p, adults: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-600">Children</label>
                <Input
                  type="number"
                  min={0}
                  value={calcInput.children}
                  onChange={(e) =>
                    setCalcInput((p) => ({ ...p, children: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-xs font-medium text-stone-600">
                  Departure Date (for season)
                </label>
                <Input
                  type="date"
                  value={calcInput.departureDate}
                  onChange={(e) =>
                    setCalcInput((p) => ({ ...p, departureDate: e.target.value }))
                  }
                />
              </div>
            </div>

            {calc && (
              <div className="rounded-lg bg-stone-50 border border-stone-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-500">Per person</span>
                  <span className="font-semibold text-stone-900">${calc.perPerson.toLocaleString()}</span>
                </div>
                {calc.children > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-stone-500">Per child (60%)</span>
                    <span className="font-semibold text-stone-900">${calc.childPrice.toLocaleString()}</span>
                  </div>
                )}
                {calc.season && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-stone-500">Season</span>
                    <Badge className="bg-amber-50 text-amber-700 capitalize">{calc.season}</Badge>
                  </div>
                )}
                {calc.appliedRules.length > 0 && (
                  <div>
                    <p className="text-xs text-stone-400 mb-1">Applied rules</p>
                    {calc.appliedRules.map((r) => (
                      <div key={r.name} className="flex justify-between text-xs text-stone-500">
                        <span>{r.name}</span>
                        <span className={r.adjustment >= 0 ? "text-amber-600" : "text-emerald-600"}>
                          {r.adjustment >= 0 ? "+" : ""}${Math.round(r.adjustment)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="border-t pt-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-stone-700">
                    Total ({calc.adults}A{calc.children > 0 ? ` + ${calc.children}C` : ""})
                  </span>
                  <span className="text-xl font-bold text-[#C8962C]">
                    ${calc.totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
