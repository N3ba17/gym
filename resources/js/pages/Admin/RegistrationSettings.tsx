import { Head, router } from "@inertiajs/react";
import {
  CalendarCheck,
  Clock,
  Globe,
  Mail,
  Save,
  ToggleLeft,
  ToggleRight,
  CalendarDays,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import RegistrationSettingController from "@/actions/App/Http/Controllers/Admin/RegistrationSettingController";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type Setting = {
  id: number;
  is_open: boolean;
  close_at: string | null;
  open_days: string[] | null;
  open_from: string | null;
  open_to: string | null;
  closed_message: string | null;
};

type Props = {
  setting: Setting;
};

export default function RegistrationSettings({ setting }: Props) {
  const [isOpen, setIsOpen] = useState(setting.is_open);
  const [closeAt, setCloseAt] = useState(setting.close_at ?? "");
  const [openDays, setOpenDays] = useState<string[]>(setting.open_days ?? []);
  const [openFrom, setOpenFrom] = useState(setting.open_from ?? "");
  const [openTo, setOpenTo] = useState(setting.open_to ?? "");
  const [closedMessage, setClosedMessage] = useState(setting.closed_message ?? "");
  const [saving, setSaving] = useState(false);

  const toggleDay = (day: string) => {
    setOpenDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSave = () => {
    setSaving(true);
    router.put(RegistrationSettingController.update.url(), {
      is_open: isOpen,
      close_at: closeAt || null,
      open_days: openDays.length > 0 ? openDays : null,
      open_from: openFrom || null,
      open_to: openTo || null,
      closed_message: closedMessage || null,
    }, {
      preserveScroll: true,
      onSuccess: () => toast.success("Registration settings saved."),
      onError: () => toast.error("Failed to save settings."),
      onFinish: () => setSaving(false),
    });
  };

  const hasTimeLimit = !!openFrom && !!openTo;
  const hasCloseDate = !!closeAt;
  const hasDayLimit = openDays.length > 0;

  return (
    <>
      <Head title="Registration Settings" />

      <div className="space-y-6">
        <div className="bg-card rounded-[28px] border shadow-sm border-sidebar-border/50 p-5 sm:p-6 md:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
                Registration Settings
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Control when the gym registration form is available to employees
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-sidebar-primary hover:opacity-90 text-sidebar-primary-foreground text-sm font-bold shadow-lg shadow-sidebar-primary/20 disabled:opacity-50"
            >
              <Save className="size-4" />
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Master Toggle */}
          <div className="bg-card rounded-[28px] border shadow-sm border-sidebar-border/50 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-sidebar-primary/10 text-sidebar-primary flex items-center justify-center shrink-0">
                  {isOpen ? <ToggleRight className="size-5" /> : <ToggleLeft className="size-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-sidebar-foreground text-base">Master Switch</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isOpen
                      ? "Registration is open. Employees can sign up."
                      : "Registration is closed. The closed message will be shown."}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                  "relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
                  isOpen ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-sm ring-0 transition duration-200",
                    isOpen ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>
          </div>

          {/* Close Date */}
          <div className="bg-card rounded-[28px] border shadow-sm border-sidebar-border/50 p-5 sm:p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-sidebar-primary/10 text-sidebar-primary flex items-center justify-center shrink-0">
                <CalendarDays className="size-5" />
              </div>
              <div>
                <h3 className="font-bold text-sidebar-foreground text-base">Auto-Close Date</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {hasCloseDate
                    ? `Registration will close at ${new Date(closeAt).toLocaleString()}.`
                    : "Set a specific date and time for registration to close automatically."}
                </p>
              </div>
            </div>

            <input
              type="datetime-local"
              value={closeAt ? closeAt.slice(0, 16) : ""}
              onChange={(e) => setCloseAt(e.target.value ? e.target.value + ":00" : "")}
              className="w-full px-4 py-2.5 rounded-2xl border bg-background border-sidebar-border/50 text-sm outline-none focus:ring-4 focus:ring-sidebar-accent/50 focus:border-sidebar-primary"
            />

            {closeAt && (
              <button
                onClick={() => setCloseAt("")}
                className="mt-2 text-xs font-medium text-rose-500 hover:underline"
              >
                Clear close date
              </button>
            )}
          </div>

          {/* Days of Week */}
          <div className="bg-card rounded-[28px] border shadow-sm border-sidebar-border/50 p-5 sm:p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-sidebar-primary/10 text-sidebar-primary flex items-center justify-center shrink-0">
                <Globe className="size-5" />
              </div>
              <div>
                <h3 className="font-bold text-sidebar-foreground text-base">Open Days</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {hasDayLimit
                    ? `Registration open on: ${openDays.join(", ")}.`
                    : "Registration is open every day of the week."}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => {
                const selected = openDays.includes(day);
                return (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={cn(
                      "px-4 py-2 rounded-2xl border text-sm font-bold transition",
                      selected
                        ? "bg-sidebar-primary text-sidebar-primary-foreground border-sidebar-primary"
                        : "bg-background text-muted-foreground border-sidebar-border/50 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    {day.slice(0, 3)}
                  </button>
                );
              })}
            </div>

            {openDays.length > 0 && (
              <button
                onClick={() => setOpenDays([])}
                className="mt-3 text-xs font-medium text-rose-500 hover:underline"
              >
                Clear all days (allow every day)
              </button>
            )}
          </div>

          {/* Time Range */}
          <div className="bg-card rounded-[28px] border shadow-sm border-sidebar-border/50 p-5 sm:p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-sidebar-primary/10 text-sidebar-primary flex items-center justify-center shrink-0">
                <Clock className="size-5" />
              </div>
              <div>
                <h3 className="font-bold text-sidebar-foreground text-base">Time Range</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {hasTimeLimit
                    ? `Registration open from ${openFrom} to ${openTo}.`
                    : "Set the daily time window for registration (optional)."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  From
                </label>
                <input
                  type="time"
                  value={openFrom}
                  onChange={(e) => setOpenFrom(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border bg-background border-sidebar-border/50 text-sm outline-none focus:ring-4 focus:ring-sidebar-accent/50 focus:border-sidebar-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  To
                </label>
                <input
                  type="time"
                  value={openTo}
                  onChange={(e) => setOpenTo(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border bg-background border-sidebar-border/50 text-sm outline-none focus:ring-4 focus:ring-sidebar-accent/50 focus:border-sidebar-primary"
                />
              </div>
            </div>

            {hasTimeLimit && (
              <button
                onClick={() => { setOpenFrom(""); setOpenTo(""); }}
                className="mt-3 text-xs font-medium text-rose-500 hover:underline"
              >
                Clear time range (allow all hours)
              </button>
            )}
          </div>
        </div>

        {/* Closed Message */}
        <div className="bg-card rounded-[28px] border shadow-sm border-sidebar-border/50 p-5 sm:p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-sidebar-primary/10 text-sidebar-primary flex items-center justify-center shrink-0">
              <Mail className="size-5" />
            </div>
            <div>
              <h3 className="font-bold text-sidebar-foreground text-base">Closed Page Message</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Custom message shown to employees when registration is closed.
              </p>
            </div>
          </div>

          <textarea
            value={closedMessage}
            onChange={(e) => setClosedMessage(e.target.value)}
            placeholder="Gym registration is currently closed. If you have any questions or need assistance, please reach out to the facility coordinator at gym@eecconstruction.com."
            rows={3}
            className="w-full px-4 py-3 rounded-2xl border bg-background border-sidebar-border/50 text-sm outline-none focus:ring-4 focus:ring-sidebar-accent/50 focus:border-sidebar-primary min-h-[80px] resize-y"
          />
        </div>

        {/* Current Status Summary */}
        <div className="bg-card rounded-[28px] border shadow-sm border-sidebar-border/50 p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={cn(
              "w-3 h-3 rounded-full",
              isOpen ? "bg-emerald-500" : "bg-rose-500"
            )} />
            <h3 className="font-bold text-sidebar-foreground text-base">Current Status</h3>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CalendarCheck className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">Registration is </span>
              <span className={cn(
                "font-bold",
                isOpen ? "text-emerald-500" : "text-rose-500"
              )}>
                {isOpen ? "OPEN" : "CLOSED"}
              </span>
            </div>

            {closeAt && (
              <div className="flex items-center gap-2">
                <CalendarDays className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Auto-closes at <span className="font-bold text-sidebar-foreground">{new Date(closeAt).toLocaleString()}</span>
                </span>
              </div>
            )}

            {openDays.length > 0 && (
              <div className="flex items-center gap-2">
                <Globe className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Open on <span className="font-bold text-sidebar-foreground">{openDays.join(", ")}</span>
                </span>
              </div>
            )}

            {openFrom && openTo && (
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Daily window: <span className="font-bold text-sidebar-foreground">{openFrom} – {openTo}</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
