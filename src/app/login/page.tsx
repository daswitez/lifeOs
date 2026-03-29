"use client"

import { useState, useTransition } from 'react'
import { Sparkles, Loader2, AlertCircle, ArrowRight } from 'lucide-react'
import { login } from './actions'
import Link from 'next/link'

export default function LoginPage() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (formData: FormData) => {
    setErrorMsg(null)
    startTransition(async () => {
      const res = await login(formData);
      if (res && res.error) {
         setErrorMsg(res.error);
      }
    })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] p-4">
      {/* Premium Monolithic Container */}
      <div className="w-full max-w-sm px-8 py-10 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="w-12 h-12 bg-[var(--foreground)] text-[var(--background)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
          <Sparkles className="w-6 h-6" />
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] mb-2">LifeOS</h1>
        <p className="text-sm font-serif text-[var(--muted-foreground)] mb-8 italic">
          Welcome back. Sign in to continue.
        </p>

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3 text-left animate-in zoom-in-95 duration-200">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-600 font-medium leading-relaxed">
              {errorMsg}
            </p>
          </div>
        )}

        <form action={handleSubmit} className="flex flex-col gap-4 text-left">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--muted-foreground)]">Email</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              required 
              autoComplete="email"
              disabled={isPending}
              className="px-4 py-3 border border-[var(--border)] rounded-lg bg-[var(--background)] text-sm focus:outline-none focus:border-[var(--foreground)] transition-colors text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] disabled:opacity-50"
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5 mb-2">
            <label className="text-[10px] uppercase tracking-widest font-semibold text-[var(--muted-foreground)]">Password</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              required
              disabled={isPending}
              className="px-4 py-3 border border-[var(--border)] rounded-lg bg-[var(--background)] text-sm focus:outline-none focus:border-[var(--foreground)] transition-colors text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/30 disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            disabled={isPending}
            className="w-full mt-2 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Sign In
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[var(--border)] text-sm text-[var(--muted-foreground)]">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[var(--foreground)] font-semibold hover:underline inline-flex items-center gap-1">
            Create Profile <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

    </div>
  )
}
