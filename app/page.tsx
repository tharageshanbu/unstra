import { createClient } from '@/lib/supabase/server';
import WaitlistForm from '@/components/WaitlistForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unstra | AI Contract Review & Red Flag Detection',
  description: 'Know exactly what you\'re signing. Unstra uses legal-grade AI to find red flags in leases and contracts.',
};

export default async function LandingPage() {
  const supabase = await createClient();
  const { count } = await supabase.from('waitlist').select('*', { count: 'exact', head: true });
  const displayCount = (count || 0) + 450;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] selection:bg-indigo-100 overflow-x-hidden">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 md:px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200">U</div>
          <span className="text-xl font-[900] tracking-tighter uppercase">Unstra</span>
        </div>
<div className="flex gap-4 md:gap-8 text-[10px] md:text-sm font-bold text-slate-500">
  <a href="#features" className="hover:text-indigo-600">Features</a>
  <a href="#security" className="hover:text-indigo-600">Security</a>
  <a href="#pricing" className="hover:text-indigo-600">Pricing</a>
</div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 md:px-8 pt-12 md:pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 text-[10px] font-bold tracking-[0.2em] text-indigo-600 uppercase bg-indigo-50 rounded-full border border-indigo-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
          </span>
          Coming Early 2026
        </div>

        <h1 className="text-5xl md:text-8xl font-[900] tracking-tight mb-6 leading-[0.9] text-slate-900">
          Know exactly <br />
          <span className="text-indigo-600 italic">what you're signing.</span>
        </h1>
        
        <p className="text-lg md:text-2xl text-slate-500 mb-10 max-w-2xl mx-auto font-medium">
          AI-powered clarity for leases, employment contracts, and fine print. Find what matters, miss nothing.
        </p>
        
        <div className="max-w-md mx-auto mb-8">
          <WaitlistForm />
        </div>
        
        <p className="text-sm font-semibold text-slate-400">
          Join <span className="text-slate-900 font-bold">{displayCount.toLocaleString()}</span> others securing their future.
        </p>
      </main>

      {/* Product Preview - Responsive Fix */}
      <section id="features" className="max-w-6xl mx-auto px-6 md:px-8 py-24 border-t border-slate-100">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6 text-slate-900">No more "Legal Anxiety."</h2>
            <p className="text-slate-500 text-lg mb-8 leading-relaxed">
              Our AI doesn't just read the fine print—it translates it into your language. See the risks before the ink dries.
            </p>
            <ul className="space-y-4">
              {['Automatic Renewal Detection', 'Hidden Fee Identification', 'Termination Right Analysis'].map((item) => (
                <li key={item} className="flex items-center gap-3 font-bold text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">✓</div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Living Mockup */}
          <div className="relative order-1 lg:order-2">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 opacity-30 blur-[1px] select-none">
              <div className="h-4 w-1/3 bg-slate-200 rounded mb-4" />
              {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-2 w-full bg-slate-100 rounded mb-3" />)}
            </div>

            <div className="relative lg:absolute lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 mt-[-80px] lg:mt-0 w-full max-w-[360px] mx-auto bg-white rounded-3xl shadow-2xl border-2 border-indigo-50 p-6 z-20">
              <div className="flex items-center gap-3 mb-4 text-red-600">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white text-xs font-bold font-mono">!</div>
                <p className="text-[10px] font-bold uppercase tracking-widest">High Risk Detected</p>
              </div>
              <div className="p-4 bg-red-50 rounded-2xl border border-red-100 mb-3">
                <p className="text-xs font-bold text-red-900 leading-tight italic">"Deposit is non-refundable even if the landlord cancels."</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Unstra Suggestion</p>
                <p className="text-xs font-bold text-emerald-900 leading-tight">Request "Mutual Termination" language to protect your cash.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-white py-16 px-6 border-y border-slate-100 text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-10">Launching Soon On</p>
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-8 md:gap-16 grayscale opacity-30 font-black text-lg text-slate-400">
           <span>LEGAL TODAY</span>
           <span>TECH CRUNCH</span>
           <span>PRODUCT HUNT</span>
           <span>FREELANCE INSIDER</span>
        </div>
      </section>

{/* Security Section */}
      <section id="security" className="py-24 bg-[#F8FAFC]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-block p-3 rounded-2xl bg-white shadow-sm border border-slate-200 mb-6">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-6">Your privacy is non-negotiable.</h2>
          <p className="text-slate-500 text-lg mb-10">
            We don't sell your data. We don't train our AI on your private contracts. 
            All documents are encrypted and automatically deleted after analysis.
          </p>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            {[
              { t: 'Bank-Level Encryption', d: 'AES-256 bit encryption for all files.' },
              { t: 'Auto-Delete', d: 'Data is wiped instantly after your review.' },
              { t: 'No AI Training', d: 'Your data stays yours. Period.' }
            ].map((item) => (
              <div key={item.t} className="p-6 bg-white rounded-2xl border border-slate-100">
                <h4 className="font-bold text-slate-900 mb-2">{item.t}</h4>
                <p className="text-xs text-slate-500 font-medium">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-6">Simple, fair pricing.</h2>
          <p className="text-slate-500 text-lg mb-12">No subscriptions. Pay only when you need a review.</p>
          
          <div className="relative p-8 md:p-12 rounded-[40px] border-4 border-indigo-600 bg-white shadow-2xl shadow-indigo-100 overflow-hidden">
             <div className="absolute top-0 right-0 bg-indigo-600 text-white px-6 py-2 font-black text-xs uppercase tracking-widest rounded-bl-2xl">
              Early Bird
            </div>
            <h3 className="text-xl font-black mb-2 italic">Beta Access Pass</h3>
            <div className="flex justify-center items-baseline gap-1 mb-6">
              <span className="text-5xl font-[900]">$0</span>
              <span className="text-slate-400 font-bold">/per review</span>
            </div>
            <p className="text-slate-600 font-bold mb-8">Free for the first 1,000 waitlist members.</p>
            <ul className="space-y-4 text-left max-w-xs mx-auto mb-10">
              {['Unlimited Red-Flag Checks', 'Plain-English Summaries', 'Legal-Grade Analysis'].map((li) => (
                <li key={li} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                  <span className="text-indigo-600">✦</span> {li}
                </li>
              ))}
            </ul>
            <a href="#" className="block w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all">
              Claim Your Free Spot
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#F8FAFC] py-20 px-6 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
            <div className="max-w-xs">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">U</div>
                <span className="text-lg font-[900] tracking-tighter uppercase">Unstra</span>
              </div>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">
                Empowering people to sign with confidence. The future of contract review is clear, fast, and AI-driven.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-16 md:gap-24">
              <div>
                <h4 className="font-black uppercase tracking-widest text-[10px] text-slate-400 mb-6">Product</h4>
                <ul className="space-y-4 text-sm font-bold text-slate-600">
                  <li><a href="#features" className="hover:text-indigo-600">Features</a></li>
                  <li><a href="#security" className="hover:text-indigo-600">Security</a></li>
                  <li><a href="#pricing" className="hover:text-indigo-600">Pricing</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-black uppercase tracking-widest text-[10px] text-slate-400 mb-6">Social</h4>
                <ul className="space-y-4 text-sm font-bold text-slate-600">
                  <li><a href="#" className="hover:text-indigo-600">Twitter</a></li>
                  <li><a href="#" className="hover:text-indigo-600">LinkedIn</a></li>
                  <li><a href="mailto:hello@unstra.com" className="hover:text-indigo-600">Contact</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between gap-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2026 UNSTRA AI. ALL RIGHTS RESERVED.</p>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
              DISCLAIMER: UNSTRA PROVIDES AI ANALYSIS, NOT LEGAL ADVICE.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}