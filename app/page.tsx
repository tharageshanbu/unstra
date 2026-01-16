import { createClient } from '@/lib/supabase/server';
import WaitlistForm from '@/components/WaitlistForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unstra | AI Contract Review & Red Flag Detection',
  description: "Know exactly what you're signing. Unstra uses legal-grade AI to find red flags in leases and contracts.",
  metadataBase: new URL('https://unstra.com'), // REQUIRED for images to work correctly
  openGraph: {
    title: 'Unstra | AI Contract Review & Red Flag Detection',
    description: 'Find red flags in your contracts instantly with legal-grade AI.',
    url: 'https://unstra.com',
    siteName: 'Unstra',
    locale: 'en_US',
    type: 'website',
    // Remove the 'images' array from here
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Unstra | AI Contract Review',
    description: 'Find red flags in your contracts instantly.',
    // Remove the 'images' array from here
  },
  other: {
    'article:author': 'Unstra Team',
    'article:published_time': '2026-01-16T00:00:00Z', 
  }
};

export default async function LandingPage() {
  const supabase = await createClient();
  const { count } = await supabase.from('waitlist').select('*', { count: 'exact', head: true });
  
  // LOGIC: Start the bar at 88% and slowly creep to 100% as real people join.
  // This ensures it never looks "empty" on day one.
  const realCount = count || 0;
  const progressPercentage = Math.min(88 + (realCount / 50), 98); 

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] selection:bg-indigo-100 overflow-x-hidden">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 md:px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200">U</div>
          <span className="text-xl font-[900] tracking-tighter uppercase">Unstra</span>
        </div>
        <div className="flex gap-4 md:gap-8 text-[10px] md:text-sm font-bold text-slate-500">
          <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
          <a href="#security" className="hover:text-indigo-600 transition-colors">Security</a>
          <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 md:px-8 pt-12 md:pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 text-[10px] font-bold tracking-[0.2em] text-indigo-600 uppercase bg-indigo-50 rounded-full border border-indigo-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
          </span>
          FOUNDING MEMBER ACCESS
        </div>

        <h1 className="text-5xl md:text-8xl font-[900] tracking-tight mb-6 leading-[0.9] text-slate-900">
          Know exactly <br />
          <span className="text-indigo-600 italic">what you're signing.</span>
        </h1>
        
        <p className="text-lg md:text-2xl text-slate-500 mb-10 max-w-2xl mx-auto font-medium">
          AI-powered clarity for leases, employment contracts, and fine print. Find what matters, miss nothing.
        </p>
        
        <div className="max-w-md mx-auto mb-10">
          <WaitlistForm />
        </div>
        
        {/* Milestone Progress Bar */}
        <div className="max-w-xs mx-auto">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Founding Cohort</span>
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.15em]">{Math.floor(progressPercentage)}% Capacity</span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-1000 ease-out" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Limited to first 500 members
          </p>
        </div>
      </main>

      {/* Product Preview */}
      <section id="features" className="max-w-6xl mx-auto px-6 md:px-8 py-24 border-t border-slate-100">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="order-2 lg:order-1 text-left">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6 text-slate-900 leading-tight">No more "Legal Anxiety."</h2>
            <p className="text-slate-500 text-lg mb-8 leading-relaxed font-medium">
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

          <div className="relative order-1 lg:order-2">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 opacity-30 blur-[1px] select-none">
              <div className="h-4 w-1/3 bg-slate-200 rounded mb-4" />
              {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-2 w-full bg-slate-100 rounded mb-3" />)}
            </div>
            <div className="relative lg:absolute lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 mt-[-80px] lg:mt-0 w-full max-w-[360px] mx-auto bg-white rounded-3xl shadow-2xl border-2 border-indigo-50 p-6 z-20">
              <div className="flex items-center gap-3 mb-4 text-red-600">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white text-xs font-bold font-mono italic">!</div>
                <p className="text-[10px] font-bold uppercase tracking-widest">High Risk Detected</p>
              </div>
              <div className="p-4 bg-red-50 rounded-2xl border border-red-100 mb-3 text-left">
                <p className="text-xs font-bold text-red-900 leading-tight italic">"Deposit is non-refundable even if the landlord cancels."</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-left">
                <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1 tracking-widest">Unstra Suggestion</p>
                <p className="text-xs font-bold text-emerald-900 leading-tight">Request "Mutual Termination" language to protect your cash.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-white py-16 px-6 border-y border-slate-100 text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-10">Anticipated Launch Coverage</p>
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
          <h2 className="text-3xl md:text-4xl font-black mb-6 tracking-tight">Your privacy is non-negotiable.</h2>
          <p className="text-slate-500 text-lg mb-10 font-medium">
            We don't sell your data. We don't train our AI on your private contracts. 
            All documents are encrypted and automatically deleted after analysis.
          </p>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            {[
              { t: 'Bank-Level Encryption', d: 'AES-256 bit encryption for all files.' },
              { t: 'Auto-Delete', d: 'Data is wiped instantly after your review.' },
              { t: 'No AI Training', d: 'Your data stays yours. Period.' }
            ].map((item) => (
              <div key={item.t} className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <h4 className="font-bold text-slate-900 mb-2">{item.t}</h4>
                <p className="text-xs text-slate-500 font-bold leading-relaxed">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tight text-[#0F172A]">The Beta Pass.</h2>
          <p className="text-slate-500 text-lg mb-12 font-medium">Limited access for the first cohort of founding members.</p>
          
          <div className="relative group p-1 md:p-1.5 rounded-[42px] bg-gradient-to-b from-slate-200 to-white shadow-2xl">
            <div className="bg-white rounded-[40px] p-8 md:p-14 border border-slate-100 shadow-inner">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#0F172A] text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-xl">
                Phase 01
              </div>
              <h3 className="text-indigo-600 text-sm font-black uppercase tracking-[0.2em] mb-4">Founding Member</h3>
              <div className="flex justify-center items-baseline gap-2 mb-8">
                <span className="text-7xl font-[1000] tracking-tighter text-[#0F172A]">$0</span>
                <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">Beta Access</span>
              </div>
              <div className="max-w-md mx-auto">
                <p className="text-slate-600 text-md leading-relaxed mb-10 font-medium">
                  Get <span className="text-[#0F172A] font-bold border-b-2 border-indigo-500/30">3 Full AI Scans</span> for free. 
                  Founding Members receive <span className="text-[#0F172A] font-bold">priority queue access</span> and an exclusive 
                  <span className="text-[#0F172A] font-bold block">50% discount on their first year.</span>
                </p>
                <div className="grid gap-4 mb-12 text-left">
                  {['3 High-Priority AI Scans', 'Founding Member Badge', 'Early Access to New Tools'].map((li) => (
                    <div key={li} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100/50">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm font-bold text-slate-700">{li}</span>
                    </div>
                  ))}
                </div>
                <a href="#" className="group relative block w-full py-6 bg-[#0F172A] text-white rounded-2xl font-black text-lg transition-all hover:bg-indigo-600 hover:shadow-2xl hover:shadow-indigo-200 active:scale-[0.98]">
                  Claim My Spot
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white pt-24 pb-12 px-6 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-12 mb-20">
            <div className="col-span-2 lg:col-span-5 pr-8 text-left">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100">U</div>
                <span className="text-xl font-[1000] tracking-tighter uppercase text-[#0F172A]">Unstra</span>
              </div>
              <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6 max-w-sm">
                Empowering people to sign with total confidence. 
                The future of contract review is driven by high-fidelity AI.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Systems Operational</span>
              </div>
            </div>
            <div className="col-span-1 lg:col-span-2 text-left">
              <h4 className="font-black uppercase tracking-[0.2em] text-[10px] text-[#0F172A] mb-8">Product</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-500">
                <li><a href="#features" className="hover:text-indigo-600">Features</a></li>
                <li><a href="#security" className="hover:text-indigo-600">Security</a></li>
                <li><a href="#pricing" className="hover:text-indigo-600">Pricing</a></li>
              </ul>
            </div>
            <div className="col-span-1 lg:col-span-2 text-left">
              <h4 className="font-black uppercase tracking-[0.2em] text-[10px] text-[#0F172A] mb-8">Connect</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-500">
                <li><a href="#" className="hover:text-indigo-600">LinkedIn</a></li>
                <li><a href="#" className="hover:text-indigo-600">Twitter (X)</a></li>
                <li><a href="mailto:hello@unstra.com" className="hover:text-indigo-600">Email</a></li>
              </ul>
            </div>
            <div className="col-span-2 lg:col-span-3 text-left">
              <h4 className="font-black uppercase tracking-[0.2em] text-[10px] text-[#0F172A] mb-8">Legal</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-500">
                <li><a href="#" className="hover:text-indigo-600">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-indigo-600">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-slate-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <p className="text-[10px] font-black text-[#0F172A] uppercase tracking-[0.2em]">© 2026 UNSTRA AI. ALL RIGHTS RESERVED.</p>
            <p className="text-[9px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest italic max-w-xl lg:text-right">
              Disclaimer: Unstra provides AI-driven contract analysis for informational purposes only. We are not a law firm and do not provide legal advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}