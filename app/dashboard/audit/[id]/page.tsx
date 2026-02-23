"use client";

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import { 
  ArrowLeft, ShieldAlert, FileText, Copy, MapPin, Users, 
  ExternalLink, CheckCircle, Calendar, Download,
  DollarSign, Globe, Briefcase, Zap, Activity, RefreshCw, ChevronDown, Check, AlertTriangle, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const supabase = createClient();

const LANGUAGES = [
  { code: 'Arabic', name: 'ARABIC' }, { code: 'Bengali', name: 'BENGALI' },
  { code: 'Chinese', name: 'CHINESE (SIMPLIFIED)' }, { code: 'Dutch', name: 'DUTCH' },
  { code: 'French', name: 'FRENCH' }, { code: 'German', name: 'GERMAN' },
  { code: 'Hindi', name: 'HINDI' }, { code: 'Italian', name: 'ITALIAN' },
  { code: 'Japanese', name: 'JAPANESE' }, { code: 'Korean', name: 'KOREAN' },
  { code: 'Portuguese', name: 'PORTUGUESE' }, { code: 'Russian', name: 'RUSSIAN' },
  { code: 'Spanish', name: 'SPANISH' }, { code: 'Tamil', name: 'TAMIL' },
  { code: 'Vietnamese', name: 'VIETNAMESE' }
];

export default function ReportPage() {
  const { id } = useParams();
  const router = useRouter();
  const [report, setReport] = useState<any>(null);
  const [originalReport, setOriginalReport] = useState<any>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [selectedLang, setSelectedLang] = useState('original');
  const [activeFlagIndex, setActiveFlagIndex] = useState(0);
  const [isTranslating, setIsTranslating] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  
  // ✅ SECURITY & LOADING STATES
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchReport = async () => {
    // 1. Get Session User
    const { data: { user: activeUser } } = await supabase.auth.getUser();
    
    // 2. Fetch Data
    const { data, error } = await supabase.from('audits').select('*').eq('id', id).single();
    
    // 3. Handle Record Not Found or DB Error
    if (error || !data) {
      setNotFound(true);
      return;
    }

    // 4. ✅ SECURITY: BOLA (Broken Object Level Authorization) Check
    if (data.user_id !== activeUser?.id) {
      setIsAuthorized(false);
      return;
    }

    if (data) {
      // ✅ LOGIC: If processing, we set basic report info to trigger loader, else format data
      if (data.status === 'completed') {
        const rawOriginal = data.original_analysis || {};
        const normalizedGaps = (rawOriginal.missing_clauses || []).map((c: any) => 
          typeof c === 'object' ? `${c.label}: ${c.desc}` : c
        );

        const formattedOriginal = {
          ...data,
          verdict: rawOriginal.ceo_summary || data.verdict,
          meta_data: {
            all_dates: rawOriginal.sensed_dates || [],
            all_financials: rawOriginal.sensed_financials || [],
            all_flags: (rawOriginal.red_flags || []).map((f: any) => ({
              ...f,
              statute: f.statute || "N/A",
              page_ref: f.page_ref || "N/A"
            })) 
          }, 
          missing_clauses: normalizedGaps
        };

        setReport(formattedOriginal);
        setOriginalReport(formattedOriginal);

    const savedLang = localStorage.getItem(`lang_${id}`);
      
      if (savedLang && savedLang !== 'original' && data.translations?.[savedLang]) {
        // Translation exists for the new data - apply it
        applyVaultLanguage(data, savedLang);
      } else {
        // Translation is missing (purged) or user is on original - reset to English
        setSelectedLang('original');
        localStorage.setItem(`lang_${id}`, 'original');
      }
    } else {
      // Just set the raw data so the status intercept can catch it
      setReport(data);
    }

      const { data: urlData } = await supabase.storage.from('contracts').createSignedUrl(data.file_path, 3600);
      if (urlData) setFileUrl(urlData.signedUrl);
    }
  };

  const applyVaultLanguage = (baseReport: any, lang: string) => {
    if (baseReport?.translations?.[lang]) {
      const vault = baseReport.translations[lang];
      const normalizedGaps = (vault.gaps || []).map((c: any) => 
        typeof c === 'object' ? `${c.label}: ${c.desc}` : c
      );

      setSelectedLang(lang);
      setReport({
        ...baseReport,
        verdict: vault.verdict,
        meta_data: {
          all_flags: vault.flags || [],
          all_dates: vault.dates || [],
          all_financials: vault.financials || []
        },
        missing_clauses: normalizedGaps
      });
    }
  };

  useEffect(() => { 
    fetchReport(); 

    // ✅ FIX: ADDED REALTIME HANDSHAKE (Auto-refresh on update)
    const channel = supabase.channel(`report-realtime-${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'audits', filter: `id=eq.${id}` }, () => {
        fetchReport();
      })
      .subscribe();

    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      supabase.removeChannel(channel); // Cleanup channel on unmount
    };
  }, [id]);

  const handleLanguageChange = async (newLang: string) => {
    setIsDropdownOpen(false);
    setRetryError(null);
    if (newLang === 'original') { 
      setSelectedLang('original'); 
      setReport(originalReport); 
      localStorage.setItem(`lang_${id}`, 'original');
      return; 
    }
    if (report?.translations?.[newLang]) {
      applyVaultLanguage(report, newLang);
      localStorage.setItem(`lang_${id}`, newLang);
      return;
    }
    setSelectedLang(newLang);
    setIsTranslating(true);
    try {
      const { error: funcError } = await supabase.functions.invoke('contract-audit', {
        body: { record: { id, file_path: report?.file_path }, language: newLang, translation_only: true }
      });
      if (funcError) throw funcError;
      const { data: updated } = await supabase.from('audits').select('*').eq('id', id).single();
      if (updated?.translations?.[newLang]) {
        localStorage.setItem(`lang_${id}`, newLang);
        applyVaultLanguage(updated, newLang);
      }
    } catch (err: any) { 
      setRetryError("High Latency. Please try again.");
      setSelectedLang('original');
      setReport(originalReport);
    } finally { 
      setIsTranslating(false); 
    }
  };

  const downloadPDFReport = () => {
    const source = originalReport; 
    const doc = new jsPDF();
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 55, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22); doc.text("UNSTRA FORENSIC CERTIFICATE", 15, 25);
    doc.setFontSize(8);
    doc.text(`VERIFIED ID: ${id}`, 15, 35);
    doc.text(`SOURCE FILE: ${source.file_name}`, 15, 41);
    doc.text(`LEGAL JURISDICTION: ${source.jurisdiction?.toUpperCase()}`, 15, 47);
    doc.text(`ISSUED: ${new Date(source.created_at).toLocaleDateString()}`, 165, 25);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14); doc.text("INTELLIGENCE VERDICT", 15, 70);
    doc.setFontSize(10);
    const splitVerdict = doc.splitTextToSize(`"${source.verdict}"`, 180);
    doc.text(splitVerdict, 15, 80);
    autoTable(doc, {
      startY: 85 + (splitVerdict.length * 5),
      head: [['DOMAIN', 'FORENSIC DATA POINT', 'STATUS']],
      body: [
        ['DOC TYPE', source.document_type?.toUpperCase() || 'GENERAL', 'VERIFIED'],
        ['PARTY A', source.party_a_name, 'ACTIVE'],
        ['PARTY B', source.party_b_name, 'ACTIVE'],
        ['VALUATION', source.contract_value ? `${source.contract_value}${source.currency_code ? ` ${source.currency_code}` : ''}` : '', 'FORENSIC'],
        ['RISK QUOTIENT', `${source.risk_score}/10`, source.risk_score > 7 ? 'CRITICAL' : 'STABLE'],
      ],
      headStyles: { fillColor: [37, 99, 235] }, theme: 'striped'
    });
    let currentY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14); doc.text("NEGOTIATION CONFLICTS (ENGLISH SOURCE)", 15, currentY);
    autoTable(doc, {
      startY: currentY + 5,
      head: [['ISSUE', 'SEVERITY', 'NEGOTIATION SCRIPT']],
      body: source.meta_data.all_flags.map((f: any) => [f.issue, f.severity.toUpperCase(), f.script]),
      headStyles: { fillColor: [220, 38, 38] },
      columnStyles: { 2: { cellWidth: 100 } }
    });
    currentY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14); doc.text("MILESTONE SENSING", 15, currentY);
    autoTable(doc, {
      startY: currentY + 5,
      head: [['LABEL', 'DETECTED VALUE']],
      body: source.meta_data.all_dates.map((d: any) => [d.label, d.value]),
      theme: 'grid',
      headStyles: { fillColor: [82, 82, 91] }
    });
    currentY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14); doc.text("FISCAL FORENSIC", 15, currentY);
    autoTable(doc, {
      startY: currentY + 5,
      head: [['FISCAL LABEL', 'AMOUNT']],
      body: source.meta_data.all_financials.map((f: any) => [f.label, f.value ? `${f.value}${source.currency_code ? ` ${source.currency_code}` : ''}` : '']),
      theme: 'grid',
      headStyles: { fillColor: [22, 163, 74] }
    });
    currentY = (doc as any).lastAutoTable.finalY + 15;
    if (source.missing_clauses?.length > 0) {
      doc.setFontSize(14); doc.text("SENSED INTELLIGENCE GAPS", 15, currentY);
      autoTable(doc, {
        startY: currentY + 5,
        body: source.missing_clauses.map((c: string) => [c]),
        theme: 'plain',
        styles: { textColor: [220, 38, 38], fontStyle: 'bold', cellPadding: 2 }
      });
    }
    doc.save(`UNSTRA_AUDIT_${source.file_name.split('.')[0]}.pdf`);
  };

  const allFlags = useMemo(() => {
    const flags = report?.meta_data?.all_flags || [];
    return [...flags].sort((a, b) => (a.severity?.toLowerCase() === 'high' ? -1 : 1));
  }, [report]);

  const ledgerDates = useMemo(() => report?.meta_data?.all_dates || [], [report]);
  const ledgerFinancials = useMemo(() => report?.meta_data?.all_financials || [], [report]);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // ✅ UI GUARD: UNAUTHORIZED ACCESS
  if (!isAuthorized) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <ShieldAlert size={48} className="text-red-500 mb-6 animate-pulse" />
      <h2 className="text-xl font-black uppercase italic tracking-tighter text-white mb-2">Access Revoked</h2>
      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8">Unauthorized Intelligence Request Detected.</p>
      <button onClick={() => router.push('/dashboard/audit-history')} className="px-8 py-3 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest">Return to Ledger</button>
    </div>
  );

  // ✅ UI GUARD: RECORD NOT FOUND
  if (notFound) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <FileText size={48} className="text-zinc-800 mb-6" />
      <h2 className="text-xl font-black uppercase italic tracking-tighter text-white mb-2">Record Not Found</h2>
      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8">The requested forensic data does not exist in your vault.</p>
      <button onClick={() => router.push('/dashboard/audit-history')} className="px-8 py-3 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest">Back to Ledger</button>
    </div>
  );

  if (!report) return <div className="min-h-screen bg-black flex items-center justify-center"><Activity className="animate-spin text-blue-500" /></div>;

  // ✅ NEW: SENSING INTERCEPT (Hides old data during re-run)
  if (report.status === 'processing') return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />
        <Loader2 size={48} className="text-blue-500 animate-spin relative z-10" />
      </div>
      <h2 className="text-xl font-black uppercase italic tracking-tighter text-white mb-2">Intelligence Update In Progress</h2>
      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8">Updating forensic ledger for "{report.file_name}"...</p>
      <button onClick={() => router.push('/dashboard/audit-history')} className="px-8 py-3 border border-white/10 rounded-full text-zinc-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all">Archive Access</button>
    </div>
  );

  return (
    <main className="min-h-screen bg-black text-white pb-20 pt-4 md:pt-0 overflow-x-hidden">
      <AnimatePresence>
        {isTranslating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center">
            <RefreshCw className="animate-spin text-blue-500 mb-4" size={32} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Re-Sensing In {selectedLang}...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1440px] mx-auto p-4 md:p-8 mt-0 md:mt-0">
        <div className="flex flex-row items-center justify-end gap-3 mb-6 md:mb-12 relative z-[200]">
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <button onClick={downloadPDFReport} className="flex items-center gap-2 bg-white/5 border border-white/10 hover:border-blue-500/50 px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all text-zinc-400 hover:text-blue-400 shrink-0">
              <Download size={14} /> 
              <span className="hidden sm:inline">Export Certificate</span>
              <span className="sm:hidden">Export</span>
            </button>
            <div className="flex items-center gap-1 bg-zinc-900/50 border border-white/5 p-1 rounded-xl backdrop-blur-xl shrink-0">
              <button onClick={() => handleLanguageChange('original')} className={`text-[9px] font-black uppercase px-3 py-2 rounded-lg transition-all ${selectedLang === 'original' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-zinc-500 hover:text-white'}`}>
                <span className="hidden sm:inline">{report.detected_language || 'English'}</span>
                <span className="sm:hidden">EN</span>
              </button>
              <div className="w-[1px] h-3 bg-white/10 mx-1" />
              <div className="relative">
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-white">
                  {selectedLang === 'original' ? 'Translate To' : selectedLang}
                  <ChevronDown size={12} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 5 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 top-full mt-2 w-[220px] bg-zinc-950 border border-white/10 rounded-2xl p-2 backdrop-blur-3xl shadow-2xl z-[9999]">
                      <div className="max-h-[300px] overflow-y-auto custom-scrollbar" ref={dropdownRef}>
                        {report.detected_language?.toLowerCase() !== 'english' && (
                          <button onClick={() => handleLanguageChange('English')} className="w-full text-left px-4 py-3 rounded-xl text-[10px] font-bold text-zinc-400 hover:bg-white/5 hover:text-white flex items-center justify-between">
                            ENGLISH {selectedLang === 'English' && <Check size={12} className="text-blue-500" />}
                          </button>
                        )}
                        {LANGUAGES.map(lang => lang.code !== report.detected_language && (
                          <button key={lang.code} onClick={() => handleLanguageChange(lang.code)} className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-bold transition-all flex items-center justify-between mb-1 ${selectedLang === lang.code ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:bg-white/5'}`}>
                            {lang.name} {selectedLang === lang.code && <Check size={12} />}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {retryError && (
          <div className="mb-6 bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl flex items-center gap-3 text-orange-400 text-[10px] font-bold uppercase tracking-widest">
            <AlertTriangle size={16} /> {retryError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 bg-white/[0.02] border border-white/5 p-6 md:p-8 rounded-[40px] backdrop-blur-md relative z-[1]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500"><Briefcase size={20}/></div>
            <div className="min-w-0">
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Doc Type</p>
              <p className="text-xs md:text-sm font-bold uppercase leading-tight text-zinc-200">{report.document_type || 'Detecting...'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 border-white/5 md:border-x px-0 md:px-6">
            <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500"><MapPin size={20}/></div>
            <div className="min-w-0">
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Jurisdiction</p>
              <p className="text-xs md:text-sm font-bold uppercase leading-tight text-zinc-200">{report.jurisdiction || 'Detecting...'}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-500/10 rounded-2xl text-green-500 mt-1"><Users size={20}/></div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Parties</p>
              <p className="text-xs md:text-sm font-bold uppercase leading-tight text-zinc-200 mb-1">A: {report.party_a_name}</p>
              <p className="text-xs md:text-sm font-bold uppercase leading-tight text-zinc-200">B: {report.party_b_name}</p>
            </div>
          </div>
        </div>

        <div className={`p-8 rounded-[40px] mb-12 border transition-all duration-700 ${
          report.risk_score >= 8 ? 'bg-red-500/10 border-red-500/20 shadow-lg animate-pulse' : 
          report.risk_score >= 5 ? 'bg-orange-500/10 border-orange-500/20 shadow-md' : 
          'bg-emerald-500/10 border-emerald-500/20 shadow-md'
        }`}>
          <div className="flex items-center gap-2 text-blue-400 font-black text-[10px] uppercase tracking-[0.3em] mb-4">
            <Zap size={14} fill="currentColor" /> Intelligence Verdict
          </div>
          <h2 className="text-2xl font-bold italic leading-relaxed text-zinc-100">
            "{report.verdict || "Analysis in progress..."}"
          </h2>
          <div className={`mt-6 inline-block px-5 py-2 rounded-full border font-black text-[10px] uppercase tracking-widest ${
            report.risk_score >= 8 ? 'border-red-500/40 text-red-500' : 
            report.risk_score >= 5 ? 'border-orange-500/40 text-orange-400' : 
            'border-emerald-500/40 text-emerald-400'
          }`}>
            Risk Quotient: {report.risk_score || '—'}/10
          </div>
        </div>

        <div className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/[0.01] border border-white/5 p-8 rounded-[32px] backdrop-blur-sm shadow-inner">
            <p className="text-[10px] font-black text-zinc-500 uppercase mb-8 flex items-center gap-3 tracking-[0.2em]"><Calendar size={16} className="text-blue-500"/> Milestone Sensing</p>
            <div className="space-y-8">
              {ledgerDates.map((item: any, i: number) => (
                <div key={i} className="flex flex-col border-l-2 border-white/[0.05] pl-6 py-1 group hover:border-blue-500 transition-all">
                  <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mb-1 group-hover:text-zinc-300 transition-colors">{item.label}</span>
                  <span className="text-xs font-bold text-zinc-200 leading-relaxed whitespace-pre-wrap">{item.value || 'N/A'}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/[0.01] border border-white/5 p-8 rounded-[32px] backdrop-blur-sm shadow-inner">
            <p className="text-[10px] font-black text-zinc-500 uppercase mb-8 flex items-center gap-3 tracking-[0.2em]"><DollarSign size={16} className="text-blue-500"/> Fiscal Forensic</p>
            <div className="space-y-8">
              {ledgerFinancials.map((item: any, i: number) => (
                <div key={i} className="flex flex-col border-l-2 border-white/[0.05] pl-6 py-1 group hover:border-blue-500 transition-all">
                  <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mb-1 group-hover:text-zinc-300 transition-colors">{item.label}</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-bold text-blue-400 leading-relaxed whitespace-pre-wrap">{item.value || 'TBD'}</span>
                    <span className="text-[10px] font-black text-blue-500/40 uppercase tracking-tighter">
                      {item.unit || report.currency_code || ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 items-start w-full px-1 md:px-0 overflow-x-hidden">
          <div className="col-span-12 lg:col-span-7 space-y-4 w-full min-w-0">
            {allFlags.map((flag: any, index: number) => (
              <div 
                key={index} 
                onClick={() => setActiveFlagIndex(index)} 
                className={`cursor-pointer transition-all border rounded-[28px] md:rounded-[32px] p-5 md:p-8 w-full overflow-hidden ${
                  activeFlagIndex === index 
                    ? 'bg-zinc-900 border-blue-500/50 shadow-2xl' 
                    : 'bg-zinc-900/20 border-white/5 opacity-50 grayscale hover:grayscale-0'
                }`}
              >
                <div className={`flex flex-wrap items-center gap-3 font-black text-[10px] md:text-[11px] uppercase tracking-widest ${flag.severity === 'high' ? 'text-red-500' : 'text-orange-500'}`}>
                  <ShieldAlert size={18} className="shrink-0" /> 
                  <span className="text-left">Conflict #{index + 1}: {flag.issue}</span>
                  <span className="bg-white/10 px-2 py-0.5 rounded text-zinc-400 border border-white/5">{flag.statute || "N/A"}</span>
                </div>
                {activeFlagIndex === index && (
                  <div className="mt-6 space-y-6 animate-in fade-in duration-500 w-full overflow-hidden">
                    <div className="bg-white/5 p-5 md:p-6 rounded-2xl border border-white/5 italic text-zinc-400 text-sm font-serif leading-relaxed break-words text-left">
                      "{flag.quote}"
                    </div>
                    <div className="bg-blue-600/5 border border-blue-500/20 p-5 md:p-6 rounded-2xl text-sm italic text-zinc-300 w-full">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Negotiation Script</span>
                        <button onClick={(e) => { e.stopPropagation(); copyToClipboard(flag.script, index); }}>
                          {copiedIndex === index ? <CheckCircle size={14} className="text-blue-500"/> : <Copy size={14} />}
                        </button>
                      </div>
                      <p className="break-words leading-relaxed text-left whitespace-pre-wrap">{flag.script}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="col-span-12 lg:col-span-5 lg:sticky lg:top-8 w-full min-w-0">
            <div className="bg-white rounded-[32px] md:rounded-[40px] min-h-[500px] lg:h-[850px] flex flex-col border border-white/10 shadow-2xl w-full">
              <div className="bg-zinc-50 p-5 md:p-6 border-b flex items-center justify-between text-black shrink-0 rounded-t-[32px] md:rounded-t-[40px]">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText size={20} className="text-blue-600 shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-widest truncate">{report.file_name || 'Document'}</span>
                </div>
                {fileUrl && (
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all shrink-0">
                    <ExternalLink size={18} />
                  </a>
                )}
              </div>
              <div className="p-6 md:p-10 text-zinc-800 font-serif overflow-y-auto flex-1 bg-[#F9FAFB] rounded-b-[32px] md:rounded-b-[40px]">
                <div className="relative pl-6 md:pl-8 border-l-[3px] border-red-500 mb-10 text-left">
                  <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-4 font-sans italic leading-none">Forensic Evidence:</p>
                  <p className="text-lg md:text-xl text-zinc-950 italic leading-relaxed break-words">
                    "{allFlags[activeFlagIndex]?.quote}"
                  </p>
                </div>
                <div className="mt-10 md:mt-16 pt-10 border-t border-zinc-100 text-left">
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-6 font-sans">Sensed Intelligence Gaps:</p>
                  <div className="space-y-3 w-full">
                    {report.missing_clauses?.map((c: string, i: number) => (
                      <div key={i} className="bg-red-500/5 text-red-700 px-4 md:px-5 py-3 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-start gap-3 border border-red-500/10 shadow-sm w-full">
                        <ShieldAlert size={14} className="shrink-0 mt-0.5" /> 
                        <span className="leading-snug break-words">{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}