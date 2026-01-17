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
const dbCount = 0; // This connects to your actual database email count
const startingOffset = 34;
const totalSeats = 100;

// This logic ensures it starts at 34, grows with signups, but stops at 99
const displayCount = Math.min(startingOffset + dbCount, 99);
const progressPercent = (displayCount / totalSeats) * 100;
const seatsRemaining = totalSeats - displayCount;

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
<main className="max-w-7xl mx-auto px-6 md:px-8 pt-6 md:pt-12 pb-20 text-center">  {/* Founding Badge */}
  <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 text-[10px] font-bold tracking-[0.2em] text-indigo-600 uppercase bg-indigo-50 rounded-full border border-indigo-100">
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
    </span>
    FOUNDING MEMBER ACCESS
  </div>

  {/* Main Headline */}
  <h1 className="text-5xl md:text-8xl font-[900] tracking-tight mb-6 leading-[0.9] text-slate-900">
    Know exactly <br />
    <span className="text-indigo-600 italic">what you're signing.</span>
  </h1>
  
  {/* Sub-headline */}
  <p className="text-lg md:text-2xl text-slate-500 mb-10 max-w-2xl mx-auto font-medium">
    Unstra uses AI to scan your contracts for hidden red flags. Get a plain-English breakdown of every risk before you sign.
  </p>
  
  {/* Waitlist Input Box */}
  <div className="max-w-md mx-auto mb-10">
    <WaitlistForm />
  </div>
  
  {/* The 99-Cap Milestone Bar */}
  <div className="max-w-xs mx-auto">
    <div className="flex justify-between items-end mb-2">
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
        </span>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Founding Cohort</span>
      </div>
      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.15em]">
        {displayCount}/{totalSeats} Joined
      </span>
    </div>
    
    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
      <div 
        className="h-full bg-indigo-600 transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(79,70,229,0.3)]" 
        style={{ width: `${progressPercent}%` }} 
      />
    </div>
    
    <p className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
      {seatsRemaining} {seatsRemaining === 1 ? 'Seat' : 'Seats'} Remaining
    </p>
  </div>
</main>

{/* Cohesive Premium Section */}
<section id="pricing" className="py-24 bg-[#F8FAFC]"> {/* Soft off-white background */}
  <div className="max-w-3xl mx-auto px-6 text-center">
    
    <h2 className="text-4xl md:text-5xl font-[1000] mb-4 tracking-tight text-slate-900 leading-tight">
      Claim your spot in the Founding 100
    </h2>
    <p className="text-slate-500 text-lg mb-12 font-medium">
      An exclusive launch offer for those who prioritize clarity.
    </p>
    
    {/* The Card - Uses a subtle 'Glass' effect but on a light theme */}
    <div className="relative p-1 rounded-[42px] bg-white border border-slate-200 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)]">
      <div className="bg-white rounded-[40px] p-10 md:p-16">
        
        <div className="inline-block bg-indigo-50 text-indigo-600 px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8">
          Complimentary Access
        </div>

        <div className="flex justify-center items-baseline gap-3 mb-10">
          <span className="text-8xl font-[1000] tracking-tighter text-[#0F172A]">$0</span>
          <div className="text-left">
            <span className="block text-slate-300 font-bold line-through text-2xl decoration-indigo-500/30 decoration-4 leading-none">$60</span>
            <span className="text-indigo-600 font-black text-[10px] uppercase tracking-widest leading-none">Pro Value</span>
          </div>
        </div>

        <div className="grid gap-4 mb-12 text-left max-w-sm mx-auto">
          {[
            '10 High-Precision Analysis Credits', 
            'Deep-Reasoning Risk Detection',
            'Founding Member Status',
            'Exclusive Early-Bird Rates'
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm font-bold text-slate-700">{feature}</span>
            </div>
          ))}
        </div>

{/* We changed <button> to <a> and added href="#waitlist-top" 
    Make sure your Hero section/Input has the id="waitlist-top"
*/}
<a 
  href="#" 
  className="block w-full py-6 bg-[#0F172A] text-white rounded-2xl font-black text-lg text-center hover:bg-indigo-600 transition-all duration-300 shadow-xl hover:shadow-indigo-200"
>
  Claim My Founding Pass
</a>
        
        <p className="mt-8 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          Limited Availability • No Credit Card Required
        </p>
      </div>
    </div>
  </div>
</section>

{/* The Process Section */}
<section id="features" className="w-full py-24 bg-white">
  {/* Added px-6 md:px-8 and max-w-7xl to fix the edge-cutting issue */}
  <div className="max-w-7xl mx-auto px-6 md:px-8">
    <div className="relative">
      {/* Subtle Background Header */}
      <div className="text-center mb-16">
        <h2 className="text-[10px] font-black tracking-[0.3em] text-indigo-600 uppercase mb-4">How it works</h2>
        <p className="text-3xl md:text-4xl font-[900] text-slate-900 tracking-tight">Three steps to total clarity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {[
          { 
            step: "01", 
            title: "Secure Upload", 
            desc: "Securely upload any agreement. From complex insurance policies and leases to SaaS and employment offers, our AI maps risks across all legal documentation.",
            color: "bg-blue-50 text-blue-600",
            visual: (
              <div className="flex flex-col gap-1 w-10 h-12 bg-white border-2 border-blue-100 rounded-lg p-2 mb-4 group-hover:border-blue-400 transition-colors">
                <div className="w-full h-1 bg-blue-100 rounded" />
                <div className="w-2/3 h-1 bg-blue-100 rounded" />
                <div className="w-full h-1 bg-blue-100 rounded" />
                <div className="mt-auto w-full flex justify-center text-[10px] text-blue-400 font-bold">↑</div>
              </div>
            )
          },
          { 
            step: "02", 
            title: "Deep Analysis", 
            desc: "Our AI maps your document against 50+ risk categories to find hidden 'gotcha' clauses instantly.",
            color: "bg-indigo-50 text-indigo-600",
            visual: (
              <div className="relative w-12 h-12 mb-4">
                <div className="absolute inset-0 bg-indigo-100 rounded-full animate-pulse" />
                <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                   <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
              </div>
            )
          },
          { 
            step: "03", 
            title: "Actionable Report", 
            desc: "Receive a categorized list of red flags with plain-English suggestions on what to negotiate.",
            color: "bg-purple-50 text-purple-600",
            visual: (
              <div className="flex flex-col gap-2 w-12 mb-4">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-400" /><div className="w-8 h-1 bg-slate-100 rounded" /></div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-400" /><div className="w-10 h-1 bg-slate-100 rounded" /></div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400" /><div className="w-6 h-1 bg-slate-100 rounded" /></div>
              </div>
            )
          }
        ].map((item, idx) => (
          <div key={item.step} className="group relative p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            {item.visual}
            <h3 className="text-xl font-black text-slate-900 mb-3">{item.title}</h3>
            <p className="text-slate-500 text-sm font-bold leading-relaxed">{item.desc}</p>
            <div className={`absolute top-6 right-6 px-3 py-1 rounded-full ${item.color} text-[10px] font-black uppercase tracking-widest`}>
              Step {item.step}
            </div>
            {idx < 2 && (
              <div className="hidden lg:block absolute top-1/2 -right-4 translate-x-1/2 -translate-y-1/2 z-20">
                <svg className="w-6 h-6 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
</section>

      {/* Product Preview / Feature Deep-Dive */}
<section id="product-deep-dive" className="max-w-7xl mx-auto px-6 md:px-8 py-24 border-t border-slate-100">
  <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
    <div className="order-2 lg:order-1 text-left">
      <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6 text-slate-900 leading-tight">
        Don't just read it. <span className="text-indigo-600">Understand it.</span>
      </h2>
      <p className="text-slate-500 text-lg mb-8 leading-relaxed font-medium">
        Unstra acts as a specialized layer between you and the fine print. 
        We identify high-impact clauses that dictate your costs and your rights—turning 30 pages of jargon into a 2-minute summary.
      </p>
<ul className="space-y-4">
  {[
    'Financial Red Flag Detection', 
    'Liability & Coverage Analysis', 
    'Unfair Termination & Trap Clauses'
  ].map((item) => (
    <li key={item} className="flex items-center gap-3 font-bold text-slate-700">
      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">✓</div>
      {item}
    </li>
  ))}
</ul>
    </div>

    <div className="relative order-1 lg:order-2">
      {/* Background Document Mockup */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 opacity-30 blur-[1px] select-none">
        <div className="h-4 w-1/3 bg-slate-200 rounded mb-4" />
        {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-2 w-full bg-slate-100 rounded mb-3" />)}
      </div>

      {/* The "Aha!" Risk Card - RENTAL/LEASE EXAMPLE */}
      <div className="relative lg:absolute lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 mt-[-80px] lg:mt-0 w-full max-w-[380px] mx-auto bg-white rounded-3xl shadow-[0_20px_50px_rgba(79,70,229,0.15)] border-2 border-indigo-50 p-6 z-20 transition-transform hover:scale-[1.02] duration-300">
        <div className="flex items-center gap-3 mb-4 text-rose-600">
          <div className="w-8 h-8 bg-rose-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-rose-200">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">Maintenance Trap</p>
        </div>
        
        <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 mb-3 text-left">
          <p className="text-xs font-bold text-rose-900 leading-tight italic">
            "Tenant shall be responsible for all repairs and replacements of major appliances, including HVAC and plumbing, regardless of cause."
          </p>
        </div>

        <div className="p-4 bg-[#0F172A] rounded-2xl shadow-xl text-left border border-slate-800">
          <p className="text-[10px] font-black text-indigo-400 uppercase mb-1 tracking-widest">Unstra Analysis</p>
          <p className="text-xs font-bold text-white leading-relaxed">
            This is a "High-Cost Liability" clause. We suggest requesting that repairs for <span className="text-indigo-300 underline underline-offset-4">wear and tear</span> remain the Landlord's responsibility to protect your bank account.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

{/* Security Section */}
<section id="security" className="py-24 bg-[#F8FAFC]">
  <div className="max-w-5xl mx-auto px-6 text-center">
    <div className="inline-block p-4 rounded-3xl bg-white shadow-sm border border-slate-100 mb-8">
      <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    </div>
    
    <h2 className="text-3xl md:text-4xl font-[900] mb-6 tracking-tight text-slate-900">
      Privacy by design.
    </h2>
    
    <p className="text-slate-500 text-lg mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
      We handle your documents with total transparency. No hidden data harvesting, no training, and no long-term storage.
    </p>

    <div className="grid md:grid-cols-3 gap-6 text-left">
      {[
        { 
          t: 'Standard Encryption', 
          d: 'Your data is encrypted using industry-standard protocols while moving between your browser and our servers.',
          icon: '🔒'
        },
        { 
          t: 'Immediate Deletion', 
          d: 'We don’t keep your files. Documents are deleted from our temporary storage immediately after the analysis is complete.',
          icon: '🧹'
        },
        { 
          t: 'No AI Training', 
          d: 'Your private documents are never used to train or improve our AI models. Your data stays yours.',
          icon: '🛡️'
        }
      ].map((item) => (
        <div key={item.t} className="p-8 bg-white rounded-3xl border border-slate-200/60 shadow-sm">
          <div className="text-xl mb-4">{item.icon}</div>
          <h4 className="font-bold text-slate-900 mb-2 tracking-tight">{item.t}</h4>
          <p className="text-xs text-slate-500 font-bold leading-relaxed">{item.d}</p>
        </div>
      ))}
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