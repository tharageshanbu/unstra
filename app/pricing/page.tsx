"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Crown, Shield, Lock, Building2, Zap, ArrowLeft, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

const SOLO_TIERS = [
  {
    id: "pay_as_you_go",
    name: "PAY-AS-YOU-GO",
    price: "$5.99",
    billing: "SINGLE PASS",
    capacity: "1 DOCUMENT",
    limit: "UP TO 50 PAGES | 10MB",
    features: ["50-POINT AI AUDIT", "RISK SCORE (1-10)"],
    cta: "BUY CREDIT",
    highlight: false
  },
  {
    id: "standard",
    name: "STANDARD",
    price: "$24.99",
    billing: "PER MONTH",
    capacity: "5 DOCUMENTS",
    limit: "UP TO 60 PAGES | 15MB",
    features: ["INTELLIGENCE LEDGER", "PRIORITY SENSING"],
    cta: "START PROTOCOL",
    highlight: false
  },
  {
    id: "professional",
    name: "PROFESSIONAL",
    price: "$49.99",
    billing: "PER MONTH",
    capacity: "10 DOCUMENTS",
    limit: "UP TO 75 PAGES | 25MB",
    features: ["IP DEEP-DIVE AUDIT", "MANAGING PARTNER PERSONA"],
    cta: "GO PROFESSIONAL",
    highlight: true 
  }
];

const FUTURE_TIERS = [
  {
    id: "business",
    name: "BUSINESS",
    details: "25 Documents | Team Shared Pool",
    icon: Building2,
    features: ["TEAM COLLABORATION", "CENTRALIZED BILLING", "CUSTOM AUDIT FLOWS"]
  },
  {
    id: "enterprise",
    name: "ENTERPRISE",
    details: "Unlimited Forensic Capacity",
    icon: Zap,
    features: ["PRIVATE CLOUD DEPLOY", "WHITE-GLOVE ONBOARDING", "EXECUTIVE DASHBOARD"]
  }
];

export default function PricingPage() {
  const router = useRouter();
  const [hoveredTier, setHoveredTier] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleCheckout = async (tierId: string) => {
    // Ensuring session isolation by forcing authentication before checkout
    router.push(`/login?redirect=checkout&tier=${tierId}`);
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-blue-500/30 overflow-x-hidden font-sans">
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] z-0" />

      {/* 1. ADAPTIVE STATUS BAR NAV - Mobile Fix */}
      <nav className="fixed w-full z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-20 flex justify-between items-center">
          <button onClick={() => router.push('/')} className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              <Shield size={20} className="text-white" />
            </div>
            <span className="text-xl font-[900] tracking-tighter italic uppercase">Unstra</span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            <button onClick={() => router.push('/')} className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500 hover:text-white transition-all">
              Home
            </button>
            <button onClick={() => router.push('/login')} className="bg-white text-black px-8 py-3 rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl">
              Enter Vault
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-white z-50" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-black border-b border-white/10 px-6 py-10 flex flex-col gap-8 overflow-hidden z-40 shadow-2xl"
            >
              <button onClick={() => router.push('/')} className="text-left text-xs font-black uppercase tracking-[0.4em] text-zinc-400">
                Home
              </button>
              <button onClick={() => router.push('/login')} className="w-full bg-white text-black py-4 rounded-full font-black text-xs uppercase tracking-[0.3em]">
                Enter Vault
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* 2. HEADER SECTION */}
      <section className="relative pt-48 pb-24 px-10 max-w-5xl mx-auto text-center z-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-3 mb-10 bg-blue-600/5 border border-blue-600/20 px-6 py-2 rounded-full">
          <Crown size={12} className="text-blue-500" />
          <span className="text-[9px] font-black uppercase tracking-[0.5em] text-blue-400 italic">Access Protocols v1.0</span>
        </motion.div>
        
        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic mb-8 leading-[0.85]">
          Sovereign <br /> <span className="text-blue-600">Access.</span>
        </h1>
        <p className="text-zinc-500 font-bold italic text-lg tracking-tight max-w-xl mx-auto leading-relaxed">
          Secure your forensic capacity. Deploy the "Expert Eye" across your legal stack with total privacy.
        </p>
      </section>

      {/* 3. ACTIVE SOLO TIERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 md:px-10 max-w-7xl mx-auto mb-32 z-10 relative">
        {SOLO_TIERS.map((tier) => {
          const isHighlighted = hoveredTier ? hoveredTier === tier.id : tier.highlight;
          
          return (
            <motion.div
              key={tier.id}
              onMouseEnter={() => setHoveredTier(tier.id)}
              onMouseLeave={() => setHoveredTier(null)}
              className={`relative flex flex-col p-12 rounded-[48px] border transition-all duration-700 cursor-default ${
                isHighlighted 
                  ? 'bg-blue-600/[0.04] border-blue-600/40 shadow-[0_0_80px_rgba(37,99,235,0.15)] scale-105 z-20' 
                  : 'bg-zinc-900/20 border-white/5 opacity-50'
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[8px] font-black uppercase px-6 py-2 rounded-full tracking-[0.3em] shadow-2xl">
                  MANAGING PARTNER PICK
                </div>
              )}
              
              <div className="mb-12">
                <h3 className={`text-[11px] font-black uppercase tracking-[0.4em] mb-8 ${isHighlighted ? 'text-blue-400' : 'text-zinc-500'}`}>
                  {tier.name}
                </h3>
                <div className="flex items-end gap-2 mb-6">
                  <span className="text-6xl font-black tracking-tighter italic leading-none">{tier.price}</span>
                  <span className="text-[10px] font-black text-zinc-600 uppercase mb-1">{tier.billing}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black text-white uppercase tracking-widest">{tier.capacity}</p>
                  <p className="text-[10px] font-black text-blue-500/80 uppercase tracking-widest italic">{tier.limit}</p>
                </div>
              </div>

              <div className="flex-1 space-y-6 mb-12 border-t border-white/5 pt-10">
                {tier.features.map((feat) => (
                  <div key={feat} className="flex items-center gap-4">
                    <Check size={14} className={isHighlighted ? "text-blue-500" : "text-zinc-800"} />
                    <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${isHighlighted ? "text-zinc-200" : "text-zinc-600"}`}>{feat}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => handleCheckout(tier.id)}
                className={`w-full py-5 rounded-[24px] font-black text-[11px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 ${
                isHighlighted ? 'bg-blue-600 text-white shadow-blue-600/40 shadow-2xl hover:scale-105' : 'bg-white text-black hover:bg-zinc-200'
              }`}>
                <Shield size={14} /> {tier.cta}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* 4. FUTURE INFRASTRUCTURE: COMING SOON */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 mb-48 z-10 relative">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic mb-4">Coming <span className="text-zinc-700">Soon.</span></h2>
          <div className="h-[2px] w-24 bg-blue-600 mx-auto opacity-50" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {FUTURE_TIERS.map((tier) => (
            <div 
              key={tier.id}
              className="group relative flex flex-col p-12 rounded-[48px] bg-zinc-900/10 border border-white/5 transition-all duration-500 hover:border-blue-500/30 hover:bg-zinc-900/30 cursor-not-allowed"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-600 group-hover:text-blue-500 group-hover:border-blue-500/30 transition-all shadow-2xl">
                  <tier.icon size={28} />
                </div>
                <Lock size={16} className="text-zinc-800 group-hover:text-zinc-600 transition-colors" />
              </div>

              <h3 className="text-2xl font-black uppercase tracking-tighter italic text-zinc-400 group-hover:text-white transition-colors mb-2 leading-none">
                {tier.name}
              </h3>
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-8 italic">
                {tier.details}
              </p>

              <div className="space-y-4 pt-8 border-t border-white/5">
                {tier.features.map((feat) => (
                  <div key={feat} className="flex items-center gap-4 opacity-30 group-hover:opacity-60 transition-opacity">
                    <Check size={12} className="text-zinc-500" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}