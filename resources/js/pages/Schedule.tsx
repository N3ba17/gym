import { Head, Link } from "@inertiajs/react";
import {
  CalendarClock,
  Users,
  HeartPulse,
  ChevronRight,
  Search,
} from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

type Assignee = {
  id: number;
  name: string;
  employee_id: string;
  sector: string;
  has_illness: boolean;
};

type SlotData = {
  day: string;
  time: string;
  count: number;
  assignees: Assignee[];
};

type Props = {
  slots: Record<string, SlotData>;
  days: string[];
  times: string[];
};

const MAX_CAPACITY = 40;

export default function Schedule({ slots, days, times }: Props) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const selected = selectedSlot ? slots[selectedSlot] : null;

  const filteredAssignees = selected
    ? selected.assignees.filter(
        (a) =>
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.employee_id.toLowerCase().includes(search.toLowerCase()) ||
          a.sector.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Head title="Schedule Management" />

      <main className="max-w-8xl mx-auto px-4 py-8 pb-24 space-y-6">
        <div className="bg-card rounded-[28px] border shadow-sm border-sidebar-border/50 p-6 md:p-7">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Schedule Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Track registrations per day and time slot
              </p>
            </div>
            <Link
              href="/registrations"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-sidebar-primary hover:opacity-90 text-sidebar-primary-foreground text-sm font-bold shadow-lg shadow-sidebar-primary/20"
            >
              View All Registrations <ChevronRight className="size-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card rounded-[28px] border shadow-sm border-sidebar-border/50 overflow-hidden">
            <div className="p-5 border-b border-sidebar-border/50">
              <h3 className="text-lg font-bold text-sidebar-foreground">Slot Overview</h3>
              <p className="text-xs text-muted-foreground mt-1">Click a slot to see assignees</p>
            </div>
            <div className="overflow-auto">
              <div className="min-w-[600px]">
                <div className="grid grid-cols-[180px_repeat(6,minmax(90px,1fr))] gap-2 p-4 bg-sidebar-accent/30 border-b border-sidebar-border/50">
                  <div />
                  {days.map((d) => (
                    <div
                      key={d}
                      className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground text-center"
                    >
                      {d.slice(0, 3)}
                    </div>
                  ))}
                </div>

                <div className="p-4 space-y-2">
                  {times.map((time) => (
                    <div
                      key={time}
                      className="grid grid-cols-[180px_repeat(6,minmax(90px,1fr))] gap-2"
                    >
                      <div className="text-xs font-medium text-muted-foreground pr-2 flex items-center">
                        {time}
                      </div>

                      {days.map((day) => {
                        const key = day + "||" + time;
                        const data = slots[key];
                        const utilPct = Math.min(100, (data.count / MAX_CAPACITY) * 100);
                        const isSelected = selectedSlot === key;
                        const isFull = data.count >= MAX_CAPACITY;

                        let bg = "bg-background";
                        let border = "border-sidebar-border/50";
                        let textColor = "text-sidebar-foreground";

                        if (isFull) {
                          bg = "bg-rose-500/10";
                          border = "border-rose-500/30";
                          textColor = "text-rose-500";
                        } else if (utilPct >= 50) {
                          bg = "bg-amber-500/10";
                          border = "border-amber-500/30";
                          textColor = "text-amber-500";
                        } else if (data.count > 0) {
                          bg = "bg-emerald-500/10";
                          border = "border-emerald-500/30";
                          textColor = "text-emerald-500";
                        }

                        return (
                          <button
                            key={key}
                            onClick={() => setSelectedSlot(isSelected ? null : key)}
                            className={cn(
                              "rounded-2xl border p-2 text-center transition hover:shadow-md cursor-pointer",
                              bg,
                              border,
                              isSelected && "ring-2 ring-sidebar-primary ring-offset-2"
                            )}
                          >
                            <div className={cn("text-xs font-bold", textColor)}>
                              {data.count}
                            </div>
                            <div className="text-[10px] font-medium text-muted-foreground mt-0.5">
                              {isFull ? "Full" : data.count === 0 ? "Empty" : "Assigned"}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-sidebar-border/50 bg-sidebar-accent/30 flex flex-wrap gap-3 text-xs font-bold">
              <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-sidebar-border/50 bg-background">
                <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/40" />
                Empty
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-sidebar-border/50 bg-background">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Available
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-sidebar-border/50 bg-background">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Filling 50%+
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-sidebar-border/50 bg-background">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Full
              </div>
            </div>
          </div>

          <div className="bg-card rounded-[28px] border shadow-sm border-sidebar-border/50 overflow-hidden">
            <div className="p-5 border-b border-sidebar-border/50">
              <h3 className="text-lg font-bold text-sidebar-foreground">Slot Details</h3>
              {selected ? (
                <p className="text-xs text-muted-foreground mt-1">
                  {selected.day} &middot; {selected.time}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground/60 mt-1">Select a slot to view details</p>
              )}
            </div>

            {selected ? (
              <>
                <div className="p-5 border-b border-sidebar-border/50">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-sm font-bold text-sidebar-foreground">
                        {selected.count} assigned
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Max {MAX_CAPACITY} &middot;{" "}
                        {Math.max(0, MAX_CAPACITY - selected.count)} remaining
                      </div>
                    </div>
                    <div
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-bold",
                        selected.count >= MAX_CAPACITY
                          ? "bg-rose-500/10 text-rose-500"
                          : selected.count >= MAX_CAPACITY * 0.5
                          ? "bg-amber-500/10 text-amber-500"
                          : "bg-emerald-500/10 text-emerald-500"
                      )}
                    >
                      {Math.round((selected.count / MAX_CAPACITY) * 100)}%
                    </div>
                  </div>

                  <div className="bg-sidebar-accent/50 rounded-full h-2.5">
                    <div
                      className={cn(
                        "h-2.5 rounded-full transition-all",
                        selected.count >= MAX_CAPACITY
                          ? "bg-rose-500"
                          : selected.count >= MAX_CAPACITY * 0.5
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      )}
                      style={{ width: `${Math.min(100, (selected.count / MAX_CAPACITY) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="p-4">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search assignees..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-sidebar-border/50 bg-background text-sm outline-none focus:ring-4 focus:ring-sidebar-accent/50 focus:border-sidebar-primary"
                    />
                  </div>

                  {filteredAssignees.length > 0 ? (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {filteredAssignees.map((a) => (
                        <div
                          key={a.id}
                          className="flex items-center justify-between gap-3 bg-sidebar-accent/30 rounded-xl border border-sidebar-border/50 p-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-sidebar-primary/10 text-sidebar-primary flex items-center justify-center font-bold text-sm">
                              {a.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-sidebar-foreground text-sm">{a.name}</div>
                              <div className="text-xs text-muted-foreground">{a.employee_id}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {a.has_illness && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-[10px] font-bold text-rose-500">
                                <HeartPulse className="size-3" />
                                Review
                              </span>
                            )}
                            <Link
                              href={`/registrations`}
                              className="inline-flex items-center gap-1 rounded-full border border-sidebar-border/50 bg-background px-2 py-1 text-[10px] font-bold text-sidebar-primary hover:bg-sidebar-accent"
                            >
                              Edit
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-6">No assignees found</p>
                  )}
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                <CalendarClock className="size-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Click a slot on the grid to view assignees</p>
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Schedule Management &mdash; powered by ScheduleController@index()
        </p>
      </main>
    </div>
  );
}