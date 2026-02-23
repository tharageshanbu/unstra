"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Upload, Zap, MessageSquare, Activity, Loader2, FileText, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import { createClient } from "@/lib/supabase/client";
import { useRouter } from 'next/navigation';

const supabase = createClient();

// --- PREMIUM SENSING OVERLAY ---
function SensingOverlay({ fileName, onComplete }: { fileName: string, onComplete: () => void }) {
  const [currentPoint, setCurrentPoint] = useState(0);

  const SENSING_POINTS = [
    "Initializing Unstra Risk Engine...",
    "Extracting Vital Stats & Entities...",
    "Identifying Governing Law...",
    "Sensing Liability Caps...",
    "Auditing Ownership Structural Spans...",
    "Checking Forensic Continuity...",
    "Finalizing Forensic Score..."
  ];

  useEffect(() => {
    if (currentPoint < SENSING_POINTS.length) {
      const timer = setTimeout(() => setCurrentPoint(prev => prev + 1), 1200);
      return () => clearTimeout(timer);
    } else {
      const finishTimer = setTimeout(onComplete, 1000);
      return () => clearTimeout(finishTimer);
    }
  }, [currentPoint, onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-3xl px-6 text-white">
      <div className="max-w-md w-full p-10 text-center bg-zinc-950/50 border border-white/5 rounded-[48px] shadow-[0_0_100px_rgba(37,99,235,0.1)]">
        <div className="relative inline-block mb-12">
          <div className="absolute inset-0 bg-blue-500/20 blur-[60px] rounded-full animate-pulse" />
          <div className="relative w-28 h-28 bg-zinc-900 border border-white/10 rounded-[35px] flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" strokeWidth={1} />
            <div className="absolute inset-0 border border-blue-500/20 rounded-[35px] animate-ping duration-[3000ms]" />
          </div>
        </div>
        <h2 className="text-2xl font-black tracking-tighter mb-2 uppercase italic leading-none">Forensic Sensing</h2>
        <p className="text-zinc-500 text-[9px] mb-12 truncate px-4 font-mono uppercase tracking-[0.3em]">{fileName}</p>
        <div className="space-y-5 text-left border-l border-white/10 ml-6">
          {SENSING_POINTS.map((point, index) => (
            <div key={index} className={`flex items-center gap-5 transition-all duration-700 ml-[-9px] ${index === currentPoint ? 'opacity-100 scale-105' : index < currentPoint ? 'opacity-30' : 'opacity-0'}`}>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors duration-500 ${index < currentPoint ? 'bg-emerald-500 border-emerald-500' : index === currentPoint ? 'border-blue-500 animate-pulse' : 'border-zinc-800'}`}>
                {index < currentPoint && <CheckCircle2 size={10} className="text-black" strokeWidth={4} />}
              </div>
              <span className={`text-[10px] font-black tracking-widest uppercase ${index === currentPoint ? 'text-blue-400' : 'text-zinc-500'}`}>{point}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SoloVault({ user }: { user: any }) {
  const router = useRouter();
  const [credits, setCredits] = useState(0);
  const [recentAudits, setRecentAudits] = useState<any[]>([]);
  const [isSensing, setIsSensing] = useState(false);
  const [activeFileName, setActiveFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");

  const isProcessingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    if (!user?.id) return;
    const [profileRes, auditsRes] = await Promise.all([
      supabase.from('profiles').select('credits').eq('id', user.id).single(),
      supabase.from('audits').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5)
    ]);
    if (profileRes.data) setCredits(profileRes.data.credits);
    if (auditsRes.data) setRecentAudits(auditsRes.data);
  };

  useEffect(() => {
    if (user?.id) {
      fetchData();
      const channel = supabase.channel(`vault-realtime-${user.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'audits', filter: `user_id=eq.${user.id}` }, () => fetchData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, () => fetchData())
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [user?.id]);

  const handleUpload = async (file: File) => {
    if (isProcessingRef.current || credits < 1) return;
    setUploadError("");

    if (file.size > 25 * 1024 * 1024) {
      setUploadError("FILE EXCEEDS 25MB SOVEREIGN LIMIT.");
      return;
    }

    const allowedTypes = ['application/pdf'];
    const isPdfByMime = allowedTypes.includes(file.type);
    const isPdfByExt = file.name.toLowerCase().endsWith('.pdf');

    if (!isPdfByMime && !isPdfByExt) {
      setUploadError("UNSUPPORTED FORMAT. UPLOAD PDF ONLY.");
      return;
    }

    isProcessingRef.current = true;
    setActiveFileName(file.name);
    setIsSensing(true);

    try {
      const sanitizeFileName = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9.]/g, '_').replace(/_{2,}/g, '_');    
      };

      const safeName = sanitizeFileName(file.name);
      const filePath = `${user.id}/${crypto.randomUUID()}-${safeName}`;

      const uploadRes = await supabase.storage.from('contracts').upload(filePath, file);
      if (uploadRes.error) throw uploadRes.error;

      const { data: auditData, error: insertError } = await supabase.from('audits').insert({
        user_id: user.id, file_name: file.name, file_path: filePath, status: 'processing'
      }).select().single();

      if (insertError) throw insertError;

      const invokeRes = await supabase.functions.invoke('contract-audit', { body: { record: auditData } });
      if (invokeRes.error) throw invokeRes.error;

    } catch (e: any) {
      setUploadError(e?.message ? `PROTOCOL FAILURE: ${e.message}` : "UPLOAD FAILED. RETRY PROTOCOL.");
      setIsSensing(false);
      isProcessingRef.current = false;
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'completed': return { text: 'SECURED', color: 'text-emerald-500' };
      case 'failed': return { text: 'FAILED', color: 'text-red-500' };
      default: return { text: 'SENSING...', color: 'text-blue-500 animate-pulse' };
    }
  };

  const getRiskStyles = (score: number | null, status: string) => {
    if (status === 'failed') return 'text-red-500 border-red-500/30 bg-red-500/10';
    if (!score) return 'text-blue-500 border-blue-500/20 bg-blue-500/5';
    if (score >= 8) return 'text-red-500 border-red-500/30 bg-red-500/10';
    if (score >= 5) return 'text-orange-500 border-orange-500/30 bg-orange-500/5';
    return 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10';
  };

  const getScoreColor = (score: number | null, status: string) => {
    if (status === 'failed') return 'text-red-500';
    if (status === 'processing') return 'text-blue-500 animate-pulse';
    if (!score) return 'text-zinc-500';
    if (score >= 8) return 'text-red-500';
    if (score >= 5) return 'text-orange-500';
    return 'text-emerald-500';
  };

  return (
    <div className="flex flex-col xl:flex-row w-full bg-[#020202] min-h-screen text-white overflow-x-hidden">
      
      {isSensing && (
        <SensingOverlay
          fileName={activeFileName}
          onComplete={() => {
            setIsSensing(false);
            isProcessingRef.current = false;
            router.push('/dashboard/audit-history');
          }}
        />
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
        className="hidden"
        accept="application/pdf,.pdf"
      />

      <main
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.[0]) handleUpload(e.dataTransfer.files[0]); }}
        className="relative flex-none xl:flex-1 flex flex-col items-center justify-center p-6 lg:p-12 min-h-dvh xl:min-h-0 xl:h-full overflow-hidden"
      >
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="text-center mb-8 lg:mb-10 relative z-10">
          <div className="flex items-center justify-center gap-3 mb-4 lg:mb-5">
            <Zap size={14} className="text-blue-500 fill-blue-500 animate-pulse" />
            <span className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.4em] italic text-nowrap">Intelligence Protocol v1.0</span>
          </div>
          <h2 className="text-4xl lg:text-[5rem] font-[900] text-white uppercase tracking-tighter italic leading-[0.9]">
            Sovereign <br className="lg:hidden" /> Interface.
          </h2>
        </div>

        {/* ✅ DYNAMIC UPLOAD BOX (LOCKS DOWN IF 0 CREDITS) */}
        <div
          onClick={() => !isProcessingRef.current && credits > 0 && fileInputRef.current?.click()}
          className={`w-full max-w-lg aspect-[4/3] lg:aspect-[16/10] bg-[#070707] border-2 rounded-[40px] lg:rounded-[64px] flex flex-col items-center justify-center relative group transition-all duration-700 shadow-2xl overflow-hidden ${
            credits < 1 
              ? 'border-red-500/20 grayscale cursor-not-allowed opacity-50' 
              : isDragging ? 'border-blue-500 bg-blue-500/5 scale-[1.02] cursor-pointer' 
              : 'border-white/5 hover:border-blue-500/30 cursor-pointer'
          }`}
        >
          <div className="relative mb-5 lg:mb-10 text-center">
            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full scale-0 group-hover:scale-110 transition-transform duration-700 opacity-0 group-hover:opacity-100" />
            <Upload size={40} className={`mx-auto transition-all duration-500 ${credits < 1 ? 'text-zinc-800' : 'text-zinc-600 group-hover:text-blue-400'}`} />
          </div>
          
          <h3 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-tighter mb-4 italic leading-none">
            {credits < 1 ? 'Vault Locked' : 'Initialize Audit'}
          </h3>

          <div className="text-center px-8 mb-4 lg:mb-6">
            <p className={`text-[10px] font-black tracking-[0.3em] uppercase font-mono mb-2 ${credits < 1 ? 'text-red-500/50' : 'text-blue-400'}`}>
              [ SENSING ENGINE: {credits < 1 ? 'INACTIVE' : 'OPERATIONAL'} ]
            </p>
            
            {uploadError ? (
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-red-400 animate-pulse">
                {uploadError}
              </p>
            ) : credits < 1 ? (
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-red-500/60 italic">
                Insufficient Intelligence Credits.
              </p>
            ) : (
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 opacity-70">
                PDF ONLY • MAX 25MB
              </p>
            )}
          </div>

          <button 
            disabled={credits < 1}
            className={`px-12 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-2xl ${
              credits < 1 
                ? 'bg-zinc-900 text-zinc-600 border border-white/5' 
                : 'bg-white text-black hover:bg-blue-600 hover:text-white active:scale-95'
            }`}
          >
            {credits < 1 ? 'Top Up Required' : 'Select Document'}
          </button>
        </div>
      </main>

      <aside className="w-full xl:w-[380px] border-t xl:border-t-0 xl:border-l border-white/5 p-8 lg:p-12 flex flex-col bg-[#050505] z-10 min-h-dvh xl:min-h-0">
        <div className="flex items-center gap-3 mb-10 border-b border-white/10 pb-8 shrink-0">
          <Activity size={16} className="text-blue-500 animate-pulse" />
          <span className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-200 italic font-sans">Vault Status</span>
        </div>
        <div className="bg-zinc-900/60 border border-white/10 p-7 rounded-[32px] mb-12 shadow-inner relative overflow-hidden group hover:border-blue-500/20 transition-all shrink-0">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">Intelligence Credits:</span>
            <Sparkles size={12} className="text-blue-500 animate-spin-slow" />
          </div>
          <span className="text-4xl lg:text-5xl font-black text-white tabular-nums leading-none">
            {credits} <span className="text-[10px] text-zinc-600 font-bold uppercase ml-1 italic tracking-[0.2em]">Available</span>
          </span>
        </div>
        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-300 mb-8 px-1 italic shrink-0">Recent Intelligence</h3>
        <div className="space-y-4 flex-1 overflow-y-auto pr-1 min-h-[300px]">
          {recentAudits.length > 0 ? (
            recentAudits.map((audit) => {
              const statusInfo = getStatusDisplay(audit.status);
              return (
                <div key={audit.id} onClick={() => router.push(`/dashboard/audit/${audit.id}`)} title={audit.file_name} className="group flex items-center justify-between p-5 rounded-[24px] bg-white/[0.01] border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center border shrink-0 relative transition-all ${getRiskStyles(audit.risk_score, audit.status)}`}>
                      {audit.status === 'failed' ? (
                        <ShieldAlert size={18} strokeWidth={1.5} className="relative z-10" />
                      ) : (
                        <>
                          {audit.status === 'completed' && <div className="absolute inset-[3px] bg-current opacity-[0.15] rounded-[10px] blur-[1px]" />}
                          <FileText size={18} strokeWidth={1.5} className="relative z-10" />
                        </>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-[900] text-zinc-100 truncate uppercase italic tracking-tight group-hover:text-white transition-colors">{audit.file_name}</p>
                      <p className={`text-[9px] font-black uppercase mt-1 tracking-widest italic ${statusInfo.color}`}>{statusInfo.text}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-[14px] font-black tabular-nums ${getScoreColor(audit.risk_score, audit.status)}`}>
                      {audit.status === 'failed' ? 'ERROR' : audit.status === 'processing' ? '...' : `${audit.risk_score || 0}/10`}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 border-2 border-dashed border-white/[0.03] rounded-[32px] flex flex-col items-center justify-center text-center opacity-40 h-full">
              <ShieldAlert size={32} className="text-zinc-700 mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 leading-relaxed italic text-center">Intelligence Ledger Empty.</p>
            </div>
          )}
        </div>
        <button onClick={() => router.push('/dashboard/report')} className="mt-12 flex items-center justify-center gap-3 p-6 rounded-[32px] bg-zinc-900/30 border border-white/5 text-[9px] font-black uppercase text-zinc-400 tracking-[0.3em] hover:text-white hover:border-blue-500/20 transition-all shadow-xl group shrink-0">
          <MessageSquare size={16} className="text-blue-500 group-hover:scale-110 transition-transform duration-500" /> Report Intelligence Gap
        </button>
      </aside>
    </div>
  );
}