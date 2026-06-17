import { Head, router } from "@inertiajs/react";
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Users,
  Plus,
  Calendar,
  Info,
  BadgeCheck,
} from "lucide-react";
import React, { useReducer, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

/* ---------------------------------------------
   CONFIG (keep your values)
---------------------------------------------- */
type SlotCounts = Record<string, number>;

type RegistrationData = {
  id: number;
  name: string;
  employee_id: string;
  age: number;
  sex: string;
  sector: string;
  phone_number: string;
  chronic_illness: string | null;
  selected_slots: { day: string; time: string }[];
  created_at: string;
  updated_at: string;
};

type Props = {
  slotCounts?: SlotCounts;
  closeAt?: string | null;
};

const SECTORS = [
  "Design & Consultancy Business Unit",
  "Construction Business Unit",
  "Integrated Technical Services Business Unit",
  "Plant & Logistics Management Business Unit",
];

const SCHEDULE_SLOTS = [
  "12:30 - 1:30 Morning",
  "1:30 - 2:30 Morning",
  "6:30 - 7:30 Noon",
  "11:00 - 12:00 Evening",
  "12:00 - 1:00 Evening",
  "1:00 - 2:00 Evening",
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const MAX_CAPACITY = 40;
const MAX_SELECTIONS = 3;
const MONTHLY_FEE_ETB = 500;

const POST_ROUTE = "/register-gym";

/* ---------------------------------------------
   HELPERS
---------------------------------------------- */
function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

function statusForCount(count: number) {
  if (count <= 10) {
    return {
      label: "Available",
      pill:
        "text-emerald-700 bg-emerald-50 border-emerald-200 " +
        "dark:text-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/60",
      dot: "bg-emerald-500",
    };
  }

  if (count <= 20) {
    return {
      label: "Filling",
      pill:
        "text-amber-700 bg-amber-50 border-amber-200 " +
        "dark:text-amber-200 dark:bg-amber-950/30 dark:border-amber-900/60",
      dot: "bg-amber-500",
    };
  }

  if (count <= 30) {
    return {
      label: "Dense",
      pill:
        "text-rose-700 bg-rose-50 border-rose-200 " +
        "dark:text-rose-200 dark:bg-rose-950/30 dark:border-rose-900/60",
      dot: "bg-rose-500",
    };
  }

  return {
    label: "Filled",
    pill:
      "text-slate-700 bg-slate-100 border-slate-300 " +
      "dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700",
    dot: "bg-slate-500",
  };
}

type Slot = { id: string; day: string; time: string };

type State = {
  step: 1 | 2;
  submitted: boolean;
  submitting: boolean;
  loadingCounts: boolean;
  form: {
    name: string;
    age: string;
    sex: string;
    sector: string;
    chronicIllness: string;
    phoneNumber: string;
    employeeId: string;
  };
  selectedSlots: Slot[];
  errors: Record<string, string | undefined>;
  infoNote: string;
  serverMessage: string;
  serverError: string;
  registration: RegistrationData | null;
  slotCounts: SlotCounts;
};

function validate(form: State["form"], selectedSlots: Slot[] | null) {
  const errors: Record<string, string> = {};

  if (!form.name.trim()) {
errors.name = "Full name is required.";
}

  if (!form.employeeId.trim()) {
errors.employeeId = "Employee ID is required.";
}

  const ageNum = Number(form.age);

  if (!form.age) {
errors.age = "Age is required.";
} else if (Number.isNaN(ageNum)) {
errors.age = "Age must be a number.";
} else if (ageNum < 21 || ageNum > 70) {
errors.age = "Age must be between 21 and 70.";
}

  if (!form.sex) {
errors.sex = "Please select a sex option.";
}

  if (!form.sector) {
errors.sector = "Please select a sector.";
}

  if (!form.phoneNumber.trim()) {
errors.phoneNumber = "Phone number is required.";
} else if (normalizePhone(form.phoneNumber).length < 9) {
errors.phoneNumber = "Phone number looks too short.";
}

  if (selectedSlots && selectedSlots.length === 0) {
    errors.selectedSlots = "Select at least 1 schedule slot.";
  }

  return errors;
}

/* ---------------------------------------------
   STATE
---------------------------------------------- */
const initialState: State = {
  step: 1,
  submitted: false,
  submitting: false,
  loadingCounts: true,
  form: {
    name: "",
    age: "",
    sex: "",
    sector: "",
    chronicIllness: "",
    phoneNumber: "",
    employeeId: "",
  },
  selectedSlots: [],
  errors: {},
  infoNote: "",
  serverMessage: "",
  serverError: "",
  registration: null,
  slotCounts: {},
};

type Action =
  | { type: "SET_FIELD"; field: keyof State["form"]; value: string }
  | { type: "SET_ERRORS"; errors: Record<string, string | undefined> }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "TOGGLE_SLOT"; day: string; time: string }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_SUCCESS"; message: string; registration: RegistrationData }
  | { type: "SUBMIT_FAIL"; message: string }
  | { type: "SET_SLOT_COUNTS"; counts: SlotCounts }
  | { type: "SET_LOADING_COUNTS"; loading: boolean }
  | { type: "RESET" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        form: { ...state.form, [action.field]: action.value },
        errors: { ...state.errors, [action.field]: undefined },
        infoNote: "",
        serverError: "",
      };

    case "SET_ERRORS":
      return { ...state, errors: action.errors };

    case "NEXT_STEP":
      return { ...state, step: 2, infoNote: "", serverError: "" };

    case "PREV_STEP":
      return { ...state, step: 1, infoNote: "", serverError: "" };

    case "TOGGLE_SLOT": {
      const { day, time } = action;

      const id = `${day}—${time}`;
      const existsExact = state.selectedSlots.some((s) => s.id === id);

      // remove if clicked same selected
      if (existsExact) {
        return {
          ...state,
          selectedSlots: state.selectedSlots.filter((s) => s.id !== id),
          errors: { ...state.errors, selectedSlots: undefined },
          infoNote: "",
        };
      }

      // 1 per day -> replace
      const existingDaySlot = state.selectedSlots.find((s) => s.day === day);

      // max 3 days only when adding NEW day
      if (!existingDaySlot && state.selectedSlots.length >= MAX_SELECTIONS) {
        return {
          ...state,
          errors: { ...state.errors, selectedSlots: `You can select up to ${MAX_SELECTIONS} days per week.` },
          infoNote: "",
        };
      }

      if (existingDaySlot) {
        const replaced = state.selectedSlots.filter((s) => s.day !== day).concat([{ id, day, time }]);

        return {
          ...state,
          selectedSlots: replaced,
          errors: { ...state.errors, selectedSlots: undefined },
          infoNote: `Updated ${day}: replaced the previous time with the new selection.`,
        };
      }

      // add new day slot
      return {
        ...state,
        selectedSlots: [...state.selectedSlots, { id, day, time }],
        errors: { ...state.errors, selectedSlots: undefined },
        infoNote: "",
      };
    }

    case "SUBMIT_START":
      return { ...state, submitting: true, serverError: "", serverMessage: "" };

    case "SUBMIT_SUCCESS":
      return {
        ...state,
        submitting: false,
        submitted: true,
        serverMessage: action.message || "Success",
        registration: action.registration,
      };

    case "SUBMIT_FAIL":
      return { ...state, submitting: false, serverError: action.message || "Request failed." };

    case "SET_SLOT_COUNTS":
      return { ...state, slotCounts: action.counts, loadingCounts: false };

    case "SET_LOADING_COUNTS":
      return { ...state, loadingCounts: action.loading };

    case "RESET":
      return { ...initialState, slotCounts: state.slotCounts, loadingCounts: false };

    default:
      return state;
  }
}

/* ---------------------------------------------
   UI Building Blocks (template look)
---------------------------------------------- */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900 font-sans dark:from-slate-950 dark:to-slate-950 dark:text-slate-100">
      {children}
    </div>
  );
}

function TopNav({ step, closeAt }: { step: 1 | 2; closeAt?: string | null }) {
  return (
    <nav className="bg-white/80 dark:bg-slate-950/70 backdrop-blur border-b border-slate-200/70 dark:border-slate-800 sticky top-0 z-30">
      <div className="w-full mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="bg-cyan-600 p-2 rounded-xl text-white shadow-sm shrink-0">
            <CalendarCheck size={22} />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-extrabold tracking-tight leading-none truncate">
              Gymnastic Portal
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 -mt-0.5 truncate">
              Employee registration & session scheduling
            </p>
          </div>
        </div>

        <div className="flex md:hidden items-center gap-2.5 text-sm font-extrabold uppercase tracking-wider">
          <span className={cn(step === 1 ? "text-cyan-600" : "text-slate-300 dark:text-slate-700")}>Info</span>
          <div className="w-8 h-[3px] bg-slate-200 dark:bg-slate-800 rounded-full" />
          <span className={cn(step === 2 ? "text-cyan-600" : "text-slate-300 dark:text-slate-700")}>Schedule</span>
        </div>
        <div className="hidden md:flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.2em]">
          <span className={step === 1 ? "text-cyan-600" : "text-slate-300 dark:text-slate-700"}>1. Info</span>
          <div className="w-10 h-[2px] bg-slate-200 dark:bg-slate-800 rounded-full" />
          <span className={step === 2 ? "text-cyan-600" : "text-slate-300 dark:text-slate-700"}>2. Schedule</span>
        </div>
      </div>

      {closeAt ? (
        <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900/60">
          <div className="w-full mx-auto px-4 md:px-6 lg:px-8 py-2 flex items-center justify-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-200">
            <CalendarCheck size={14} className="shrink-0" />
            <span>
              Registration closes{" "}
              <span className="underline decoration-amber-400 dark:decoration-amber-600">
                {new Date(closeAt).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
            </span>
          </div>
        </div>
      ) : null}
    </nav>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-end justify-between gap-2">
        <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">{label}</label>
        {error ? <span className="text-[10px] sm:text-xs font-semibold text-rose-600">{error}</span> : null}
      </div>
      {children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full px-4 py-3 rounded-2xl border bg-slate-50",
        "dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100",
        "outline-none focus:ring-4 focus:ring-cyan-100 dark:focus:ring-cyan-900/40 focus:border-cyan-500 transition",
        props.className
      )}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "w-full px-4 py-3 rounded-2xl border bg-slate-50",
        "dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100",
        "outline-none focus:ring-4 focus:ring-cyan-100 dark:focus:ring-cyan-900/40 focus:border-cyan-500 transition",
        props.className
      )}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full px-4 py-3 rounded-2xl border bg-slate-50 min-h-[110px]",
        "dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100",
        "outline-none focus:ring-4 focus:ring-cyan-100 dark:focus:ring-cyan-900/40 focus:border-cyan-500 transition",
        props.className
      )}
    />
  );
}

/* ---------------------------------------------
   MAIN PAGE (Inertia + API counts + router.post)
---------------------------------------------- */
export default function Registrations({ slotCounts = {}, closeAt }: Props) {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    slotCounts,
    loadingCounts: Object.keys(slotCounts).length === 0,
  });

  // Pull fresh counts on mount
  useEffect(() => {
    fetch("/api/register-gym/slot-counts")
      .then((res) => res.json())
      .then((data) => dispatch({ type: "SET_SLOT_COUNTS", counts: data }))
      .catch(() => dispatch({ type: "SET_LOADING_COUNTS", loading: false }));
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [state.step, state.submitted]);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      dispatch({ type: "SET_FIELD", field: name as keyof State["form"], value });
    },
    []
  );

  const goNext = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const errs = validate(state.form, null);

      if (Object.keys(errs).length) {
        dispatch({ type: "SET_ERRORS", errors: errs });

        return;
      }

      dispatch({ type: "NEXT_STEP" });
    },
    [state.form]
  );

  const getSlotCount = useCallback(
    (day: string, time: string) => {
      const key = `${day}||${time}`;

      return state.slotCounts[key] ?? 0;
    },
    [state.slotCounts]
  );

  const toggleSlot = useCallback(
    (day: string, time: string) => {
      dispatch({ type: "TOGGLE_SLOT", day, time });
    },
    []
  );

  const submit = useCallback(() => {
    const errs = validate(state.form, state.selectedSlots);

    if (Object.keys(errs).length) {
      dispatch({ type: "SET_ERRORS", errors: errs });

      return;
    }

    router.post(
      POST_ROUTE,
      {
        name: state.form.name.trim(),
        age: Number(state.form.age),
        sex: state.form.sex,
        sector: state.form.sector,
        chronicIllness: state.form.chronicIllness?.trim() || "",
        selectedSlots: state.selectedSlots.map((s) => ({ day: s.day, time: s.time })),
        employeeId: state.form.employeeId.trim(),
        phoneNumber: state.form.phoneNumber.trim(),
      },
      {
        preserveScroll: true,
        onStart: () => dispatch({ type: "SUBMIT_START" }),
        onSuccess: (page: any) => {
          dispatch({
            type: "SUBMIT_SUCCESS",
            message: page?.props?.flash?.success || "Success",
            registration: page?.props?.flash?.registration,
          });

          // refresh counts after successful registration
          fetch("/api/register-gym/slot-counts")
            .then((res) => res.json())
            .then((data) => dispatch({ type: "SET_SLOT_COUNTS", counts: data }))
            .catch(() => {});
        },
        onError: (errors: any) => {
          dispatch({
            type: "SET_ERRORS",
            errors: { ...state.errors, ...errors },
          });
        },
      }
    );
  }, [state.form, state.selectedSlots, state.errors]);

  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  const selectedCount = state.selectedSlots.length;

  /* ---------------------------------------------
     SUCCESS SCREEN
  ---------------------------------------------- */
  if (state.submitted) {
    return (
      <Shell>
        <Head title="Registration Complete" />
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[28px] shadow-xl border border-slate-200 dark:border-slate-800 p-5 sm:p-8 text-center">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>

            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">
              Registration Complete
            </h2>

            <p className="text-slate-600 dark:text-slate-300 mb-1">
              Thank you,{" "}
              <span className="font-extrabold text-slate-900 dark:text-white">{state.form.name}</span>. Your{" "}
              <span className="font-extrabold">{selectedCount}</span> session{selectedCount !== 1 ? "s" : ""} have been confirmed.
            </p>

            {state.registration ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                Employee ID:{" "}
                <span className="font-bold text-slate-800 dark:text-slate-200">{state.registration.employee_id}</span>
              </p>
            ) : null}

            {state.serverMessage ? (
              <div className="mb-3 inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-200 dark:border-cyan-900/60 bg-cyan-50 dark:bg-cyan-950/30 px-4 py-3 text-sm font-extrabold text-cyan-800 dark:text-cyan-200">
                <BadgeCheck size={18} />
                {state.serverMessage}
              </div>
            ) : null}

            <div className="mb-6 inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3 text-sm font-extrabold text-emerald-800 dark:text-emerald-200">
              <Info size={18} />
              Monthly payment: {MONTHLY_FEE_ETB} ETB
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/40 rounded-2xl p-4 mb-7 text-left text-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Selected Sessions</p>
                <span className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200">
                  <BadgeCheck size={14} /> Confirmed
                </span>
              </div>

              <div className="space-y-2">
                {state.selectedSlots.map((s) => (
                  <div key={s.id} className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 dark:text-slate-100">{s.day}</span>
                    <span className="text-slate-500 dark:text-slate-400 font-semibold">{s.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={reset}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold py-3.5 rounded-2xl transition shadow-lg shadow-cyan-100 dark:shadow-cyan-900/10"
            >
              New Registration
            </button>

            <p className="text-xs text-slate-400 mt-4">If you need changes, contact the facility coordinator.</p>
          </div>
        </div>
      </Shell>
    );
  }

  /* ---------------------------------------------
     MAIN FLOW
  ---------------------------------------------- */
  return (
    <Shell>
      <Head title="Gym Registration" />
      <TopNav step={state.step} closeAt={closeAt} />

      <main className="w-full mx-auto px-4 md:px-6 lg:px-8 py-8 pb-28">
        {state.step === 1 ? (
          /* STEP 1 */
          <div className="w-full">
            <div className="bg-white dark:bg-slate-900 rounded-[28px] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="h-2 bg-linear-gradient-to-r from-cyan-600 to-cyan-700 w-full" />

              <div className="p-5 sm:p-7 md:p-8 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">Step 1 — Employee Details</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Provide accurate details for identification and scheduling communications.
                </p>
              </div>

              <form onSubmit={goNext} className="p-5 sm:p-7 md:p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Full Name" error={state.errors.name}>
                    <Input required name="name" value={state.form.name} onChange={onChange} placeholder="Full Name" autoComplete="name" />
                  </Field>

                  <Field label="Employee ID" error={state.errors.employee_id || state.errors.employeeId}>
                    <Input required name="employeeId" value={state.form.employeeId} onChange={onChange} placeholder="EMP-0000" />
                  </Field>

                  <div className="grid grid-cols-2 gap-4 md:col-span-2">
                    <Field label="Age (21–70)" error={state.errors.age}>
                      <Input required type="number" name="age" value={state.form.age} onChange={onChange} placeholder="e.g., 28" min={21} max={70} />
                    </Field>

                    <Field label="Sex" error={state.errors.sex}>
                      <Select required name="sex" value={state.form.sex} onChange={onChange}>
                        <option value="" disabled>Choose Sex</option>
                        <option value="Male" >Male</option>
                        <option value="Female">Female</option>
                      </Select>
                    </Field>
                  </div>

                  <Field label="Sector" error={state.errors.sector}>
                    <Select required name="sector" value={state.form.sector} onChange={onChange}>
                      <option value="">Choose Sector</option>
                      {SECTORS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="Phone Number" error={state.errors.phone_number || state.errors.phoneNumber}>
                    <Input
                      required
                      type="tel"
                      name="phoneNumber"
                      value={state.form.phoneNumber}
                      onChange={onChange}
                      placeholder="+251 9xx xxx xxx"
                      autoComplete="tel"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Use a reachable number for schedule updates.</p>
                  </Field>
                </div>

                <Field label="Chronic Illness (optional)" error={state.errors.chronicIllness}>
                  <Textarea name="chronicIllness" value={state.form.chronicIllness} onChange={onChange} placeholder="Type 'None' if not applicable" />
                  <div className="mt-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 p-4 text-sm text-slate-600 dark:text-slate-300 flex gap-3">
                    <Info className="mt-0.5 text-slate-500 dark:text-slate-400" size={18} />
                    <p>This information supports safety protocol planning and is handled confidentially.</p>
                  </div>
                </Field>

                {state.serverError ? (
                  <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 p-4 text-sm text-rose-700 dark:text-rose-200 font-semibold">
                    {state.serverError}
                  </div>
                ) : null}

                <button
                  type="submit"
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold py-4 rounded-[22px] transition shadow-lg shadow-cyan-100 dark:shadow-cyan-900/10 flex items-center justify-center gap-2 text-lg"
                >
                  Continue to Schedule <ChevronRight size={20} />
                </button>

                {Object.keys(state.errors).length > 0 ? (
                  <p className="text-xs text-rose-600 font-semibold text-center">
                    Please correct the highlighted fields to continue.
                  </p>
                ) : null}
              </form>
            </div>
          </div>
        ) : (
          /* STEP 2 */
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <button
                  onClick={() => dispatch({ type: "PREV_STEP" })}
                  className="inline-flex items-center gap-2 text-cyan-700 dark:text-cyan-300 font-bold hover:underline"
                >
                  <ChevronLeft size={16} /> Back to Details
                </button>

                <h3 className="text-xl sm:text-2xl font-extrabold mt-2">Step 2 — Select Your Sessions</h3>
                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
                  Choose up to <span className="font-bold">{MAX_SELECTIONS}</span> days per week. Only{" "}
                  <span className="font-bold">1 slot per day</span>.
                </p>

                {state.infoNote ? (
                  <p className="text-xs sm:text-sm text-cyan-700 dark:text-cyan-300 font-bold mt-2">{state.infoNote}</p>
                ) : null}

                {state.errors.selectedSlots ? (
                  <p className="text-xs sm:text-sm text-rose-600 font-bold mt-2">{state.errors.selectedSlots}</p>
                ) : null}

                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-2 text-xs font-extrabold text-emerald-800 dark:text-emerald-200">
                  <Info size={14} />
                  Monthly payment: {MONTHLY_FEE_ETB} ETB
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-xs font-bold">
                <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  1–10 Available
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  11–20 Filling
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  21–30 Dense
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                  31+ Filled
                </div>
              </div>
            </div>

            {/* Responsive grid similar to your template */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="bg-white dark:bg-slate-900 rounded-[28px] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden"
                >
                  <div className="bg-slate-900 dark:bg-slate-950 text-white p-4 sm:p-5 flex items-center justify-between">
                    <h4 className="font-extrabold flex items-center gap-2">
                      <Calendar size={18} className="text-cyan-300" /> {day}
                    </h4>
                    <span className="text-xs text-white/70 font-bold">Select 1 slot</span>
                  </div>

                  <div className="p-3 sm:p-4 space-y-2">
                    {SCHEDULE_SLOTS.map((time) => {
                      const count = getSlotCount(day, time);
                      const meta = statusForCount(count);
                      const id = `${day}—${time}`;
                      const selected = state.selectedSlots.some((s) => s.id === id);

                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => toggleSlot(day, time)}
                          className={cn(
                            "w-full text-left flex items-center justify-between p-3 sm:p-4 rounded-[22px] border-2 transition cursor-pointer",
                            selected
                              ? "border-cyan-600 bg-cyan-50 dark:bg-cyan-950/30 ring-4 ring-cyan-100 dark:ring-cyan-900/30"
                              : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-950/40"
                          )}
                        >
                          <div className="flex items-start gap-3 sm:gap-4">
                            <div
                              className={cn(
                                "w-7 h-7 rounded-xl border-2 flex items-center justify-center transition mt-0.5",
                                selected
                                  ? "bg-cyan-600 border-cyan-600"
                                  : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                              )}
                              aria-hidden="true"
                            >
                              {selected ? <CheckCircle2 size={16} className="text-white" /> : null}
                            </div>

                            <div className="min-w-0">
                              <div className="font-extrabold text-slate-900 dark:text-slate-100 truncate text-sm sm:text-base">
                                {time}
                              </div>

                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                {state.loadingCounts ? (
                                  <>
                                    <span className="h-5 w-20 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
                                    <span className="h-5 w-16 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
                                  </>
                                ) : (
                                  <>
                                    <span
                                      className={cn(
                                        "text-[10px] w-fit px-2.5 py-1 rounded-full border inline-flex items-center gap-1 font-extrabold uppercase tracking-widest",
                                        meta.pill
                                      )}
                                    >
                                      <span className={cn("w-2 h-2 rounded-full", meta.dot)} />
                                      {meta.label}
                                    </span>

                                    <span
                                      className={cn(
                                        "text-[10px] w-fit px-2.5 py-1 rounded-full border",
                                        "text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800",
                                        "inline-flex items-center gap-1 font-extrabold uppercase tracking-widest"
                                      )}
                                    >
                                      <Users size={12} />
                                      {count}/{MAX_CAPACITY}
                                    </span>

                                    {count >= MAX_CAPACITY ? (
                                      <span className="text-[10px] px-2.5 py-1 rounded-full border font-extrabold uppercase tracking-widest text-slate-700 bg-slate-100 border-slate-300 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700">
                                        Full
                                      </span>
                                    ) : null}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-slate-400">
                            {selected ? (
                              <span className="text-cyan-700 dark:text-cyan-300 text-xs font-extrabold uppercase tracking-widest">
                                Selected
                              </span>
                            ) : (
                              <Plus size={18} />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {state.serverError ? (
              <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 p-4 text-sm text-rose-700 dark:text-rose-200 font-semibold">
                {state.serverError}
              </div>
            ) : null}

            {/* Sticky submission bar (step 2 only) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-950/80 backdrop-blur border-t border-slate-200 dark:border-slate-800 p-3 sm:p-4 z-40 shadow-[0_-6px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_-6px_30px_rgba(0,0,0,0.35)]">
              <div className="w-full mx-auto px-0 md:px-2 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">
                    Sessions Selected
                  </p>
                  <p className="text-lg font-extrabold text-cyan-700 dark:text-cyan-300">
                    {selectedCount}/{MAX_SELECTIONS} chosen
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Rule: 1 per day • Monthly payment: {MONTHLY_FEE_ETB} ETB
                  </p>
                </div>

                <button
                  onClick={submit}
                  disabled={selectedCount === 0 || state.submitting}
                  className={cn(
                    "px-5 sm:px-8 md:px-10 py-3.5 rounded-[22px] font-extrabold transition flex items-center gap-2",
                    selectedCount > 0 && !state.submitting
                      ? "bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-200 dark:shadow-cyan-900/20"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                  )}
                >
                  {state.submitting ? "Submitting..." : "Confirm & Finalize"} <CheckCircle2 size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-8 md:py-10 text-center text-slate-400 text-xs px-4">
        <p className="font-semibold">EEC Gymnastic Program © 2026</p>
        <p className="mt-1">
          Monthly payment is {MONTHLY_FEE_ETB} ETB. Registrations are subject to facility capacity and safety protocols.
        </p>
      </footer>
    </Shell>
  );
}

(Registrations as any).layout = (page: React.ReactNode) => page;