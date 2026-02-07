'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { login, signup, signInWithGoogle } from './actions'
import { Shield, ArrowLeft, Lock, Mail, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LoginPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ message?: string; error?: string }> 
}) {
  const params = React.use(searchParams);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-[#020202] text-white flex items-center justify-center px-6 selection:bg-blue-500/30 overflow-hidden font-sans">
      <div className="fixed inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-[410px] z-10 py-4">
        
        <button onClick={() => router.push('/')} className="absolute top-8 left-8 group flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 bg-white/[0.05] hover:bg-white/[0.1] hover:border-blue-500 transition-all shadow-2xl">
          <ArrowLeft size={14} className="text-zinc-300 group-hover:text-blue-400 transition-transform group-hover:-translate-x-1" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300 group-hover:text-white">Exit</span>
        </button>

        <div className="flex flex-col items-center gap-5 text-center mb-6">
          <div className="w-14 h-14 bg-blue-600 rounded-[22px] flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.35)] border border-blue-400/30">
            <Shield size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-[900] uppercase tracking-tighter italic leading-none mb-2 text-white">
              Unstra <span className="text-blue-600 italic">Vault.</span>
            </h1>
            <p className="text-zinc-400 text-[11px] font-black uppercase tracking-[0.3em] italic">
              Elite Forensic Sensing Protocol
            </p>
          </div>
        </div>

        <form action={signInWithGoogle}>
          <button className="w-full flex items-center justify-center gap-3 bg-white text-black font-[900] text-[12px] uppercase tracking-widest py-4 rounded-xl hover:bg-zinc-100 transition-all active:scale-[0.98] shadow-2xl">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </form>

        <div className="relative flex items-center gap-6 py-6">
          <div className="flex-1 h-[1px] bg-white/20"></div>
          <span className="text-zinc-100 text-[9px] font-black uppercase tracking-[0.5em] italic">Secure Access</span>
          <div className="flex-1 h-[1px] bg-white/20"></div>
        </div>

        <form action={isSignUp ? signup : login} className="flex flex-col gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 ml-1">
              <Mail size={13} className="text-blue-500" />
              <label className="text-[12px] font-black text-white uppercase tracking-[0.2em] italic">Primary Email</label>
            </div>
            <input className="w-full rounded-2xl px-5 py-3.5 bg-zinc-900 border border-white/20 focus:border-blue-500 focus:bg-black outline-none transition-all font-bold text-sm placeholder:text-zinc-600" name="email" type="email" placeholder="name@email.com" required />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <div className="flex items-center gap-2">
                <Lock size={13} className="text-blue-500" />
                <label className="text-[12px] font-black text-white uppercase tracking-[0.2em] italic">Vault Password</label>
              </div>
              {/* MINIMALIST FORGOT PASSWORD */}
              {!isSignUp && (
                <button type="button" onClick={() => router.push('/reset-password')} className="text-[9px] font-black text-zinc-500 hover:text-blue-400 uppercase tracking-widest transition-colors italic">Forgot?</button>
              )}
            </div>
            <div className="relative">
              <input className="w-full rounded-2xl px-5 py-3.5 bg-zinc-900 border border-white/20 focus:border-blue-500 focus:bg-black outline-none transition-all font-bold text-sm placeholder:text-zinc-600 pr-12" name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" required minLength={6} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* DYNAMIC CONFIRM PASSWORD FOR SIGNUP */}
          <AnimatePresence>
            {isSignUp && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2 overflow-hidden">
                <div className="flex items-center gap-2 ml-1">
                  <Shield size={13} className="text-blue-500" />
                  <label className="text-[12px] font-black text-white uppercase tracking-[0.2em] italic">Confirm Password</label>
                </div>
                <input className="w-full rounded-2xl px-5 py-3.5 bg-zinc-900 border border-white/20 focus:border-blue-500 focus:bg-black outline-none transition-all font-bold text-sm placeholder:text-zinc-600" name="confirmPassword" type="password" placeholder="••••••••" required minLength={6} />
              </motion.div>
            )}
          </AnimatePresence>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-[900] text-[12px] uppercase tracking-[0.4em] py-4.5 rounded-xl transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)] mt-1 active:scale-[0.98]">
            {isSignUp ? 'INITIALIZE VAULT' : 'ENTER VAULT'}
          </button>

          <p className="text-center text-[12px] font-black uppercase tracking-widest text-zinc-400 mt-2">
            {isSignUp ? 'ACCESS ESTABLISHED?' : 'NEW TO UNSTRA?'}
            <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="ml-3 text-blue-400 hover:text-white transition-colors underline underline-offset-4 decoration-blue-500/50">
              {isSignUp ? 'LOG IN' : 'SIGN UP NOW'}
            </button>
          </p>

          {(params.message || params.error) && (
            <div className="mt-2">
              <p className={`p-3 rounded-xl text-[10px] font-black uppercase tracking-widest border italic text-center ${params.error ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                {params.message || params.error}
              </p>
            </div>
          )}
        </form>
      </motion.div>
    </div>
  )
}