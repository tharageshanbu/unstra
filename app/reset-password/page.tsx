'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from "@/lib/supabase/client"
import { Shield, ArrowLeft, Mail, Loader2, Lock, Eye, EyeOff, CheckCircle2, Circle, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

const supabase = createClient()

export default function ResetPasswordPage() {
  const [isRecoverySession, setIsRecoverySession] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null)
  const router = useRouter()

  // ✅ HANDSHAKE: Detect if user clicked the email link
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecoverySession(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // Strength Logic (Sovereign Standard)
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
  const canSubmitUpdate = passwordStrength.isValid && isMatch;

  // Action A: Request Link (Stage 1)
  const handleRequestLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setFeedback(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://www.unstra.com/reset-password',
    })

    setLoading(false)
    if (error) setFeedback({ type: 'error', msg: error.message })
    else setFeedback({ type: 'success', msg: "Recovery protocol initiated. Check your primary inbox." })
  }

  // Action B: Update Credentials (Stage 2 - Arriving from Email)
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmitUpdate) return
    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password })
    
    setLoading(false)
    if (error) setFeedback({ type: 'error', msg: error.message })
    else setDone(true)
  }

  if (done) return (
    <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center p-6 text-center">
      <CheckCircle size={48} className="text-emerald-500 mb-6" />
      <h1 className="text-3xl font-black uppercase italic text-white">Vault Secured.</h1>
      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mt-3">Access Protocol Re-Established</p>
      <button onClick={() => router.push('/login')} className="mt-10 bg-white text-black font-black px-10 py-4 rounded-xl text-[12px] uppercase tracking-widest hover:bg-zinc-200 transition-all">Enter Vault</button>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#020202] text-white flex items-center justify-center px-6 selection:bg-blue-500/30 overflow-hidden font-sans">
      <div className="fixed inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-[410px] z-10 text-center py-4">
        {!isRecoverySession && (
          <button onClick={() => router.push('/login')} className="inline-flex items-center gap-2 mb-10 px-4 py-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-blue-500 transition-all group">
            <ArrowLeft size={14} className="text-zinc-500 group-hover:text-blue-400 transition-transform group-hover:-translate-x-1" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 group-hover:text-white">Back to Login</span>
          </button>
        )}

        <div className="flex flex-col items-center gap-5 mb-10">
          <div className="w-14 h-14 bg-blue-600 rounded-[22px] flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.2)] border border-blue-400/30">
            <Shield size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-[900] uppercase tracking-tighter italic leading-none mb-2 text-white">
              {isRecoverySession ? 'New Protocol.' : 'Vault Recovery.'}
            </h1>
            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] italic">
              {isRecoverySession ? 'Update Master Credentials' : 'Authorize Intelligence Link'}
            </p>
          </div>
        </div>
        
        <form onSubmit={isRecoverySession ? handleUpdatePassword : handleRequestLink} className="space-y-6">
          {!isRecoverySession ? (
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2 ml-1">
                <Mail size={13} className="text-blue-500" />
                <label className="text-[12px] font-black text-white uppercase tracking-[0.2em] italic">Primary Email</label>
              </div>
              <input 
                className="w-full rounded-2xl px-5 py-4 bg-zinc-900 border border-white/20 focus:border-blue-500 focus:bg-black outline-none transition-all font-bold text-sm placeholder:text-zinc-600" 
                type="email" placeholder="name@email.com" required value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-6 text-left">
              <div className="space-y-2">
                <div className="flex items-center gap-2 ml-1">
                  <Lock size={13} className="text-blue-500" />
                  <label className="text-[12px] font-black uppercase tracking-widest italic">New Password</label>
                </div>
                <div className="relative">
                  <input 
                    required type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/20 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none transition-all font-bold text-sm pr-12"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Password Strength UI */}
              <div className="grid grid-cols-2 gap-2 px-1">
                {Object.keys(passwordStrength.checks).map((check) => (
                  <div key={check} className={`flex items-center gap-2 text-[9px] font-bold ${passwordStrength.checks[check as keyof typeof passwordStrength.checks] ? 'text-blue-400' : 'text-zinc-600'}`}>
                    {passwordStrength.checks[check as keyof typeof passwordStrength.checks] ? <CheckCircle2 size={10} /> : <Circle size={10} />} {check.toUpperCase()}
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 ml-1">
                  <Shield size={13} className="text-blue-500" />
                  <label className="text-[12px] font-black uppercase tracking-widest italic">Confirm Protocol</label>
                </div>
                <input 
                  required type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full bg-zinc-900 border ${confirmPassword !== '' && !isMatch ? 'border-red-500/50' : 'border-white/20'} rounded-2xl px-5 py-4 focus:border-blue-500 outline-none transition-all font-bold text-sm`}
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          <button 
            disabled={loading || (isRecoverySession && !canSubmitUpdate)} 
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-[900] text-[12px] uppercase tracking-[0.4em] py-4.5 rounded-xl transition-all shadow-[0_0_30px_rgba(37,99,235,0.2)] active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : (isRecoverySession ? 'CONFIRM NEW CREDENTIALS' : 'Dispatch Recovery Link')}
          </button>

          {feedback && (
            <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl text-[10px] font-black uppercase tracking-widest border italic text-center ${
                feedback.type === 'error' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
              }`}
            >
              {feedback.msg}
            </motion.p>
          )}
        </form>
      </motion.div>
    </div>
  )
}