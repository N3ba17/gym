import { Link } from '@inertiajs/react';
import { Dumbbell } from 'lucide-react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="min-h-screen flex items-center justify-center p-6 md:p-10 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Background Effects */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <Link
                        href={home()}
                        className="flex items-center gap-3 mb-2"
                    >
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/20">
                            <Dumbbell className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">
                            GymReg
                        </span>
                    </Link>
                </div>

                {/* Card */}
                <div className="p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 shadow-xl shadow-slate-200/10 dark:shadow-slate-900/20">
                    <div className="space-y-2 text-center mb-8">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {title}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>

                {/* Back to home */}
                <div className="text-center mt-6">
                    <Link
                        href={home()}
                        className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                    >
                        &larr; Back to home
                    </Link>
                </div>
            </div>
        </div>
    );
}