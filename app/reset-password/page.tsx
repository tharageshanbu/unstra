// app/reset-password/page.tsx
'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from "@/lib/supabase/client"
import { Shield, ArrowLeft, Mail } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/settings/password`,
    })
    setLoading(false)
    setMessage(error ? error.message : "Recovery link dispatched to your vault email.")
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-sm z-10 text-center">
        <button onClick={() => router.push('/login')} className="inline-flex items-center gap-2 mb-10 text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft size={14} /><span className="text-[10px] font-black uppercase tracking-[0.3em]">Back to Login</span>
        </button>
        <Shield size={40} className="text-blue-600 mx-auto mb-6" />
        <h1 className="text-3xl font-black uppercase tracking-tighter italic mb-2">Vault <span className="text-blue-600">Recovery.</span></h1>
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-10">Authorize Intelligence Link</p>
        
        <form onSubmit={handleReset} className="space-y-6">
          <div className="space-y-2 text-left">
            <label className="text-[11px] font-black text-white uppercase tracking-widest ml-1 italic">Primary Email</label>
            <input 
              className="w-full rounded-2xl px-5 py-4 bg-zinc-900 border border-white/10 focus:border-blue-500 outline-none transition-all font-bold" 
              type="email" placeholder="name@email.com" required value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button disabled={loading} className="w-full bg-blue-600 py-4.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
            {loading ? 'Dispatching...' : 'Dispatch Recovery Link'}
          </button>
          {message && <p className="p-4 bg-blue-500/5 text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-500/10 italic">{message}</p>}
        </form>
      </motion.div>
    </div>
  )
}