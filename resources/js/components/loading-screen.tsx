import { router } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";

export default function LoadingScreen() {
  const [show, setShow] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const start = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setShow(true), 250);
    };
    const finish = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setShow(false);
    };

    const removeStart = router.on("start", start);
    const removeFinish = router.on("finish", finish);

    return () => {
      removeStart();
      removeFinish();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-blue-900" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Loading...
        </p>
      </div>
    </div>
  );
}
