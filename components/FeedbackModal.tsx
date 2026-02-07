"use client";
import React, { useState } from 'react';
import { MessageSquare, Send, Loader2, CheckCircle } from 'lucide-react';
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export default function FeedbackModal({ userEmail }: { userEmail: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await supabase.from('feedback').insert({ email: userEmail, message: text });
    setLoading(false);
    setSent(true);
    setTimeout(() => { setIsOpen(false); setSent(false); setText(""); }, 2000);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 bg-zinc-900 border border-white/10 p-4 rounded-full text-blue-500 hover:text-white hover:border-blue-500/50 transition-all shadow-2xl z-50 group"
      >
        <MessageSquare size={20} />
        <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-zinc-900 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Report Intelligence Gap
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
          <div className="bg-zinc-900 border border-white/10 p-8 rounded-[32px] max-w-md w-full relative">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Beta Feedback</h3>
            {sent ? (
              <div className="py-10 text-center space-y-4">
                <CheckCircle className="text-green-500 mx-auto" size={40} />
                <p className="text-xs text-zinc-400">Intelligence logged. Thank you for securing the Vault.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <textarea 
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Describe the issue or sensing error..."
                  className="w-full h-32 bg-black border border-white/10 rounded-2xl p-4 text-xs text-zinc-300 outline-none focus:border-blue-500/50"
                />
                <div className="flex gap-3">
                  <button onClick={() => setIsOpen(false)} className="flex-1 py-3 text-[10px] font-black uppercase text-zinc-500">Cancel</button>
                  <button 
                    onClick={handleSubmit} 
                    disabled={!text || loading}
                    className="flex-1 bg-white text-black py-3 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={14}/> : <Send size={14}/>} Submit
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}