"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignInPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Sign-in failed.");
        setSubmitting(false);
        return;
      }
      router.push("/overview");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-[#0A3868]">
          CHS Boys Soccer
        </h1>
        <p className="mt-1 text-sm text-[#6B6B6B]">
          Enter your 4-digit PIN to sign in.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="password"
          inputMode="numeric"
          pattern="\d{4}"
          maxLength={4}
          autoFocus
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          className="rounded-md border border-[#D9C9A8] px-4 py-3 text-center text-2xl tracking-[0.5em]"
          placeholder="••••"
        />
        {error && <p className="text-sm text-[#B23B3B]">{error}</p>}
        <button
          type="submit"
          disabled={pin.length !== 4 || submitting}
          className="rounded-md bg-[#0A3868] px-4 py-3 font-medium text-white disabled:opacity-50"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <Link
        href="/"
        className="text-center text-sm text-[#6B6B6B] underline underline-offset-2"
      >
        Continue without signing in
      </Link>
    </main>
  );
}
