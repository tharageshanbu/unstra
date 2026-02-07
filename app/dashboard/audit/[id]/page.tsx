"use client";

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import { 
  ArrowLeft, ShieldAlert, FileText, Copy, MapPin, Users, 
  ExternalLink, CheckCircle, Calendar, Download,
  DollarSign, Globe, Briefcase, Zap, Activity, RefreshCw, ChevronDown, Check
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
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchReport = async () => {
    const { data } = await supabase.from('audits').select('*').eq('id', id).single();
    if (data) {
      setReport(data);
      if (data.original_analysis) {
        setOriginalReport({
          ...data,
          verdict: data.original_analysis.ceo_summary,
          meta_data: {
            all_dates: data.original_analysis.sensed_dates,
            all_financials: data.original_analysis.sensed_financials,
            all_flags: data.original_analysis.red_flags
          },
          missing_clauses: data.original_analysis.missing_clauses
        });
      } else {
        setOriginalReport(data);
      }
      const { data: urlData } = await supabase.storage.from('contracts').createSignedUrl(data.file_path, 3600);
      if (urlData) setFileUrl(urlData.signedUrl);
    }
  };

  useEffect(() => { 
    fetchReport(); 
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [id]);

 const handleLanguageChange = async (newLang: string) => {
    setIsDropdownOpen(false);
    if (newLang === 'original') { setSelectedLang('original'); setReport(originalReport); return; }
    setSelectedLang(newLang);
    setIsTranslating(true);
    
    try {
      // 1. First, invoke the function to ensure the translation exists in the vault
      const { data: funcData, error: funcError } = await supabase.functions.invoke('contract-audit', {
        body: { record: { id, file_path: report?.file_path }, language: newLang, translation_only: true }
      });
      if (funcError) throw funcError;

      // 2. Fetch the updated record to get the latest 'translations' object
      const { data: updated, error: fetchError } = await supabase.from('audits').select('*').eq('id', id).single();
      if (fetchError) throw fetchError;

      // 3. Map the vaulted language data to the UI state
      if (updated?.translations?.[newLang]) {
        const vault = updated.translations[newLang];
        setReport({
          ...updated,
          verdict: vault.verdict,
          meta_data: {
            all_flags: vault.flags,
            all_dates: vault.dates,
            all_financials: vault.financials
          },
          missing_clauses: vault.gaps
        });
      } else {
        setReport(updated);
      }
    } catch (err: any) { 
      console.error("Vault Sync Error:", err.message); 
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
    doc.text(`SOURCE FILE: ${report.file_name}`, 15, 41);
    doc.text(`LEGAL JURISDICTION: ${report.jurisdiction?.toUpperCase()}`, 15, 47);
    doc.text(`ISSUED: ${new Date(report.created_at).toLocaleDateString()}`, 165, 25);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14); doc.text("INTELLIGENCE VERDICT", 15, 70);
    doc.setFontSize(10);
    const splitVerdict = doc.splitTextToSize(`"${source.verdict}"`, 180);
    doc.text(splitVerdict, 15, 80);
    const vHeight = splitVerdict.length * 5;
    autoTable(doc, {
      startY: 85 + vHeight,
      head: [['DOMAIN', 'FORENSIC DATA POINT', 'STATUS']],
      body: [
        ['DOC TYPE', source.document_type?.toUpperCase(), 'VERIFIED'],
        ['PARTY A', source.party_a_name, 'ACTIVE'],
        ['PARTY B', source.party_b_name, 'ACTIVE'],
        ['VALUATION', source.contract_value || 'TBD', 'FORENSIC'],
        ['RISK QUOTIENT', `${source.risk_score}/10`, source.risk_score > 7 ? 'CRITICAL' : 'STABLE'],
      ],
      headStyles: { fillColor: [37, 99, 235] }, theme: 'striped'
    });
    let fY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(14); doc.text("NEGOTIATION PLAYBOOK", 15, fY + 15);
    autoTable(doc, {
      startY: fY + 20,
      head: [['ISSUE', 'SEVERITY', 'NEGOTIATION SCRIPT']],
      body: source.meta_data.all_flags.map((f: any) => [f.issue, f.severity.toUpperCase(), f.script]),
      headStyles: { fillColor: [220, 38, 38] },
      columnStyles: { 2: { cellWidth: 100 } }
    });
    fY = (doc as any).lastAutoTable.finalY;
    if (source.missing_clauses?.length > 0) {
      doc.text("SENSE GAPS", 15, fY + 15);
      autoTable(doc, {
        startY: fY + 20,
        body: source.missing_clauses.map((c: string) => [c]),
        theme: 'plain',
        styles: { textColor: [220, 38, 38], fontStyle: 'bold' }
      });
    }
    doc.save(`UNSTRA_AUDIT_${report.file_name.split('.')[0]}.pdf`);
  };

  const allFlags = useMemo(() => {
    const flags = report?.meta_data?.all_flags || [];
    return [...flags].sort((a, b) => (a.severity === 'high' ? -1 : 1));
  }, [report]);

  const ledgerDates = useMemo(() => report?.meta_data?.all_dates || [], [report]);
  const ledgerFinancials = useMemo(() => report?.meta_data?.all_financials || [], [report]);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!report) return <div className="min-h-screen bg-black flex items-center justify-center"><Activity className="animate-spin text-blue-500" /></div>;

  return (
    <main className="min-h-screen bg-black text-white pb-20 overflow-x-hidden">
      {isTranslating && (
        <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center">
          <RefreshCw className="animate-spin text-blue-500 mb-4" size={32} />
          <p className="text-[10px] font-black uppercase tracking-[0.3em]">Re-Sensing In {selectedLang}...</p>
        </div>
      )}

      <div className="max-w-[1440px] mx-auto p-8">
        {/* HEADER LAYER FIX */}
        <div className="flex items-center justify-between mb-10 relative z-[200]">
          <button onClick={() => router.push('/dashboard/audit-history')} className="flex items-center gap-2 text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Intelligence Ledger
          </button>

          <div className="flex items-center gap-4">
            <button onClick={downloadPDFReport} className="flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600/20 transition-all text-blue-400">
              <Download size={14} /> Export Certificate
            </button>

            <div className="flex items-center gap-3 bg-zinc-900/80 border border-white/10 p-1.5 rounded-2xl px-4 backdrop-blur-xl relative" ref={dropdownRef}>
              <Globe size={14} className="text-blue-400" />
              <button 
                onClick={() => handleLanguageChange('original')}
                className={`text-[9px] font-black uppercase px-4 py-2 rounded-xl transition-all ${selectedLang === 'original' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
              >
                {report.detected_language || 'English'} (Source)
              </button>
              <div className="w-[1px] h-5 bg-white/10 mx-1" />
              
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white group"
              >
                {selectedLang === 'original' ? 'Translate To' : selectedLang}
                <ChevronDown size={14} className={`text-zinc-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 5 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-2 w-[220px] bg-zinc-950 border border-white/10 rounded-2xl p-2 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,1)] z-[9999]"
                  >
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                      {report.detected_language?.toLowerCase() !== 'english' && (
                        <button
                          onClick={() => handleLanguageChange('English')}
                          className="w-full text-left px-4 py-3 rounded-xl text-[10px] font-bold text-zinc-400 hover:bg-white/5 hover:text-white flex items-center justify-between"
                        >
                          ENGLISH {selectedLang === 'English' && <Check size={12} className="text-blue-500" />}
                        </button>
                      )}
                      {LANGUAGES.map(lang => lang.code !== report.detected_language && (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageChange(lang.code)}
                          className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-bold transition-all flex items-center justify-between mb-1 ${selectedLang === lang.code ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                        >
                          {lang.name}
                          {selectedLang === lang.code && <Check size={12} />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* 1. IDENTITY BAR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 bg-white/[0.02] border border-white/5 p-8 rounded-[40px] backdrop-blur-md relative z-[1]">
          <div className="flex items-center gap-4 group cursor-help" title={report.document_type}>
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 group-hover:scale-110 transition-transform"><Briefcase size={20}/></div>
            <div className="min-w-0"><p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Doc Type</p>
            <p className="text-sm font-bold uppercase truncate group-hover:text-blue-400 transition-colors">{report.document_type || 'Detecting...'}</p></div>
          </div>
          <div className="flex items-center gap-4 border-x border-white/5 px-6 group cursor-help" title={report.jurisdiction}>
            <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500 group-hover:scale-110 transition-transform"><MapPin size={20}/></div>
            <div className="min-w-0"><p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Jurisdiction</p>
            <p className="text-sm font-bold uppercase truncate group-hover:text-purple-400 transition-colors">{report.jurisdiction || 'Detecting...'}</p></div>
          </div>
          <div className="flex items-start gap-4 group cursor-help" title={`PARTY A: ${report.party_a_name}\nPARTY B: ${report.party_b_name}`}>
            <div className="p-3 bg-green-500/10 rounded-2xl text-green-500 group-hover:scale-110 transition-transform mt-1"><Users size={20}/></div>
            <div className="flex-1 min-w-0"><p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Parties</p>
            <p className="text-xs font-bold opacity-70 truncate group-hover:text-green-400 transition-colors">A: {report.party_a_name}</p>
            <p className="text-xs font-bold opacity-70 truncate group-hover:text-green-400 transition-colors">B: {report.party_b_name}</p></div>
          </div>
        </div>

        {/* 2. VERDICT */}
        <div className={`p-8 rounded-[40px] mb-12 border transition-all duration-700 ${report.risk_score > 7 ? 'bg-red-500/10 border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.15)] animate-pulse' : 'bg-blue-600/10 border-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.1)]'}`}>
          <div className="flex items-center gap-2 text-blue-400 font-black text-[10px] uppercase tracking-[0.3em] mb-4"><Zap size={14} fill="currentColor" /> Intelligence Verdict</div>
          <h2 className="text-2xl font-bold italic leading-relaxed text-zinc-100">"{report.verdict || "Analysis in progress..."}"</h2>
          <div className={`mt-6 inline-block px-5 py-2 rounded-full border font-black text-[10px] uppercase tracking-widest ${report.risk_score > 7 ? 'border-red-500/40 text-red-500' : 'border-blue-500/40 text-blue-400'}`}>
            Risk Quotient: {report.risk_score || '—'}/10
          </div>
        </div>

        {/* 3. SENSING LEDGER */}
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
                      <span className="text-[10px] font-black text-blue-500/40 uppercase tracking-tighter">CDN$</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
        </div>

        {/* 4. PLAYBOOK & PREVIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="col-span-12 lg:col-span-7 space-y-4">
            {allFlags.map((flag: any, index: number) => (
              <div key={index} onClick={() => setActiveFlagIndex(index)} className={`cursor-pointer transition-all border rounded-[32px] p-8 ${activeFlagIndex === index ? 'bg-zinc-900 border-blue-500/50 shadow-2xl scale-[1.01]' : 'bg-zinc-900/20 border-white/5 opacity-50 grayscale hover:grayscale-0'}`}>
                <div className={`flex items-center gap-3 font-black text-[11px] uppercase tracking-widest ${flag.severity === 'high' ? 'text-red-500' : 'text-orange-500'}`}>
                  <ShieldAlert size={18} /> Conflict #{index + 1}: {flag.issue}
                </div>
                {activeFlagIndex === index && (
                  <div className="mt-6 space-y-6 animate-in fade-in duration-500">
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5 italic text-zinc-400 text-sm font-serif leading-relaxed">"{flag.quote}"</div>
                    <div className="bg-blue-600/5 border border-blue-500/20 p-6 rounded-2xl text-sm italic text-zinc-300">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Negotiation Script</span>
                        <button onClick={(e) => { e.stopPropagation(); copyToClipboard(flag.script, index); }}>
                          {copiedIndex === index ? <CheckCircle size={14} className="text-blue-500"/> : <Copy size={14} />}
                        </button>
                      </div>
                      {flag.script}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="col-span-12 lg:col-span-5 lg:sticky lg:top-8">
            <div className="bg-white rounded-[40px] h-[850px] flex flex-col border border-white/10 overflow-hidden shadow-2xl">
                <div className="bg-zinc-50 p-6 border-b flex items-center justify-between text-black shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText size={20} className="text-blue-600 shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-widest truncate">{report.file_name || 'Document'}</span>
                  </div>
                  {fileUrl && (
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-all hover:scale-105">
                      <span className="text-[9px] font-black uppercase tracking-widest">Full View</span>
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
                
                <div className="p-10 text-zinc-800 font-serif overflow-y-auto flex-1 bg-[#F9FAFB]">
                  <div className="relative pl-8 border-l-[3px] border-red-500 mb-10">
                    <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-4 font-sans italic leading-none">Forensic Evidence:</p>
                    <p className="text-xl text-zinc-950 italic leading-relaxed">"{allFlags[activeFlagIndex]?.quote}"</p>
                  </div>
                  
                  {/* FIXED SENSED GAPS ICON SIZING */}
                  <div className="mt-16 pt-10 border-t border-zinc-100">
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-6 font-sans">Sensed Intelligence Gaps:</p>
                    <div className="space-y-3">
                      {report.missing_clauses?.map((c: string, i: number) => (
                        <div key={i} className="bg-red-500/5 text-red-700 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-start gap-3 border border-red-500/10 shadow-sm">
                          <ShieldAlert size={14} className="shrink-0 mt-0.5" /> 
                          <span className="leading-snug">{c}</span>
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