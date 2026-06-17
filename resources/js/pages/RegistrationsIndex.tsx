import { Head, router } from "@inertiajs/react";
import {
  CalendarClock,
  HeartPulse,
  ChevronUp,
  ChevronDown,
  Search,
  X,
  Pencil,
  Trash2,
  Check,
  Filter,
} from "lucide-react";
import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIMES = [
  "12:30 AM - 1:30 AM",
  "1:30 AM - 2:30 AM",
  "6:30 AM - 7:30 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 1:00 PM",
  "1:00 PM - 2:00 PM",
];

type Slot = { day: string; time: string };

type Registration = {
  id: number;
  name: string;
  employee_id: string;
  sector: string;
  sex: string;
  age: number;
  phone_number: string;
  chronic_illness: string | null;
  selected_slots: Slot[] | null;
  created_at: string;
};

type Props = {
  registrations: Registration[];
  filters?: {
    sectors: string[];
    sexes: string[];
  };
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);

  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function SlotBadge({ day, time }: { day: string; time: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border bg-sidebar-accent px-2 py-1 text-[11px] font-bold text-sidebar-foreground">
      <CalendarClock className="size-3" />
      {day.slice(0, 3)} {time.split(" - ")[0]}
    </span>
  );
}

type SortKey = "name" | "sector" | "age" | "slots" | "health" | "created_at";
type SortDir = "asc" | "desc";

export default function RegistrationsIndex({ registrations, filters }: Props) {
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [sexFilter, setSexFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const perPage = 15;
  const [expanded, setExpanded] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editSlots, setEditSlots] = useState<Slot[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const startEdit = (r: Registration) => {
    setEditingId(r.id);
    setEditSlots([...(r.selected_slots ?? [])]);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditSlots([]);
  };

  const toggleSlot = (day: string, time: string) => {
    const existing = editSlots.find((s) => s.day === day);

    if (existing) {
      setEditSlots(editSlots.filter((s) => s.day !== day));
    } else {
      setEditSlots([...editSlots.filter((s) => s.day !== day), { day, time }]);
    }
  };

  const saveEdit = (id: number) => {
    setSaving(true);
    router.put(`/registrations/${id}`, { selected_slots: editSlots }, {
      onFinish: () => {
        setSaving(false);
        setEditingId(null);
        setEditSlots([]);
      },
    });
  };

  const confirmDelete = (id: number) => {
    setDeleting(true);
    router.delete(`/registrations/${id}`, {
      onFinish: () => {
        setDeleting(false);
        setDeleteId(null);
      },
    });
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "created_at" ? "desc" : "asc");
      setPage(1);
    }
  };

  const applyFilters = (newFilters?: { sector?: string; sex?: string; search?: string }) => {
    const params: Record<string, string> = {};

    if (newFilters?.sector) {
      params.sector = newFilters.sector;
    }

    if (newFilters?.sex) {
      params.sex = newFilters.sex;
    }

    if (newFilters?.search) {
      params.search = newFilters.search;
    }

    router.get('/registrations', params, { preserveState: true });
  };

  const clearFilters = () => {
    setSearch("");
    setSectorFilter("");
    setSexFilter("");
    router.get('/registrations', {}, { preserveState: true });
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) {
      return null;
    }

    return sortDir === "asc" ? (
      <ChevronUp className="size-4" />
    ) : (
      <ChevronDown className="size-4" />
    );
  };

  const hasActiveFilters = sectorFilter || sexFilter || search;

  // Reset to page 1 when filters change
  React.useEffect(() => {
 setPage(1); 
}, [search, sectorFilter, sexFilter]);

  const filtered = useMemo(() => {
    return registrations.filter((r) => {
      const q = search.toLowerCase();
      const matchesSearch = !search ||
        r.name.toLowerCase().includes(q) ||
        r.employee_id.toLowerCase().includes(q) ||
        r.sector.toLowerCase().includes(q) ||
        r.phone_number.includes(q);
      const matchesSector = !sectorFilter || r.sector === sectorFilter;
      const matchesSex = !sexFilter || r.sex === sexFilter;

      return matchesSearch && matchesSector && matchesSex;
    });
  }, [registrations, search, sectorFilter, sexFilter]);

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;

    switch (sortKey) {
      case "name":
        cmp = a.name.localeCompare(b.name);
        break;
      case "sector":
        cmp = a.sector.localeCompare(b.sector);
        break;
      case "age":
        cmp = a.age - b.age;
        break;
      case "slots":
        cmp = (a.selected_slots?.length ?? 0) - (b.selected_slots?.length ?? 0);
        break;
      case "health":
        const aIll = a.chronic_illness && a.chronic_illness.trim().toLowerCase() !== "none";
        const bIll = b.chronic_illness && b.chronic_illness.trim().toLowerCase() !== "none";
        cmp = Number(aIll) - Number(bIll);
        break;
      case "created_at":
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
    }

    return sortDir === "asc" ? cmp : -cmp;
  });

  const totalPages = Math.ceil(sorted.length / perPage);
  const safePage = Math.min(page, Math.max(totalPages, 1));
  const paginated = sorted.slice((safePage - 1) * perPage, safePage * perPage);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Head title="All Registrations" />

      <main className="max-w-8xl mx-auto px-4 py-8 pb-24 space-y-6">
          <div className="bg-card rounded-[28px] border shadow-sm border-sidebar-border/50 p-5 sm:p-6 md:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
                All Registrations
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                {registrations.length} total records
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search name, employee ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applyFilters({ search, sector: sectorFilter, sex: sexFilter })}
                  className="pl-9 pr-4 py-2.5 rounded-2xl border bg-background border-sidebar-border/50 w-full sm:w-64 text-sm outline-none focus:ring-4 focus:ring-sidebar-accent/50 focus:border-sidebar-primary"
                />
                {search && (
                  <button
                    onClick={() => {
                      setSearch("");
                      applyFilters({ sector: sectorFilter, sex: sexFilter, search: "" });
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-sidebar-foreground"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-sm font-medium transition-colors",
                  showFilters || hasActiveFilters
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "bg-background border-sidebar-border/50 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <Filter className="size-4" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-1 bg-sidebar-primary-foreground text-sidebar-primary text-xs rounded-full px-1.5 py-0.5">
                    {[sectorFilter ? 1 : 0, sexFilter ? 1 : 0, search ? 1 : 0].filter(Boolean).length}
                  </span>
                )}
              </button>

              <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">
                {paginated.length ? `${(safePage - 1) * perPage + 1}–${(safePage - 1) * perPage + paginated.length}` : "0"} of {sorted.length}
              </span>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-sidebar-border/50">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                <div className="flex-1 min-w-0 sm:min-w-[150px]">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    Sector
                  </label>
                  <select
                    value={sectorFilter}
                    onChange={(e) => {
                      setSectorFilter(e.target.value);
                      applyFilters({ search, sex: sexFilter, sector: e.target.value });
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border bg-background border-sidebar-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-sidebar-primary"
                  >
                    <option value="">All Sectors</option>
                    {filters?.sectors.map((sector) => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 min-w-0 sm:min-w-[150px]">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    Sex
                  </label>
                  <select
                    value={sexFilter}
                    onChange={(e) => {
                      setSexFilter(e.target.value);
                      applyFilters({ search, sector: sectorFilter, sex: e.target.value });
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border bg-background border-sidebar-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-sidebar-primary"
                  >
                    <option value="">All</option>
                    {filters?.sexes.map((sex) => (
                      <option key={sex} value={sex}>{sex}</option>
                    ))}
                  </select>
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2.5 rounded-xl border border-sidebar-border/50 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground sm:self-auto"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="bg-card rounded-[28px] border shadow-sm border-sidebar-border/50 overflow-hidden">
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-sidebar-accent/50 text-muted-foreground">
                <tr>
                  <th className="text-left px-3 sm:px-6 py-3 sm:py-4">
                    <button
                      onClick={() => handleSort("name")}
                      className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest hover:text-sidebar-primary"
                    >
                      Employee <SortIcon col="name" />
                    </button>
                  </th>
                  <th className="text-left px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                    <button
                      onClick={() => handleSort("sector")}
                      className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest hover:text-sidebar-primary"
                    >
                      Sector <SortIcon col="sector" />
                    </button>
                  </th>
                  <th className="text-left px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                    <button
                      onClick={() => handleSort("age")}
                      className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest hover:text-sidebar-primary"
                    >
                      Demographics <SortIcon col="age" />
                    </button>
                  </th>
                  <th className="text-left px-3 sm:px-6 py-3 sm:py-4">
                    <button
                      onClick={() => handleSort("slots")}
                      className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest hover:text-sidebar-primary"
                    >
                      Slots <SortIcon col="slots" />
                    </button>
                  </th>
                  <th className="text-left px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                    <button
                      onClick={() => handleSort("health")}
                      className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest hover:text-sidebar-primary"
                    >
                      Health <SortIcon col="health" />
                    </button>
                  </th>
                  <th className="text-left px-3 sm:px-6 py-3 sm:py-4">
                    <button
                      onClick={() => handleSort("created_at")}
                      className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest hover:text-sidebar-primary"
                    >
                      Date <SortIcon col="created_at" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((r) => {
                  const illness =
                    !!r.chronic_illness &&
                    r.chronic_illness.trim().length > 0 &&
                    r.chronic_illness.trim().toLowerCase() !== "none";
                  const slots = r.selected_slots ?? [];
                  const isExpanded = expanded === r.id;

                  return (
                    <React.Fragment key={r.id}>
                      <tr
                        className={cn(
                          "border-t border-sidebar-border/50 cursor-pointer hover:bg-sidebar-accent/50 transition",
                          isExpanded && "bg-sidebar-primary/10"
                        )}
                        onClick={() => setExpanded(isExpanded ? null : r.id)}
                      >
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="font-bold text-sidebar-foreground text-sm sm:text-base">{r.name}</div>
                          <div className="text-[11px] sm:text-xs text-muted-foreground font-medium">
                            {r.employee_id}
                          </div>
                          <div className="text-[11px] text-muted-foreground font-medium sm:hidden">
                            {r.sector} &middot; {r.sex}, {r.age}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                          <span className="font-medium text-sidebar-foreground/80 text-sm">{r.sector}</span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                          <div className="font-medium text-sidebar-foreground/80 text-sm">
                            {r.sex} &middot; {r.age}
                          </div>
                          <div className="text-xs text-muted-foreground font-medium">
                            {r.phone_number}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="flex flex-wrap gap-1">
                            {slots.length > 0 ? (
                              <>
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-sidebar-primary/30 bg-sidebar-primary/10 px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold text-sidebar-primary">
                                  <CalendarClock className="size-3" />
                                  {slots.length} selected
                                </span>
                              </>
                            ) : (
                              <span className="text-xs text-muted-foreground">None</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
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
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="text-muted-foreground text-[10px] sm:text-xs font-medium">
                            {formatDate(r.created_at)}
                          </div>
                          <div className="text-muted-foreground/60 text-[9px] sm:text-[10px] font-medium">
                            {formatTime(r.created_at)}
                          </div>
                        </td>
                      </tr>

                      {isExpanded && editingId === r.id ? (
                        <tr className="border-t border-sidebar-border/50 bg-sidebar-primary/5">
                          <td colSpan={6} className="px-4 sm:px-6 py-4 sm:py-5">
                            <div className="space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                                  Edit Selected Sessions — 1 per day
                                </p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={cancelEdit}
                                    className="px-4 py-2 rounded-2xl border border-sidebar-border/50 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => saveEdit(r.id)}
                                    disabled={saving}
                                    className="px-4 py-2 rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground text-sm font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                                  >
                                    <Check className="size-4" />
                                    {saving ? "Saving..." : "Save Changes"}
                                  </button>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
                                {DAYS.map((day) => {
                                  const selected = editSlots.find((s) => s.day === day);

                                  return (
                                    <div key={day} className="bg-background rounded-xl border border-sidebar-border/50 overflow-hidden">
                                      <div className="bg-sidebar-primary text-sidebar-primary-foreground p-3 text-center">
                                        <span className="text-xs font-bold">{day.slice(0, 3)}</span>
                                      </div>
                                      <div className="p-2 space-y-1">
                                        {TIMES.map((time) => {
                                          const isSel = selected?.day === day && selected?.time === time;

                                          return (
                                            <button
                                              key={time}
                                              onClick={() => toggleSlot(day, time)}
                                              className={cn(
                                                "w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium transition",
                                                isSel
                                                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                                  : "hover:bg-sidebar-accent text-sidebar-foreground/70"
                                              )}
                                            >
                                              {time.split(" - ")[0]}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {editSlots.length} slot{editSlots.length !== 1 ? "s" : ""} selected
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : isExpanded ? (
                        <tr className="border-t border-sidebar-border/50 bg-sidebar-accent/30">
                          <td colSpan={6} className="px-4 sm:px-6 py-4 sm:py-5">
                            <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 flex-1">
                                <div>
                                  <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 sm:mb-3">
                                    Selected Sessions
                                  </p>
                                  {slots.length > 0 ? (
                                    <div className="space-y-2">
                                      {slots.map((s, i) => (
                                        <div
                                          key={i}
                                          className="flex items-center gap-3 bg-background rounded-xl border border-sidebar-border/50 p-3"
                                        >
                                          <div className="w-8 h-8 rounded-lg bg-sidebar-primary/10 text-sidebar-primary flex items-center justify-center font-bold text-sm">
                                            {s.day.slice(0, 3)}
                                          </div>
                                          <div>
                                            <div className="font-bold text-sidebar-foreground text-sm">
                                              {s.day}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                              {s.time}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-muted-foreground">No slots selected</p>
                                  )}
                                </div>

                                <div>
                                  <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 sm:mb-3">
                                    Chronic Illness
                                  </p>
                                  {illness ? (
                                    <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 sm:p-4">
                                      <div className="flex items-start gap-2">
                                        <HeartPulse className="size-4 text-rose-500 mt-0.5 shrink-0" />
                                        <div className="min-w-0">
                                          <div className="font-bold text-rose-500 text-sm">
                                            Declared
                                          </div>
                                          <div className="text-sidebar-foreground text-sm mt-1 break-words">
                                            {r.chronic_illness}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 sm:p-4 flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                      <span className="font-bold text-emerald-500 text-sm">
                                        None declared
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <div>
                                  <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 sm:mb-3">
                                    Details
                                  </p>
                                  <div className="bg-background border border-sidebar-border/50 rounded-xl p-3 sm:p-4 space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-xs text-muted-foreground">Employee ID</span>
                                      <span className="text-xs font-bold">{r.employee_id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-xs text-muted-foreground">Sector</span>
                                      <span className="text-xs font-bold">{r.sector}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-xs text-muted-foreground">Age</span>
                                      <span className="text-xs font-bold">{r.age}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-xs text-muted-foreground">Phone</span>
                                      <span className="text-xs font-bold">{r.phone_number}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-xs text-muted-foreground">Registered</span>
                                      <span className="text-xs font-bold">
                                        {formatDate(r.created_at)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEdit(r);
                                  }}
                                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl border border-sidebar-border/50 bg-background text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent"
                                >
                                  <Pencil className="size-4" /> Edit Slots
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteId(r.id);
                                  }}
                                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl border border-sidebar-border/50 bg-background text-sm font-medium text-rose-500 hover:bg-rose-500/10"
                                >
                                  <Trash2 className="size-4" /> Delete
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </React.Fragment>
                  );
                })}

                {paginated.length === 0 && (
                  <tr>
                    <td className="px-3 sm:px-6 py-12 text-center text-muted-foreground text-sm" colSpan={6}>
                      No registrations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-4 px-1">
            <p className="text-xs text-muted-foreground">
              Page {safePage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, safePage - 1))}
                disabled={safePage <= 1}
                className="px-4 py-2 rounded-2xl border border-sidebar-border/50 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                .map((p, idx, arr) => (
                  <React.Fragment key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="text-muted-foreground px-1">...</span>
                    )}
                    <button
                      onClick={() => setPage(p)}
                      className={cn(
                        "w-9 h-9 rounded-xl text-sm font-bold transition",
                        p === safePage
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      )}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                ))}
              <button
                onClick={() => setPage(Math.min(totalPages, safePage + 1))}
                disabled={safePage >= totalPages}
                className="px-4 py-2 rounded-2xl border border-sidebar-border/50 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {deleteId && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-[28px] shadow-2xl max-w-sm w-full p-5 sm:p-8 text-center border border-sidebar-border/50">
              <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="size-8" />
              </div>
              <h3 className="text-xl font-extrabold text-sidebar-foreground mb-2">Delete Registration?</h3>
              <p className="text-muted-foreground text-sm mb-6">
                This action cannot be undone. The employee's data will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-3 rounded-2xl border border-sidebar-border/50 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmDelete(deleteId)}
                  disabled={deleting}
                  className="flex-1 py-3 rounded-2xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600 disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}