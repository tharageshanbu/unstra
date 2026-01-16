'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

const supabase = createClient();
const { error } = await supabase
  .from('waitlist')
  .insert([
    { 
      email, 
      source: window.location.search.includes('ref=linkedin') ? 'linkedin' : 'direct',
user_agent: typeof window !== 'undefined' ? navigator.userAgent : 'Server'    }
  ]);
  
    if (error) {
      alert("Error joining. You might already be on the list!");
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) return (
    <div className="animate-in fade-in zoom-in duration-300 p-4 bg-indigo-50 text-indigo-700 rounded-2xl border border-indigo-100 text-center font-medium">
      🎉 You're in! We'll notify you soon.
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <input
        type="email"
        placeholder="Enter your email"
        required
        className="flex-grow px-6 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button
        disabled={loading}
        className="bg-[#0F172A] text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
      >
        {loading ? 'Joining...' : 'Get Early Access'}
      </button>
    </form>
  );
}