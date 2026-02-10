"use client";

import React, { useEffect, useState, useLayoutEffect } from 'react';
import { Shield, LayoutDashboard, History, User, LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from 'framer-motion';

const supabase = createClient();

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setEmail(user.email);
    };
    fetchUser();
  }, []);

  // ARCHITECT FIX 1: Instant sidebar closure and scroll reset on route change
  useLayoutEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // ARCHITECT FIX 2: Prevent background scroll when menu is open on mobile
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isSidebarOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    /* h-[100dvh] ensures perfect fit on mobile browsers with shifting bars */
    <div className="flex h-[100dvh] bg-[#020202] overflow-hidden selection:bg-blue-500/30 font-sans">
      
      {/* ASIDE: THE COMMAND COLUMN */}
      <aside className={`
        fixed left-0 top-0 h-full w-72 border-r border-white/5 bg-[#050505] flex flex-col z-50 transition-transform duration-500 ease-in-out
        ${isSidebarOpen ? 'translate-x-0 shadow-[0_0_50px_rgba(0,0,0,0.9)]' : '-translate-x-full lg:translate-x-0'}
      `}>
        <button 
          onClick={() => setIsSidebarOpen(false)} 
          className="lg:hidden absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="p-8 pt-10 lg:pt-8">
          <Link href="/dashboard" className="flex items-center gap-3 mb-12 group">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_25px_rgba(37,99,235,0.4)] group-hover:scale-105 transition-all duration-500">
              <Shield className="text-white w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-[900] tracking-tighter text-white uppercase italic leading-none">UNSTRA</span>
              <span className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em] mt-1.5">Vault System</span>
            </div>
          </Link>

          <div className="px-4 py-3.5 mb-10 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-blue-400/90">Sensing Core Active</span>
          </div>

          <nav className="space-y-1.5">
            <p className="px-4 text-[9px] font-black text-zinc-700 uppercase tracking-[0.4em] mb-4 italic">System Command</p>
            <NavItem href="/dashboard" icon={<LayoutDashboard size={18} />} label="Personal Vault" active={pathname === '/dashboard'} />
            <NavItem href="/dashboard/audit-history" icon={<History size={18} />} label="Audit Ledger" active={pathname === '/dashboard/audit-history'} />
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-3 border-t border-white/5 bg-black/20">
          <div className="flex items-center gap-3 p-4 rounded-[24px] bg-white/[0.02] border border-white/5 group hover:border-white/10 transition-all overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center border border-white/10 shrink-0 group-hover:border-blue-500/30 transition-colors">
              <User size={16} className="text-zinc-500 group-hover:text-blue-500" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[10px] font-bold text-white truncate lowercase leading-tight">{email || 'session.active'}</span>
              <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mt-1 italic">Authorized Session</span>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-red-500 transition-all group">
            <LogOut size={12} className="group-hover:-translate-x-1 transition-transform" /> Terminate Session
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT: Force local scroll to stabilize mobile viewport */}
      <main className="flex-1 lg:ml-72 bg-[#020202] relative h-full overflow-y-auto overflow-x-hidden 
        scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        
        {/* ARCHITECT FIX 3: Trigger is now 'absolute' inside scrollable 'main' so it scrolls away */}
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden absolute top-6 left-6 z-[60] w-12 h-12 bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl active:scale-90 transition-all"
          >
            <Menu size={22} className="text-blue-500" />
          </button>
        )}

        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] fixed" />
        
        <div className="relative z-10 w-full min-h-full flex flex-col">
          {children}
        </div>
      </main>

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-md z-40"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link href={href} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-[11px] font-[900] uppercase tracking-tight transition-all ${active ? 'text-white bg-blue-600/10 border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.05)]' : 'text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent'}`}>
      <span className={active ? 'text-blue-500' : 'group-hover:text-blue-500 transition-colors'}>{icon}</span>
      {label}
    </Link>
  );
}