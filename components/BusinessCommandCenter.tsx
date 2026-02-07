"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Zap, Users, TrendingUp, 
  ArrowRight, Building2, Activity, PlusSquare 
} from 'lucide-react';
import { createClient } from "@/lib/supabase/client";
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import InviteLinkGenerator from "./InviteLinkGenerator";

const supabase = createClient();

export default function BusinessCommandCenter({ org, role, user }: { org: any, role: string, user: any }) {
  const router = useRouter();
  const [stats, setStats] = useState({ totalValue: "$0", highRisk: 0, totalAudits: 0 });
  const [teamAudits, setTeamAudits] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrgIntelligence = async () => {
      const { data } = await supabase
        .from('audits')
        .select('*')
        .eq('organization_id', org.id)
        .order('created_at', { ascending: false });

      if (data) {
        setTeamAudits(data);
        const highRiskCount = data.filter(a => (a.risk_score || 0) > 7).length;
        const total = data.reduce((acc, curr) => acc + (parseFloat(curr.contract_value?.replace(/[^0-9.]/g, '')) || 0), 0);

        setStats({
          totalValue: total > 0 ? `$${(total / 1000000).toFixed(1)}M` : "$0",
          highRisk: highRiskCount,
          totalAudits: data.length
        });
      }
    };
    
    if (org?.id) fetchOrgIntelligence();
    
    const channel = supabase.channel(`org-sync-${org.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'audits', filter: `organization_id=eq.${org.id}` }, 
      () => fetchOrgIntelligence())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [org.id]);

  return (
    /* REMOVED min-h-screen to let it grow naturally for scrolling */
    <div className="p-10 max-w-7xl mx-auto text-left pb-24">
      {/* 1. ENTERPRISE HEADER - Brighter Forensic Styling */}
      <div className="flex justify-between items-end mb-12">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <Activity size={14} className="text-blue-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 italic">Corporate Command Center</span>
          </div>
          <h1 className="text-5xl font-black uppercase tracking-tighter text-white italic leading-none">
            {org.name} <span className="text-zinc-800">Workspace</span>
          </h1>
        </motion.div>
        
        <div className="flex gap-4">
            <button className="bg-zinc-900 border border-white/10 text-white px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all">
              Team Settings
            </button>
            <button 
              onClick={() => router.push('/dashboard/audit-history')} 
              className="bg-blue-600 text-white px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:bg-blue-500 transition-all flex items-center gap-3"
            >
              <PlusSquare size={16} /> New Org Audit
            </button>
        </div>
      </div>

      {/* 2. SHARED METRIC HEATMAP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-zinc-900/40 border border-white/10 p-8 rounded-[40px] relative overflow-hidden group">
          <p className="text-[11px] font-black text-zinc-300 uppercase tracking-widest mb-2">Total Managed Value</p>
          <p className="text-4xl font-black text-white tracking-tighter tabular-nums">{stats.totalValue}</p>
          <TrendingUp className="absolute bottom-6 right-8 text-blue-500/10 group-hover:text-blue-500/30 transition-all duration-700" size={56}/>
        </div>
        
        <div className={`border p-8 rounded-[40px] relative overflow-hidden group transition-all duration-500 ${stats.highRisk > 0 ? 'bg-red-500/5 border-red-500/20' : 'bg-zinc-900/40 border-white/10'}`}>
          <p className={`text-[11px] font-black uppercase tracking-widest mb-2 ${stats.highRisk > 0 ? 'text-red-500' : 'text-zinc-300'}`}>Critical Exposure</p>
          <p className="text-4xl font-black text-white tracking-tighter tabular-nums">{stats.highRisk} <span className="text-sm font-bold text-zinc-500 italic">Alerts</span></p>
          <ShieldAlert className={`absolute bottom-6 right-8 transition-colors ${stats.highRisk > 0 ? 'text-red-500/20 animate-pulse' : 'text-zinc-800'}`} size={56}/>
        </div>

        <div className="bg-zinc-900/40 border border-white/10 p-8 rounded-[40px] relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-black text-zinc-300 uppercase tracking-widest">Workspace Credits</p>
            <Zap size={14} className="text-blue-500 fill-blue-500" />
          </div>
          <p className="text-4xl font-black text-white tracking-tighter tabular-nums">{org.credits || 0}</p>
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-1">Sovereign Points Remaining</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* 3. TEAM INTELLIGENCE FEED */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-[#050505] border border-white/10 rounded-[48px] p-10 shadow-2xl relative min-h-[500px]">
            <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6">
              <h3 className="text-xs font-black text-zinc-200 uppercase tracking-[0.4em]">Forensic Feed</h3>
              <button onClick={() => router.push('/dashboard/audit-history')} className="text-[10px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2 transition-all group">
                Full Ledger <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="space-y-4">
              {teamAudits.length > 0 ? teamAudits.map((audit) => (
                <div 
                  key={audit.id} 
                  onClick={() => router.push(`/dashboard/audit/${audit.id}`)} 
                  className="group flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-[32px] hover:bg-white/[0.04] hover:border-blue-500/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-6">
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
                       (audit.risk_score || 0) > 7 ? 'bg-red-500/10 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'bg-zinc-900 border-white/10 group-hover:border-blue-500/50'
                     }`}>
                        <Zap size={18} className={(audit.risk_score || 0) > 7 ? 'text-red-500' : 'text-blue-400'} />
                     </div>
                     <div className="min-w-0">
                       <p className="text-sm font-black text-white uppercase truncate tracking-tight group-hover:text-blue-400 transition-colors">{audit.file_name}</p>
                       <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">
                         <span className="text-zinc-100 font-black">{new Date(audit.created_at).toLocaleDateString().replace(/\//g, '.')}</span> 
                         <span className="mx-2 text-zinc-800">•</span> 
                         <span className="italic">TEAM SECURED</span>
                       </p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className={`text-sm font-black tabular-nums ${(audit.risk_score || 0) > 7 ? 'text-red-500' : 'text-blue-400'}`}>
                       {audit.risk_score ? `${audit.risk_score}/10` : 'SENSING'}
                     </p>
                     <p className="text-[8px] font-black text-zinc-600 uppercase tracking-tighter">Forensic Score</p>
                  </div>
                </div>
              )) : (
                <div className="py-32 text-center">
                  <Activity size={48} className="mx-auto text-zinc-900 mb-6 opacity-20" />
                  <p className="text-zinc-600 font-black uppercase tracking-[0.5em] italic text-[10px]">No Team Intelligence Detected</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. SECURITY & INVITE CONTROLS */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {(role === 'admin' || role === 'manager') && (
            <InviteLinkGenerator orgId={org.id} />
          )}

          <div className="bg-zinc-900/40 border border-white/10 p-8 rounded-[40px] relative overflow-hidden">
            <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-8 italic">Security Context</h4>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                  <Building2 size={20}/>
                </div>
                <div>
                  <p className="text-[8px] font-black text-zinc-600 uppercase mb-0.5">Active Entity</p>
                  <p className="text-xs font-black text-white uppercase tracking-tight">{org.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/20">
                  <Users size={20}/>
                </div>
                <div>
                  <p className="text-[8px] font-black text-zinc-600 uppercase mb-0.5">Session Role</p>
                  <p className="text-xs font-black text-white uppercase tracking-tight capitalize">{role}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-[32px] border border-blue-500/20 bg-blue-500/5 relative group overflow-hidden">
             <div className="absolute -right-4 -bottom-4 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-700">
                <Building2 size={120} />
             </div>
             <div className="flex items-center gap-3 mb-3 relative z-10">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,1)]" />
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Enterprise Sensing Active</span>
             </div>
             <p className="text-[11px] text-zinc-400 font-bold leading-relaxed tracking-tight italic relative z-10">
               All intelligence extracted in this workspace is governed by {org.name} cryptographic isolation protocols.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}