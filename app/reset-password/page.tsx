'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClient } from "@/lib/supabase/client"
import { Shield, ArrowLeft, Mail, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setFeedback(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // Must match your Supabase Redirect Whitelist
      redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/settings/password`,
    })

    setLoading(false)
    if (error) {
      setFeedback({ type: 'error', msg: error.message })
    } else {
      setFeedback({ type: 'success', msg: "Recovery protocol initiated. Check your primary inbox." })
    }
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white flex items-center justify-center px-6 selection:bg-blue-500/30 overflow-hidden font-sans">
      <div className="fixed inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-[410px] z-10 text-center py-4">
        <button 
          onClick={() => router.push('/login')} 
          className="inline-flex items-center gap-2 mb-10 px-4 py-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-blue-500 transition-all group"
        >
          <ArrowLeft size={14} className="text-zinc-500 group-hover:text-blue-400 transition-transform group-hover:-translate-x-1" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 group-hover:text-white">Back to Login</span>
        </button>

        <div className="flex flex-col items-center gap-5 mb-10">
          <div className="w-14 h-14 bg-blue-600 rounded-[22px] flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.2)] border border-blue-400/30">
            <Shield size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-[900] uppercase tracking-tighter italic leading-none mb-2 text-white">
              Vault <span className="text-blue-600">Recovery.</span>
            </h1>
            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] italic">
              Authorize Intelligence Link
            </p>
          </div>
        </div>
        
        <form onSubmit={handleReset} className="space-y-6">
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2 ml-1">
              <Mail size={13} className="text-blue-500" />
              <label className="text-[12px] font-black text-white uppercase tracking-[0.2em] italic">Primary Email</label>
            </div>
            <input 
              className="w-full rounded-2xl px-5 py-4 bg-zinc-900 border border-white/20 focus:border-blue-500 focus:bg-black outline-none transition-all font-bold text-sm placeholder:text-zinc-600" 
              type="email" 
              placeholder="name@email.com" 
              required 
              value={email} 
              onChange={(e) => { setEmail(e.target.value); setFeedback(null); }}
            />
          </div>

          <button 
            disabled={loading} 
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-[900] text-[12px] uppercase tracking-[0.4em] py-4.5 rounded-xl transition-all shadow-[0_0_30px_rgba(37,99,235,0.2)] active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Dispatch Recovery Link'}
          </button>

          {feedback && (
            <motion.p 
              initial={{ opacity: 0, y: 5 }} 
              animate={{ opacity: 1, y: 0 }}
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