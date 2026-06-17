import { Head, Link } from '@inertiajs/react';
import { Dumbbell, Users, Calendar, TrendingUp, ArrowRight } from 'lucide-react';
import { login, dashboard } from '@/routes';

export default function Welcome() {
    return (
        <>
            <Head title="Gym Registration Portal" />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                {/* Navigation */}
                <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-slate-950/70 border-b border-slate-200/50 dark:border-slate-800/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600">
                                    <Dumbbell className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold text-slate-900 dark:text-white">
                                    GymReg
                                </span>
                            </div>
<div className="flex items-center gap-4">
                                <Link
                                    href={login()}
                                    className="px-5 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-600/25"
                                >
                                    Get Started
                                </Link>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
                    <div className="absolute inset-0 -z-10">
                        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/50 dark:border-blue-800/50 mb-6">
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                                    Employee Wellness Program
                                </span>
                            </div>

                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight mb-6">
                                Get Fit. Stay Healthy.{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                    Together.
                                </span>
                            </h1>

                            <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
                                Register for your preferred gym slots effortlessly.
                                Track your bookings and join the community on the path to wellness.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link
                                    href={login()}
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-600/25"
                                >
                                    Start Now
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                            {[
                                { icon: Users, label: 'Total capacity', value: '500+' },
                                { icon: Calendar, label: 'Weekly Slots', value: '180+' },
                                { icon: TrendingUp, label: 'Check-ins', value: '1.2k' },
                                { icon: Dumbbell, label: 'Sessions', value: '50+' },
                            ].map((stat, idx) => (
                                <div
                                    key={idx}
                                    className="text-center p-6 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-800/50 hover:border-blue-500/30 dark:hover:border-blue-500/30 transition-colors"
                                >
                                    <stat.icon className="w-6 h-6 mx-auto mb-3 text-blue-600" />
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {stat.value}
                                    </div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 bg-white/50 dark:bg-slate-900/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                                Everything You Need
                            </h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                                A complete gym registration system designed for employee wellness programs.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: Calendar,
                                    title: 'Flexible Scheduling',
                                    description: 'Choose from multiple time slots across weekdays. Book up to 3 sessions per registration.',
                                    color: 'blue',
                                },
                                {
                                    icon: Users,
                                    title: 'Easy Management',
                                    description: 'Admins can manage registrations, reassign slots, and view comprehensive analytics.',
                                    color: 'indigo',
                                },
                                {
                                    icon: TrendingUp,
                                    title: 'Real-time Tracking',
                                    description: 'Monitor slot availability, track registrations, and analyze trends with live dashboards.',
                                    color: 'emerald',
                                },
                            ].map((feature, idx) => (
                                <div
                                    key={idx}
                                    className="group p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-slate-900/20 transition-all duration-300"
                                >
                                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-${feature.color}-100 dark:bg-${feature.color}-900/30 mb-6`}>
                                        <feature.icon className={`w-7 h-7 text-${feature.color}-600 dark:text-${feature.color}-400`} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                                        {feature.title}
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-blue-600 to-indigo-600 p-12 lg:p-16">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-2xl" />

                            <div className="relative text-center">
                                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                                    Ready to Get Started?
                                </h2>
                                <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
                                    Join hundreds of employees already benefiting from our wellness program.
                                </p>
                                <Link
                                    href={login()}
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold rounded-2xl hover:bg-blue-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Login to Portal
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-8 border-t border-slate-200/50 dark:border-slate-800/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
                                    <Dumbbell className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                                    GymReg Portal
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-500">
                                Employee Wellness Program
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}