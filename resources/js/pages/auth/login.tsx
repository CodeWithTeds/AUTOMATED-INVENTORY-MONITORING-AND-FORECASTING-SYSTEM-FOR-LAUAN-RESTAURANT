import InputError from '@/components/input-error';
import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { dashboard, home } from '@/routes';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: true,
    });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Log in" />

            <main className="relative flex min-h-screen overflow-hidden bg-[#f7f1ea] text-[#040404]">
                <div className="absolute left-[-8%] top-[52%] h-14 w-[32%] -rotate-8 bg-[#faa340]" />
                <div className="absolute right-[-4%] top-[37%] h-14 w-[32%] -rotate-3 bg-[#e3dad0]" />
                <div className="absolute inset-x-0 bottom-0 h-[44%] bg-[#fbf5ed]" />

                <section className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center justify-center px-6 py-10">
                    <Link href={home()} className="mb-5 block">
                        <img
                            src="/image.png"
                            alt="Lauan Restaurant"
                            className="h-24 w-40 rounded-md object-cover shadow-[0_18px_44px_rgba(4,4,4,0.14)]"
                        />
                    </Link>

                    <form
                        onSubmit={handleSubmit}
                        className="w-full rounded-lg border border-[#040404]/10 bg-white/92 p-6 shadow-[0_26px_90px_rgba(4,4,4,0.12)] backdrop-blur md:p-7"
                    >
                        <div className="text-center">
                            <p className="text-sm font-semibold text-[#040404]/55">
                                Welcome back
                            </p>
                            <div className="mx-auto mt-5 flex size-24 items-center justify-center rounded-full border border-[#040404]/10 bg-[#040404] text-3xl font-semibold text-white shadow-inner">
                                R
                            </div>
                            <h1 className="mt-5 text-2xl font-semibold">Renz</h1>
                        </div>

                        <div className="mt-7 space-y-4">
                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-[#040404]/70">
                                    Email address
                                </span>
                                <span className="relative block">
                                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#040404]/38" />
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(event) =>
                                            setData('email', event.target.value)
                                        }
                                        autoComplete="email"
                                        autoFocus
                                        className="h-12 w-full rounded-md border border-[#040404]/14 bg-white px-10 text-sm outline-none transition placeholder:text-[#040404]/38 focus:border-[#faa340] focus:ring-4 focus:ring-[#faa340]/18"
                                        placeholder="admin@aimfs.test"
                                        required
                                    />
                                </span>
                                <InputError message={errors.email} />
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-[#040404]/70">
                                    Password
                                </span>
                                <span className="relative block">
                                    <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#040404]/38" />
                                    <input
                                        type={passwordVisible ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(event) =>
                                            setData('password', event.target.value)
                                        }
                                        autoComplete="current-password"
                                        className="h-12 w-full rounded-md border border-[#040404]/14 bg-white px-10 text-sm outline-none transition placeholder:text-[#040404]/38 focus:border-[#faa340] focus:ring-4 focus:ring-[#faa340]/18"
                                        placeholder="Enter your password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setPasswordVisible((visible) => !visible)
                                        }
                                        className="absolute right-3 top-1/2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-[#040404]/50 transition hover:text-[#040404]"
                                        aria-label={
                                            passwordVisible
                                                ? 'Hide password'
                                                : 'Show password'
                                        }
                                    >
                                        {passwordVisible ? (
                                            <EyeOff className="size-4" />
                                        ) : (
                                            <Eye className="size-4" />
                                        )}
                                    </button>
                                </span>
                                <InputError message={errors.password} />
                            </label>

                            <div className="flex items-center justify-between gap-3 text-sm">
                                <label className="flex items-center gap-2 text-[#040404]/62">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(event) =>
                                            setData('remember', event.target.checked)
                                        }
                                        className="size-4 rounded border-[#040404]/18 accent-[#faa340]"
                                    />
                                    Remember me
                                </label>

                                {canResetPassword && (
                                    <Link
                                        href={request()}
                                        className="font-medium text-[#040404] transition hover:text-[#faa340]"
                                    >
                                        Forgot password?
                                    </Link>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="mt-2 h-12 w-full rounded-md bg-[#faa340] text-sm font-semibold text-[#040404] shadow-[0_16px_38px_rgba(250,163,64,0.32)] transition hover:bg-[#f8992f] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {processing ? 'Signing in...' : 'Log in'}
                            </button>
                        </div>

                        {status && (
                            <p className="mt-4 text-center text-sm font-medium text-[#040404]/70">
                                {status}
                            </p>
                        )}
                    </form>

                    <footer className="mt-20 text-center text-sm text-[#040404]/55">
                        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                            <a href="#" className="transition hover:text-[#040404]">
                                Terms & Condition
                            </a>
                            <a href="#" className="transition hover:text-[#040404]">
                                Privacy
                            </a>
                            <a href="#" className="transition hover:text-[#040404]">
                                Help
                            </a>
                        </div>
                        <p className="mt-4">Copyrights © 2026 - DreamsPOS</p>
                    </footer>
                </section>

                <Link
                    href={dashboard()}
                    className="sr-only"
                    aria-hidden="true"
                    tabIndex={-1}
                >
                    Dashboard
                </Link>
            </main>
        </>
    );
}
