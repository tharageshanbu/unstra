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

  const [purgeConfirmation, setPurgeConfirmation] = useState<any | null>(null);

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
    if (isRedoing) return;
    setIsRedoing(audit.id);
    try {
      // 1. Reset UI to processing state
      await supabase.from('audits').update({ status: 'processing', risk_score: null }).eq('id', audit.id);
      
      // 2. Invoke Edge Function with PAID RERUN protocol
      await supabase.functions.invoke('contract-audit', {
        body: { 
          record: { id: audit.id, file_path: audit.file_path }, 
          retry_mode: true, 
          rerun_paid: true // ✅ Deducts 1 credit for completed records per your Edge Function logic
        }
      });
      
      await syncLedgerData(user.id);
    } catch (err) { 
      console.error("Redo Failed:", err); 
    } finally { 
      setIsRedoing(null); 
    }
  };

  const executePurge = async () => {
    if (!purgeConfirmation) return;
    const audit = purgeConfirmation;
    setIsDeleting(audit.id);

    try {
      const { error: storageError } = await supabase.storage.from('contracts').remove([audit.file_path]);
      if (storageError) throw new Error("Storage link could not be severed.");
      const { error: dbError } = await supabase.from('audits').delete().eq('id', audit.id);
      if (dbError) throw dbError;
      setAudits(prev => prev.filter(a => a.id !== audit.id));
      setPurgeConfirmation(null);
    } catch (err: any) {
      console.error("Purge Protocol Failed:", err.message);
    } finally {
      setIsDeleting(null);
    }
  };

  const getRiskStyles = (score: number | null, status: string) => {
    if (status !== 'completed' && status !== 'failed') return { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', fill: false };
    if (status === 'failed') return { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/40', fill: false };
    if (!score || score < 5) return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', fill: true };
    if (score < 8) return { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', fill: true };
    return { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/40', fill: true, glow: 'shadow-[0_0_20px_rgba(239,68,68,0.2)]' };
  };

  return (
    <main className="min-h-screen bg-[#020202] text-white selection:bg-blue-500/30 pb-24 overflow-x-hidden">
      
      <AnimatePresence>
        {purgeConfirmation && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-xl px-6">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md w-full p-10 bg-zinc-950 border border-red-500/20 rounded-[48px] text-center shadow-[0_0_100px_rgba(239,68,68,0.1)]"
            >
              <ShieldAlert size={48} className="text-red-500 mx-auto mb-8 animate-pulse" />
              <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-4 leading-none">Purge Protocol</h2>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed mb-10 px-4">
                Are you certain you want to <span className="text-red-500">permanently sever</span> the forensic link to "{purgeConfirmation.file_name}"? This action is irreversible.
              </p>
              <div className="flex flex-col gap-3">
                <button onClick={executePurge} disabled={!!isDeleting} className="w-full py-4 bg-red-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-red-500 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-2xl">
                  {isDeleting ? <Loader2 className="animate-spin" size={14} /> : "Authorize Purge"}
                </button>
                <button onClick={() => setPurgeConfirmation(null)} className="w-full py-4 text-zinc-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all">
                  Abort Protocol
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="p-6 lg:p-16 pt-36 lg:pt-16 max-w-7xl mx-auto relative z-10 text-left">
        <header className="flex flex-col gap-10 mb-16 lg:mb-20">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Zap size={14} className="text-blue-500 fill-blue-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 italic leading-none">Forensic Archive</span>
            </div>
            <h1 className="text-4xl lg:text-7xl font-black uppercase tracking-tighter italic leading-[0.85] text-white">
              Intelligence <br/> Ledger.
            </h1>
          </div>
          
          <div className="flex flex-col gap-4 w-full max-w-3xl">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSortBy(sortBy === 'date' ? 'risk' : sortBy === 'risk' ? 'status' : 'date')}
                className="h-11 px-6 bg-zinc-900 border border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:border-blue-500/40 transition-all flex items-center gap-3 shadow-xl text-zinc-400 hover:text-white"
              >
                <ArrowUpDown size={12} className="text-blue-500" /> 
                <span>Sort: {sortBy}</span>
              </button>
              <div className="h-11 px-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center">
                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                  {audits.length} Records
                </span>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Forensic Vault..." 
                className="h-14 bg-zinc-900 border border-white/5 rounded-2xl py-4 pl-14 pr-8 text-[11px] font-black uppercase tracking-widest outline-none focus:border-blue-500/40 w-full shadow-xl transition-all placeholder:text-zinc-700 text-white"
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
                  className={`group relative flex flex-col lg:flex-row lg:items-center justify-between p-5 lg:p-8 bg-zinc-950/50 backdrop-blur-md border border-white/5 rounded-[28px] lg:rounded-[32px] hover:border-blue-500/30 transition-all cursor-pointer shadow-2xl overflow-hidden`}
                >
                  <div className="flex items-center gap-4 lg:gap-6 flex-1 min-w-0">
                    <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center shrink-0 border relative transition-all ${styles.bg} ${styles.border} ${styles.glow}`}>
                      {audit.status === 'failed' ? (
                        <ShieldAlert className={`w-5 h-5 lg:w-6 lg:h-6 ${styles.color}`} />
                      ) : (
                        <>
                          {styles.fill && <div className={`absolute inset-3 rounded-lg ${styles.bg.replace('/10', '/40')} blur-[2px] opacity-50`} />}
                          <FileText className={`w-5 h-5 lg:w-6 lg:h-6 relative z-10 ${styles.color}`} strokeWidth={1.5} />
                        </>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[13px] lg:text-[15px] font-black uppercase italic tracking-tight text-zinc-100 truncate group-hover:text-blue-400 transition-colors" title={audit.file_name}>
                        {audit.file_name}
                      </h3>
                      <div className="flex items-center gap-2 lg:gap-3 mt-1 leading-none">
                        <span className="text-[8px] lg:text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                          {new Date(audit.created_at).toLocaleDateString().replace(/\//g, '.')}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-zinc-800" />
                        <span className="text-[8px] lg:text-[9px] font-black text-zinc-400 uppercase tracking-widest px-2 py-1 bg-zinc-900/50 rounded-md border border-zinc-800/50">
                          {audit.status === 'completed' ? (audit.detected_language || 'ENGLISH') : audit.status === 'failed' ? 'ERROR' : 'PENDING'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:flex items-center justify-between lg:justify-end gap-6 lg:gap-10 mt-6 lg:mt-0 pt-5 lg:pt-0 border-t lg:border-t-0 border-white/5">
                    <div className="text-left lg:text-right lg:px-6 lg:border-r lg:border-white/5 lg:w-28 shrink-0">
                      <p className="text-[7px] lg:text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1 leading-none">Risk Factor</p>
                      <span className={`text-xs lg:text-sm font-black tabular-nums ${styles.color}`}>
                        {audit.status === 'completed' ? `${audit.risk_score || 0}/10` : audit.status === 'failed' ? 'ERROR' : 'SENSING'}
                      </span>
                    </div>

                    <div className="flex items-center justify-end lg:justify-start gap-2 lg:gap-3 lg:min-w-[100px] shrink-0">
                      <div className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full ${
                        audit.status === 'completed' 
                          ? 'bg-emerald-500 shadow-[0_0_100px_rgba(16,185,129,0.5)]' 
                          : audit.status === 'failed' 
                            ? 'bg-red-500 shadow-[0_0_100px_rgba(239,68,68,0.5)]' 
                            : 'bg-blue-500 animate-pulse'
                      }`} />
                      <span className={`text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${
                        audit.status === 'completed' ? 'text-emerald-500' : audit.status === 'failed' ? 'text-red-500' : 'text-blue-500'
                      }`}>
                        {audit.status === 'completed' ? 'SECURED' : audit.status === 'failed' ? 'FAILED' : 'SENSING'}
                      </span>
                    </div>

                    <div className="col-span-2 lg:col-span-1 flex items-center justify-end gap-2 lg:gap-3 lg:min-w-[90px] shrink-0">
                      {/* ✅ REFINED REDO LOGIC: Visible for completed/failed. Hidden while sensing. */}
                      {(audit.status === 'completed' || audit.status === 'failed') && (
                        <button onClick={(e) => { e.stopPropagation(); handleRedo(e, audit); }} disabled={!!isRedoing} className="p-2.5 lg:p-3 bg-blue-500/5 hover:bg-blue-500 hover:text-white rounded-xl text-blue-500 transition-all border border-blue-500/10 shadow-lg disabled:opacity-30 disabled:cursor-not-allowed">
                          {isRedoing === audit.id ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                        </button>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); setPurgeConfirmation(audit); }} disabled={isDeleting === audit.id} className="p-2.5 lg:p-3 bg-red-500/5 hover:bg-red-500 hover:text-white rounded-xl text-red-500 transition-all border border-red-500/10 shadow-lg">
                        {isDeleting === audit.id ? <Loader2 size={14} className="animate-spin text-white" /> : <Trash2 size={14} />}
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