"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Zap, Activity, Check, Lock, Play, Eye, 
  Terminal, ArrowRight, ShieldCheck, FileText, Globe, Menu, X 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // FIXED: Manual scroll handler to fix mobile navigation
  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setIsMenuOpen(false); // Close menu immediately

    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        const offset = 80; // Height of your fixed h-20 nav
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 200); // Small delay to allow menu to exit
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-blue-500/30 overflow-x-hidden font-sans">
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] z-0" />

      {/* 1. ADAPTIVE STATUS BAR NAV */}
      <nav className="fixed w-full z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              <Shield size={20} className="text-white" />
            </div>
            <span className="text-xl font-[900] tracking-tighter italic uppercase">Unstra</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            <a href="#process" onClick={(e) => scrollToSection(e, 'process')} className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500 hover:text-white transition-all">Process</a>
            <a href="#security" onClick={(e) => scrollToSection(e, 'security')} className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500 hover:text-white transition-all">Security</a>
            {false&& (<a href="/pricing" className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500 hover:text-white transition-all">Pricing</a>)}
            <button 
              onClick={() => router.push('/login')}
              className="bg-white text-black px-8 py-3 rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl"
            >
              Enter Vault
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-white z-50" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown Fix */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="md:hidden fixed top-20 left-0 w-full bg-black border-b border-white/10 px-6 py-10 flex flex-col gap-8 z-40 shadow-2xl"
            >
              <button onClick={(e) => scrollToSection(e, 'process')} className="text-left text-xs font-black uppercase tracking-[0.4em] text-zinc-400">Process</button>
              <button onClick={(e) => scrollToSection(e, 'security')} className="text-left text-xs font-black uppercase tracking-[0.4em] text-zinc-400">Security</button>
              {false && (<button onClick={() => { setIsMenuOpen(false); router.push('/pricing'); }} className="text-left text-xs font-black uppercase tracking-[0.4em] text-zinc-400">Pricing</button>)}
              <button 
                onClick={() => { setIsMenuOpen(false); router.push('/login'); }}
                className="w-full bg-white text-black py-4 rounded-full font-black text-xs uppercase tracking-[0.3em]"
              >
                Enter Vault
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* 2. HERO: THREE-LINE ARCHITECTURE */}
      <section className="relative pt-48 pb-24 px-6 max-w-7xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 mb-12 bg-blue-600/5 border border-blue-600/20 px-6 py-2 rounded-full shadow-[0_0_40px_rgba(37,99,235,0.15)]"
        >
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-400 italic text-nowrap">Expert Eye Protocol Engaged</span>
        </motion.div>

        <h1 className="text-5xl md:text-[100px] font-black uppercase tracking-tighter italic leading-[0.8] mb-12 drop-shadow-2xl">
          Sign every contract <br />
          <span className="text-zinc-500">With total</span> <br />
          <span className="text-blue-600">Confidence.</span>
        </h1>

        <p className="text-zinc-500 max-w-[850px] mx-auto text-lg md:text-xl font-bold italic leading-relaxed mb-16 px-4">
          Unstra scans the fine print for you. We find the red flags, explain the risks in plain <br className="hidden md:block" /> 
          English, and make sure you never get stuck in a bad deal.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <button onClick={() => router.push('/login')} className="w-full sm:w-auto bg-blue-600 text-white px-14 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.3em] shadow-[0_0_40px_rgba(37,99,235,0.4)] hover:scale-105 transition-all">
            Access My Vault
          </button>
          <button onClick={() => router.push('/demo')} className="w-full sm:w-auto bg-zinc-900 border border-white/10 text-white px-14 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all">
            See Sample Audit
          </button>
        </div>
      </section>

      {/* 3. REFINED PROCESS SECTION */}
      <section id="process" className="py-32 px-6 md:px-10 max-w-7xl mx-auto border-t border-white/5">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="text-left">
            <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.6em] mb-8 italic underline underline-offset-8 decoration-blue-500/30">Forensic Pipeline</h2>
            <p className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic mb-12 leading-[0.9]">
              From Upload <br /> <span className="text-zinc-800 tracking-normal text-italic">To Total Clarity.</span>
            </p>
            
            <div className="space-y-12">
              {[
                { t: "SECURE DROP", d: "Drag and drop any PDF. Documents are isolated in your personal vault immediately via 256-bit AES encryption.", icon: ShieldCheck, color: "text-blue-500" },
                { t: "JURISDICTION MAPPING", d: "Our engine automatically identifies the Governing Law and maps risks specific to your region.", icon: Globe, color: "text-emerald-500" },
                { t: "EXPERT EYE SENSING", d: "Audit agreements against 50 high-stakes risk categories to find hidden red flags instantly.", icon: Eye, color: "text-amber-500" },
                { t: "PLAIN ENGLISH VERDICT", d: "Get a clear Risk Score (1-10) and specific scripts on exactly what to negotiate.", icon: FileText, color: "text-rose-500" }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 items-start group">
                  <div className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center ${item.color} shadow-[0_0_20px_rgba(0,0,0,0.5)] group-hover:border-current transition-all duration-500`}>
                    <item.icon size={24} />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] mb-2 text-white">{item.t}</h4>
                    <p className="text-sm text-zinc-500 font-bold italic leading-relaxed tracking-tight max-w-md">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative group rounded-[40px] overflow-hidden border border-white/10 bg-zinc-900 shadow-2xl transition-transform hover:scale-[1.01] duration-700">
            <video autoPlay loop muted playsInline className="w-full aspect-video object-cover opacity-60 group-hover:opacity-100 transition-opacity">
              <source src="/demo.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-8 left-8 flex items-center gap-3">
              <Activity size={16} className="text-blue-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] italic text-zinc-400">Live Forensic Stream</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECURITY: YOUR DATA ISOLATED */}
      <section id="security" className="py-32 bg-[#050505] border-y border-white/5 relative overflow-hidden text-center">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <ShieldCheck size={56} className="mx-auto mb-10 text-blue-600 drop-shadow-[0_0_20px_rgba(37,99,235,0.4)]" />
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic mb-10">
            Your Data, <span className="text-blue-600 italic">Isolated.</span>
          </h2>
          <p className="text-zinc-500 text-xl font-bold italic leading-relaxed mb-20 max-w-3xl mx-auto">
            We handle your documents with total transparency. No hidden data harvesting, no training, and no long-term storage.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { t: "NO MODEL TRAINING", d: "Privacy Protocol", desc: "Your private contracts stay private. We never use your data to train or improve global AI models.", icon: Shield },
              { t: "SESSION PURGING", d: "Clean Slate Policy", desc: "Once your report is finalized, document logs are scrubbed from our active sensing memory immediately.", icon: Zap },
              { t: "CRYPTOGRAPHIC VAULT", d: "Military-Grade AES", desc: "Agreements are protected at rest with industry-standard 256-bit AES encryption protocols.", icon: Lock }
            ].map((item, i) => (
              <div key={i} className="p-12 bg-black/50 backdrop-blur-sm rounded-[48px] border border-white/5 hover:border-blue-500/30 transition-all group text-left">
                <item.icon size={24} className="text-blue-500 mb-6 group-hover:scale-110 transition-transform" />
                <h4 className="text-2xl font-black text-white italic mb-1 group-hover:text-blue-500 transition-colors uppercase tracking-tighter">{item.t}</h4>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-6 italic">{item.d}</p>
                <p className="text-sm text-zinc-400 font-bold italic leading-relaxed italic tracking-tight">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. THE SOVEREIGN FOOTER */}
      <footer className="pt-32 pb-12 px-10 max-w-7xl mx-auto border-t border-white/5 mt-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24 text-left">
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-500 mb-8 italic">Mission</h4>
            <p className="text-zinc-400 text-sm font-bold italic leading-relaxed max-w-sm">
              Empowering founders and auditors to sign with total confidence. 
              Unstra is the specialized layer between you and the fine print.
            </p>
          </div>

          <div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-100 mb-8 italic underline underline-offset-8 decoration-zinc-100/30">Protocols</h4>
            <ul className="space-y-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">
              <li><button onClick={(e) => scrollToSection(e, 'process')} className="hover:text-blue-500 transition-colors uppercase">Forensic Method</button></li>
              <li><button onClick={(e) => scrollToSection(e, 'security')} className="hover:text-blue-500 transition-colors uppercase">Data Sovereignty</button></li>
              {false && (<li><button onClick={() => router.push('/pricing')} className="hover:text-blue-500 transition-colors uppercase">Sovereign Pricing</button></li>)}
              <li><button onClick={() => router.push('/login')} className="hover:text-blue-500 transition-colors uppercase text-left">Vault Access</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-100 mb-8 italic underline underline-offset-8 decoration-zinc-100/30">Compliance</h4>
            <ul className="space-y-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">
              <li><a href="mailto:hello@unstra.com" className="hover:text-blue-500 transition-colors">Contact Team</a></li>
              <li><a href="/privacy" className="hover:text-blue-500 transition-colors">Privacy Protocol</a></li>
              <li><a href="/terms" className="hover:text-blue-500 transition-colors">Terms of Intelligence</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/10 gap-8">
          <div className="flex flex-col gap-2 items-center md:items-start text-center md:text-left">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em]">© 2026 UNSTRA AI.</p>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <span className="text-[8px] font-black text-emerald-500/80 uppercase tracking-widest">Global Sensing Network Active</span>
            </div>
          </div>
          
          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.1em] italic text-center md:text-right max-w-md leading-relaxed">
            Disclaimer: Unstra provides AI-driven contract analysis for informational purposes only. 
            We are not a law firm and do not provide legal advice. Sensed results should be verified by a qualified professional.
          </p>
        </div>
      </footer>
    </div>
  );
}