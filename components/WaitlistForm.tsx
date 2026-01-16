'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      
      // 1. Insert into Supabase
      const { error } = await supabase
        .from('waitlist')
        .insert([
          { 
            email, 
            source: window.location.search.includes('ref=linkedin') ? 'linkedin' : 'direct',
            user_agent: typeof window !== 'undefined' ? navigator.userAgent : 'Server'
          }
        ]);

      // 2. Check for database errors
      if (error) {
        // Handle unique constraint error (user already exists)
        if (error.code === '23505') {
          alert("You're already on the list! We'll be in touch soon.");
          router.push('/thanks'); // Still send them to thanks if they are already subbed
          return;
        }
        throw error;
      }

      // 3. Optional: Trigger the Resend email API here tomorrow
      // await fetch('/api/send-welcome', { method: 'POST', body: JSON.stringify({ email }) });

      // 4. Success! Redirect to thanks page
      router.push('/thanks');

    } catch (err: any) {
      console.error('Waitlist error:', err);
      alert("Something went wrong: " + (err.message || "Please try again later."));
    } finally {
      // 5. This always runs, ensuring the button re-enables if there's an error
      setLoading(false);
    }
  };

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
  type="submit"
  disabled={loading}
  className="bg-[#0F172A] text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all disabled:opacity-70 flex items-center justify-center gap-2 min-w-[160px]"
>
  {loading ? (
    <>
      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>Joining...</span>
    </>
  ) : (
    'Get Early Access'
  )}
</button>
    </form>
  );
}