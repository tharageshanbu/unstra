'use client'

import React, { useState, useMemo } from 'react'
import { createClient } from "@/lib/supabase/client"
import { Shield, Lock, CheckCircle2, Circle, CheckCircle, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Reuse the Elite Strength Logic
  const passwordStrength = useMemo(() => {
    const checks = {
      length: password.length >= 8,
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*]/.test(password),
      upper: /[A-Z]/.test(password)
    };
    const score = Object.values(checks).filter(Boolean).length;
    return { checks, score, isValid: score === 4 };
  }, [password]);

  const isMatch = password === confirmPassword && password !== '';
  const canSubmit = passwordStrength.isValid && isMatch;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return;
    
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    
    if (error) {
      setError(error.message)
    } else {
      setDone(true)
    }
  }

  if (done) return (
    <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-8 border border-emerald-500/30">
        <CheckCircle size={40} className="text-emerald-500" />
      </div>
      <h1 className="text-4xl font-black uppercase tracking-tighter italic text-white">Vault Secured.</h1>
      <p className="text-zinc-500 text-[11px] font-black uppercase tracking-[0.3em] mt-3 italic">Protocol Update Successful</p>
      <button 
        onClick={() => window.location.href = '/dashboard'} 
        className="mt-10 bg-white text-black font-[900] px-10 py-4 rounded-xl text-[12px] uppercase tracking-[0.4em] hover:bg-zinc-200 transition-all active:scale-95 shadow-2xl"
      >
        Enter Dashboard
      </button>
    </div>
  )

  return (
    <main className="min-h-screen bg-[#020202] text-white flex items-center justify-center p-6 font-sans">
      <div className="fixed inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[410px] z-10">
        <div className="text-center mb-10">
          <Shield size={40} className="text-blue-600 mx-auto mb-6" />
          <h1 className="text-3xl font-black uppercase tracking-tighter italic text-white">New <span className="text-blue-600">Protocol.</span></h1>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] italic">Update Vault Credentials</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 ml-1">
              <Lock size={13} className="text-blue-500" />
              <label className="text-[12px] font-black uppercase tracking-widest italic">New Password</label>
            </div>
            <input 
              required type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(null); }}
              className="w-full bg-zinc-900 border border-white/20 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none transition-all font-bold text-sm"
              placeholder="••••••••"
            />
          </div>

          {/* Strength Indicators (Matching Login Style) */}
          <div className="grid grid-cols-2 gap-2 px-1">
            <div className={`flex items-center gap-2 text-[9px] font-bold ${passwordStrength.checks.length ? 'text-blue-400' : 'text-zinc-600'}`}>
              {passwordStrength.checks.length ? <CheckCircle2 size={10} /> : <Circle size={10} />} 8+ CHARS
            </div>
            <div className={`flex items-center gap-2 text-[9px] font-bold ${passwordStrength.checks.upper ? 'text-blue-400' : 'text-zinc-600'}`}>
              {passwordStrength.checks.upper ? <CheckCircle2 size={10} /> : <Circle size={10} />} UPPERCASE
            </div>
            <div className={`flex items-center gap-2 text-[9px] font-bold ${passwordStrength.checks.number ? 'text-blue-400' : 'text-zinc-600'}`}>
              {passwordStrength.checks.number ? <CheckCircle2 size={10} /> : <Circle size={10} />} NUMBER
            </div>
            <div className={`flex items-center gap-2 text-[9px] font-bold ${passwordStrength.checks.special ? 'text-blue-400' : 'text-zinc-600'}`}>
              {passwordStrength.checks.special ? <CheckCircle2 size={10} /> : <Circle size={10} />} SYMBOL
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 ml-1">
              <Shield size={13} className="text-blue-500" />
              <label className="text-[12px] font-black uppercase tracking-widest italic">Confirm Protocol</label>
            </div>
            <input 
              required type="password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
              className={`w-full bg-zinc-900 border ${confirmPassword !== '' && !isMatch ? 'border-red-500/50' : 'border-white/20'} rounded-2xl px-5 py-4 focus:border-blue-500 outline-none transition-all font-bold text-sm`}
              placeholder="••••••••"
            />
          </div>

          <button 
            disabled={loading || !canSubmit} 
            className="w-full bg-blue-600 disabled:opacity-50 py-4.5 rounded-xl font-black text-xs uppercase tracking-[0.4em] shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'CONFIRM NEW CREDENTIALS'}
          </button>

          {error && (
            <p className="p-4 bg-red-500/10 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-500/20 text-center italic">
              {error}
            </p>
          )}
        </form>
      </motion.div>
    </main>
  )
}