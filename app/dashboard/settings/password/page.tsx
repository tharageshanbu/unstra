// app/dashboard/settings/password/page.tsx
'use client'

import React, { useState } from 'react'
import { createClient } from "@/lib/supabase/client"
import { Shield, Lock, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const supabase = createClient()

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (!error) setDone(true)
  }

  if (done) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <CheckCircle size={48} className="text-emerald-500 mb-6" />
      <h1 className="text-2xl font-black uppercase tracking-tighter italic">Vault Secured.</h1>
      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-2">Credentials updated successfully.</p>
      <button onClick={() => window.location.href = '/dashboard'} className="mt-8 bg-zinc-900 border border-white/10 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-emerald-500 transition-all">Enter Dashboard</button>
    </div>
  )

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Shield size={40} className="text-blue-600 mx-auto mb-6" />
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">New <span className="text-blue-600">Protocol.</span></h1>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Update Vault Credentials</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 ml-1">
              <Lock size={13} className="text-blue-500" />
              <label className="text-[12px] font-black uppercase tracking-widest italic">New Password</label>
            </div>
            <input 
              required minLength={6} type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none transition-all font-bold"
              placeholder="••••••••"
            />
          </div>
          <button disabled={loading} className="w-full bg-blue-600 py-4.5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-lg shadow-blue-600/20">
            {loading ? 'SENSING...' : 'CONFIRM NEW CREDENTIALS'}
          </button>
        </form>
      </motion.div>
    </main>
  )
}