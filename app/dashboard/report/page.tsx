"use client";

import React, { useState } from 'react';
import { createClient } from "@/lib/supabase/client";
import { useRouter } from 'next/navigation';
import { Send, Image as ImageIcon, CheckCircle, Loader2, X, Shield } from 'lucide-react';

const supabase = createClient();

export default function ReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Internal human-readable Tracking ID (Invisible to User)
      const internalId = `UNS-${Math.random().toString(36).toUpperCase().substring(2, 6)}-${Math.random().toString(36).toUpperCase().substring(2, 6)}`;
      let screenshotUrl = null;

      if (file) {
        if (file.size > 5 * 1024 * 1024) { 
          alert("IMAGE TOO LARGE. 5MB LIMIT."); 
          setLoading(false); 
          return; 
        }
        
        // Doc naming starts with Tracking ID for easy review
        const filePath = `${internalId}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from('feedback-images').upload(filePath, file);
        if (uploadError) throw uploadError;
        screenshotUrl = filePath;
      }

      // Reusing 'tracking_id' (renamed from category) for internal mapping
      const { error: dbError } = await supabase.from('feedback').insert({
        email,
        message,
        screenshot_url: screenshotUrl,
        tracking_id: internalId 
      });

      if (dbError) throw dbError;
      setSuccess(true);
    } catch (err) {
      alert("Submission failed. Verify RLS and storage permissions.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center p-6">
        <div className="text-center bg-zinc-950 border border-white/5 p-12 rounded-[48px] max-w-sm shadow-[0_0_100px_rgba(37,99,235,0.1)]">
          <CheckCircle className="text-emerald-500 w-16 h-16 mx-auto mb-6" />
          <h2 className="text-white text-2xl font-black uppercase italic mb-2 tracking-tighter leading-none">Logged</h2>
          <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-8 leading-relaxed italic">Intelligence discrepancy received for forensic review.</p>
          <button onClick={() => router.back()} className="bg-white text-black px-12 py-4 rounded-full font-black text-[10px] uppercase tracking-widest active:scale-95 transition-transform shadow-2xl">Return to Vault</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] selection:bg-blue-500/30">
      <main className="p-8 pt-24 lg:pt-12 lg:p-24 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Shield size={14} className="text-blue-500" />
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] italic leading-none">Gap Discovery</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-white uppercase italic tracking-tighter mb-4 leading-none">
              Report Issue.
            </h1>
            <p className="text-zinc-500 text-[10px] uppercase tracking-[0.4em] font-bold opacity-60">Forensic calibration protocol active.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-zinc-950 border border-white/5 p-8 lg:p-12 rounded-[40px] space-y-12 shadow-2xl">
              <div className="space-y-4">
                <label className="block text-zinc-500 text-[9.5px] font-black uppercase tracking-[0.4em] ml-2 italic leading-none">Partner Identification</label>
                <input 
                  type="email" required placeholder="Identification (Email)..."
                  className="w-full bg-black border border-white/5 rounded-2xl p-5 text-white text-sm focus:border-blue-500/50 outline-none transition-all placeholder:text-zinc-800"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <label className="block text-zinc-500 text-[9.5px] font-black uppercase tracking-[0.4em] ml-2 italic leading-none">Discrepancy Details</label>
                <textarea 
                  required rows={6} placeholder="Describe the sensing gap or logic error..."
                  className="w-full bg-black border border-white/5 rounded-[32px] p-6 text-white text-sm focus:border-blue-500/50 outline-none transition-all placeholder:text-zinc-800 resize-none leading-relaxed"
                  value={message} onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <label className="block text-zinc-500 text-[9.5px] font-black uppercase tracking-[0.4em] ml-2 italic leading-none">Evidence (Optional)</label>
                {file ? (
                  <div className="relative group rounded-[24px] overflow-hidden border border-blue-500/30">
                    <div className="absolute inset-0 bg-blue-500/5 z-0" />
                    <div className="relative z-10 flex items-center justify-between p-6">
                      <div className="flex items-center gap-4">
                        <ImageIcon size={20} className="text-blue-500" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest truncate max-w-[200px]">{file.name}</span>
                      </div>
                      <button type="button" onClick={() => setFile(null)} className="text-zinc-500 hover:text-red-500 transition-colors"><X size={18} /></button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/5 rounded-[32px] cursor-pointer hover:bg-white/[0.02] hover:border-blue-500/20 transition-all group active:scale-[0.99]">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <ImageIcon className="w-8 h-8 text-zinc-800 group-hover:text-blue-500 transition-colors" strokeWidth={1} />
                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest group-hover:text-zinc-400 transition-colors">Attach Visual</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  </label>
                )}
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-white text-black py-7 rounded-[35px] font-black uppercase text-xs tracking-[0.5em] hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-50 shadow-2xl"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} strokeWidth={2.5} /> Submit Discrepancy</>}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}