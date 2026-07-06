import { Head, Link } from "@inertiajs/react";
import {
  Users,
  CalendarDays,
  CalendarClock,
  Activity,
  HeartPulse,
  Download,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

/* ---------------------------------------------
 Types (match controller props)
--------------------------------------------- */
type Slot = { day: string; time: string };

type Registration = {
  id?: number;
  name: string;
  employee_id: string;
  sector: string;
  sex: string;
  age: number;
  phone_number: string;
  chronic_illness?: string | null;
  selected_slots?: Slot[] | null;
  created_at?: string;
};

type Stats = {
  total: number;
  todayRegistrations: number;
  totalSlotSelections: number;
  avgAge: number;
  illnessCount: number;
  illnessPct: number;
};

type Charts = {
  trend: { day: string; registrations: number }[];
  sectors: { sector: string; count: number }[];
  sex: { sex: string; count: number }[];
  ageBands: { band: string; count: number }[];
  slotHeat: Record<string, number>; // key = "day||time"
};

type Props = {
  registrations: Registration[];
  stats: Stats;
  charts: Charts;
};

/* ---------------------------------------------
 Config (should match your registration page)
--------------------------------------------- */
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIMES = [
  "12:30 AM - 1:30 AM",
  "1:30 AM - 2:30 AM",
  "6:30 AM - 7:30 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 1:00 PM",
  "1:00 PM - 2:00 PM",
];

const MAX_CAPACITY = 40;
const PIE_COLORS = ["#2563eb", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

/* ---------------------------------------------
 Small helpers
--------------------------------------------- */
function formatNumber(n: number) {
  return new Intl.NumberFormat().format(n ?? 0);
}

function statusMeta(utilPct: number) {
  if (utilPct < 35) {
    return {
      label: "Available",
      bg: "bg-emerald-500/10",
      text: "text-emerald-500",
      border: "border-emerald-500/30",
      dot: "bg-emerald-500",
    };
  }

  if (utilPct <= 70) {
    return {
      label: "Filling",
      bg: "bg-amber-500/10",
      text: "text-amber-500",
      border: "border-amber-500/30",
      dot: "bg-amber-500",
    };
  }

  return {
    label: "Busy",
    bg: "bg-rose-500/10",
    text: "text-rose-500",
    border: "border-rose-500/30",
    dot: "bg-rose-500",
  };
}

function TooltipCard({ active, payload, label }: any) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="bg-background border shadow-md rounded-xl px-3 py-2 text-xs">
      <div className="font-bold text-sidebar-foreground">{label}</div>
      {payload.map((p: any, idx: number) => (
        <div key={idx} className="flex items-center justify-between gap-6 mt-1">
          <span className="font-medium text-muted-foreground">{p.name}</span>
          <span className="font-bold" style={{ color: p.color }}>
            {p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function ChartShell({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card rounded-[28px] border shadow-sm border-sidebar-border/50 overflow-hidden">
      <div className="p-6 border-b border-sidebar-border/50 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-sidebar-foreground">{title}</h3>
          {subtitle ? <p className="text-sm text-muted-foreground mt-1">{subtitle}</p> : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      <div className="p-4 md:p-6">{children}</div>
    </div>
  );
}

function MeasuredChart({ children, className = "h-72" }: { children: React.ReactNode; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  const updateSize = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setSize({ width: Math.round(rect.width), height: Math.round(rect.height) });
    }
  }, []);

  useEffect(() => {
    updateSize();
    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [updateSize]);

  if (!size) {
    return <div ref={containerRef} className={className} />;
  }

  return (
    <div ref={containerRef} className={className}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { width: size.width, height: size.height });
        }
        return child;
      })}
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="bg-card rounded-[22px] border shadow-sm border-sidebar-border/50 p-5 hover:shadow-md hover:border-sidebar-primary/30 transition-all duration-300 group">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
          <div className="mt-2 text-2xl md:text-3xl font-bold tracking-tight text-sidebar-foreground group-hover:text-sidebar-primary transition-colors">
            {value}
          </div>
          {sub ? <p className="mt-1 text-xs text-muted-foreground font-medium">{sub}</p> : null}
        </div>
        <div className={cn("rounded-2xl p-3 border shadow-sm", accent)}>{icon}</div>
      </div>
    </div>
  );
}

/* ---------------------------------------------
 Page
--------------------------------------------- */
export default function Dashboard({ registrations, stats, charts }: Props) {
  // Normalize slotHeat (record) to safe lookup
  const slotHeat = charts?.slotHeat ?? {};

  // Recent table rows (controller already takes 10)
  const recent = useMemo(() => registrations ?? [], [registrations]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Head title="Dashboard" />

      <main className="max-w-8xl mx-auto px-4 py-8 pb-24 space-y-6">
        {/* Header */}
        <div className="bg-card rounded-[28px] border shadow-sm border-sidebar-border/50 p-6 md:p-7 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-sidebar-primary/5 to-transparent pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Admin Dashboard — Overview
              </h1>
              <p className="text-muted-foreground mt-1">
                KPI summaries, demographics, and slot utilization (last 30 days trend).
              </p>
            </div>

            <button
              type="button"
              onClick={() => alert("Connect this to your export endpoint")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 bg-sidebar-primary hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] text-sidebar-primary-foreground font-bold text-sm shadow-lg shadow-sidebar-primary/20 transition-all"
            >
              <Download className="size-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard
            label="Total registrations"
            value={formatNumber(stats?.total ?? 0)}
            sub="All time"
            icon={<Users className="size-5 text-sidebar-primary" />}
            accent="bg-sidebar-primary/10 border-sidebar-primary/30"
          />

          <KpiCard
            label="Today's registrations"
            value={formatNumber(stats?.todayRegistrations ?? 0)}
            sub="Created today"
            icon={<CalendarDays className="size-5 text-emerald-500" />}
            accent="bg-emerald-500/10 border-emerald-500/30"
          />

          <KpiCard
            label="Slots selected"
            value={formatNumber(stats?.totalSlotSelections ?? 0)}
            sub="Total individual selections"
            icon={<CalendarClock className="size-5 text-indigo-500" />}
            accent="bg-indigo-500/10 border-indigo-500/30"
          />

          <KpiCard
            label="Average age"
            value={stats?.avgAge ? stats.avgAge.toFixed(1) : "—"}
            sub="All registrations"
            icon={<Activity className="size-5 text-muted-foreground" />}
            accent="bg-sidebar-accent border-sidebar-border/50"
          />

          <KpiCard
            label="Chronic illness"
            value={`${(stats?.illnessPct ?? 0).toFixed(1)}%`}
            sub={`${formatNumber(stats?.illnessCount ?? 0)} declared`}
            icon={<HeartPulse className="size-5 text-rose-500" />}
            accent="bg-rose-500/10 border-rose-500/30"
          />
        </div>

        {/* ---------------------------------------------
            Charts Row 1: Trend & Heatmap
        ---------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartShell
            title="Registrations trend"
            subtitle="Daily registrations (last 30 days)"
            right={
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Last 30 days
              </span>
            }
          >
            <MeasuredChart className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts?.trend ?? []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-sidebar-border/50" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip content={<TooltipCard />} />
                  <Area
                    type="monotone"
                    dataKey="registrations"
                    name="Registrations"
                    stroke="#2563eb"
                    strokeWidth={3}
                    fill="url(#trendGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </MeasuredChart>
          </ChartShell>

          <ChartShell
            title="Slot utilization"
            subtitle="Count of selections per day & time (heatmap)"
            right={
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Capacity {MAX_CAPACITY}
              </span>
            }
          >
            <div className="overflow-auto">
              <div className="min-w-[780px]">
                {/* Legend */}
                <div className="flex flex-wrap gap-2 mb-4 text-xs font-bold">
                  {[
                    { label: "Taken", dot: "bg-emerald-500", box: "bg-background border-sidebar-border/50" },
                    { label: "Filling", dot: "bg-amber-500", box: "bg-background border-sidebar-border/50" },
                    { label: "Busy", dot: "bg-rose-500", box: "bg-background border-sidebar-border/50" },
                  ].map((x) => (
                    <div key={x.label} className={cn("flex items-center gap-2 px-3 py-2 rounded-full border", x.box)}>
                      <span className={cn("w-2.5 h-2.5 rounded-full", x.dot)} />
                      {x.label}
                    </div>
                  ))}
                </div>

                {/* header row */}
                <div className="grid grid-cols-[160px_repeat(6,minmax(90px,1fr))] gap-2 mb-3">
                  <div />
                  {DAYS.map((d) => (
                    <div
                      key={d}
                      className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground text-center"
                    >
                      {d.slice(0, 3)}
                    </div>
                  ))}
                </div>

                {/* time rows */}
                <div className="space-y-2">
                  {TIMES.map((time) => (
                    <div
                      key={time}
                      className="grid grid-cols-[160px_repeat(6,minmax(90px,1fr))] gap-2"
                    >
                      <div className="text-xs font-medium text-muted-foreground pr-2 flex items-center">
                        {time}
                      </div>

                      {DAYS.map((day) => {
                        const key = `${day}||${time}`;
                        const count = slotHeat[key] ?? 0;
                        const utilPct = Math.min(100, (count / MAX_CAPACITY) * 100);
                        const meta = statusMeta(utilPct);

                        const label = meta.label === "Available" ? "Taken" : meta.label;

                        return (
                          <div
                            key={key}
                            className={cn("rounded-2xl border p-2 text-center", meta.bg, meta.border)}
                            title={`${day} • ${time} • ${count} selections`}
                          >
                            <div className={cn("text-xs font-bold", meta.text)}>{count}</div>
                            <div className="text-[10px] font-medium text-muted-foreground">{label}</div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-xs text-muted-foreground">
                  Heatmap values are calculated by flattening every selected slot across all registrations.
                </p>
              </div>
            </div>
          </ChartShell>
        </div>

        {/* ---------------------------------------------
            Row 2: Sex Breakdown and Age Bands (2 Columns)
        ---------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartShell title="Sex breakdown" subtitle="Distribution by sex">
            <MeasuredChart className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<TooltipCard />} />
                  <Legend wrapperStyle={{ fontSize: "12px", fontWeight: 600 }} />
                  <Pie
                    data={charts?.sex ?? []}
                    dataKey="count"
                    nameKey="sex"
                    outerRadius={95}
                    innerRadius={55}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {(charts?.sex ?? []).map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </MeasuredChart>
          </ChartShell>

          <ChartShell title="Age bands" subtitle="Registrations grouped into age ranges">
            <MeasuredChart className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts?.ageBands ?? []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ageGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-sidebar-border/50" vertical={false} />
                  <XAxis dataKey="band" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip content={<TooltipCard />} />
                  <Bar
                    dataKey="count"
                    name="Registrations"
                    fill="url(#ageGradient)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </MeasuredChart>
          </ChartShell>
        </div>

        {/* ---------------------------------------------
            Row 3: Sector Distribution (Full Width)
        ---------------------------------------------- */}
        <div className="grid grid-cols-1 gap-6">
          <ChartShell
            title="Sector distribution"
            subtitle="Registrations grouped by department/sector"
          >
            <MeasuredChart className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts?.sectors ?? []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sectorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={1} />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0.5} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-sidebar-border/50" vertical={false} />
                  <XAxis
                    dataKey="sector"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={0}
                    height={60}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip content={<TooltipCard />} />
                  <Bar
                    dataKey="count"
                    name="Registrations"
                    fill="url(#sectorGradient)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </MeasuredChart>
          </ChartShell>
        </div>

        {/* Recent Registrations */}
        <div className="bg-card rounded-[28px] border shadow-sm border-sidebar-border/50 overflow-hidden">
          <div className="p-6 border-b border-sidebar-border/50 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-sidebar-foreground">Recent registrations</h3>
              <p className="text-sm text-muted-foreground mt-1">Latest 10 records</p>
            </div>
            <Link
                href="/registrations"
                className="text-sm font-bold text-sidebar-primary hover:underline"
              >
                View all
              </Link>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-sidebar-accent/50 text-muted-foreground">
                <tr>
                  <th className="text-left font-bold uppercase tracking-widest text-[11px] px-6 py-4">
                    Employee
                  </th>
                  <th className="text-left font-bold uppercase tracking-widest text-[11px] px-6 py-4">
                    Sector
                  </th>
                  <th className="text-left font-bold uppercase tracking-widest text-[11px] px-6 py-4">
                    Demographics
                  </th>
                  <th className="text-left font-bold uppercase tracking-widest text-[11px] px-6 py-4">
                    Slots
                  </th>
                  <th className="text-left font-bold uppercase tracking-widest text-[11px] px-6 py-4">
                    Health
                  </th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r, idx) => {
                  const illness =
                    !!r.chronic_illness &&
                    r.chronic_illness.trim().length > 0 &&
                    r.chronic_illness.trim().toLowerCase() !== "none";

                  const slotCount = (r.selected_slots ?? []).length;

                  return (
                    <tr key={`${r.employee_id}-${idx}`} className="border-t border-sidebar-border/50">
                      <td className="px-6 py-4">
                        <div className="font-bold text-sidebar-foreground">{r.name}</div>
                        <div className="text-xs text-muted-foreground font-medium">{r.employee_id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-sidebar-foreground/80">{r.sector}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-sidebar-foreground/80">
                          {r.sex} • {r.age}
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">
                          {r.phone_number}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 rounded-full border border-sidebar-primary/30 bg-sidebar-primary/10 px-3 py-1 text-xs font-bold text-sidebar-primary">
                          <CalendarClock className="size-4 text-sidebar-primary" />
                          {slotCount} selected
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold",
                            illness
                              ? "bg-rose-500/10 border-rose-500/30 text-rose-500"
                              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                          )}
                        >
                          <span
                            className={cn(
                              "w-2 h-2 rounded-full",
                              illness ? "bg-rose-500" : "bg-emerald-500"
                            )}
                          />
                          {illness ? "Needs review" : "OK"}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {recent.length === 0 ? (
                  <tr>
                    <td className="px-6 py-8 text-center text-muted-foreground" colSpan={5}>
                      No registrations found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Dashboard is powered by server-side aggregates from DashboardController@index().
        </p>
      </main>
    </div>
  );
}