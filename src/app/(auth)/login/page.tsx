"use client";

import { useState } from "react";
import { requestLogin, verifyLogin } from "@/app/actions/auth";
import { Loader2, ArrowRight, CheckCircle } from "lucide-react";

export default function LoginPage() {
    const [step, setStep] = useState<"INPUT" | "OTP">("INPUT");
    const [identifier, setIdentifier] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleRequestLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData();
        formData.append("identifier", identifier);

        const res = await requestLogin(formData);

        if (res.error) {
            setError(res.error);
        } else {
            setStep("OTP");
        }
        setLoading(false);
    }

    async function handleVerifyLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await verifyLogin(identifier, otp);

        if (res?.error) {
            setError(res.error);
            setLoading(false);
        } else {
            // Redirect happens in server action
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tighter text-white">
                        ZARK <span className="text-primary">.</span>
                    </h1>
                    <p className="mt-2 text-sm text-zinc-400">
                        Acesse o sistema operacional da sua vida.
                    </p>
                </div>

                {error && (
                    <div className="rounded-lg border border-red-900/50 bg-red-900/20 p-3 text-sm text-red-400">
                        {error}
                    </div>
                )}

                {step === "INPUT" ? (
                    <form onSubmit={handleRequestLogin} className="space-y-6">
                        <div>
                            <label htmlFor="identifier" className="sr-only">
                                Email ou WhatsApp
                            </label>
                            <input
                                id="identifier"
                                name="identifier"
                                type="text"
                                required
                                placeholder="seu@email.com ou WhatsApp"
                                className="block w-full rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-white placeholder-zinc-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 font-semibold text-white transition-all hover:bg-orange-600 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <>
                                    Continuar <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyLogin} className="space-y-6">
                        <div className="text-center">
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-900/20 text-green-500">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                            <p className="text-zinc-300">
                                Código enviado para <span className="text-white">{identifier}</span>
                            </p>
                        </div>
                        <div>
                            <label htmlFor="otp" className="sr-only">
                                Código de 6 dígitos
                            </label>
                            <input
                                id="otp"
                                name="otp"
                                type="text"
                                required
                                maxLength={6}
                                placeholder="000000"
                                className="block w-full rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-center text-2xl tracking-widest text-white placeholder-zinc-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 font-semibold text-white transition-all hover:bg-orange-600 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                "Verificar Código"
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep("INPUT")}
                            className="w-full text-sm text-zinc-500 hover:text-white"
                        >
                            Voltar
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
