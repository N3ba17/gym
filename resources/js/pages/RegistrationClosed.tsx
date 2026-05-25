import { Head, Link } from "@inertiajs/react";
import { CalendarCheck, Mail, ShieldX } from "lucide-react";

type Props = {
  message?: string;
};

export default function RegistrationClosed({ message }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900 font-sans dark:from-slate-950 dark:to-slate-950 dark:text-slate-100 flex flex-col">
      <Head title="Registration Closed" />

      <nav className="bg-white/80 dark:bg-slate-950/70 backdrop-blur border-b border-slate-200/70 dark:border-slate-800">
        <div className="w-full mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-sm shrink-0">
            <CalendarCheck size={22} />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-extrabold tracking-tight leading-none">
              Gymnastic Portal
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 -mt-0.5">
              Employee registration & session scheduling
            </p>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-[28px] shadow-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 md:p-10 text-center">
          <div className="w-20 h-20 bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldX size={40} />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-3">
            Registration Closed
          </h2>

          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            {message || "Gym registration is currently closed. If you have any questions or need assistance, please reach out to the facility coordinator."}
          </p>

          <div className="bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 mb-6">
            <div className="flex items-center justify-center gap-3">
              <Mail className="size-5 text-blue-600 shrink-0" />
              <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 break-all">
                info@eecconstruction.com
              </span>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm transition shadow-lg shadow-blue-100 dark:shadow-blue-900/10"
          >
            Back to Home
          </Link>

          <p className="text-xs text-slate-400 mt-5">
            Thank you for your understanding.
          </p>
        </div>
      </main>

      <footer className="py-8 text-center text-slate-400 text-xs px-4">
        <p className="font-semibold">EEC Gymnastic Program &copy; 2026</p>
      </footer>
    </div>
  );
}

(RegistrationClosed as any).layout = (page: React.ReactNode) => page;
