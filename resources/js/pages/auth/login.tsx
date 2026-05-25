import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Dumbbell } from 'lucide-react';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({
    status,
    canResetPassword,
}: Props) {
    return (
        <>
            <Head title="Log in" />

            <div className="flex items-center justify-center">
                <div className="w-full max-w-md">
                    {/* Logo & Header */}
                   

                    <Form
                        {...store.form()}
                        resetOnSuccess={['password']}
                    >
                        {({ processing, errors }) => (
                            <div className="space-y-5">
                                {status && (
                                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/50 dark:border-emerald-800/50">
                                        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                                            {status}
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Email address
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="name@company.com"
                                        className="h-12 rounded-xl border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            Password
                                        </Label>
                                        {canResetPassword && (
                                            <TextLink
                                                href={request()}
                                                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                                tabIndex={5}
                                            >
                                                Forgot password?
                                            </TextLink>
                                        )}
                                    </div>
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        className="h-12 rounded-xl border-slate-200 dark:border-slate-700"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        tabIndex={3}
                                        className="rounded border-slate-300 dark:border-slate-600"
                                    />
                                    <Label htmlFor="remember" className="text-sm text-slate-600 dark:text-slate-400">
                                        Remember me
                                    </Label>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                                    tabIndex={4}
                                    disabled={processing}
                                    data-test="login-button"
                                >
                                    {processing ? (
                                        <Spinner className="w-5 h-5" />
                                    ) : (
                                        'Sign in'
                                    )}
                                </Button>
                            </div>
                        )}
                    </Form>
                </div>
            </div>
        </>
    );
}

Login.layout = {
    title: 'Sign in to your account',
    description: 'Enter your email and password to access the admin portal',
};