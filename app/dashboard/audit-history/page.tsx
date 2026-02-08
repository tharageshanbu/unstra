"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from "@/lib/supabase/client";
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Search, Zap, Trash2, Loader2, 
  RotateCcw, ArrowUpDown, ShieldAlert, ShieldCheck, PlusSquare 
} from 'lucide-react';

const supabase = createClient();

export default function AuditHistory() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [audits, setAudits] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isRedoing, setIsRedoing] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'risk' | 'status'>('date');

  const syncLedgerData = useCallback(async (userId: string) => {
    const { data: auditsRes } = await supabase.from('audits').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (auditsRes) setAudits(auditsRes);
    setLoading(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: { user: activeUser } } = await supabase.auth.getUser();
      if (!activeUser) { router.push('/login'); return; }
      setUser(activeUser);
      syncLedgerData(activeUser.id);

      const channel = supabase.channel(`ledger-realtime-${activeUser.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'audits', filter: `user_id=eq.${activeUser.id}` }, () => syncLedgerData(activeUser.id))
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    };
    init();
  }, [router, syncLedgerData]);

  const processedAudits = useMemo(() => {
    let filtered = audits.filter(a => a.file_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return [...filtered].sort((a, b) => {
      if (sortBy === 'risk') return (b.risk_score || 0) - (a.risk_score || 0);
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [audits, searchQuery, sortBy]);

  const handleRedo = async (e: React.MouseEvent, audit: any) => {
    e.stopPropagation();
    setIsRedoing(audit.id);
    try {
      await supabase.from('audits').update({ status: 'processing', risk_score: null }).eq('id', audit.id);
      await supabase.functions.invoke('contract-audit', {
        body: { record: { id: audit.id, file_path: audit.file_path }, retry_mode: true, bypass_billing: true }
      });
      await syncLedgerData(user.id);
    } catch (err) { console.error("Redo Failed:", err); } finally { setIsRedoing(null); }
  };

  const handleDelete = async (e: React.MouseEvent, audit: any) => {
    e.stopPropagation();
    if (!confirm(`PERMANENTLY PURGE "${audit.file_name}" FROM VAULT?`)) return;
    setIsDeleting(audit.id);
    try {
      await supabase.storage.from('contracts').remove([audit.file_path]);
      await supabase.from('audits').delete().eq('id', audit.id);
      setAudits(prev => prev.filter(a => a.id !== audit.id));
    } catch (err: any) { console.error("Purge Failed:", err.message); } finally { setIsDeleting(null); }
  };

  const getRiskStyles = (score: number | null, status: string) => {
    // MODIFIED: Logic synchronized with SoloVault fallback pattern
    if (status !== 'completed' && status !== 'failed') return { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', fill: false };
    if (status === 'failed') return { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/40', fill: false };
    if (!score || score < 5) return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', fill: true };
    if (score < 8) return { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', fill: true };
    return { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/40', fill: true, glow: 'shadow-[0_0_20px_rgba(239,68,68,0.2)]' };
  };

  return (
    <main className="min-h-screen bg-[#020202] text-white selection:bg-blue-500/30 pb-24 overflow-x-hidden">
      <div className="p-6 lg:p-16 pt-36 lg:pt-16 max-w-7xl mx-auto relative z-10 text-left">
        <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 mb-20">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Zap size={14} className="text-blue-500 fill-blue-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 italic leading-none">Forensic Archive</span>
            </div>
            <h1 className="text-4xl lg:text-7xl font-black uppercase tracking-tighter italic leading-[0.85]">
              Intelligence <br/> Ledger.
            </h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
            <button onClick={() => setSortBy(sortBy === 'date' ? 'risk' : sortBy === 'risk' ? 'status' : 'date')}
              className="px-6 py-4 bg-zinc-900 border border-white/5 rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] hover:border-blue-500/40 transition-all flex items-center gap-3 shadow-xl">
              <ArrowUpDown size={14} className="text-blue-500" /> Sort: {sortBy}
            </button>

            <div className="relative flex-1 xl:w-72 mt-2 xl:mt-0">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Ledger..." 
                className="bg-zinc-900 border border-white/5 rounded-[24px] py-4 pl-14 pr-8 text-[11px] font-black uppercase tracking-widest outline-none focus:border-blue-500/40 w-full shadow-xl"
              />
            </div>
          </div>
        </header>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {processedAudits.map((audit) => {
              const styles = getRiskStyles(audit.risk_score, audit.status);
              return (
                <motion.div key={audit.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}
                  onClick={() => router.push(`/dashboard/audit/${audit.id}`)}
                  className={`group relative flex flex-col md:flex-row md:items-center justify-between p-6 lg:p-8 bg-zinc-950/50 backdrop-blur-md border border-white/5 rounded-[32px] hover:border-blue-500/30 transition-all cursor-pointer shadow-2xl overflow-hidden`}
                >
                  <div className="flex items-center gap-6 flex-1 min-w-0">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border relative transition-all ${styles.bg} ${styles.border} ${styles.glow}`}>
                      {audit.status === 'failed' ? (
                        <ShieldAlert className={`w-6 h-6 ${styles.color}`} />
                      ) : (
                        <>
                          {styles.fill && <div className={`absolute inset-3 rounded-lg ${styles.bg.replace('/10', '/40')} blur-[2px] opacity-50`} />}
                          <FileText className={`w-6 h-6 relative z-10 ${styles.color}`} strokeWidth={1.5} />
                        </>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[15px] font-black uppercase italic tracking-tight text-zinc-100 truncate group-hover:text-blue-400 transition-colors" title={audit.file_name}>
                        {audit.file_name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1.5 leading-none">
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                          {new Date(audit.created_at).toLocaleDateString().replace(/\//g, '.')}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-zinc-800" />
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest px-2 py-1 bg-zinc-900/50 rounded-md border border-zinc-800/50">
                          {/* MODIFIED: Catch-all logic matching SoloVault */}
                          {audit.status === 'completed' ? (audit.detected_language || 'ENGLISH') : audit.status === 'failed' ? 'ERROR' : 'PENDING'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-10 mt-6 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 border-white/5">
                    <div className="text-center md:text-right px-6 border-r border-white/5 w-28 shrink-0">
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1 leading-none">Risk Factor</p>
                      <span className={`text-sm font-black tabular-nums ${styles.color}`}>
                        {/* MODIFIED: Explicit completed check prevents stuck sensing */}
                        {audit.status === 'completed' ? `${audit.risk_score || 0}/10` : audit.status === 'failed' ? 'ERROR' : 'SENSING'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 min-w-[100px] shrink-0">
                      {/* MODIFIED: Dot color logic pulled from SoloVault */}
                      <div className={`w-2 h-2 rounded-full ${
                        audit.status === 'completed' 
                          ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' 
                          : audit.status === 'failed' 
                            ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' 
                            : 'bg-blue-500 animate-pulse'
                      }`} />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${
                        audit.status === 'completed' ? 'text-emerald-500' : audit.status === 'failed' ? 'text-red-500' : 'text-blue-500'
                      }`}>
                        {/* MODIFIED: Direct string mapping from SoloVault */}
                        {audit.status === 'completed' ? 'SECURED' : audit.status === 'failed' ? 'FAILED' : 'SENSING'}
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-3 min-w-[90px] shrink-0">
                      {audit.status !== 'completed' && (
                        <button onClick={(e) => { e.stopPropagation(); handleRedo(e, audit); }} disabled={isRedoing === audit.id} className="p-3 bg-blue-500/5 hover:bg-blue-500 hover:text-white rounded-xl text-blue-500 transition-all border border-blue-500/10 shadow-lg" title="Initiate Redo Protocol">
                          {isRedoing === audit.id ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
                        </button>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(e, audit); }} disabled={isDeleting === audit.id} className="p-3 bg-red-500/5 hover:bg-red-500 hover:text-white rounded-xl text-red-500 transition-all border border-red-500/10 shadow-lg" title="Purge Document">
                        {isDeleting === audit.id ? <Loader2 size={16} className="animate-spin text-white" /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {processedAudits.length === 0 && !loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-32 text-center border-2 border-dashed border-white/5 rounded-[48px]">
              <ShieldCheck className="w-16 h-16 text-zinc-800 mx-auto mb-6 opacity-20" />
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] italic mb-8">Intelligence Ledger Empty.</p>
              <button onClick={() => router.push('/dashboard')} className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-2xl active:scale-95 group">
                 <PlusSquare size={16} className="group-hover:rotate-90 transition-transform duration-500" />
                 Initialize New Sensing
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </main> 
  );
}