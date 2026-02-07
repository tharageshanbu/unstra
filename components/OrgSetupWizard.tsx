"use client";

import React, { useState } from 'react';
import { createClient } from "@/lib/supabase/client";
import { Building2, Users, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

const supabase = createClient();

export default function OrgSetupWizard({ user, onComplete }: { user: any, onComplete: () => void }) {
  const [orgName, setOrgName] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);

  const handleCreateOrg = async () => {
    if (!orgName || !user) return;
    setIsDeploying(true);

    try {
      // 1. Create the Organization
      const { data: org, error: orgErr } = await supabase
        .from('organizations')
        .insert({ name: orgName, tier: 'business' })
        .select()
        .single();

      if (orgErr) throw orgErr;

      // 2. Create the Admin Membership for the CEO
      const { error: memErr } = await supabase
        .from('memberships')
        .insert({
          organization_id: org.id,
          user_id: user.id,
          role: 'admin'
        });

      if (memErr) throw memErr;

      onComplete(); // Refresh the dashboard to show BusinessCommandCenter
    } catch (err: any) {
      console.error("Setup Failed:", err.message);
      setIsDeploying(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
      <div className="max-w-xl w-full bg-[#0A0A0A] border border-white/5 rounded-[48px] p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full" />
        
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-blue-500/20">
            <Building2 className="text-blue-500 w-10 h-10" />
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-4 uppercase tracking-tight">Establish Workspace</h2>
          <p className="text-zinc-500 mb-10 text-sm leading-relaxed">
            Transition from Solo Audits to Enterprise Intelligence. Create a shared environment for your Leads and Managers.
          </p>

          <div className="space-y-6 text-left mb-10">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <ShieldCheck className="text-blue-500 mt-1" size={18} />
              <div>
                <p className="text-xs font-bold text-zinc-200 uppercase tracking-widest">Managing Partner Oversight</p>
                <p className="text-[11px] text-zinc-500">Aggregate risk scores across all team members in one heatmap.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <Users className="text-purple-500 mt-1" size={18} />
              <div>
                <p className="text-xs font-bold text-zinc-200 uppercase tracking-widest">Shared Playbooks</p>
                <p className="text-[11px] text-zinc-500">Standardize negotiation scripts for your entire legal and sales team.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <input 
              type="text"
              placeholder="Organization Name (e.g. Reon Homes)"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:border-blue-500/50 transition-all"
            />
            
            <button 
              onClick={handleCreateOrg}
              disabled={!orgName || isDeploying}
              className="w-full bg-white text-black py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all disabled:opacity-50"
            >
              {isDeploying ? <Loader2 className="animate-spin" size={16} /> : "Initialize Workspace"} <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}